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
        var data_to_return = data.chapters.map((chapter) => ({
        ...chapter,
        ...parseRawText(chapter.raw_text), // Merging parsed content directly
      }));
      data_to_return = data_to_return.map((chapter) => ({
        ...chapter,
        opt: parseText(chapter.opt),
        exe: parseExe(chapter.exe, chapter.metadata.type),
      }));
      return data_to_return;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

function parseExe(input, type) {
    // Extract text outside of brackets
    const outsideText = input.replace(/\[.*?\]/g, '').trim();
    
    // Extract text inside brackets
    const insideOptions = input.match(/\[(.*?)\]/g).map(option => option.slice(1, -1));
    
    return {
        "txt": outsideText,
        "options": insideOptions,
        "correctAnswer": insideOptions[0]
    };
}

function parseText(input) {
    // Extract text outside of brackets
    const outsideText = input.replace(/\[.*?\]/g, '').trim();
    
    // Extract text inside brackets
    const insideOptions = input.match(/\[(.*?)\]/g).map(option => option.slice(1, -1));
    
    return {
        "txt": outsideText,
        "options": insideOptions
    };
}

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
