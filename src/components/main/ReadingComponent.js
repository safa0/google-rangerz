import React, { useState, useEffect, useRef } from 'react';
import './StoryComponents.css';

const ReadingComponent = ({ imageUrl, text, onNext }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [displayedWords, setDisplayedWords] = useState(0);
  const [textBoxHeight, setTextBoxHeight] = useState('auto');
  const [isTextComplete, setIsTextComplete] = useState(false);
  const fullTextRef = useRef(null);
  
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
  
  // Calculate the full text height on mount
  useEffect(() => {
    // We need to create a hidden element with the full text to measure it
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.width = '100%';
    hiddenDiv.style.maxWidth = '800px'; // Adjust to match your container width
    hiddenDiv.style.padding = '20px'; // Match your text container padding
    hiddenDiv.style.fontFamily = 'inherit';
    hiddenDiv.style.fontSize = 'inherit';
    hiddenDiv.style.lineHeight = 'inherit';
    hiddenDiv.textContent = text;
    
    document.body.appendChild(hiddenDiv);
    const height = hiddenDiv.offsetHeight;
    document.body.removeChild(hiddenDiv);
    
    // Add a larger buffer to ensure text fits
    setTextBoxHeight(`${height + 80}px`);
  }, [text]);

  // Split text into words
  const words = text.split(/\s+/);
  
  // Reset text animation when text changes
  useEffect(() => {
    setDisplayedWords(0);
    setIsButtonVisible(false);
    setIsTextComplete(false);
  }, [text]);
  
  // Text streaming effect - one word at a time
  useEffect(() => {
    if (!isTextVisible || displayedWords >= words.length) {
      if (isTextVisible && displayedWords >= words.length) {
        // Mark text as complete
        setIsTextComplete(true);
        // Show button after text is fully displayed
        setTimeout(() => setIsButtonVisible(true), 300);
      }
      return;
    }
    
    const typingTimer = setTimeout(() => {
      setDisplayedWords(prev => prev + 1);
    }, 160); // Adjust typing speed here (higher = slower)
    
    return () => clearTimeout(typingTimer);
  }, [displayedWords, words.length, isTextVisible]);
  
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
      
      <div 
        className={`story-text-container ${isTextVisible ? 'slide-up' : ''}`} 
        style={{ 
          height: textBoxHeight,
          overflow: isTextComplete ? 'auto' : 'hidden',
          maxHeight: isTextComplete ? '300px' : textBoxHeight, // Allow scrolling when complete
          transition: 'all 0.3s ease'
        }}
      >
        <p className="story-text">{words.slice(0, displayedWords).join(' ')}</p>
        {/* Hidden full text to ensure container has proper size */}
        <div 
          ref={fullTextRef} 
          style={{ 
            position: 'absolute', 
            visibility: 'hidden', 
            height: 0, 
            overflow: 'hidden' 
          }}
        >
          {text}
        </div>
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