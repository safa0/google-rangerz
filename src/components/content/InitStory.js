import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InitStory.css';

const InitStory = () => {
  const navigate = useNavigate();

  // Sample story cards data
  const storyCards = [
    {
      id: 1,
      title: "Basic Swedish",
      description: "Learn essential Swedish phrases and vocabulary for beginners",
      image: "https://via.placeholder.com/300x200?text=Basic+Swedish"
    },
    {
      id: 2,
      title: "Swedish Culture",
      description: "Explore Swedish traditions, customs, and cultural insights",
      image: "https://via.placeholder.com/300x200?text=Swedish+Culture"
    },
    {
      id: 3,
      title: "Practical Conversations",
      description: "Practice everyday conversations in Swedish with interactive examples",
      image: "https://via.placeholder.com/300x200?text=Conversations"
    }
  ];

  const handleCardClick = (id) => {
    // Navigate to the specific story or lesson
    navigate(`/story/${id}`);
  };

  return (
    <div className="init-story-container">
      <h1>Welcome to Your Swedish Journey</h1>
      <p className="subtitle">Choose a story path to begin learning</p>
      
      <div className="story-cards-container">
        {storyCards.map(card => (
          <div 
            key={card.id} 
            className="story-card"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-image-container">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="card-content">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitStory; 