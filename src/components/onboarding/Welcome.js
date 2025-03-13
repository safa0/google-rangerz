import React, { useState, useEffect, memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import axios from 'axios';
import './Welcome.css';

// Mock Google Auth - this will be replaced with actual Google Auth later
const Welcome = () => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated, loading } = useContext(AuthContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For mock login modal
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Check if user is already logged in, only navigate if they are
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log("User is already authenticated:", user);
      
      // Only redirect to stories if user has completed onboarding
      if (!user.isNewUser && user.onboardingCompleted) {
        console.log("User already completed onboarding, redirecting to stories");
        navigate('/stories');
      } else {
        console.log("User needs onboarding, redirecting to onboarding flow");
        navigate('/who-is-learning');
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  // Handle mock Google Sign-In
  const handleMockLogin = async (email) => {
    setIsLoading(true);
    setError('');

      console.log("Attempting login/signup with email:", email, "isSignup:", isSignup);
      
      const name = email.split('@')[0]; // Get name from email for new users
      
      const backendResponse = await fetch('http://localhost:5000/api/auth/mock-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          isNewUser: isSignup, // This is critical - make sure we tell the backend if this is a signup
        }),
        credentials: 'include', // Important for cookies/session
      });

      if (!backendResponse.ok) {
        throw new Error(`Server responded with status: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      console.log("Login/signup response:", data);

      if (data.status === 'success') {
        // Store the user data in context
        login(data.user);
        setShowMockLogin(false);
        
        // Make explicit routing decision based on user status
        if (isSignup || data.user.isNewUser || !data.user.onboardingCompleted) {
          console.log("New user or onboarding incomplete, redirecting to onboarding flow");
          // For new users, go to onboarding flow
          navigate('/who-is-learning');
        } else {
          console.log("Existing user with completed onboarding, redirecting to stories");
          // For existing users with completed onboarding, go directly to stories page
          navigate('/stories');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open login/signup modal with appropriate mode
  const openAuthModal = (signup) => {
    setIsSignup(signup);
    setShowMockLogin(true);
  };

  // New function to bypass login and go directly to InitStory
  const goDirectlyToInitStory = () => {
    navigate('/init-story');
  };

  // If user is authenticated and has completed onboarding, don't render the welcome page
  if (isAuthenticated && !loading && user && !user.isNewUser && user.onboardingCompleted) {
    return <div className="loading">Redirecting to stories...</div>;
  }

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
      
      {(loading || isLoading) && !showMockLogin ? (
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
      
      {/* Dummy button to bypass login */}
      <div className="bypass-login-container">
        <button 
          className="bypass-login-button" 
          onClick={goDirectlyToInitStory}
          disabled={isLoading}
        >
          Skip Login (Demo Mode)
        </button>
      </div>
    </div>
  );
};

// Extracted as a separate component to prevent re-renders
const MockLoginForm = memo(({ isLoading, isSignup, onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    onLogin(email);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
        />
        {error && <div className="error-message">{error}</div>}
      </div>
      <button type="submit" className="login-button" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
});

export default Welcome;