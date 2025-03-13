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
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '80%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">{title}</h1>

      <div className="character-grid">
        {characters.map(character => (
          <div
            key={character.id}
            className={`character-option ${selectedCharacter === character.id ? 'selected' : ''}`}
            onClick={() => handleCharacterSelect(character.id)}
            style={{ backgroundColor: `${character.color}20` }} // 20 represents 12% opacity
          >
            <div style={{ fontSize: '36px', lineHeight: '1' }}>
              {character.emoji}
            </div>
          </div>
        ))}
      </div>

      <div className="button-container">
        <button
          className="primary-button"
          disabled={!selectedCharacter}
          onClick={handleContinue}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default CharacterSelection;