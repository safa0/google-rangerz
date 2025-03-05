import React, { useState, useEffect } from 'react';
import './StoryComponents.css';

const StoryComplete = ({ score, timeElapsed, accuracy, onContinue }) => {
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // Sequentially animate components
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      
      const statsTimer = setTimeout(() => {
        setShowStats(true);
        
        const buttonTimer = setTimeout(() => {
          setShowButton(true);
        }, 600);
        
        return () => clearTimeout(buttonTimer);
      }, 800);
      
      return () => clearTimeout(statsTimer);
    }, 300);
    
    // Create confetti effect
    createConfetti();
    
    return () => clearTimeout(contentTimer);
  }, []);
  
  const createConfetti = () => {
    const container = document.querySelector('.story-complete');
    if (!container) return;
    
    const colors = ['#FF4081', '#3F51B5', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Randomize properties
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.width = `${5 + Math.random() * 10}px`;
      confetti.style.height = `${5 + Math.random() * 10}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      
      container.appendChild(confetti);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Determine message based on accuracy
  const getMessage = () => {
    if (accuracy === 100) return 'Perfect lesson!';
    if (accuracy >= 80) return 'Great job!';
    if (accuracy >= 60) return 'Good effort!';
    return 'Keep practicing!';
  };
  
  return (
    <div className="story-complete">
      <div className={`completion-content ${showContent ? 'scale-in' : ''}`}>
        <div className="celebration-character">
          <img 
            src="/characters/celebrating.png" 
            alt="Celebrating character"
            onError={(e) => {
              e.target.onerror = null;
              // Fallback to emoji
              e.target.parentNode.innerHTML = `
                <div style="font-size: 80px; margin-bottom: 20px;">🎉👏</div>
              `;
            }}
          />
          <div className="celebration-character-duolingo">
            <img 
              src="/characters/owl.png" 
              alt="Duolingo owl"
              onError={(e) => {
                e.target.onerror = null;
                // Fallback to emoji
                e.target.parentNode.innerHTML = `
                  <div style="font-size: 60px;">🦉</div>
                `;
              }}
            />
          </div>
        </div>
        
        <h2 className="completion-title">{getMessage()}</h2>
        <p className="completion-subtitle">
          {accuracy === 100 
            ? 'Du gjorde inga misstag i denna lektion' 
            : `Du fick ${accuracy}% rätt i denna lektion`}
        </p>
        
        <div className={`stats-container ${showStats ? 'slide-up' : ''}`}>
          <div className="stat-box xp-box">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{score}</div>
            <div className="stat-label">TOTAL XP</div>
          </div>
          
          <div className="stat-box time-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(timeElapsed)}</div>
            <div className="stat-label">QUICK</div>
          </div>
          
          <div className="stat-box accuracy-box">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">AMAZING</div>
          </div>
        </div>
      </div>
      
      <button 
        className={`continue-button ${showButton ? 'fade-in' : ''}`}
        onClick={onContinue}
      >
        FORTSÄTT
      </button>
    </div>
  );
};

export default StoryComplete;