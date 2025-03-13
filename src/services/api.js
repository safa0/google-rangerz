import axios from 'axios';

// Base URL for API requests - can be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for maintaining session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Story-related API functions
export const initializeStory = async (userData) => {
  try {
    const response = await apiClient.post('/initialize_story', userData);
    return response.data;
  } catch (error) {
    console.error('Error initializing story:', error);
    throw error;
  }
};

export const continueStory = async (storyData) => {
  try {
    const response = await apiClient.post('/continue_story', storyData);
    return response.data;
  } catch (error) {
    console.error('Error continuing story:', error);
    throw error;
  }
};

// User-related API functions
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const completeOnboarding = async (onboardingData) => {
  try {
    const response = await apiClient.post('/api/user/complete-onboarding', onboardingData);
    return response.data;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// Mock API function that returns data in the format you specified
export const mockInitializeStory = () => {
  // Return dummy story data in the format from your API
  return Promise.resolve({
    stories: [
      {
        title: "Den hemliga forsen",
        txt: "Du är på vandring i en djup skog, redo att fiska i den kristallklara forsen. Vilka hemligheter gömmer sig i skogen?",
        img: "https://via.placeholder.com/300x200?text=Forest+Stream"
      },
      {
        title: "Camping under stjärnorna",
        txt: "Du befinner dig på ett campingäventyr, omgiven av naturens lugn. Vad ska du göra i natten?",
        img: "https://via.placeholder.com/300x200?text=Night+Camping"
      },
      {
        title: "Fiskelyckan",
        txt: "Du är ute på en fisketur, redo för att fånga din största fisk någonsin. Kommer du att lyckas fånga den?",
        img: "https://via.placeholder.com/300x200?text=Fishing+Lake"
      }
    ]
  });
};

// Function to initialize story with real API
export const realInitializeStory = async (userData) => {
  try {
    const response = await apiClient.post('/initialize_story', {
      name: userData.name || "John Doe",
      age: userData.age || 10,
      skill_level: userData.skill_level || "beginner",
      interests: userData.interests || ["hiking", "camping", "fishing"],
      comfortable_words: userData.comfortable_words || [],
      struggling_words: userData.struggling_words || [],
      exercise_type: "comprehension_text",
      summary_of_previous_story: ""
    });
    
    // Parse the response to extract stories
    const stories = parseStoryResponse(response.data);
    return { stories };
  } catch (error) {
    console.error('Error initializing story:', error);
    throw error;
  }
};

// Helper function to parse the API response
const parseStoryResponse = (responseData) => {
  // This function would parse the XML-like format from your API
  // For now, we'll return mock data
  return [
    {
      title: "Den hemliga forsen",
      txt: "Du är på vandring i en djup skog, redo att fiska i den kristallklara forsen. Vilka hemligheter gömmer sig i skogen?",
      img: "https://via.placeholder.com/300x200?text=Forest+Stream"
    },
    {
      title: "Camping under stjärnorna",
      txt: "Du befinner dig på ett campingäventyr, omgiven av naturens lugn. Vad ska du göra i natten?",
      img: "https://via.placeholder.com/300x200?text=Night+Camping"
    },
    {
      title: "Fiskelyckan",
      txt: "Du är ute på en fisketur, redo för att fånga din största fisk någonsin. Kommer du att lyckas fånga den?",
      img: "https://via.placeholder.com/300x200?text=Fishing+Lake"
    }
  ];
};

export default {
  initializeStory,
  continueStory,
  getCurrentUser,
  completeOnboarding,
  mockInitializeStory,
  realInitializeStory
}; 