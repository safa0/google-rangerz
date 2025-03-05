import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReadingComponent from './ReadingComponent';
import FillBlankComponent from './FillBlankComponent';
import ComprehensionComponent from './ComprehensionComponent';
import StoryComplete from './StoryComplete';
import './StoryReader.css';

const StoryReader = ({ userData, updateUserStats }) => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [storyData, setStoryData] = useState(null);

  // This would normally be fetched from an API based on storyId
  useEffect(() => {
    // Mock story data
    const mockStory = {
      id: 1,
      title: "Zari and The Giganto-Pop",
      pages: [
        {
          type: "intro",
          imageUrl: "/stories/zari_cover.png",
          title: "Zari and The Giganto-Pop"
        },
        {
          type: "reading",
          imageUrl: "/stories/candy_store.png",
          text: "Lily is looking at the black and purple gummy hearts."
        },
        {
          type: "fillBlank",
          imageUrl: "/stories/bathroom.png",
          text: "First, Oscar ___ water and a little shampoo.",
          options: ["mix", "mixed"],
          correctAnswer: "mixed"
        },
        {
          type: "comprehension",
          imageUrl: "/stories/question.png",
          question: "What color are the gummy hearts?",
          options: ["Red and blue", "Black and purple", "Green and yellow"],
          correctAnswer: "Black and purple"
        },
        {
          type: "reading",
          imageUrl: "/stories/zari_happy.png",
          text: "Zari is very happy with her new candy!"
        }
      ]
    };

    setStoryData(mockStory);
    setStartTime(Date.now());
  }, [storyId]);

  const handleNext = (isCorrect = true) => {
    if (!isCorrect) {
      setMistakes(prev => prev + 1);
    } else {
      setScore(prev => prev + 1);
    }

    if (storyData && currentPage >= storyData.pages.length - 1) {
      // Story completed - calculate final time
      const endTime = Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      setTimeElapsed(totalTime);
      
      // Update user stats
      updateUserStats({
        totalXP: userData.stats.totalXP + score,
        storiesCompletedToday: userData.stats.storiesCompletedToday + 1,
        totalStoriesCompleted: userData.stats.totalStoriesCompleted + 1,
        currentStreak: updateStreak(userData.stats.currentStreak),
        longestStreak: Math.max(userData.stats.longestStreak, updateStreak(userData.stats.currentStreak))
      });

      // Move to next page (StoryComplete page)
      setCurrentPage(prev => prev + 1);
    } else {
      // Move to next page
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Helper function to update streak
  const updateStreak = (currentStreak) => {
    // Check if user already completed a story today
    const lastCompletionDate = localStorage.getItem('lastStoryCompletionDate');
    const today = new Date().toDateString();
    
    if (lastCompletionDate === today) {
      // Already completed a story today, streak stays the same
      return currentStreak;
    }
    
    // Check if this is consecutive days
    if (lastCompletionDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastCompletionDate === yesterdayString) {
        // Completed a story yesterday, streak increases
        localStorage.setItem('lastStoryCompletionDate', today);
        return currentStreak + 1;
      }
    }
    
    // First story or streak broken
    localStorage.setItem('lastStoryCompletionDate', today);
    return 1;
  };

  const handleBack = () => {
    if (currentPage === 0) {
      // Return to stories explorer
      navigate('/stories');
    } else {
      setCurrentPage(prev => prev - 1);
    }
  };

  const restartStory = () => {
    setCurrentPage(0);
    setScore(0);
    setMistakes(0);
    setStartTime(Date.now());
  };

  const renderCurrentPage = () => {
    if (!storyData) return <div className="loading-container">Loading...</div>;

    // Check if we've reached the end
    if (currentPage >= storyData.pages.length) {
      const totalQuestions = storyData.pages.filter(
        page => page.type === 'fillBlank' || page.type === 'comprehension'
      ).length;
      
      const accuracy = totalQuestions > 0 
        ? Math.round((totalQuestions - mistakes) / totalQuestions * 100) 
        : 100;

      return (
        <StoryComplete 
          score={score} 
          timeElapsed={timeElapsed} 
          accuracy={accuracy}
          onContinue={() => navigate('/stories')}
        />
      );
    }

    const page = storyData.pages[currentPage];

    switch (page.type) {
      case 'intro':
        return (
          <div className="story-intro">
            <div className="story-cover">
              <img 
                src={page.imageUrl} 
                alt={page.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x300?text=Book+Cover';
                }}
              />
            </div>
            <h2 className="story-title">{page.title}</h2>
            <button 
              className="story-start-button"
              onClick={() => handleNext(true)}
            >
              <span className="arrow-icon">→</span>
            </button>
          </div>
        );
      case 'reading':
        return (
          <ReadingComponent 
            imageUrl={page.imageUrl}
            text={page.text}
            onNext={() => handleNext(true)}
          />
        );
      case 'fillBlank':
        return (
          <FillBlankComponent 
            imageUrl={page.imageUrl}
            text={page.text}
            options={page.options}
            correctAnswer={page.correctAnswer}
            onNext={handleNext}
          />
        );
      case 'comprehension':
        return (
          <ComprehensionComponent 
            imageUrl={page.imageUrl}
            question={page.question}
            options={page.options}
            correctAnswer={page.correctAnswer}
            onNext={handleNext}
          />
        );
      default:
        return <div>Unknown page type</div>;
    }
  };

  return (
    <div className="story-reader">
      <div className="story-header">
        <button className="back-button" onClick={handleBack}>
          ×
        </button>
        <div className="progress-bar">
          {storyData && (
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(currentPage / storyData.pages.length) * 100}%` 
              }}
            ></div>
          )}
        </div>
      </div>
      
      <div className="story-content">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default StoryReader;