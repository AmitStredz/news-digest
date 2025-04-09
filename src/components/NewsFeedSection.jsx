import React, { useState } from 'react';
import { useUserId } from '@nhost/react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ARTICLES } from '../graphql/queries';
import { ADD_BOOKMARK } from '../graphql/mutations';

const NewsFeedSection = () => {
  const userId = useUserId();
  const [page, setPage] = useState(1);
  const articlesPerPage = 10;

  const { data, loading, error } = useQuery(GET_ARTICLES, {
    variables: {
      limit: articlesPerPage,
      offset: (page - 1) * articlesPerPage
    }
  });

  const [addBookmark] = useMutation(ADD_BOOKMARK, {
    onError: (error) => {
      console.error('Error adding bookmark:', error);
    }
  });

  const handleBookmark = async (articleId) => {
    try {
      await addBookmark({
        variables: {
          userId,
          articleId
        }
      });
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  if (loading) return <div className="p-4">Loading articles...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading articles: {error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {data?.articles.map((article) => (
        <article key={article.id} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {article.title}
                </a>
              </h2>
              <div className="text-sm text-gray-600 mb-2">
                {article.source} • {new Date(article.published_at).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => handleBookmark(article.id)}
              className="text-gray-500 hover:text-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="prose max-w-none mb-4">
            <p>{article.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">Sentiment:</span>
              <span className={`px-2 py-1 rounded ${
                article.sentiment_label === 'positive' ? 'bg-green-100 text-green-800' :
                article.sentiment_label === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {article.sentiment_label}
              </span>
            </div>
            {article.sentiment_explanation && (
              <div className="text-sm text-gray-600">
                <span className="font-medium mr-2">Why:</span>
                {article.sentiment_explanation}
              </div>
            )}
          </div>
        </article>
      ))}

      <div className="flex justify-between items-center mt-6 mb-8">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.articles?.length || data.articles.length < articlesPerPage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NewsFeedSection; 