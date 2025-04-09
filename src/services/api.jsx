// This file will contain all API endpoints for communication with Nhost/Hasura
// For now, we'll use mock data but later we'll implement actual requests

import nhost from "../config/nhost";

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
console.log("API_BASE_URL:", API_BASE_URL);

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log("API Response Status:", response.status);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("API Error Response:", error);
    throw new Error(error.message || "Something went wrong");
  }
  const data = await response.json();
  console.log("API Response Data:", data);
  return data;
};

// Auth header with JWT token
const getAuthHeader = () => {
  const token = nhost.auth.getAccessToken();
  console.log("Auth Token:", token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Authentication APIs
export const authAPI = {
  // Login using Nhost
  login: async (email, password) => {
    console.log("Login attempt for:", email);
    try {
      const { session, error } = await nhost.auth.signIn({
        email,
        password,
      });

      if (error) {
        console.error("Login error from Nhost:", error);
        throw new Error(error.message);
      }
      console.log("Login successful, user:", session?.user?.email);
      return { success: true, user: session.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign up using Nhost
  signup: async (email, password, metadata = {}) => {
    console.log("Signup attempt for:", email);
    try {
      const { session, error } = await nhost.auth.signUp({
        email,
        password,
        options: {
          metadata,
        },
      });

      if (error) {
        console.error("Signup error from Nhost:", error);
        throw new Error(error.message);
      }
      console.log("Signup successful, user:", session?.user?.email);
      return { success: true, user: session?.user };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  },

  // Logout using Nhost
  logout: async () => {
    console.log("Logout attempt");
    try {
      const { error } = await nhost.auth.signOut();
      if (error) {
        console.error("Logout error from Nhost:", error);
        throw new Error(error.message);
      }
      console.log("Logout successful");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  },

  // Verify email after registration
  verifyEmail: async (ticket) => {
    console.log("Email verification attempt with ticket:", ticket);
    try {
      const response = await fetch(`${API_BASE_URL}/actions/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ ticket }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getUserProfile: async () => {
    console.log("Get user profile attempt");
    try {
      const response = await fetch(`${API_BASE_URL}/user-profile`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Get user profile error:", error);
      return { success: false, error: error.message };
    }
  },
};

// News APIs
export const newsAPI = {
  // Get personalized news feed
  getFeed: async () => {
    console.log("Getting news feed");
    console.log("AuthToken returned: ", getAuthHeader());
    try {
      const response = await fetch(`${API_BASE_URL}/news/feed`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Get news feed error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get specific article
  getArticle: async (articleId) => {
    console.log("Getting article:", articleId);
    try {
      const response = await fetch(`${API_BASE_URL}/news/articles/${articleId}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Get article error:", error);
      return { success: false, error: error.message };
    }
  },

  // Mark article as read
  markAsRead: async (articleId) => {
    console.log("Marking article as read:", articleId);
    try {
      const response = await fetch(`${API_BASE_URL}/news/read/${articleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Mark as read error:", error);
      return { success: false, error: error.message };
    }
  },

  // Bookmark article
  bookmarkArticle: async (articleId) => {
    console.log("Bookmarking article:", articleId);
    try {
      const response = await fetch(`${API_BASE_URL}/news/bookmark/${articleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Bookmark article error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get bookmarked articles
  getBookmarks: async () => {
    console.log("Getting bookmarks");
    try {
      const response = await fetch(`${API_BASE_URL}/news/bookmarks`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      return { success: false, error: error.message };
    }
  },
};

// User preferences APIs
export const preferencesAPI = {
  // Get user preferences
  getPreferences: async () => {
    console.log("Getting user preferences");
    try {
      const response = await fetch(`${API_BASE_URL}/preferences`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Get preferences error:", error);
      return { success: false, error: error.message };
    }
  },

  // Save user preferences
  savePreferences: async (preferences) => {
    console.log("Saving user preferences:", preferences);
    try {
      const response = await fetch(`${API_BASE_URL}/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(preferences),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Save preferences error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get available topics
  getAvailableTopics: async () => {
    console.log("Getting available topics");
    try {
      const response = await fetch(`${API_BASE_URL}/preferences/available-topics`);
      return handleResponse(response);
    } catch (error) {
      console.error("Get available topics error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get available news sources
  getAvailableSources: async () => {
    console.log("Getting available sources");
    try {
      const response = await fetch(`${API_BASE_URL}/preferences/available-sources`);
      return handleResponse(response);
    } catch (error) {
      console.error("Get available sources error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Generic GraphQL utility using Nhost
export const graphql = {
  // Execute GraphQL query with Nhost client
  request: async (query, variables = {}) => {
    console.log("GraphQL request with variables:", variables);
    try {
      const { data, error } = await nhost.graphql.request(query, variables);
      if (error) {
        console.error("GraphQL error:", error);
        throw new Error(error.message);
      }
      console.log("GraphQL response data:", data);
      return { success: true, data };
    } catch (error) {
      console.error("GraphQL request error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Services for interacting with Nhost/Hasura GraphQL API
// Will uncomment import when actually using it in the GraphQL requests
// import nhost from '../config/nhost';

// News-related GraphQL queries and mutations
const NEWS_FEED_QUERY = `
  query GetNewsFeed($limit: Int = 10) {
    articles(limit: $limit, order_by: {published_at: desc}) {
      id
      title
      summary
      source
      image_url
      published_at
      sentiment
      url
    }
  }
`;

const USER_PREFERENCES_QUERY = `
  query GetUserPreferences {
    user_preferences {
      topics
      sources
      update_frequency
      summary_length
    }
  }
`;

const SAVE_PREFERENCES_MUTATION = `
  mutation SaveUserPreferences($topics: jsonb, $sources: jsonb, $update_frequency: String, $summary_length: String) {
    insert_user_preferences(objects: [
      {
        topics: $topics,
        sources: $sources,
        update_frequency: $update_frequency,
        summary_length: $summary_length
      }
    ], 
    on_conflict: {
      constraint: user_preferences_user_id_key,
      update_columns: [topics, sources, update_frequency, summary_length]
    }) {
      affected_rows
    }
  }
`;

const BOOKMARK_ARTICLE_MUTATION = `
  mutation BookmarkArticle($article_id: uuid!) {
    insert_bookmarks(objects: [{article_id: $article_id}]) {
      affected_rows
    }
  }
`;

const GET_BOOKMARKS_QUERY = `
  query GetBookmarks {
    bookmarks {
      id
      article {
        id
        title
        summary
        source
        image_url
        published_at
        sentiment
        url
      }
    }
  }
`;

// For now, we'll still use mock data, but with proper Nhost functions
// as placeholders for when the backend is fully set up

// News API service
const newsService = {
  // Get news articles based on user preferences
  async getNewsFeed() {
    try {
      // For now, return mock data
      // Later will use: return await nhost.graphql.request(NEWS_FEED_QUERY);
      console.log('Fetching news feed (mock)');
      
      // Mock news data
      const mockArticles = [
        {
          id: 1,
          title: 'AI Breakthrough Promises New Era of Efficient Computing',
          source: 'Tech Innovations',
          summary: 'Researchers have developed a new AI algorithm that reduces computational requirements by 60% while maintaining accuracy, potentially revolutionizing how AI is deployed on edge devices.',
          sentiment: 'positive',
          date: '2023-10-15',
          imageUrl: 'https://placehold.co/600x400/png',
        },
        {
          id: 2,
          title: 'Global Markets React to Economic Policy Shifts',
          source: 'Financial Times',
          summary: 'Major stock indices showed volatility as central banks announced coordinated policy changes aimed at addressing inflation concerns while balancing growth targets.',
          sentiment: 'neutral',
          date: '2023-10-14',
          imageUrl: 'https://placehold.co/600x400/png',
        },
        {
          id: 3,
          title: 'Climate Report Warns of Accelerating Impact on Coastal Regions',
          source: 'Environmental Journal',
          summary: 'Latest climate analysis indicates faster than expected sea level rise, threatening coastal communities and requiring urgent adaptation measures within the next decade.',
          sentiment: 'negative',
          date: '2023-10-13',
          imageUrl: 'https://placehold.co/600x400/png',
        },
      ];
      
      return { data: { articles: mockArticles }, error: null };
    } catch (error) {
      console.error('Error fetching news feed:', error);
      return { data: null, error };
    }
  },
  
  // Get user preferences
  async getUserPreferences() {
    try {
      // For now, return mock data
      // Later will use: return await nhost.graphql.request(USER_PREFERENCES_QUERY);
      return {
        data: {
          user_preferences: {
            topics: ['Technology', 'Business'],
            sources: ['All'],
            update_frequency: 'daily',
            summary_length: 'medium'
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { data: null, error };
    }
  },
  
  // Save user preferences
  async savePreferences(preferences) {
    try {
      // Later will use:
      /*
      return await nhost.graphql.request(SAVE_PREFERENCES_MUTATION, {
        topics: preferences.topics,
        sources: preferences.sources,
        update_frequency: preferences.updateFrequency,
        summary_length: preferences.summaryLength
      });
      */
      console.log('Saving preferences (mock):', preferences);
      return { data: { affected_rows: 1 }, error: null };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { data: null, error };
    }
  },
  
  // Bookmark an article
  async bookmarkArticle(articleId) {
    try {
      // Later will use:
      // return await nhost.graphql.request(BOOKMARK_ARTICLE_MUTATION, { article_id: articleId });
      console.log('Bookmarking article (mock):', articleId);
      return { data: { affected_rows: 1 }, error: null };
    } catch (error) {
      console.error('Error bookmarking article:', error);
      return { data: null, error };
    }
  },
  
  // Get bookmarked articles
  async getBookmarks() {
    try {
      // Later will use: return await nhost.graphql.request(GET_BOOKMARKS_QUERY);
      console.log('Fetching bookmarks (mock)');
      
      // Return empty bookmarks for now
      return {
        data: {
          bookmarks: []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return { data: null, error };
    }
  },
};

// Export just the service
export { newsService };

export default nhost; 