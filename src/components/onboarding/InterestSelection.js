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
    { id: 'animals', name: 'Djur', imageUrl: '', color: '#8BC34A' },
    { id: 'space', name: 'Rymden', imageUrl: '', color: '#3F51B5' },
    { id: 'sports', name: 'Sport', imageUrl: '', color: '#FF5722' },
    { id: 'music', name: 'Musik', imageUrl: '', color: '#9C27B0' },
    { id: 'nature', name: 'Natur', imageUrl: '', color: '#4CAF50' },
    { id: 'history', name: 'Historia', imageUrl: '', color: '#795548' },
    { id: 'tech', name: 'Teknik', imageUrl: '', color: '#607D8B' },
    { id: 'food', name: 'Mat', imageUrl: '', color: '#FF9800' },
    { id: 'fantasy', name: 'Fantasy', imageUrl: '', color: '#E91E63' },
    { id: 'science', name: 'Vetenskap', imageUrl: '', color: '#009688' },
    { id: 'art', name: 'Konst', imageUrl: '', color: '#FFEB3B' },
    { id: 'travel', name: 'Resor', imageUrl: '', color: '#2196F3' }
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