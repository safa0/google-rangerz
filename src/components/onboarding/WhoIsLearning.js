import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WhoIsLearning = ({ updateUserData }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { 
      id: 'myKids', 
      label: 'Mina barn', 
      description: 'Jag är en förälder eller vårdnadshavare och använder Lexi AI med barn hemma.',
      icon: '👨‍👧‍👦'
    },
    { 
      id: 'myStudents', 
      label: 'Mina elever', 
      description: 'Jag är en lärare eller pedagog och använder Lexi AI med elever.',
      icon: '📚'
    },
    { 
      id: 'myself', 
      label: 'Jag själv', 
      description: 'Jag är en elev och använder Lexi AI för att lära mig.',
      icon: '🧒'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    updateUserData({ userType: selectedOption });
    
    if (selectedOption === 'myself') {
      navigate('/child-name'); // Go directly to name input for self-learners
    } else {
      navigate('/child-name'); // For parents/teachers
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '32%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">Vem lär sig läsa?</h1>
      <p className="onboarding-subtitle">
        Detta hjälper oss skapa rätt konto för dig och dina läsare.
      </p>

      <div className="option-list">
        {options.map(option => (
          <button
            key={option.id}
            className={`option-button ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <span className="option-icon">{option.icon}</span>
            <div>
              <strong>{option.label}</strong>
              <p style={{ fontSize: '14px', marginTop: '4px', color: '#777' }}>
                {option.description}
              </p>
            </div>
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

export default WhoIsLearning;