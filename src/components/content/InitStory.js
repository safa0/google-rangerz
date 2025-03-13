import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInitializeStory } from '../../services/api';
import './InitStory.css';

const InitStory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyOptions, setStoryOptions] = useState([]);

  // We'll keep this commented out until we need it
  // const dummyUser = {
  //   name: "John Doe",
  //   age: 10,
  //   skill_level: "beginner",
  //   interests: ["hiking", "camping", "fishing"]
  // };

  useEffect(() => {
    // Fetch story options when component mounts
    const fetchStoryOptions = async () => {
      setLoading(true);
      try {
        // Use the mock function for now
        const response = await mockInitializeStory();
        
        if (response.stories && response.stories.length > 0) {
          // Map the stories to our card format
          const storyCards = response.stories.map((story, index) => ({
            id: index + 1,
            title: story.title,
            description: story.txt,
            image: story.img || `https://via.placeholder.com/300x200?text=${encodeURIComponent(story.title)}`
          }));
          
          setStoryOptions(storyCards);
        } else {
          throw new Error("No stories found in the response");
        }
      } catch (err) {
        setError("Failed to load story options. Please try again.");
        console.error("Error loading story options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryOptions();
  }, []);

  const handleCardClick = async (id) => {
    // Find the selected story
    const selectedStory = storyOptions.find(story => story.id === id);
    
    if (selectedStory) {
      // Navigate to the story view with the story data
      navigate(`/story/${id}`, { 
        state: { 
          storyTitle: selectedStory.title,
          storyDescription: selectedStory.description
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="init-story-container">
        <div className="loading-spinner">Loading story options...</div>
      </div>
    );
  }

  return (
    <div className="init-story-container">
      <h1>Welcome to Your Swedish Journey</h1>
      <p className="subtitle">Choose a story path to begin learning</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="story-cards-container">
        {storyOptions.map(card => (
          <div 
            key={card.id} 
            className="story-card"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-image-container">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="card-content">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitStory; 