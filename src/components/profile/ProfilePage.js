import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = ({ userData }) => {
  const navigate = useNavigate();
  const [profileStats, setProfileStats] = useState({
    name: 'John Singer',
    username: '@JohnSinger',
    joinDate: 'March 2025',
    currentStreak: 1,
    longestStreak: 1,
    totalXP: 6,
    storiesCompletedToday: 1,
    totalStoriesCompleted: 1,
    following: 0,
    followers: 0,
    league: 'Guld',
    topFinishes: 3,
    badges: ['reader', 'fast', 'accurate', 'consistent'],
    characterUrl: '',
    characterColor: '#4267B2'
  });
  
  const [showWrappedPreview, setShowWrappedPreview] = useState(false);
  const [animateXP, setAnimateXP] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);
  
  useEffect(() => {
    // In a real app, we would fetch this data from an API or database
    // based on the user's ID or other identifying information
    if (userData && userData.childName) {
      setProfileStats(prev => ({
        ...prev,
        name: userData.childName
      }));
    }
    
    // Simulate fetching data
    setTimeout(() => {
      // Animate stats after data is loaded
      setAnimateXP(true);
      
      setTimeout(() => {
        setAnimateStreak(true);
      }, 300);
    }, 500);
  }, [userData]);
  
  const handleAddFriends = () => {
    alert('Friend feature coming soon!');
  };
  
  const handleShareProfile = () => {
    alert('Share feature coming soon!');
  };
  
  const toggleWrappedPreview = () => {
    setShowWrappedPreview(!showWrappedPreview);
  };
  
  const startNewStory = () => {
    navigate('/stories');
  };
  
  return (
    <div className="profile-page">
      {/* Header with settings */}
      <div className="profile-header">
        <div className="invisible-placeholder"></div>
        <h1 className="profile-title">Profil</h1>
        <button className="settings-button" onClick={() => alert('Settings feature coming soon!')}>
          ⚙️
        </button>
      </div>
      
      {/* Profile banner and info */}
      <div className="profile-banner" style={{ backgroundColor: profileStats.characterColor }}>
        <div className="profile-avatar">
          {profileStats.characterUrl ? (
            <img src={profileStats.characterUrl} alt="Character" />
          ) : (
            <div className="character-placeholder">
              <span>{profileStats.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-info">
        <h2 className="profile-name">{profileStats.name}</h2>
        <p className="profile-username">{profileStats.username} • Började {profileStats.joinDate}</p>
        
        <div className="profile-social">
          <div className="social-item">
            <img src="/flags/swedish.png" alt="Swedish" className="course-flag" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23006AA7"/><rect x="10" y="0" width="4" height="32" fill="%23FECC02"/><rect x="0" y="14" width="32" height="4" fill="%23FECC02"/></svg>';
              }}
            />
            <span className="social-label">Svenska</span>
          </div>
          <div className="social-item">
            <span className="social-count">{profileStats.following}</span>
            <span className="social-label">Följer</span>
          </div>
          <div className="social-item">
            <span className="social-count">{profileStats.followers}</span>
            <span className="social-label">Följare</span>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="action-button add-friends" onClick={handleAddFriends}>
            <span className="action-icon">👥</span> LÄGG TILL VÄNNER
          </button>
          <button className="action-button share" onClick={handleShareProfile}>
            <span className="action-icon">↗️</span>
          </button>
        </div>
      </div>
      
      {/* Overview section */}
      <section className="profile-section">
        <h3 className="section-title">Översikt</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FF9600' }}>🔥</div>
            <div className={`stat-value ${animateStreak ? 'animate-in' : ''}`}>{profileStats.currentStreak}</div>
            <div className="stat-label">Dagars svit</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FFC800' }}>⚡</div>
            <div className={`stat-value ${animateXP ? 'animate-in' : ''}`}>{profileStats.totalXP}</div>
            <div className="stat-label">Totala XP</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FFDD00' }}>🏆</div>
            <div className="stat-value">{profileStats.league}</div>
            <div className="stat-label">Liga</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FFE300' }}>🏅</div>
            <div className="stat-value">{profileStats.topFinishes}</div>
            <div className="stat-label">Topp 3 i ligor</div>
          </div>
        </div>
      </section>
      
      {/* Today's activity */}
      <section className="profile-section">
        <h3 className="section-title">Idag</h3>
        
        <div className="today-activity">
          <div className="activity-item">
            <div className="activity-icon">📚</div>
            <div className="activity-info">
              <div className="activity-value">{profileStats.storiesCompletedToday}</div>
              <div className="activity-label">Sagor avklarade</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">⏱️</div>
            <div className="activity-info">
              <div className="activity-value">15</div>
              <div className="activity-label">Minuter</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">🎯</div>
            <div className="activity-info">
              <div className="activity-value">87%</div>
              <div className="activity-label">Korrekt</div>
            </div>
          </div>
        </div>
        
        <button className="story-button" onClick={startNewStory}>
          <span className="button-icon">📖</span>
          <span className="button-text">Läs en ny saga</span>
        </button>
      </section>
      
      {/* Records and achievements */}
      <section className="profile-section">
        <h3 className="section-title">Rekord och prestationer</h3>
        
        <div className="records-list">
          <div className="record-item">
            <div className="record-icon">🔥</div>
            <div className="record-info">
              <div className="record-label">Längsta svit</div>
              <div className="record-value">{profileStats.longestStreak} dagar</div>
            </div>
          </div>
          
          <div className="record-item">
            <div className="record-icon">📚</div>
            <div className="record-info">
              <div className="record-label">Totalt lästa sagor</div>
              <div className="record-value">{profileStats.totalStoriesCompleted}</div>
            </div>
          </div>
          
          <div className="record-item">
            <div className="record-icon">🎓</div>
            <div className="record-info">
              <div className="record-label">Inlärda ord</div>
              <div className="record-value">135</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Wrapped Feature */}
      <section className="profile-section wrapped-section" onClick={toggleWrappedPreview}>
        <div className="wrapped-banner">
          <div className="wrapped-content">
            <h3 className="wrapped-title">Årlig sammanfattning</h3>
            <p className="wrapped-subtitle">Klicka för att se din läsningsresa!</p>
          </div>
          <div className="wrapped-icon">🎁</div>
        </div>
        
        {showWrappedPreview && (
          <div className="wrapped-preview">
            <div className="wrapped-stat">
              <div className="wrapped-stat-value">100+</div>
              <div className="wrapped-stat-label">ord inlärda</div>
            </div>
            <div className="wrapped-stat">
              <div className="wrapped-stat-value">15</div>
              <div className="wrapped-stat-label">sagor lästa</div>
            </div>
            <div className="wrapped-stat">
              <div className="wrapped-stat-value">7</div>
              <div className="wrapped-stat-label">längsta svit</div>
            </div>
            <button className="wrapped-share-button" onClick={(e) => {
              e.stopPropagation();
              alert('Dela din sammanfattning med vänner och familj!');
            }}>
              DELA SAMMANFATTNING
            </button>
          </div>
        )}
      </section>
      
      {/* Badges section */}
      <section className="profile-section">
        <h3 className="section-title">Dina märken</h3>
        
        <div className="badges-grid">
          {profileStats.badges.map((badge, index) => (
            <div key={index} className="badge-item">
              <div className="badge-icon">
                {badge === 'reader' && '📚'}
                {badge === 'fast' && '⚡'}
                {badge === 'accurate' && '🎯'}
                {badge === 'consistent' && '🔥'}
              </div>
              <div className="badge-name">
                {badge === 'reader' && 'Bokmal'}
                {badge === 'fast' && 'Snabb'}
                {badge === 'accurate' && 'Noggrann'}
                {badge === 'consistent' && 'Konsekvent'}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Navigation bar */}
      <div className="nav-bar">
        <button className="nav-item" onClick={() => navigate('/stories')}>
          <span className="nav-icon">📚</span>
          <span className="nav-label">Sagor</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/games')}>
          <span className="nav-icon">🎮</span>
          <span className="nav-label">Spela</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profil</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;