export const getStoryById = async (storyId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/story/${storyId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      return data.story;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    return null;
  }
};

export const getStoriesbyUserID = async (userID) => {
    try {
        const response = await fetch(`http://localhost:5000/api/story/user/${userID}`, {
        method: 'GET',
        credentials: 'include',
        });
    
        const data = await response.json();
        
        if (data.status === 'success') {
        return data.stories;
        } else {
        throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching stories:', error);
        return [];
    }
    }

export const getChaptersByStory = async (storyId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/story/${storyId}/chapters`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.status === 'success') {
      return data.chapters.map((chapter) => ({
        ...chapter,
        ...parseRawText(chapter.raw_text), // Merging parsed content directly
      }));
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

const parseRawText = (rawText) => {
  const sections = {};
  const regex = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const [, tag, content] = match;
    sections[tag] = content.trim();
  }

  return sections;
};
