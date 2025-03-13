import axios from 'axios';

// Use the same base URL as in test_api.py
const API_BASE_URL = 'https://rangerz-backend-331294271019.europe-north2.run.app';

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Changed to false since the API doesn't require cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
apiClient.interceptors.request.use(request => {
  console.log('🚀 API Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
}, error => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for logging
apiClient.interceptors.response.use(response => {
  console.log('✅ API Response:', {
    url: response.config.url,
    status: response.status,
    data: typeof response.data === 'string' ? 'Large data (possibly image)' : response.data
  });
  return response;
}, error => {
  console.error('❌ Response Error:', error.response ? {
    url: error.config.url,
    status: error.response.status,
    data: error.response.data
  } : error.message);
  return Promise.reject(error);
});

// Generate image from description - matches test_api.py format
export const generateImage = async (description) => {
  console.log('📷 Generating image for description:', description);
  try {
    const response = await apiClient.post('/generate_image', {
      description: description
    });
    
    // Return the base64 image data with proper format for direct use in img src
    if (response.data && response.data.image_base64) {
      console.log('📷 Image generated successfully');
      return `data:image/jpeg;base64,${response.data.image_base64}`;
    } else {
      console.error('📷 Invalid image data received from API');
      throw new Error('Invalid image data received from API');
    }
  } catch (error) {
    console.error('📷 Error generating image:', error);
    throw error;
  }
};

// Mock image generation for development
export const mockGenerateImage = (description) => {
  console.log('🔶 MOCK: Generating image for description:', description);
  const imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(description.substring(0, 30))}`;
  return Promise.resolve(imageUrl);
};

// Initialize story with real API - matches format in test_api.py
export const realInitializeStory = async (userData) => {
  console.log('📚 Initializing story with user data:', userData);
  try {
    // Format exactly as in test_api.py
    const requestData = {
      name: userData.name || "John Doe",
      age: userData.age || 10,
      skill_level: "beginner",
      interests: userData.interests || ["hiking", "camping", "fishing"],
      model: "gemini-2.0-flash-lite-001"
    };
    
    console.log('📚 Sending request to initialize_story:', requestData);
    const response = await apiClient.post('/initialize_story', requestData);
    console.log('📚 ########Received response:', response.data);
    
    // The API response format needs to be transformed to match our expected format
    return await parseApiResponse(response.data);
  } catch (error) {
    console.error('📚 Error initializing story:', error);
    throw error;
  }
};

// Continue story with API - matches format in test_api.py
export const continueStory = async (storyData) => {
  console.log('📚 Continuing story with data:', storyData);
  try {
    const response = await apiClient.post('/continue_story', {
      name: storyData.name,
      age: storyData.age,
      skill_level: storyData.skill_level,
      interests: storyData.interests,
      comfortable_words: storyData.comfortable_words || [],
      struggling_words: storyData.struggling_words || [],
      big_picture: storyData.big_picture || "Learning Swedish",
      summary_of_previous_story: storyData.summary_of_previous_story || "",
      latest_choice: storyData.latest_choice || "",
      exercise_type: storyData.exercise_type || "multiple_choice",
      progression: storyData.progression || 1,
      total_steps: storyData.total_steps || 5,
      model: storyData.model || "gemini-2.0-flash-lite-001"
    });
    
    return response.data;
  } catch (error) {
    console.error('📚 Error continuing story:', error);
    throw error;
  }
};

// Function to properly parse the initialize_story response
function parseApiResponse(apiResponse) {
  console.log('📚 Parsing API response type:', typeof apiResponse);

  const output = apiResponse.candidates[0].content.parts[0].text

  // Clean up the response - remove triple backticks and extra newlines
  let cleanedResponse = output;
  
  // Remove surrounding backticks if present
  if (cleanedResponse.startsWith('```') && cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.substring(3, cleanedResponse.length - 3);
  }
  
  // Remove any leading/trailing whitespace
  cleanedResponse = cleanedResponse.trim();
  
  console.log('📚 Cleaned response (first 100 chars):', cleanedResponse.substring(0, 100) + '...');
  
  try {
    // Extract title tags using regex that supports multiline content
    const titleRegex = /<title>([\s\S]*?)<\/title>/g;
    const titles = [];
    let titleMatch;
    while ((titleMatch = titleRegex.exec(cleanedResponse)) !== null) {
      titles.push(titleMatch[1].trim());
    }
    
    // Extract txt tags
    const txtRegex = /<txt>([\s\S]*?)<\/txt>/g;
    const txts = [];
    let txtMatch;
    while ((txtMatch = txtRegex.exec(cleanedResponse)) !== null) {
      txts.push(txtMatch[1].trim());
    }
    
    // Extract img tags
    const imgRegex = /<img>([\s\S]*?)<\/img>/g;
    const imgDescriptions = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(cleanedResponse)) !== null) {
      imgDescriptions.push(imgMatch[1].trim());
    }
    
    console.log('📚 Extracted data:', {
      titles: titles,
      txts: txts,
      imgDescriptions: imgDescriptions
    });
    
    // Create story objects
    const stories = [];
    for (let i = 0; i < Math.max(titles.length, txts.length, imgDescriptions.length); i++) {
      stories.push({
        title: titles[i] || `Story ${i+1}`,
        txt: txts[i] || "No description available",
        img_description: imgDescriptions[i] || "A placeholder image"
      });
    }
    
    console.log('📚 Parsed stories:adjwajidjidjidjijiwd', stories);
    return { stories };
  } catch (err) {
    console.error('❌ Error parsing API response:', err);
    throw new Error('Failed to parse API response: ' + err.message);
  }
 
}


export default {
  generateImage,
  realInitializeStory,
  continueStory,
}; 