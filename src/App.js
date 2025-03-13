import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Welcome from './components/onboarding/Welcome';
import WhoIsLearning from './components/onboarding/WhoIsLearning';
import ChildName from './components/onboarding/ChildName';
import ChildAge from './components/onboarding/ChildAge';
import CharacterSelection from './components/onboarding/CharacterSelection';
import InterestSelection from './components/onboarding/InterestSelection';
import StoriesExplorer from './components/main/StoriesExplorer';
import StoryReader from './components/main/StoryReader';
import ProfilePage from './components/profile/ProfilePage';

// Create AuthContext
export const AuthContext = React.createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  const [userData, setUserData] = useState({
    userType: '',
    childName: '',
    childAge: '',
    character: '',
    interests: [],
    joinDate: new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' }),
    stats: {
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0,
      storiesCompletedToday: 0,
      totalStoriesCompleted: 0
    }
  });

  // Check if user is logged in when app loads
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log("Checking login status...");
        setLoading(true);
        
        const response = await fetch('http://localhost:5000/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Login status response:", data);
        
        if (data.status === 'success') {
          console.log(`User authenticated: isNewUser=${data.user.isNewUser}, onboardingCompleted=${data.user.onboardingCompleted}`);
          setUser(data.user);
          
          // If user has preferences, also load them
          if (data.userPreferences) {
            console.log("App: Loaded user preferences:", data.userPreferences);
            
            // Update userData with preferences from API
            setUserData(prevData => ({
              ...prevData,
              interests: data.userPreferences.interests || [],
              childAge: data.userPreferences.age,
              character: data.userPreferences.character
            }));
            
            console.log("App: Updated userData with interests:", data.userPreferences.interests);
          } else {
            console.log("App: No user preferences found in API response");
          }
        } else {
          console.log("User not authenticated");
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkLoginStatus();
  }, []);

  const login = async (userData) => {
    console.log("Setting user data in login function:", userData);
    setUser(userData);
    
    // After login, fetch the full user data including preferences
    try {
      console.log("Fetching user preferences after login...");
      const response = await fetch('http://localhost:5000/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("User data response after login:", data);
      
      if (data.status === 'success' && data.userPreferences) {
        console.log("Got user preferences after login:", data.userPreferences);
        setUserData(prevData => ({
          ...prevData,
          interests: data.userPreferences.interests || [],
          childAge: data.userPreferences.age,
          character: data.userPreferences.character
        }));
      }
    } catch (error) {
      console.error('Error fetching user preferences after login:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      // Clear userData on logout
      setUserData({
        userType: '',
        childName: '',
        childAge: '',
        character: '',
        interests: [],
        joinDate: new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' }),
        stats: {
          currentStreak: 0,
          longestStreak: 0,
          totalXP: 0,
          storiesCompletedToday: 0,
          totalStoriesCompleted: 0
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = (newData) => {
    console.log("Updating user data:", newData);
    setUserData(prevData => {
      const updatedData = { ...prevData, ...newData };
      console.log("New userData state:", updatedData);
      return updatedData;
    });
  };

  const updateUserStats = (stats) => {
    setUserData(prevData => ({
      ...prevData,
      stats: {
        ...prevData.stats,
        ...stats
      }
    }));
  };
  
  // Define protected route component
  const ProtectedRoute = ({ children, requireOnboarding = false }) => {
    if (!authInitialized) {
      return <div className="loading">Initializing app...</div>;
    }
    
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    if (!user) {
      console.log("User not authenticated, redirecting to welcome page");
      return <Navigate to="/" replace />;
    }
    
    // If this route requires completed onboarding but user hasn't completed it
    if (!requireOnboarding && (user.isNewUser || !user.onboardingCompleted)) {
      console.log("User needs onboarding, redirecting to onboarding flow");
      return <Navigate to="/who-is-learning" replace />;
    }
    
    // All conditions pass, render the protected content
    return children;
  };

  // If auth hasn't been initialized yet, show a loading indicator
  if (!authInitialized) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      loading 
    }}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Welcome />} />
            
            {/* Onboarding Routes */}
            <Route path="/who-is-learning" element={<WhoIsLearning updateUserData={updateUserData} />} />
            <Route path="/child-name" element={<ChildName updateUserData={updateUserData} userData={userData} />} />
            <Route path="/child-age" element={<ChildAge updateUserData={updateUserData} userData={userData} />} />
            <Route path="/character-selection" element={<CharacterSelection updateUserData={updateUserData} userData={userData} />} />
            <Route path="/interest-selection" element={<InterestSelection updateUserData={updateUserData} userData={userData} />} />
            
            {/* Protected routes (require completed onboarding) */}
            <Route path="/stories" element={
              <ProtectedRoute>
                <StoriesExplorer userData={userData} />
              </ProtectedRoute>
            } />
            <Route path="/story/:storyId" element={
              <ProtectedRoute>
                <StoryReader userData={userData} updateUserStats={updateUserStats} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage userData={userData} />
              </ProtectedRoute>
            } />
            
            {/* Catch all undefined routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;