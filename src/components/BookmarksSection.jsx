import React from 'react';
import { useMutation } from '@apollo/client';
import { useAuthQuery } from '@nhost/react-apollo';
import { REMOVE_BOOKMARK } from '../graphql/mutations';
import { GET_BOOKMARKS } from '../graphql/queries';
import { toast } from 'sonner';
import { Trash, BookOpen, Calendar, Clock, AlertTriangle } from 'lucide-react';

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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-600 font-medium">Error loading bookmarks: {error.message}</p>
    </div>
  );

  const bookmarks = data?.bookmarks || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookmarks</h2>
      
      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No bookmarks yet. Start saving articles from the News Feed!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((bookmark) => (
            <article 
              key={bookmark.id} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      {bookmark.title}
                    </a>
                  </h2>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">{bookmark.source}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(bookmark.published_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Bookmarked on: {new Date(bookmark.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer group"
                  title="Remove bookmark"
                >
                  <Trash className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                </button>
              </div>

              {bookmark.image_url && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={bookmark.image_url}
                    alt={bookmark.title}
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              {bookmark.summary && (
                <div className="prose max-w-none mb-4 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-700">{bookmark.summary}</p>
                </div>
              )}

              {bookmark.sentiment_label && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm font-medium text-gray-600">Sentiment:</span>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                    bookmark.sentiment_label.toLowerCase() === 'positive' ? 'bg-green-100 text-green-800' :
                    bookmark.sentiment_label.toLowerCase() === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bookmark.sentiment_label}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksSection; 