import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockInitializeStory, generateImage, mockGenerateImage, continueStory } from '../../services/api';
import './StoryView.css';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [story, setStory] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Get story data from location state if available
  const storyTitle = location.state?.storyTitle;
  const storyDescription = location.state?.storyDescription;
  const passedStoryImage = location.state?.storyImage;
  const storyImgDescription = location.state?.storyImgDescription;
  const useRealApi = location.state?.useRealApi || false;
  const userData = location.state?.userData;

  console.log('🔄 StoryView: Initializing with params:', {
    id,
    storyTitle,
    storyDescription,
    hasPassedImage: !!passedStoryImage,
    storyImgDescription,
    useRealApi,
    userData
  });

  useEffect(() => {
    const loadStory = async () => {
      console.log('🔄 StoryView: Loading story data');
      try {
        // If we have story data from navigation state, use it
        if (storyTitle && storyDescription) {
          console.log('🔄 StoryView: Using passed story data');
          // Set basic story data
          setStory({
            title: storyTitle,
            content: storyDescription,
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
          
          // Use passed image if available, otherwise generate one
          if (passedStoryImage) {
            console.log('🔄 StoryView: Using passed image');
            setStoryImage(passedStoryImage);
            setImageLoading(false);
          } else if (storyImgDescription) {
            console.log('🔄 StoryView: Generating image from description');
            setImageLoading(true);
            try {
              // Choose between real API and mock based on flag
              console.log(`🔄 StoryView: Using ${useRealApi ? 'real' : 'mock'} API for image generation`);
              const imageData = useRealApi 
                ? await generateImage(storyImgDescription)
                : await mockGenerateImage(storyImgDescription);
              
              console.log('🔄 StoryView: Image generated successfully');
              setStoryImage(imageData);
            } catch (imgErr) {
              console.error('❌ StoryView: Error generating image:', imgErr);
              setStoryImage(`https://via.placeholder.com/800x400?text=${encodeURIComponent(storyTitle)}`);
            } finally {
              setImageLoading(false);
            }
          } else {
            console.log('🔄 StoryView: No image description, using placeholder');
            setStoryImage(`https://via.placeholder.com/800x400?text=${encodeURIComponent(storyTitle)}`);
            setImageLoading(false);
          }
        } else {
          // Otherwise, fetch from API based on ID
          console.log('🔄 StoryView: No passed data, fetching from API');
          const response = await mockInitializeStory();
          console.log('🔄 StoryView: Received response from mockInitializeStory:', response);
          
          if (response.stories && response.stories.length > 0) {
            const storyIndex = parseInt(id) - 1;
            console.log(`🔄 StoryView: Using story at index ${storyIndex}`);
            const storyData = response.stories[storyIndex] || response.stories[0];
            
            // Set basic story data
            setStory({
              title: storyData.title,
              content: storyData.txt,
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
            
            // Generate image
            console.log('🔄 StoryView: Generating image for story');
            setImageLoading(true);
            try {
              // Choose between real API and mock based on flag
              console.log(`🔄 StoryView: Using ${useRealApi ? 'real' : 'mock'} API for image generation`);
              const imageData = useRealApi 
                ? await generateImage(storyData.img_description)
                : await mockGenerateImage(storyData.img_description);
              
              console.log('🔄 StoryView: Image generated successfully');
              setStoryImage(imageData);
            } catch (imgErr) {
              console.error('❌ StoryView: Error generating image:', imgErr);
              setStoryImage(`https://via.placeholder.com/800x400?text=${encodeURIComponent(storyData.title)}`);
            } finally {
              setImageLoading(false);
            }
          } else {
            console.error('❌ StoryView: No stories found in response');
            throw new Error("Story not found");
          }
        }
      } catch (err) {
        console.error('❌ StoryView: Error loading story:', err);
        setError("Failed to load story. Please try again.");
      } finally {
        console.log('🔄 StoryView: Finished loading story');
        setLoading(false);
      }
    };

    loadStory();
  }, [id, storyTitle, storyDescription, passedStoryImage, storyImgDescription, useRealApi]);

  const handleOptionClick = (optionId) => {
    console.log(`🖱️ StoryView: Option ${optionId} clicked`);
    // In a real implementation, this would continue the story
    alert(`You selected: ${optionId}`);
  };

  const goBack = () => {
    console.log('🖱️ StoryView: Back button clicked, navigating to init-story');
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
        {imageLoading ? (
          <div className="image-loading">Loading image...</div>
        ) : (
          <img src={storyImage} alt={story.title} />
        )}
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