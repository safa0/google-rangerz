import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-logo">
        <img 
          src="/logo.svg" 
          alt="Svenska Ugglan" 
          style={{ width: '100%', height: '100%' }}
          onError={(e) => {
            e.target.onerror = null;
            // Fallback to a colored div with text if image fails to load
            e.target.parentNode.innerHTML = `
              <div style="width: 100%; height: 100%; background-color: #58CC02; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                SU
              </div>
            `;
          }}
        />
      </div>
      
      <h1 className="app-name">
        Svenska <span className="app-name-highlight">Ugglan</span>
      </h1>
      
      <p className="welcome-tagline">Lär dig svenska gratis</p>
      
      <div className="login-options">
        <button 
          className="login-button class-code"
          onClick={() => navigate('/how-did-you-hear')}
        >
          <span className="login-icon">🔑</span>
          LOGGA IN MED KLASSKOD
        </button>
        
        <button 
          className="login-button email"
          onClick={() => navigate('/how-did-you-hear')}
        >
          <span className="login-icon">✉️</span>
          LOGGA IN MED E-POST
        </button>
        
        <button 
          className="login-button get-started"
          onClick={() => navigate('/how-did-you-hear')}
        >
          BÖRJA NU
        </button>
      </div>
    </div>
  );
};

export default Welcome;