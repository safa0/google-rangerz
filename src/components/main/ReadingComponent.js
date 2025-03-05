import React, { useState, useEffect } from 'react';
import './StoryComponents.css';

const ReadingComponent = ({ imageUrl, text, onNext }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  
  useEffect(() => {
    // Sequentially animate elements
    let imageTimer, textTimer, buttonTimer;
    
    imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
      
      textTimer = setTimeout(() => {
        setIsTextVisible(true);
        
        buttonTimer = setTimeout(() => {
          setIsButtonVisible(true);
        }, 500);
      }, 500);
    }, 300);
    
    return () => {
      clearTimeout(imageTimer);
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);
  
  return (
    <div className="story-component reading-component">
      <div className={`story-image-container ${isImageLoaded ? 'scale-in' : ''}`}>
        <img 
          src={imageUrl}
          alt="Story illustration"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=Story+Scene';
          }}
        />
      </div>
      
      <div className={`story-text-container ${isTextVisible ? 'slide-up' : ''}`}>
        <p className="story-text">{text}</p>
      </div>
      
      <button 
        className={`story-continue-button ${isButtonVisible ? 'fade-in' : 'hidden'}`}
        onClick={onNext}
      >
        <span className="arrow-icon">→</span>
      </button>
    </div>
  );
};

export default ReadingComponent;