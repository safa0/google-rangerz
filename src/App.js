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
import InitStory from './components/content/InitStory';

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
  // Check if user is logged in when app loads
 // Check if user is logged in when app loads
 useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
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
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  checkLoginStatus();
}, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
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
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
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
            
            {/* Add the InitStory route */}
            <Route path="/init-story" element={
              <ProtectedRoute>
                <InitStory />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;