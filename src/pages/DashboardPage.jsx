import React, { useState, useEffect } from "react";
import { useUserData, useSignOut } from "@nhost/react";
import {
  Newspaper,
  Bookmark,
  Settings,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Brain,
  Database,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import axios from "axios";
import { GET_USER_PREFERENCES } from "../graphql/queries";
import { ADD_BOOKMARK } from "../graphql/mutations";
import PreferencesSection from "../components/PreferencesSection";
import NewsFeedSection from "../components/NewsFeedSection";
import BookmarksSection from "../components/BookmarksSection";

// API Constants
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API_BASE_URL;
const OPENROUTER_API_URL = import.meta.env.VITE_OPENROUTER_API_URL;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const ARTICLES_PER_PAGE = 6;

// Loading stages
const LoadingStages = {
  PREFERENCES: "Loading your preferences",
  FETCHING: "Fetching articles",
  ANALYZING: "AI is summarizing articles",
  RENDERING: "Preparing your feed",
};

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserData();
  const userId = user?.id;
  const { signOut, isLoading: isSigningOut } = useSignOut();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // News feed state
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(LoadingStages.PREFERENCES);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  // Initialize active tab from URL query parameter or localStorage or default to "feed"
  const initializeActiveTab = () => {
    // Check URL query parameters first
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");

    if (tabParam && ["feed", "bookmarks", "preferences"].includes(tabParam)) {
      return tabParam;
    }

    // Fall back to localStorage if available
    const savedTab = localStorage.getItem("newsDigest_activeTab");
    if (savedTab && ["feed", "bookmarks", "preferences"].includes(savedTab)) {
      return savedTab;
    }

    // Default to "feed" if no saved state
    return "feed";
  };

  const [activeTab, setActiveTab] = useState(initializeActiveTab);

  // Get user preferences
  const { data: preferencesData } = useQuery(GET_USER_PREFERENCES);

  // Add bookmark mutation
  const [addBookmark] = useMutation(ADD_BOOKMARK, {
    onError: (error) => {
      console.error("Error adding bookmark:", error);
      toast.error("Error bookmarking article");
    },
  });

  // Set up loading animation
  useEffect(() => {
    let progressInterval;
    if (isLoading) {
      setLoadingProgress(0);
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }

    return () => clearInterval(progressInterval);
  }, [isLoading]);

  // Update loading stage based on progress
  useEffect(() => {
    if (loadingProgress < 25) {
      setLoadingStage(LoadingStages.PREFERENCES);
    } else if (loadingProgress < 50) {
      setLoadingStage(LoadingStages.FETCHING);
    } else if (loadingProgress < 75) {
      setLoadingStage(LoadingStages.ANALYZING);
    } else if (loadingProgress < 100) {
      setLoadingStage(LoadingStages.RENDERING);
    }
  }, [loadingProgress]);

  // Process news articles with AI
  const processNewsWithAI = async (articles) => {
    console.log("articles", articles);
    setLoadingStage(LoadingStages.ANALYZING);
    try {
      // Limit to 6 articles for AI processing
      const limitedArticles = articles.slice(0, ARTICLES_PER_PAGE);
      const processedArticles = await Promise.all(
        limitedArticles.map(async (article) => {
          const prompt = `
          Analyze this news article and provide:
          1. A concise summary (max 2 sentences)
          2. Sentiment (positive, negative, or neutral)
          3. Brief explanation of the sentiment

          Article Title: ${article.title}
          Article Description: ${article.description || ""}
          Article Content: ${article.content || ""}
        `;
          const response = await axios.post(
            OPENROUTER_API_URL,
            {
              model: "openai/gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
            },
            {
              headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          const aiAnalysis = response?.data?.choices[0]?.message?.content;
          return {
            title: article.title,
            url: article.url,
            source: article.source.name,
            published_at: article.publishedAt,
            image_url: article.image,
            ai_analysis: aiAnalysis,
          };
        })
      );

      return processedArticles;
    } catch (error) {
      console.error("Error processing articles with AI:", error);
      return [];
    }
  };

  // Fetch personalized news based on user preferences
  const fetchPersonalizedNews = async (currentPage = page) => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingStage(LoadingStages.PREFERENCES);
      setError(null);

      const preferences = preferencesData?.user_preferences[0];
      if (!preferences) {
        console.log("No user preferences found");
        setIsLoading(false);
        return;
      }

      // Wait a bit to show preferences stage
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingStage(LoadingStages.FETCHING);

      // Build query string combining topic and keywords
      let queryString = "";
      if (preferences.topics?.length > 0) {
        queryString = preferences.topics[0];
      }
      if (preferences.keywords?.length > 0) {
        queryString = queryString
          ? `${queryString} ${preferences.keywords.join(" ")}`
          : preferences.keywords.join(" ");
      }
      if (!queryString) {
        queryString = "technology"; // Default fallback
      }

      // Fetch news based on preferences
      const response = await axios.get(NEWS_API_BASE_URL, {
        params: {
          q: queryString,           // Same parameter name
          lang: "en",               // Changed from "language"
          apikey: API_KEY,          // Changed from "apiKey"
          page: currentPage,
          max: ARTICLES_PER_PAGE    // Changed from "pageSize"
        },
      });
      console.log("response.data", response);
      if (response.data) {
        setTotalResults(response.data.totalResults);
        console.log("response.data.articles", response.data.articles);
        const processedArticles = await processNewsWithAI(
          response.data.articles
        );
        setLoadingStage(LoadingStages.RENDERING);

        // Add a small delay before showing articles for better UX
        await new Promise((resolve) => setTimeout(resolve, 500));
        setArticles(processedArticles);
      }
    } catch (error) {
      console.error("Error fetching personalized news:", error);
      setError("Failed to fetch news. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change in news feed
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPersonalizedNews(newPage);
  };

  // Handle article bookmarking
  const handleBookmark = async (article) => {
    try {
      const aiAnalysis = article.ai_analysis
        ? parseAIAnalysis(article.ai_analysis)
        : null;
      await addBookmark({
        variables: {
          userId,
          title: article.title,
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          image_url: article.image_url || null,
          sentiment_label: aiAnalysis ? aiAnalysis.sentiment : null,
          summary: aiAnalysis ? aiAnalysis.summary : article.summary || null,
        },
      });
      toast.success("Article bookmarked successfully!");
    } catch (error) {
      console.error("Error bookmarking article:", error);
      toast.error("Failed to bookmark article. Please try again.");
    }
  };

  // Parse AI analysis into structured format
  const parseAIAnalysis = (analysis) => {
    const lines = analysis.split("\n");
    return {
      summary: lines[0].replace(/^\d+\.\s*/, ""),
      sentiment: lines[1].replace(/^\d+\.\s*/, ""),
      explanation: lines[2].replace(/^\d+\.\s*/, ""),
    };
  };

  // Update localStorage and URL when tab changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("newsDigest_activeTab", activeTab);

    // Update URL without full page reload
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    navigate(`?${params.toString()}`, { replace: true });
  }, [activeTab, navigate, location.search]);

  // Fetch news on initial load and when preferences change
  useEffect(() => {
    if (preferencesData) {
      fetchPersonalizedNews();
    }
  }, [preferencesData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      // Redirect is handled automatically by Nhost auth state
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Custom loading component for news feed
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {loadingStage}
          </h3>
          <p className="text-gray-500 text-sm">
            Please wait while we prepare your personalized news
          </p>
        </div>

        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${loadingProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500">
            {loadingProgress}%
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div
            className={`p-6 rounded-lg bg-white shadow-md flex flex-col items-center ${
              loadingStage === LoadingStages.PREFERENCES
                ? "border-2 border-blue-500 scale-105"
                : "opacity-50"
            } transition-all duration-300`}
          >
            <Database
              className={`w-8 h-8 mb-2 ${
                loadingStage === LoadingStages.PREFERENCES
                  ? "text-blue-500 animate-pulse"
                  : "text-gray-400"
              }`}
            />
            <h4 className="font-medium text-sm text-center">Preferences</h4>
            {loadingProgress >= 25 && (
              <Check className="w-5 w-5 text-green-500 mt-2" />
            )}
          </div>

          <div
            className={`p-6 rounded-lg bg-white shadow-md flex flex-col items-center ${
              loadingStage === LoadingStages.FETCHING
                ? "border-2 border-blue-500 scale-105"
                : "opacity-50"
            } transition-all duration-300`}
          >
            <Newspaper
              className={`w-8 h-8 mb-2 ${
                loadingStage === LoadingStages.FETCHING
                  ? "text-blue-500 animate-pulse"
                  : "text-gray-400"
              }`}
            />
            <h4 className="font-medium text-sm text-center">News API</h4>
            {loadingProgress >= 50 && (
              <Check className="w-5 w-5 text-green-500 mt-2" />
            )}
          </div>

          <div
            className={`p-6 rounded-lg bg-white shadow-md flex flex-col items-center ${
              loadingStage === LoadingStages.ANALYZING
                ? "border-2 border-blue-500 scale-105"
                : "opacity-50"
            } transition-all duration-300`}
          >
            <Brain
              className={`w-8 h-8 mb-2 ${
                loadingStage === LoadingStages.ANALYZING
                  ? "text-blue-500 animate-pulse"
                  : "text-gray-400"
              }`}
            />
            <h4 className="font-medium text-sm text-center">AI Analysis</h4>
            {loadingProgress >= 75 && (
              <Check className="w-5 w-5 text-green-500 mt-2" />
            )}
          </div>

          <div
            className={`p-6 rounded-lg bg-white shadow-md flex flex-col items-center ${
              loadingStage === LoadingStages.RENDERING
                ? "border-2 border-blue-500 scale-105"
                : "opacity-50"
            } transition-all duration-300`}
          >
            <RefreshCw
              className={`w-8 h-8 mb-2 ${
                loadingStage === LoadingStages.RENDERING
                  ? "text-blue-500 animate-spin"
                  : "text-gray-400"
              }`}
            />
            <h4 className="font-medium text-sm text-center">Rendering</h4>
            {loadingProgress >= 100 && (
              <Check className="w-5 w-5 text-green-500 mt-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div
                className="flex-shrink-0 flex items-center group cursor-pointer"
                onClick={() => navigate("/")}
              >
                <Newspaper className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
                <span className="ml-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  News Digest
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === "feed" && (
                <button
                  onClick={() => fetchPersonalizedNews()}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Refresh
                </button>
              )}

              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 focus:outline-none group cursor-pointer"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="User avatar"
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {user.displayName || user.email}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={handleLogout}
                        disabled={isSigningOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange("feed")}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              activeTab === "feed"
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100 hover:scale-102"
            }`}
          >
            <Newspaper className="h-4 w-4 mr-2" />
            News Feed
          </button>
          <button
            onClick={() => handleTabChange("bookmarks")}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              activeTab === "bookmarks"
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100 hover:scale-102"
            }`}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </button>
          <button
            onClick={() => handleTabChange("preferences")}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              activeTab === "preferences"
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100 hover:scale-102"
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:shadow-md">
          {activeTab === "feed" &&
            (isLoading ? (
              renderLoading()
            ) : (
              <NewsFeedSection
                setActiveTab={handleTabChange}
                articles={articles}
                isLoading={false}
                error={error}
                totalResults={totalResults}
                page={page}
                onPageChange={handlePageChange}
                onBookmark={handleBookmark}
                parseAIAnalysis={parseAIAnalysis}
              />
            ))}
          {activeTab === "bookmarks" && <BookmarksSection />}
          {activeTab === "preferences" && <PreferencesSection />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
