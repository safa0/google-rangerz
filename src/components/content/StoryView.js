import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockInitializeStory } from '../../services/api';
import './StoryView.css';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [story, setStory] = useState(null);

  // Get story data from location state if available
  const storyTitle = location.state?.storyTitle;
  const storyDescription = location.state?.storyDescription;

  useEffect(() => {
    const loadStory = async () => {
      try {
        // If we have story data from navigation state, use it
        if (storyTitle && storyDescription) {
          setStory({
            title: storyTitle,
            content: storyDescription,
            image_url: `https://via.placeholder.com/800x400?text=${encodeURIComponent(storyTitle)}`,
            options: [
              { id: "option1", text: "Continue the adventure" },
              { id: "option2", text: "Try a different approach" },
              { id: "option3", text: "Learn more vocabulary" }
            ],
            vocabulary: [
              { word: "Skog", translation: "Forest", pronunciation: "skoog" },
              { word: "Vatten", translation: "Water", pronunciation: "vat-ten" },
              { word: "Fiske", translation: "Fishing", pronunciation: "fis-ke" },
              { word: "Äventyr", translation: "Adventure", pronunciation: "eh-ven-teer" }
            ]
          });
        } else {
          // Otherwise, fetch from API based on ID
          const response = await mockInitializeStory();
          
          if (response.stories && response.stories.length > 0) {
            const storyIndex = parseInt(id) - 1;
            const storyData = response.stories[storyIndex] || response.stories[0];
            
            setStory({
              title: storyData.title,
              content: storyData.txt,
              image_url: storyData.img || `https://via.placeholder.com/800x400?text=${encodeURIComponent(storyData.title)}`,
              options: [
                { id: "option1", text: "Continue the adventure" },
                { id: "option2", text: "Try a different approach" },
                { id: "option3", text: "Learn more vocabulary" }
              ],
              vocabulary: [
                { word: "Skog", translation: "Forest", pronunciation: "skoog" },
                { word: "Vatten", translation: "Water", pronunciation: "vat-ten" },
                { word: "Fiske", translation: "Fishing", pronunciation: "fis-ke" },
                { word: "Äventyr", translation: "Adventure", pronunciation: "eh-ven-teer" }
              ]
            });
          } else {
            throw new Error("Story not found");
          }
        }
      } catch (err) {
        setError("Failed to load story. Please try again.");
        console.error("Error loading story:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id, storyTitle, storyDescription]);

  const handleOptionClick = (optionId) => {
    // In a real implementation, this would continue the story
    alert(`You selected: ${optionId}`);
  };

  const goBack = () => {
    navigate('/init-story');
  };

  if (loading) {
    return (
      <div className="story-view-container">
        <div className="loading-spinner">Loading story...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-view-container">
        <div className="error-message">{error}</div>
        <button onClick={goBack} className="back-button">Go Back</button>
      </div>
    );
  }

  return (
    <div className="story-view-container">
      <button onClick={goBack} className="back-button">← Back</button>
      
      <h1>{story.title}</h1>
      
      <div className="story-image-container">
        <img src={story.image_url} alt={story.title} />
      </div>
      
      <div className="story-content">
        <p>{story.content}</p>
      </div>
      
      <div className="vocabulary-section">
        <h3>Key Vocabulary</h3>
        <div className="vocabulary-list">
          {story.vocabulary.map((item, index) => (
            <div key={index} className="vocabulary-item">
              <div className="word">{item.word}</div>
              <div className="translation">{item.translation}</div>
              <div className="pronunciation">/{item.pronunciation}/</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="options-section">
        <h3>What would you like to do next?</h3>
        <div className="options-list">
          {story.options.map(option => (
            <button 
              key={option.id} 
              className="option-button"
              onClick={() => handleOptionClick(option.id)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryView; 