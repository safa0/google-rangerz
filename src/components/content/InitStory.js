import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { realInitializeStory, generateImage} from '../../services/api';
import './InitStory.css';

const InitStory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyOptions, setStoryOptions] = useState([]);
  const [useRealApi, setUseRealApi] = useState(true); // Default to real API

  // Dummy user data for the API request - matches test_api.py format
  const dummyUser = {
    name: "John Doe",
    age: 10,
    skill_level: "beginner",
    interests: ["hiking", "camping", "fishing"],
    model: "gemini-2.0-flash-lite-001"
  };

  useEffect(() => {
    // Fetch story options when component mounts
    const fetchStoryOptions = async () => {
      console.log('🔄 InitStory: Fetching story options, useRealApi =', useRealApi);
      setLoading(true);
      try {
          
        const response = await realInitializeStory(dummyUser)
        console.log('🔄 InitStory: Received response:', response);
        
        if (response.stories && response.stories.length > 0) {
          console.log(`🔄 InitStory: Found ${response.stories.length} stories`);
          
          // Create initial story cards without images
          const initialStoryCards = response.stories.map((story, index) => ({
            id: index + 1,
            title: story.title,
            description: story.txt,
            imgDescription: story.img_description,
            image: null, // Will be populated with fetched images
            imageLoading: true
          }));
          
          console.log('🔄 InitStory: Created initial story cards:', initialStoryCards);
          
          // Set initial cards to show loading state
          setStoryOptions(initialStoryCards);
          
          // Fetch images for each card
          console.log('🔄 InitStory: Fetching images for cards');
          const cardsWithImages = await Promise.all(
            initialStoryCards.map(async (card) => {
              console.log(`🔄 InitStory: Fetching image for card ${card.id} with description: ${card.imgDescription}`);
              try {
                // Choose between real API and mock based on flag
                
                const imageData = await generateImage(card.imgDescription)
                console.log(`🔄 InitStory: Image fetched for card ${card.id}`);
                return {
                  ...card,
                  image: imageData,
                  imageLoading: false
                };
              } catch (err) {
                console.error(`❌ InitStory: Error generating image for card ${card.id}:`, err);
                return {
                  ...card,
                  image: `https://via.placeholder.com/300x200?text=Image+Error`,
                  imageLoading: false,
                  imageError: true
                };
              }
            })
          );
          
          console.log('🔄 InitStory: All images fetched, updating cards');
          setStoryOptions(cardsWithImages);
        } else {
          console.error('❌ InitStory: No stories found in the response');
          throw new Error("No stories found in the response");
        }
      } catch (err) {
        console.error('❌ InitStory: Error loading story options:', err);
        setError("Failed to load story options. Please try again.");
      } finally {
        console.log('🔄 InitStory: Finished loading story options');
        setLoading(false);
      }
    };

    fetchStoryOptions();
  }, [useRealApi]);

  const handleCardClick = async (id) => {
    console.log(`🖱️ InitStory: Card ${id} clicked`);
    // Find the selected story
    const selectedStory = storyOptions.find(story => story.id === id);
    
    if (selectedStory) {
      console.log(`🖱️ InitStory: Navigating to story ${id}:`, selectedStory);
      // Navigate to the story view with the story data
      navigate(`/story/${id}`, { 
        state: { 
          storyTitle: selectedStory.title,
          storyDescription: selectedStory.description,
          storyImage: selectedStory.image,
          storyImgDescription: selectedStory.imgDescription,
          useRealApi: useRealApi,
          userData: dummyUser // Pass user data for continuing the story
        } 
      });
    }
  };

  // Toggle between mock and real API
  const toggleApiMode = () => {
    console.log(`🔄 InitStory: Toggling API mode from ${useRealApi ? 'real' : 'mock'} to ${!useRealApi ? 'real' : 'mock'}`);
    setUseRealApi(!useRealApi);
  };

  if (loading && storyOptions.length === 0) {
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
      
      {/* API mode toggle button (for development) */}
      <button 
        className="api-toggle-button" 
        onClick={toggleApiMode}
      >
        {useRealApi ? 'Using Real API' : 'Using Mock API'} (Click to toggle)
      </button>
      
      <div className="story-cards-container">
        {storyOptions.map(card => (
          <div 
            key={card.id} 
            className="story-card"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-image-container">
              {card.imageLoading ? (
                <div className="image-loading">Loading image...</div>
              ) : card.imageError ? (
                <div className="image-error">Image could not be loaded</div>
              ) : (
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="story-card-image"
                />
              )}
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