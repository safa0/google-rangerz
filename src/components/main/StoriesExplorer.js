import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoriesbyUserID } from './story_api_render.js';  // Import the new API function

const StoriesExplorer = ({ userData }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou');

  useEffect(() => {
    const fetchStories = async () => {
      // user id is hardcoded for now
      // if (!userData || !userData.id) return;
      const fetchedStories = await getStoriesbyUserID("user_123");
      if (fetchedStories.length > 0) {
        setStories(fetchedStories);
      } else {
        console.error("No stories found for user.");
      }
    };

    fetchStories();
  }, [userData]);

  const handleStorySelect = (storyId) => {
    navigate(`/story/${storyId}`);
  };

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
        <input type="text" placeholder="Sök sagor..." />
      </div>

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
              <div className="story-title">{story.title}</div>
            </div>
          ))
        )}
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
