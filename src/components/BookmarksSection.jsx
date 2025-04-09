import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useAuthQuery } from '@nhost/react-apollo';
import { REMOVE_BOOKMARK } from '../graphql/mutations';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

const GET_BOOKMARKS = gql`
  query GetBookmarks {
    bookmarks(order_by: { created_at: desc }) {
      id
      created_at
      article {
        id
        title
        summary
        url
        source
        published_at
        sentiment_label
        image_url
      }
    }
  }
`;

const BookmarksSection = () => {
  const { data, loading, error, refetch: refetchBookmarks } = useAuthQuery(GET_BOOKMARKS);

  const [removeBookmark] = useMutation(REMOVE_BOOKMARK, {
    onCompleted: async () => {
      await refetchBookmarks();
      toast.success('Bookmark removed successfully');
    },
    onError: (error) => {
      toast.error('Error removing bookmark: ' + error.message);
    }
  });

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await removeBookmark({
        variables: { bookmarkId }
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) return <div className="p-4">Loading bookmarks...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading bookmarks: {error.message}</div>;

  const bookmarks = data?.bookmarks || [];

  return (
    <div className="max-w-4xl mx-auto">
      {bookmarks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookmarks yet. Start saving articles from the News Feed!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map(({ id, article, created_at }) => (
            <article key={id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                  <div className="text-sm text-gray-500">
                    Bookmarked on: {new Date(created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBookmark(id)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title="Remove bookmark"
                >
                  <Trash className="w-5 h-5 text-red-500" />
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
                <p className="text-gray-700">{article.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Sentiment:</span>
                <span className={`px-2 py-1 text-sm rounded ${
                  article.sentiment_label === 'positive' ? 'bg-green-100 text-green-800' :
                  article.sentiment_label === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {article.sentiment_label}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksSection; 