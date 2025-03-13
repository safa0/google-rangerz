import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const InterestSelection = ({ updateUserData, userData }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function from context
  const [selectedInterests, setSelectedInterests] = useState(userData.interests || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // If userData.interests changes (e.g., loaded after component mount), update selectedInterests
  useEffect(() => {
    if (userData.interests && userData.interests.length > 0) {
      console.log("Loading user interests from userData:", userData.interests);
      setSelectedInterests(userData.interests);
    }
  }, [userData.interests]);

  // Mock interests data - in a real app this would come from an API
  const interests = [
    { id: 'animals', name: 'Djur', imageUrl: '', color: '#8BC34A', imageUrl : 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwzfHxhbmltYWxzfGVufDB8fHx8MTc0MTg2MzQ4M3ww&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'space', name: 'Rymden', imageUrl: '', color: '#3F51B5', imageUrl : 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw1fHxzcGFjZXxlbnwwfHx8fDE3NDE4NzA3NjB8MA&ixlib=rb-4.0.3&q=80&w=1080'},
    { id: 'sports', name: 'Sport', imageUrl: '', color: '#FF5722', imageUrl : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwyfHxzcG9ydHN8ZW58MHx8fHwxNzQxODcwODA5fDA&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'music', name: 'Musik', imageUrl: '', color: '#9C27B0', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmV8ZW58MHx8fHwxNzQxODcwODY1fDA&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'nature', name: 'Natur', imageUrl: '', color: '#4CAF50', imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwyfHxuYXR1cmV8ZW58MHx8fHwxNzQxODI4NTY0fDA&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'history', name: 'Historia', imageUrl: '', color: '#795548', imageUrl: 'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw1fHxoaXN0b3J5fGVufDB8fHx8MTc0MTg3MDk3N3ww&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'tech', name: 'Teknik', imageUrl: '', color: '#607D8B', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwyMXx8dGVjaHxlbnwwfHx8fDE3NDE4MzM5NzJ8MA&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'food', name: 'Mat', imageUrl: '', color: '#FF9800', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw3fHxmb29kfGVufDB8fHx8MTc0MTg1NTQ2M3ww&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'fantasy', name: 'Fantasy', imageUrl: '', color: '#E91E63', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxmYW50YXN5fGVufDB8fHx8MTc0MTc3MjUzM3ww&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'science', name: 'Vetenskap', imageUrl: '', color: '#009688', imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw0fHxzY2llbmNlfGVufDB8fHx8MTc0MTg3MTE5N3ww&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'art', name: 'Konst', imageUrl: '', color: '#FFEB3B', imageUrl : 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxhcnR8ZW58MHx8fHwxNzQxODcxMjQ3fDA&ixlib=rb-4.0.3&q=80&w=1080' },
    { id: 'travel', name: 'Resor', imageUrl: '', color: '#2196F3',imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxM3x8dHJhdmVsfGVufDB8fHx8MTc0MTg3MTMwOHww&ixlib=rb-4.0.3&q=80&w=1080' }
  ];

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId];
      
      console.log("InterestSelection: Updated interests:", newInterests);
      return newInterests;
    });
  };

  const handleContinue = async () => {
    // Clear any previous errors
    setError('');
    setSaveSuccess(false);
    setIsSaving(true);
    
    console.log("InterestSelection: Saving interests to local state:", selectedInterests);
    
    // Update local state first
    updateUserData({ interests: selectedInterests });
    
    // Save to server
    try {
      console.log("InterestSelection: Saving interests to server:", selectedInterests);
      
      const requestBody = {
        interests: selectedInterests,
        age: userData.childAge || 10, // Default age if not set
        skillLevel: 'beginner', // Default skill level
        character: userData.character || 'owl' // Default character
      };
      
      console.log("InterestSelection: Complete request body:", requestBody);
      
      const response = await fetch('http://localhost:5000/api/user/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include', // Important for cookies/session
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("InterestSelection: Server response:", data);
      
      if (data.status === 'success') {
        console.log("InterestSelection: Interests saved successfully");
        setSaveSuccess(true);
        
        // Now get updated user data with onboardingCompleted flag set to true
        try {
          console.log("Fetching updated user data...");
          const userResponse = await fetch('http://localhost:5000/api/auth/user', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!userResponse.ok) {
            throw new Error(`Failed to get updated user data: ${userResponse.status}`);
          }
          
          const userData = await userResponse.json();
          console.log("Updated user data:", userData);
          
          if (userData.status === 'success') {
            // Update the user in context to reflect onboardingCompleted=true
            login(userData.user);
            
            // Wait a moment to show success message, then navigate
            setTimeout(() => {
              // Use replace:true to prevent going back to the onboarding flow 
              // if the user presses the back button
              navigate('/stories', { replace: true });
            }, 1000);
          }
        } catch (error) {
          console.error("Error fetching updated user data:", error);
          // Navigate anyway as a fallback
          setTimeout(() => {
            navigate('/stories', { replace: true });
          }, 1000);
        }
      } else {
        setError(`Failed to save preferences: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setError(`Failed to save preferences: ${error.message || 'Network error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter interests based on search query
  const filteredInterests = interests.filter(interest => 
    interest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if we're setting up for the user or a child
  const isForSelf = userData.userType === 'myself';
  const title = isForSelf 
    ? 'Välj några intressen' 
    : `Välj intressen för ${userData.childName || 'ditt barn'}`;
  const subtitle = 'Välj minst 3. Vi skapar särskilda läslektioner baserat på detta.';

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '96%' }}></div>
        </div>
      </div>

      <h1 className="onboarding-title">{title}</h1>
      <p className="onboarding-subtitle">{subtitle}</p>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Sök intressen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="interest-grid">
        {filteredInterests.map(interest => (
          <div key={interest.id} style={{ textAlign: 'center' }}>
            <div
              className={`interest-option ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest.id)}
              style={{ backgroundColor: interest.color }}
            >
              {interest.imageUrl ? (
                <img src={interest.imageUrl} alt={interest.name} />
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  {interest.name.charAt(0)}
                </div>
              )}
            </div>
            <p className="interest-name">{interest.name}</p>
          </div>
        ))}
      </div>

      <div className="button-container">
        {selectedInterests.length < 3 && (
          <p style={{ textAlign: 'center', color: '#FF5722', marginBottom: '10px' }}>
            Välj minst {3 - selectedInterests.length} intressen till
          </p>
        )}
        
        {error && (
          <p style={{ textAlign: 'center', color: '#FF5722', marginBottom: '10px' }}>
            {error}
          </p>
        )}
        
        {saveSuccess && (
          <p style={{ textAlign: 'center', color: '#4CAF50', marginBottom: '10px' }}>
            Intressen sparade! Dirigerar om till sagor...
          </p>
        )}
        
        <button
          className="primary-button"
          disabled={selectedInterests.length < 3 || isSaving}
          onClick={handleContinue}
        >
          {isSaving ? 'SPARAR...' : 'FORTSÄTT'}
        </button>
      </div>
    </div>
  );
};

export default InterestSelection;