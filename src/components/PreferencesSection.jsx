import React, { useState, useEffect } from 'react';
import { useUserId } from '@nhost/react';
import { useQuery, useMutation } from '@apollo/client';
import { Check, X, Plus, Search, Globe, Tag, Newspaper, ChevronRight, Info, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GET_USER_PREFERENCES } from '../graphql/queries';
import { UPDATE_USER_PREFERENCES } from '../graphql/mutations';

const PREDEFINED_TOPICS = [
  'Technology', 'Science', 'Politics', 'Business', 
  'Health', 'Entertainment', 'Sports', 'World'
];

const SUGGESTED_SOURCES = [
  'Reuters', 'BBC', 'Associated Press', 'Bloomberg',
  'The Guardian', 'CNN', 'The New York Times', 'TechCrunch',
  'Wired', 'The Verge', 'Financial Times', 'Wall Street Journal'
];

const SUGGESTED_KEYWORDS = {
  'Technology': ['AI', 'blockchain', 'cybersecurity', 'startups', '5G', 'cloud computing'],
  'Science': ['research', 'space', 'climate change', 'quantum', 'biology', 'medicine'],
  'Politics': ['policy', 'election', 'congress', 'democracy', 'legislation', 'government'],
  'Business': ['markets', 'economy', 'stocks', 'investment', 'startup', 'innovation'],
  'Health': ['medical', 'wellness', 'healthcare', 'research', 'medicine', 'nutrition'],
  'Entertainment': ['movies', 'music', 'streaming', 'celebrity', 'arts', 'culture'],
  'Sports': ['football', 'basketball', 'soccer', 'olympics', 'tennis', 'baseball'],
  'World': ['international', 'global', 'diplomacy', 'trade', 'climate', 'foreign policy']
};

const PreferencesSection = () => {
  const userId = useUserId();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [sources, setSources] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSource, setNewSource] = useState('');
  const [showSuggestedKeywords, setShowSuggestedKeywords] = useState(false);

  const { data, loading: preferencesLoading } = useQuery(GET_USER_PREFERENCES);
  
  const [updatePreferences, { loading: updating }] = useMutation(UPDATE_USER_PREFERENCES, {
    refetchQueries: [{ query: GET_USER_PREFERENCES }]
  });

  useEffect(() => {
    if (data?.user_preferences?.[0]) {
      setSelectedTopic(data.user_preferences[0].topics?.[0] || '');
      setKeywords(data.user_preferences[0].keywords || []);
      setSources(data.user_preferences[0].preferred_sources || []);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePreferences({
        variables: {
          userId,
          topics: selectedTopic ? [selectedTopic] : [],
          keywords,
          preferred_sources: sources
        }
      });
      toast.success('Preferences saved successfully!', {
        duration: 3000,
        icon: <Check className="h-5 w-5" />,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to save preferences. Please try again.', {
        duration: 3000,
        icon: <X className="h-5 w-5" />,
      });
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setShowSuggestedKeywords(true);
    toast.success(`Selected topic: ${topic}`, {
      duration: 2000,
      icon: <Check className="h-5 w-5" />,
    });
  };

  const handleAddKeyword = (keyword = newKeyword) => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setNewKeyword('');
      toast.success(`Added keyword: ${keyword}`, {
        duration: 2000,
        icon: <Plus className="h-5 w-5" />,
      });
    }
  };

  const handleAddSource = (source = newSource) => {
    if (source && !sources.includes(source)) {
      setSources([...sources, source]);
      setNewSource('');
      toast.success(`Added source: ${source}`, {
        duration: 2000,
        icon: <Plus className="h-5 w-5" />,
      });
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
    toast.success(`Removed keyword: ${keyword}`, {
      duration: 2000,
      icon: <X className="h-5 w-5" />,
    });
  };

  const handleRemoveSource = (source) => {
    setSources(sources.filter(s => s !== source));
    toast.success(`Removed source: ${source}`, {
      duration: 2000,
      icon: <X className="h-5 w-5" />,
    });
  };

  const handleClearFilters = async () => {
    try {
      setSelectedTopic('');
      setKeywords([]);
      setSources([]);
      setNewKeyword('');
      setNewSource('');
      setShowSuggestedKeywords(false);

      await updatePreferences({
        variables: {
          userId,
          topics: [],
          keywords: [],
          preferred_sources: []
        }
      });

      toast.success('All filters cleared successfully!', {
        duration: 3000,
        icon: <Trash2 className="h-5 w-5" />,
      });
    } catch (error) {
      console.error('Error clearing preferences:', error);
      toast.error('Failed to clear preferences. Please try again.', {
        duration: 3000,
        icon: <X className="h-5 w-5" />,
      });
    }
  };

  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">News Preferences</h2>
        <button
          onClick={handleClearFilters}
          className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
      
      {/* Topic Selection */}
      <div className="bg-gray-50 p-6 rounded-lg transform transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700 group cursor-pointer">
          <Globe className="h-5 w-5 mr-2 text-blue-600 group-hover:rotate-12 transition-transform" />
          Select a Topic
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PREDEFINED_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => handleTopicSelect(topic)}
              className={`p-3 rounded-lg text-center transition-all duration-200 transform cursor-pointer ${
                selectedTopic === topic 
                  ? 'bg-blue-600 text-white shadow-md scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102 shadow-sm'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Section */}
      <div className="bg-gray-50 p-6 rounded-lg transform transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700 group cursor-pointer">
          <Tag className="h-5 w-5 mr-2 text-blue-600 group-hover:rotate-12 transition-transform" />
          Keywords
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map(keyword => (
            <span
              key={keyword}
              className="px-3 py-1 bg-white text-gray-700 rounded-full flex items-center shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Add a keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            onClick={() => handleAddKeyword()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>
        {selectedTopic && showSuggestedKeywords && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Suggested keywords for {selectedTopic}:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_KEYWORDS[selectedTopic].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => handleAddKeyword(keyword)}
                  className="px-3 py-1 bg-white text-gray-700 rounded-full hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center group cursor-pointer"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sources Section */}
      <div className="bg-gray-50 p-6 rounded-lg transform transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700 group cursor-pointer">
          <Newspaper className="h-5 w-5 mr-2 text-blue-600 group-hover:rotate-12 transition-transform" />
          Preferred Sources
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {sources.map(source => (
            <span
              key={source}
              className="px-3 py-1 bg-white text-gray-700 rounded-full flex items-center shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              {source}
              <button
                onClick={() => handleRemoveSource(source)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
              placeholder="Add a source..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            onClick={() => handleAddSource()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Suggested sources:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SOURCES.map(source => (
              <button
                key={source}
                onClick={() => handleAddSource(source)}
                className="px-3 py-1 bg-white text-gray-700 rounded-full hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center group cursor-pointer"
              >
                <ChevronRight className="h-3 w-3 mr-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                {source}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center transform hover:scale-102 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
      >
        {updating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </button>
    </div>
  );
};

export default PreferencesSection; 