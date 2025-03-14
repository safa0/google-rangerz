import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoriesbyUserID, getChaptersByStory } from './story_api_render.js';  // Import the new API function
import { AuthContext } from '../../App';

const StoriesExplorer = ({ userData }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou');
  const [isLoading, setIsLoading] = useState(true);
  const [userInterests, setUserInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for stories - in a real app, this would come from an API
  const mockStories = [
    {
      id: 1,
      title: "Zari and The Giganto-Pop",
      category: 'animals',
      difficulty: 'beginner',
      thumbnail: '',
      color: '#8BC34A'
    },
    {
      id: 2,
      title: "Rymdresan",
      category: 'space',
      difficulty: 'intermediate',
      thumbnail: '',
      color: '#3F51B5'
    },
    {
      id: 3,
      title: "Fotbollsmatchen",
      category: 'sports',
      difficulty: 'beginner',
      thumbnail: '',
      color: '#FF5722'
    },
    {
      id: 4,
      title: "Musikskolan",
      category: 'music',
      difficulty: 'advanced',
      thumbnail: '',
      color: '#9C27B0'
    },
    {
      id: 5,
      title: "Skogsäventyret",
      category: 'nature',
      difficulty: 'intermediate',
      thumbnail: '',
      color: '#4CAF50'
    },
    {
      id: 6,
      title: "Vikingaresan",
      category: 'history',
      difficulty: 'advanced',
      thumbnail: '',
      color: '#795548'
    }
  ];

  // Load user preferences directly from API
  useEffect(() => {
    console.log("StoriesExplorer: Component mounted");
    setIsLoading(true);

    const fetchUserData = async () => {
      try {
        // Fetch user data directly from API to get the latest
        const response = await fetch('http://localhost:5000/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        console.log("StoriesExplorer: Fetched user data:", data);

        if (data.status === 'success') {
          if (data.userPreferences && data.userPreferences.interests) {
            // Use the interests from the API response
            console.log("StoriesExplorer: Using interests from API:", data.userPreferences.interests);
            setUserInterests(data.userPreferences.interests);
          } else if (userData && userData.interests && userData.interests.length > 0) {
            // Fallback to userData if available
            console.log("StoriesExplorer: Using interests from props:", userData.interests);
            setUserInterests(userData.interests);
          } else {
            console.log("StoriesExplorer: No interests found, showing all stories");
            setUserInterests([]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    // Initialize all stories
    const fetchStories = async () => {
      // user id is hardcoded for now
      // if (!userData || !userData.id) return;
      const fetchedStories = await getStoriesbyUserID("user_123");
      console.log(fetchedStories)
      for (let i = 0; i < fetchedStories.length; i++) {
        console.log(fetchedStories[i].id);
        const chapters = await getChaptersByStory(fetchedStories[i].id);
        fetchedStories[i].thumbnail = chapters[0].image
      } 
      
      if (fetchedStories.length > 0) {
        setStories(fetchedStories);
      } else {
        console.error("No stories found for user.");
      }
    };

    fetchStories();
  }, [userData]);

  // Filter stories when interests change or tab changes
  useEffect(() => {
    console.log("StoriesExplorer: User interests updated:", userInterests);
    
    if (activeTab === 'forYou' && userInterests && userInterests.length > 0) {
      // Filter stories based on user interests
      const filtered = mockStories.filter(story => 
        userInterests.includes(story.category)
      );
      console.log("Filtered stories based on interests:", filtered);
      
      if (filtered.length > 0) {
        setFilteredStories(filtered);
      } else {
        console.log("No matching stories found, showing all");
        setFilteredStories(mockStories);
      }
    } else {
      console.log("No user interests found or 'discover' tab active, showing all stories");
      setFilteredStories(mockStories);
    }
  }, [userInterests, activeTab]);

  // Function to handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search is empty, use the regular filtering logic
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const searchResults = stories.filter(story => 
      story.title.toLowerCase().includes(query) || 
      story.category.toLowerCase().includes(query)
    );
    
    setFilteredStories(searchResults);
  }, [searchQuery, stories]);

  const handleStorySelect = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // If component is still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="stories-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <p>Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="stories-container">
      <div className="stories-header">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>For You</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === 'forYou' ? '#58CC02' : '#f0f0f0',
              color: activeTab === 'forYou' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('forYou')}
          >
            För dig
          </button>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === 'discover' ? '#58CC02' : '#f0f0f0',
              color: activeTab === 'discover' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('discover')}
          >
            Upptäck
          </button>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Sök sagor..." 
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Show user interests if available */}
      {userInterests && userInterests.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          margin: '0 0 16px 0',
          padding: '0 8px'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Your interests: </span>
          {userInterests.map(interest => (
            <span 
              key={interest} 
              style={{ 
                fontSize: '14px', 
                backgroundColor: '#f0f0f0', 
                padding: '4px 8px', 
                borderRadius: '12px',
                color: '#333'
              }}
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      {/* Show debug info for development */}
      <div style={{ 
        margin: '0 0 16px 0',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <p>Debug info:</p>
        <p>User interests count: {userInterests ? userInterests.length : 'none'}</p>
        <p>Interests: {userInterests && userInterests.length > 0 ? userInterests.join(', ') : 'none'}</p>
        <p>Filtered stories: {filteredStories.length}</p>
      </div>

      {/* Show filtered stories */}
      <div className="stories-grid">
        {stories.length === 0 ? (
          <p>No stories available</p>
        ) : (
          stories.map(story => (
            <div 
              key={story.id} 
              className="story-card"
              onClick={() => handleStorySelect(story.id)}
            >
              {story.thumbnail ? (
                <img src={story.thumbnail} alt={story.title} className="story-image" />
              ) : (
                <div 
                  style={{ 
                    height: '100%', 
                    // random background color
                    backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: 'white'
                  }}
                >
                  {story.title.charAt(0)}
                </div>
              )}
              <div className="story-title">
                {story.title}
                <div style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  display: 'inline-block',
                  marginLeft: '6px'
                }}>
                  {story.category}
                </div>
              </div>
            </div>
          ))
        )} : (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            width: '100%',
            color: '#666'
          }}>
            No stories found matching your criteria
          </div>
        )
      </div>

      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 16px'
        }}
      >
        <button
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#58CC02',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>📚</span>
          SAGOR
        </button>
        <button
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#777',
            fontSize: '12px'
          }}
        >
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>🎮</span>
          SPELA
        </button>
        <button
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#777',
            fontSize: '12px'
          }}
          onClick={() => navigate('/profile')}
        >
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>👤</span>
          PROFIL
        </button>
      </div>
    </div>
  );
};

export default StoriesExplorer;
