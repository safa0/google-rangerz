import React, { useState, useEffect, memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

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
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

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
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login/signup:', error);
      setError(`Login failed: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Open login/signup modal with appropriate mode
  const openAuthModal = (signup) => {
    setIsSignup(signup);
    setShowMockLogin(true);
  };

  // If user is authenticated and has completed onboarding, don't render the welcome page
  if (isAuthenticated && !loading && user && !user.isNewUser && user.onboardingCompleted) {
    return <div className="loading">Redirecting to stories...</div>;
  }

const logoImage = '/assests/images/lexi_ai.jpg';

  return (
    <div className="welcome-container">
      <div className="welcome-logo">
        <img 
          src={logoImage}    
          alt="Lexi AI" 
          style={{ width: '100%', height: '100%', borderRadius : '50%', objectFit : 'cover', objectPosition : 'center', filter : 'brightness (50%)', }}
          onError={(e) => {
            e.target.onerror = null;
            // Fallback to a colored div with text if image fails to load
            e.target.parentNode.innerHTML = `
              <div style="width: 100%; height: 100%; background-color: #00FFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                SU
              </div>
            `;
          }}
        />
      </div>
      
      <h1 className="app-name">
        <span className="app-name-highlight">Lexi AI</span>
      </h1>
      
      <p className="welcome-tagline">Lär dig svenska enkelt</p>
      
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
            style={{ backgroundColor: '#004B76', color: 'white' }}
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
                backgroundColor: isSignup ? '#004B76' : '#4285F4', 
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