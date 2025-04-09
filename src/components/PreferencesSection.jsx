import React, { useState, useEffect } from 'react';
import { useUserId } from '@nhost/react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PREFERENCES } from '../graphql/queries';
import { UPDATE_USER_PREFERENCES } from '../graphql/mutations';

const PREDEFINED_TOPICS = [
  'Technology', 'Science', 'Politics', 'Business', 
  'Health', 'Entertainment', 'Sports', 'World'
];

const PREDEFINED_SOURCES = [
  'Reuters', 'BBC', 'Associated Press', 'Bloomberg',
  'The Guardian', 'CNN', 'The New York Times'
];

const PreferencesSection = () => {
  const userId = useUserId();
  const [topics, setTopics] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [sources, setSources] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSource, setNewSource] = useState('');

  const { data, loading: preferencesLoading } = useQuery(GET_USER_PREFERENCES);
  
  const [updatePreferences, { loading: updating }] = useMutation(UPDATE_USER_PREFERENCES, {
    refetchQueries: [{ query: GET_USER_PREFERENCES }]
  });

  useEffect(() => {
    if (data?.user_preferences?.[0]) {
      setTopics(data.user_preferences[0].topics || []);
      setKeywords(data.user_preferences[0].keywords || []);
      setSources(data.user_preferences[0].preferred_sources || []);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePreferences({
        variables: {
          userId,
          topics,
          keywords,
          preferred_sources: sources
        }
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleAddTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic('');
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleAddSource = () => {
    if (newSource && !sources.includes(newSource)) {
      setSources([...sources, newSource]);
      setNewSource('');
    }
  };

  const handleRemoveTopic = (topic) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleRemoveSource = (source) => {
    setSources(sources.filter(s => s !== source));
  };

  if (preferencesLoading) return <div className="p-4">Loading preferences...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">News Preferences</h2>
      
      {/* Topics Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Topics of Interest</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {topics.map(topic => (
            <span
              key={topic}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center"
            >
              {topic}
              <button
                onClick={() => handleRemoveTopic(topic)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
            placeholder="Add a topic..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAddTopic}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Keywords</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map(keyword => (
            <span
              key={keyword}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center"
            >
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-2 text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            placeholder="Add a keyword..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Sources Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Preferred Sources</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {sources.map(source => (
            <span
              key={source}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center"
            >
              {source}
              <button
                onClick={() => handleRemoveSource(source)}
                className="ml-2 text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
            placeholder="Add a source..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAddSource}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {updating ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default PreferencesSection; 