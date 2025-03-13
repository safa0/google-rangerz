import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CharacterSelection = ({ updateUserData, userData }) => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState('');

  // Array of character options
  const characters = [
    { id: 'frog', emoji: '🐸', color: '#8BC34A' },
    { id: 'chick', emoji: '🐥', color: '#FFEB3B' },
    { id: 'crab', emoji: '🦀', color: '#F44336' },
    { id: 'whale', emoji: '🐳', color: '#2196F3' },
    { id: 'unicorn', emoji: '🦄', color: '#E91E63' },
    { id: 'penguin', emoji: '🐧', color: '#212121' },
    { id: 'parrot', emoji: '🦜', color: '#FF9800' },
    { id: 'panda', emoji: '🐼', color: '#EEEEEE' },
    { id: 'lion', emoji: '🦁', color: '#FFA000' },
    { id: 'koala', emoji: '🐨', color: '#9E9E9E' },
    { id: 'giraffe', emoji: '🦒', color: '#FFC107' },
    { id: 'snake', emoji: '🐍', color: '#4CAF50' }
  ];

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
  };

  const handleContinue = () => {
    // Store selected character in local state
    console.log("Selected character:", selectedCharacter);
    updateUserData({ character: selectedCharacter });
    navigate('/interest-selection');
  };

  // Determine if we're setting up for the user or a child
  const isForSelf = userData.userType === 'myself';
  const title = isForSelf 
    ? 'Välj en karaktär' 
    : `Välj en karaktär för ${userData.childName}`;

  return (
    <div className="onboarding-container" style={{ 
      maxWidth: '700px',  // Increased from default
      padding: '0 20px',  // Add horizontal padding
      margin: '0 auto'    // Center the container
    }}>
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '80%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title" style={{ marginBottom: '30px' }}>{title}</h1>

      {/* Controlled width of the grid container */}
      <div style={{ 
        width: '100%', 
        maxWidth: '550px',  // Match the width in the image
        margin: '0 auto 40px'  // Center and add bottom margin
      }}>
        <div className="character-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          width: '100%'
        }}>
          {characters.map(character => (
            <div
              key={character.id}
              className={`character-option ${selectedCharacter === character.id ? 'selected' : ''}`}
              onClick={() => handleCharacterSelect(character.id)}
              style={{ 
                backgroundColor: `${character.color}20`, // 20 represents 12% opacity
                aspectRatio: '1/1',  // Keep it square
                borderRadius: '50%',  // Make it round
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: selectedCharacter === character.id ? `3px solid #006AA7` : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '36px' }}>
                {character.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="button-container" style={{ 
        maxWidth: '550px',  // Match the width in the image
        margin: '0 auto',   // Center the button
        width: '100%'
      }}>
        <button
          className="primary-button"
          disabled={!selectedCharacter}
          onClick={handleContinue}
          style={{
            height: '56px',
            borderRadius: '8px'
          }}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default CharacterSelection;