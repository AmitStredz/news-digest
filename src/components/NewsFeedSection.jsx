import React from "react";
import { AlertTriangle, RefreshCw, Info, ExternalLink } from "lucide-react";

const NewsFeedSection = ({ 
  setActiveTab,
  articles,
  isLoading,
  error,
  totalResults,
  page,
  onPageChange,
  onBookmark,
  parseAIAnalysis
}) => {
  
  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-3" />
        <p className="text-gray-600 font-medium">Loading your personalized news feed...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-600 font-medium">{error}</p>
      <button 
        onClick={() => onPageChange(page)}
        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );

  const totalPages = Math.ceil(totalResults / 6); // Using 6 as articles per page

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your News Feed</h2>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-blue-100 shadow-inner">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-blue-100 rounded-full blur-md opacity-70"></div>
            <Info className="relative w-16 h-16 text-blue-500 mb-2" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Articles Found</h3>
          <p className="text-gray-600 text-center max-w-md mb-2">
            We couldn't find any articles matching your current preferences.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Try updating your preferences or adding more topics of interest
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab("preferences")}
              className="px-5 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Update Preferences
            </button>
            <button 
              onClick={() => onPageChange(page)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm flex items-center group"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh Feed
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8">
            {articles.map((article) => {
              const aiAnalysis = article.ai_analysis ? parseAIAnalysis(article.ai_analysis) : null;
              
              return (
                <article
                  key={article.url}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-blue-600 flex items-center cursor-pointer"
                        >
                          {article.title}
                          <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </h2>
                      <div className="text-sm text-gray-600 mb-2 flex items-center">
                        <span className="font-medium">{article.source}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onBookmark(article)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 cursor-pointer"
                      title="Bookmark this article"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>

                  {article.image_url && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-72 object-cover rounded-lg transform hover:scale-105 transition-all duration-700"
                      />
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4 leading-relaxed border-l-4 border-blue-200 pl-4 py-1 bg-blue-50 rounded-r-md italic">
                        {aiAnalysis.summary}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-600 mr-2">Sentiment:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              aiAnalysis.sentiment.toLowerCase() === "positive"
                                ? "bg-green-100 text-green-800"
                                : aiAnalysis.sentiment.toLowerCase() === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {aiAnalysis.sentiment}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                          <span className="font-medium mr-2">Why:</span>
                          {aiAnalysis.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-8 mb-8">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center cursor-pointer disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
            <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center cursor-pointer disabled:cursor-not-allowed"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsFeedSection;
