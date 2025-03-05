import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HowDidYouHear = ({ updateUserData }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { id: 'friends', label: 'Vänner/Familj' },
    { id: 'school', label: 'Lärare/skola' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'social', label: 'Facebook/Instagram' },
    { id: 'duolingo', label: 'Duolingo språkinlärning' },
    { id: 'other', label: 'Annat' }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    updateUserData({ howDidYouHear: selectedOption });
    navigate('/who-is-learning');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '16%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">Hur hörde du talas om Svenska Ugglan?</h1>

      <div className="option-list">
        {options.map(option => (
          <button
            key={option.id}
            className={`option-button ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="button-container">
        <button
          className="primary-button"
          disabled={!selectedOption}
          onClick={handleContinue}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default HowDidYouHear;