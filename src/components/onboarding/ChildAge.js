import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChildAge = ({ updateUserData, userData }) => {
  const navigate = useNavigate();
  const [age, setAge] = useState('');

  const handleAgeChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAge(value);
  };

  const handleContinue = () => {
    updateUserData({ childAge: age });
    navigate('/character-selection');
  };

  // Determine if we're asking for the user's age or a child's age
  const isForSelf = userData.userType === 'myself';
  const title = isForSelf 
    ? `Hur gammal är du?` 
    : `Hur gammal är ${userData.childName}?`;
  const subtitle = 'Vi anpassar upplevelsen för den här åldern.';

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '64%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">{title}</h1>
      <p className="onboarding-subtitle">{subtitle}</p>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="input-field"
        placeholder="Ålder"
        value={age}
        onChange={handleAgeChange}
        autoFocus
      />

      <div className="button-container">
        <button
          className="primary-button"
          disabled={!age || parseInt(age) < 5 || parseInt(age) > 15}
          onClick={handleContinue}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default ChildAge;