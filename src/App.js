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
        
        const data = await response.json();
        console.log("Login status response:", data);
        
        if (data.status === 'success') {
          setUser(data.user);
          
          // If user has preferences, also load them
          if (data.userPreferences) {
            console.log("Loaded user preferences:", data.userPreferences);
            setUserData(prevData => ({
              ...prevData,
              interests: data.userPreferences.interests || [],
              childAge: data.userPreferences.age,
              character: data.userPreferences.character
            }));
          }
        } else {
          // Clear user if not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // Clear user on error
        setUser(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkLoginStatus();
  }, []);

  const login = (userData) => {
    console.log("Setting user data in login function:", userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = (newData) => {
    setUserData(prevData => ({ ...prevData, ...newData }));
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
  const ProtectedRoute = ({ children }) => {
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
            <Route path="/who-is-learning" element={<WhoIsLearning updateUserData={updateUserData} />} />
            <Route path="/child-name" element={<ChildName updateUserData={updateUserData} userData={userData} />} />
            <Route path="/child-age" element={<ChildAge updateUserData={updateUserData} userData={userData} />} />
            <Route path="/character-selection" element={<CharacterSelection updateUserData={updateUserData} userData={userData} />} />
            <Route path="/interest-selection" element={<InterestSelection updateUserData={updateUserData} userData={userData} />} />
            
            {/* Protected routes */}
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
            
            {/* InitStory route removed due to missing component */}
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;