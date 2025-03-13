import React, { useState, useEffect } from 'react';
import './StoryComponents.css';

const ReadingComponent = ({ imageUrl, text, onNext }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [displayedTextLength, setDisplayedTextLength] = useState(0);
  
  useEffect(() => {
    // Sequentially animate elements
    let imageTimer, textTimer;
    
    imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
      
      textTimer = setTimeout(() => {
        setIsTextVisible(true);
      }, 500);
    }, 300);
    
    return () => {
      clearTimeout(imageTimer);
      clearTimeout(textTimer);
    };
  }, []);
  
  // Reset text animation when text changes
  useEffect(() => {
    setDisplayedTextLength(0);
    setIsButtonVisible(false);
  }, [text]);
  
  // Text streaming effect
  useEffect(() => {
    if (!isTextVisible || displayedTextLength >= text.length) {
      if (isTextVisible && displayedTextLength >= text.length) {
        // Show button after text is fully displayed
        setTimeout(() => setIsButtonVisible(true), 300);
      }
      return;
    }
    
    const typingTimer = setTimeout(() => {
      setDisplayedTextLength(prev => prev + 1);
    }, 20); // Adjust typing speed here (lower = faster)
    
    return () => clearTimeout(typingTimer);
  }, [displayedTextLength, text, isTextVisible]);
  
  return (
    <div className="story-component reading-component">
      <div className={`story-image-container ${isImageLoaded ? 'scale-in' : ''}`}>
        <img 
          src={imageUrl}
          alt="Story illustration"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400';
          }}
        />
      </div>
      
      <div className={`story-text-container ${isTextVisible ? 'scale-in' : ''}`}>
        <p className="story-text">{text.substring(0, displayedTextLength)}</p>
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