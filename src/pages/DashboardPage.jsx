import React, { useState } from 'react';
import { useUserId } from '@nhost/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import PreferencesSection from '../components/PreferencesSection';
import NewsFeedSection from '../components/NewsFeedSection';
import BookmarksSection from '../components/BookmarksSection';

// GraphQL Queries and Mutations
const GET_USER_PREFERENCES = gql`
  query GetUserPreferences($userId: uuid!) {
    user_preferences(where: { user_id: { _eq: $userId } }) {
      id
      topics
      keywords
      preferred_sources
      update_frequency
      created_at
      updated_at
    }
  }
`;

const UPSERT_PREFERENCES = gql`
  mutation UpsertPreferences(
    $user_id: uuid!,
    $topics: jsonb!,
    $keywords: jsonb!,
    $preferred_sources: jsonb!,
    $update_frequency: String
  ) {
    insert_user_preferences(
      objects: [{
        user_id: $user_id,
        topics: $topics,
        keywords: $keywords,
        preferred_sources: $preferred_sources,
        update_frequency: $update_frequency
      }],
      on_conflict: {
        constraint: user_preferences_user_id_key,
        update_columns: [topics, keywords, preferred_sources, update_frequency]
      }
    ) {
      returning {
        id
        topics
        keywords
        preferred_sources
        update_frequency
        updated_at
      }
    }
  }
`;

const DashboardPage = () => {
  const userId = useUserId();
  const [activeTab, setActiveTab] = useState('feed');
  const [error, setError] = useState(null);

  // Query for user preferences
  const { data: preferencesData, loading: preferencesLoading } = useQuery(GET_USER_PREFERENCES, {
    variables: { userId },
    skip: !userId,
  });

  // Mutation for updating preferences
  const [updatePreferences] = useMutation(UPSERT_PREFERENCES, {
    refetchQueries: [{ query: GET_USER_PREFERENCES, variables: { userId } }],
  });

  const handleSavePreferences = async (newPreferences) => {
    try {
      await updatePreferences({
        variables: {
          user_id: userId,
          topics: newPreferences.topics || [],
          keywords: newPreferences.keywords || [],
          preferred_sources: newPreferences.preferred_sources || [],
          update_frequency: newPreferences.update_frequency || 'daily'
        }
      });
      setActiveTab('feed');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message);
    }
  };

  if (preferencesLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const preferences = preferencesData?.user_preferences[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'feed'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          News Feed
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bookmarks'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bookmarks
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'preferences'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'feed' && (
        <NewsFeedSection />
      )}

      {activeTab === 'bookmarks' && (
        <BookmarksSection />
      )}

      {activeTab === 'preferences' && (
        <PreferencesSection
          preferences={preferences}
          onSavePreferences={handleSavePreferences}
        />
      )}
    </div>
  );
};

export default DashboardPage; 