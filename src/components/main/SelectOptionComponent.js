import React, { useState, useEffect } from 'react';
import './StoryComponents.css';

const SelectOptionComponent = ({ imageUrl, text, options, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    const imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
      const contentTimer = setTimeout(() => setIsContentVisible(true), 500);
      return () => clearTimeout(contentTimer);
    }, 300);
    return () => clearTimeout(imageTimer);
  }, []);

  const handleOptionSelect = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(true);
    setIsAnimating(true);
    setTimeout(() => onNext(option), 1500);
  };

  return (
    <div className="story-component select-option-component">
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
      
      <div className={`story-text-container ${isContentVisible ? 'slide-up' : ''}`}>
        <p className="story-text">{text}</p>
      </div>
      
      <div className="options-container">
        {options.map((option, index) => (
          <div 
            key={index} 
            className={`option-box ${selectedOption === option ? 'selected' : ''} ${isAnimating && selectedOption !== option ? 'fade-out' : ''}`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectOptionComponent;
