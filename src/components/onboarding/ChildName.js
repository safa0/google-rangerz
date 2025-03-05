import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChildName = ({ updateUserData, userData }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleContinue = () => {
    updateUserData({ childName: name });
    navigate('/child-age');
  };

  // Determine if we're asking for the user's name or a child's name
  const isForSelf = userData.userType === 'myself';
  const title = isForSelf ? 'Vad heter du?' : 'Vad heter barnet?';
  const subtitle = isForSelf 
    ? 'Du kommer att lära dig att skriva det själv!' 
    : 'De kommer att lära sig att skriva det själva!';

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '48%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">{title}</h1>
      <p className="onboarding-subtitle">{subtitle}</p>

      <input
        type="text"
        className="input-field"
        placeholder="Namn"
        value={name}
        onChange={handleNameChange}
        autoFocus
      />

      <div className="button-container">
        <p style={{ fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
          Genom att fortsätta godkänner du våra <a href="#" style={{ color: '#4b90e2' }}>Villkor</a> och <a href="#" style={{ color: '#4b90e2' }}>Integritetspolicy</a>
        </p>
        <button
          className="primary-button"
          disabled={name.trim().length === 0}
          onClick={handleContinue}
        >
          FORTSÄTT
        </button>
      </div>
    </div>
  );
};

export default ChildName;