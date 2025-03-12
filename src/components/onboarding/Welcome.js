import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock Google Auth - this will be replaced with actual Google Auth later
const Welcome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // For mock login modal
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/user', {
          method: 'GET',
          credentials: 'include', // Important for cookies/session
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setUser(data.user);
          // If user is already logged in, redirect to stories page
          navigate('/stories');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, [navigate]);

  // Handle mock Google Sign-In
  const handleMockLogin = async (email) => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      const backendResponse = await fetch('http://localhost:5000/api/auth/mock-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          isNewUser: isSignup,
        }),
        credentials: 'include', // Important for cookies/session
      });

      const data = await backendResponse.json();

      if (data.status === 'success') {
        setUser(data.user);
        setShowMockLogin(false);
        
        // Direct to different routes based on whether it's a login or signup
        if (isSignup) {
          // For new users, go to onboarding flow - skip HowDidYouHear
          navigate('/who-is-learning');
        } else {
          // For existing users, go directly to stories page
          navigate('/stories');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during mock login:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Open login/signup modal with appropriate mode
  const openAuthModal = (signup) => {
    setIsSignup(signup);
    setShowMockLogin(true);
  };

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
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {isLoading && !showMockLogin ? (
        <div className="loading-spinner" style={{ marginBottom: '20px' }}>
          Loading...
        </div>
      ) : (
        <div className="login-options">
          {/* Class code login button - updated to skip HowDidYouHear */}
          <button 
            className="login-button class-code"
            onClick={() => navigate('/who-is-learning')}
          >
            <span className="login-icon">🔑</span>
            LOGGA IN MED KLASSKOD
          </button>
          
          {/* LOGIN button */}
          <button 
            className="login-button email"
            onClick={() => openAuthModal(false)}
          >
            <span className="login-icon">👤</span>
            LOGIN
          </button>
          
          {/* SIGN UP button */}
          <button 
            className="login-button get-started"
            onClick={() => openAuthModal(true)}
            style={{ backgroundColor: '#58CC02', color: 'white' }}
          >
            SIGN UP
          </button>
        </div>
      )}
      
      {showMockLogin && (
        <MockLoginForm 
          isLoading={isLoading}
          isSignup={isSignup}
          onLogin={handleMockLogin}
          onCancel={() => setShowMockLogin(false)}
        />
      )}
      
      {user && (
        <div className="user-info" style={{ marginTop: '20px' }}>
          <p>Logged in as: {user.name}</p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

// Extracted as a separate component to prevent re-renders
const MockLoginForm = memo(({ isLoading, isSignup, onLogin, onCancel }) => {
  const [mockEmail, setMockEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(mockEmail);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        maxWidth: '90%'
      }}>
        <h2 style={{ marginTop: 0 }}>{isSignup ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input 
              type="email" 
              value={mockEmail} 
              onChange={(e) => setMockEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              type="button" 
              onClick={onCancel}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f0f0f0', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: isSignup ? '#58CC02' : '#4285F4', 
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Welcome;