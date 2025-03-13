import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReadingComponent from './ReadingComponent';
import FillBlankComponent from './FillBlankComponent';
import ComprehensionComponent from './ComprehensionComponent';
import SelectOptionComponent from './SelectOptionComponent.js';
import StoryComplete from './StoryComplete';
import './StoryReader.css';
import { getChaptersByStory, getStoryById } from './story_api_render.js';

const StoryReader = ({ userData, updateUserStats }) => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [storyData, setStoryData] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      const story = await getStoryById(storyId);
      const chapters = await getChaptersByStory(storyId);
      console.log(chapters);
      if (chapters.length > 0) {
        const formattedStory = {
          id: storyId,
          title: story.title || "Untitled Story",
          pages: chapters.map(chapter => ([{
            type: "reading",
            imageUrl: chapter.image || "https://via.placeholder.com/300",
            text: chapter.txt || "",
          },
          {
            type: "selectOption",
            imageUrl: chapter.image || "https://via.placeholder.com/300",
            text: chapter.opt.txt || "",
            options: chapter.opt.options || [],
          },
          {
            type: JSON.parse(chapter.metadata).exercise_type || "reading",
            imageUrl: chapter.image || "https://via.placeholder.com/300",
            question: chapter.exe || "",
          }
          ]))
        };
        setStoryData(formattedStory);
        setStartTime(Date.now());
      } else {
        console.error("No chapters found for this story.");
      }
    };

    fetchStory();
  }, [storyId]);

  const handleNext = (isCorrect = true) => {
    if (!isCorrect) {
      setMistakes(prev => prev + 1);
    } else {
      setScore(prev => prev + 1);
    }

    if (storyData && currentPage >= storyData.pages.length - 1) {
      const endTime = Date.now();
      setTimeElapsed(Math.floor((endTime - startTime) / 1000));

      updateUserStats({
        totalXP: userData.stats.totalXP + score,
        storiesCompletedToday: userData.stats.storiesCompletedToday + 1,
        totalStoriesCompleted: userData.stats.totalStoriesCompleted + 1,
        currentStreak: updateStreak(userData.stats.currentStreak),
        longestStreak: Math.max(userData.stats.longestStreak, updateStreak(userData.stats.currentStreak))
      });

      setCurrentPage(prev => prev + 1);
    } else {
      if (currentStage === 2) {
        setCurrentStage(0);
        setCurrentPage(prev => prev + 1);
      }
      else {
        setCurrentStage(prev => prev + 1);
      }
    }
  };

  const updateStreak = (currentStreak) => {
    const lastCompletionDate = localStorage.getItem('lastStoryCompletionDate');
    const today = new Date().toDateString();

    if (lastCompletionDate === today) return currentStreak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompletionDate === yesterday.toDateString()) {
      localStorage.setItem('lastStoryCompletionDate', today);
      return currentStreak + 1;
    }

    localStorage.setItem('lastStoryCompletionDate', today);
    return 1;
  };

  const handleBack = () => {
    if (currentPage === 0) {
      navigate('/stories');
    } else {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderCurrentPage = () => {
    if (!storyData) return <div className="loading-container">Loading...</div>;
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
    const current_stage_page = page[currentStage];

    console.log(currentPage);
    console.log(currentStage);

    switch (current_stage_page.type) {
      case 'intro':
        return (
          <div className="story-intro">
            <div className="story-cover">
              <img src={current_stage_page.imageUrl} alt={current_stage_page.title} />
            </div>
            <h2 className="story-title">{current_stage_page.title}</h2>
            <button className="story-start-button" onClick={() => handleNext(true)}>
              <span className="arrow-icon">→</span>
            </button>
          </div>
        );
      case 'reading':
        console.log("reading");
        return <ReadingComponent imageUrl={current_stage_page.imageUrl} text={current_stage_page.text} onNext={() => handleNext(true)} />;
      case 'selectOption':
        console.log("selectOption");
        return <SelectOptionComponent imageUrl={current_stage_page.imageUrl} text={current_stage_page.text} options={current_stage_page.options} onNext={handleNext} />;
      case 'fill_in_blanks':
        console.log("fill_in_blanks");
        return <FillBlankComponent imageUrl={current_stage_page.imageUrl} text={current_stage_page.question} onNext={handleNext} />;
      case 'comprehension_text':
        console.log("comprehension_text");
        return <ComprehensionComponent imageUrl={current_stage_page.imageUrl} question={current_stage_page.question} onNext={handleNext} />;
      default:
        return <div>Unknown page type</div>;
    }
  };

  return (
    <div className="story-reader">
      <div className="story-header">
        <button className="back-button" onClick={handleBack}>×</button>
        <div className="progress-bar">
          {storyData && (
            <div className="progress-fill" style={{ width: `${(currentPage / storyData.pages.length) * 100}%` }}></div>
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
