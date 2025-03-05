import React, { useState, useEffect } from 'react';
import './StoryComponents.css';

const FillBlankComponent = ({ imageUrl, text, options, correctAnswer, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  // Process text to split around the blank
  const textParts = text.split('___');
  
  useEffect(() => {
    // Sequential animation on mount
    const imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
      
      const contentTimer = setTimeout(() => {
        setIsContentVisible(true);
      }, 500);
      
      return () => clearTimeout(contentTimer);
    }, 300);
    
    return () => clearTimeout(imageTimer);
  }, []);
  
  const handleOptionSelect = (option) => {
    if (showFeedback) return; // Prevent selection during feedback
    
    setSelectedOption(option);
    setIsCorrect(option === correctAnswer);
    setShowFeedback(true);
    setIsAnimating(true);
    
    // Wait for animation, then inform parent
    setTimeout(() => {
      onNext(option === correctAnswer);
    }, 1500);
  };
  
  // Create celebratory confetti effect for correct answer
  const renderConfetti = () => {
    if (!isCorrect || !showFeedback) return null;
    
    const confetti = [];
    const colors = ['#FF4081', '#3F51B5', '#4CAF50', '#FFC107', '#9C27B0'];
    
    for (let i = 0; i < 30; i++) {
      const left = `${Math.random() * 100}%`;
      const size = `${5 + Math.random() * 10}px`;
      const duration = `${1 + Math.random() * 2}s`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const style = {
        left,
        width: size,
        height: size,
        backgroundColor: color,
        animationDuration: duration,
        animationDelay: `${Math.random() * 0.5}s`,
      };
      
      confetti.push(<div key={i} className="confetti" style={style}></div>);
    }
    
    return <div className="celebration">{confetti}</div>;
  };
  
  return (
    <div className="story-component fill-blank-component">
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
        <p className="story-text">
          {textParts[0]}
          <span className="blank-space">
            {selectedOption ? selectedOption : '_____'}
          </span>
          {textParts[1]}
        </p>
        
        <div className="options-container">
          {options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedOption === option ? 
                (isCorrect ? 'correct' : 'incorrect') : ''} 
                ${isAnimating && selectedOption !== option ? 'fade-out' : ''}`}
              onClick={() => handleOptionSelect(option)}
              disabled={showFeedback}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {showFeedback && (
        <div className={`feedback-container ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
          <p className="feedback-text">
            {isCorrect ? 'Correct!' : 'Try again!'}
          </p>
        </div>
      )}
      
      {renderConfetti()}
    </div>
  );
};

export default FillBlankComponent;