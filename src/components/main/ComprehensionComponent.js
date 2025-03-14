import React, { useState, useEffect } from 'react';
import './StoryComponents.css';


const ComprehensionComponent = ({ imageUrl, question, options, correctAnswer, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  correctAnswer = correctAnswer[0]; // Convert to string for comparison
  useEffect(() => {
    // Sequential animation on mount
    const imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
      
      const questionTimer = setTimeout(() => {
        setIsQuestionVisible(true);
        
        const optionsTimer = setTimeout(() => {
          setAreOptionsVisible(true);
        }, 400);
        
        return () => clearTimeout(optionsTimer);
      }, 500);
      
      return () => clearTimeout(questionTimer);
    }, 300);
    
    return () => clearTimeout(imageTimer);
  }, []);
  
  const handleOptionSelect = (option) => {
    if (showFeedback) return; // Prevent selection during feedback
    
    setSelectedOption(option);
    setIsCorrect(option === correctAnswer);
    if(option === correctAnswer){
      console.log("Correct: increasing difficulty level");
    }
    else {
      console.log("Incorrect: decreasing difficulty level");
    }
    setShowFeedback(true);
    setIsAnimating(true);
    
    // Wait for animation, then inform parent
    setTimeout(() => {
      onNext(option === correctAnswer);
    }, 1500);
  };
  
  // Create character reaction based on answer
  const renderCharacterReaction = () => {
    if (!showFeedback) return null;
    
    return (
      <div className={`character-reaction ${isCorrect ? 'bounce' : 'shake'}`}>
        <div className="reaction-emoji">
          {isCorrect ? '🎉' : '🤔'}
        </div>
      </div>
    );
  };
  
  return (
    <div className="story-component comprehension-component">
      <div className={`story-image-container ${isImageLoaded ? 'scale-in' : ''}`}>
        <img 
          src={imageUrl}
          alt="Story illustration"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=Story+Scene';
          }}
        />
        {renderCharacterReaction()}
      </div>
      
      <div className={`story-question-container ${isQuestionVisible ? 'slide-up' : ''}`}>
        <h3 className="story-question">{question}</h3>
      </div>
      
      <div className={`options-container ${areOptionsVisible ? 'fade-in' : ''}`}>
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
      
      {showFeedback && (
        <div className={`feedback-container ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
          <p className="feedback-text">
            {isCorrect ? 'Bra jobbat!' : 'Försök igen!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ComprehensionComponent;