import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InterestSelection = ({ updateUserData, userData }) => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock interests data
  const interests = [
    { id: 'animals', name: 'Djur', imageUrl: '', color: '#8BC34A' },
    { id: 'space', name: 'Rymden', imageUrl: '', color: '#3F51B5' },
    { id: 'sports', name: 'Sport', imageUrl: '', color: '#FF5722' },
    { id: 'music', name: 'Musik', imageUrl: '', color: '#9C27B0' },
    { id: 'nature', name: 'Natur', imageUrl: '', color: '#4CAF50' },
    { id: 'history', name: 'Historia', imageUrl: '', color: '#795548' },
    { id: 'tech', name: 'Teknik', imageUrl: '', color: '#607D8B' },
    { id: 'food', name: 'Mat', imageUrl: '', color: '#FF9800' },
    { id: 'fantasy', name: 'Fantasy', imageUrl: '', color: '#E91E63' },
    { id: 'science', name: 'Vetenskap', imageUrl: '', color: '#009688' },
    { id: 'art', name: 'Konst', imageUrl: '', color: '#FFEB3B' },
    { id: 'travel', name: 'Resor', imageUrl: '', color: '#2196F3' }
  ];

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleContinue = () => {
    updateUserData({ interests: selectedInterests });
    navigate('/stories');
  };

  // Filter interests based on search query
  const filteredInterests = interests.filter(interest => 
    interest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if we're setting up for the user or a child
  const isForSelf = userData.userType === 'myself';
  const title = isForSelf 
    ? 'Välj några intressen' 
    : `Välj intressen för ${userData.childName}`;
  const subtitle = 'Välj minst 3. Vi skapar några särskilda läslektioner baserat på detta.';

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '96%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">{title}</h1>
      <p className="onboarding-subtitle">{subtitle}</p>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Sök intressen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="interest-grid">
        {filteredInterests.map(interest => (
          <div key={interest.id} style={{ textAlign: 'center' }}>
            <div
              className={`interest-option ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest.id)}
              style={{ backgroundColor: interest.color }}
            >
              {interest.imageUrl ? (
                <img src={interest.imageUrl} alt={interest.name} />
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  {interest.name.charAt(0)}
                </div>
              )}
            </div>
            <p className="interest-name">{interest.name}</p>
          </div>
        ))}
      </div>

      <div className="button-container">
        <button
          className="primary-button"
          disabled={selectedInterests.length < 3}
          onClick={handleContinue}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default InterestSelection;