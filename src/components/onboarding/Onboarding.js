import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Onboarding.css';

function Onboarding({ user, setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interests: [],
    age: '',
    skillLevel: 'beginner',
    character: 'owl'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interest options
  const interestOptions = [
    'language', 'culture', 'travel', 'food', 'history', 
    'music', 'literature', 'business', 'technology'
  ];

  // Skill level options
  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner - I\'m just starting' },
    { value: 'intermediate', label: 'Intermediate - I know some basics' },
    { value: 'advanced', label: 'Advanced - I\'m quite proficient' }
  ];

  // Character options (avatars)
  const characterOptions = [
    { value: 'owl', label: 'Owl' },
    { value: 'fox', label: 'Fox' },
    { value: 'bear', label: 'Bear' }
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    
    if (step === 2 && !formData.age) {
      setError('Please enter your age');
      return;
    }
    
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/user/complete-onboarding', formData);
      
      if (response.data.status === 'success') {
        // Update user state with completed onboarding
        if (setUser) {
          setUser({
            ...user,
            isNewUser: false,
            onboardingCompleted: true
          });
        }
        
        // Redirect to main content
        navigate('/foryou');
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <h1>Welcome to Svenska Ugglan!</h1>
        
        {step === 1 && (
          <div className="onboarding-step">
            <h2>What are you interested in?</h2>
            <p>Select topics that interest you (select at least one)</p>
            
            <div className="interests-grid">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  className={`interest-button ${formData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="onboarding-step">
            <h2>Tell us about yourself</h2>
            
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="skillLevel">Swedish skill level</label>
              <select
                id="skillLevel"
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
              >
                {skillLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="onboarding-step">
            <h2>Choose your learning companion</h2>
            
            <div className="character-options">
              {characterOptions.map(character => (
                <div
                  key={character.value}
                  className={`character-option ${formData.character === character.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, character: character.value }))}
                >
                  <div className="character-image">
                    {/* Character image would go here */}
                    <div className="placeholder-image">{character.label}</div>
                  </div>
                  <div className="character-name">{character.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="onboarding-navigation">
          {step > 1 && (
            <button 
              className="back-button" 
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              className="next-button" 
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button 
              className="submit-button" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Start Learning'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding; 