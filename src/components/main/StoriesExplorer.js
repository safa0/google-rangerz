import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const StoriesExplorer = ({ userData }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for stories based on selected interests
  useEffect(() => {
    console.log("StoriesExplorer: Component mounted");
    setIsLoading(true);
    
    // In a real app, this would fetch from an API based on user interests
    const mockStories = [
      {
        id: 1,
        title: "Zari and The Giganto-Pop",
        category: 'animals',
        difficulty: 'beginner',
        imageUrl: '',
        color: '#8BC34A'
      },
      {
        id: 2,
        title: "Rymdresan",
        category: 'space',
        difficulty: 'intermediate',
        imageUrl: '',
        color: '#3F51B5'
      },
      {
        id: 3,
        title: "Fotbollsmatchen",
        category: 'sports',
        difficulty: 'beginner',
        imageUrl: '',
        color: '#FF5722'
      },
      {
        id: 4,
        title: "Musikskolan",
        category: 'music',
        difficulty: 'advanced',
        imageUrl: '',
        color: '#9C27B0'
      },
      {
        id: 5,
        title: "Skogsäventyret",
        category: 'nature',
        difficulty: 'intermediate',
        imageUrl: '',
        color: '#4CAF50'
      },
      {
        id: 6,
        title: "Vikingaresan",
        category: 'history',
        difficulty: 'advanced',
        imageUrl: '',
        color: '#795548'
      }
    ];

    console.log("StoriesExplorer: User interests:", userData?.interests);

    // Ensure userData.interests exists
    if (userData && userData.interests && userData.interests.length > 0) {
      try {
        const filteredStories = mockStories.filter(story => 
          userData.interests.includes(story.category)
        );
        console.log("Filtered stories based on interests:", filteredStories);
        setStories(filteredStories.length > 0 ? filteredStories : mockStories);
      } catch (error) {
        console.error("Error filtering stories:", error);
        setStories(mockStories);
      }
    } else {
      console.log("No user interests found, showing all stories");
      setStories(mockStories);
    }
    
    setIsLoading(false);
  }, [userData]);

  // Function to handle story selection
  const handleStorySelect = (storyId) => {
    navigate(`/story/${storyId}`);
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

  // If there's no user or userData, show an error
  if (!user) {
    console.error("StoriesExplorer: No user found");
    return (
      <div className="stories-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div>
          <p>Session error. Please login again.</p>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#58CC02',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Go to Login
          </button>
        </div>
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
        <input type="text" placeholder="Sök sagor..." />
      </div>

      <div className="stories-grid">
        {stories.map(story => (
          <div 
            key={story.id} 
            className="story-card"
            onClick={() => handleStorySelect(story.id)}
          >
            {story.imageUrl ? (
              <img src={story.imageUrl} alt={story.title} className="story-image" />
            ) : (
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: story.color,
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
        ))}
      </div>

      {/* Navigation bar for mobile */}
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