# Swedish Learning App for Children

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245.svg)](https://reactrouter.com/)

## Overview

Svenska Ugglan ("Swedish Owl") is an interactive language learning application designed for children aged 9-13 to learn Swedish. Inspired by Duolingo ABC, this app focuses on reading comprehension and vocabulary building through interactive stories and gamified learning experiences.

![App Screenshot](https://via.placeholder.com/800x400?text=Svenska+Ugglan+App)

## Features

- **Interactive Onboarding**: Personalized setup process for children, parents, or teachers
- **Story-based Learning**: Engaging stories with interactive elements to practice reading
- **Multiple Learning Components**:
  - Reading pages with text and illustrations
  - Fill-in-the-blank exercises
  - Comprehension questions
- **Gamified Learning**: XP points, streaks, badges, and achievements
- **Progress Tracking**: Stats and visualizations to monitor improvement
- **Motivational Profile**: Personal stats page with streaks and achievements
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technologies

- React 18
- React Router 6
- CSS3 with custom animations
- localStorage for persistence

## Project Structure

```
src/
├── components/
│   ├── onboarding/        # User setup and personalization
│   │   ├── Welcome.js
│   │   ├── HowDidYouHear.js
│   │   ├── WhoIsLearning.js
│   │   ├── ChildName.js
│   │   ├── ChildAge.js
│   │   ├── CharacterSelection.js
│   │   └── InterestSelection.js
│   ├── main/              # Core app functionality
│   │   ├── StoriesExplorer.js
│   │   ├── StoryReader.js
│   │   ├── StoryReader.css
│   │   ├── ReadingComponent.js
│   │   ├── FillBlankComponent.js
│   │   ├── ComprehensionComponent.js
│   │   ├── StoryComplete.js
│   │   └── StoryComponents.css
│   └── profile/           # User statistics and achievements
│       ├── ProfilePage.js
│       └── ProfilePage.css
├── App.js                 # Main application component
├── App.css                # Global styles
├── index.js               # Entry point
└── index.css              # Base styles
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/svenska-ugglan.git
   cd svenska-ugglan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## Development Guidelines

### Adding New Stories

Stories are currently stored as mock data in `StoryReader.js`. Each story consists of:

```javascript
{
  id: number,
  title: string,
  pages: [
    {
      type: "intro" | "reading" | "fillBlank" | "comprehension",
      imageUrl: string,
      // Additional properties based on type
    }
  ]
}
```

To add a new story, create a new mock story object and add it to the stories array.

### Creating New Components

1. Create your component file in the appropriate directory
2. Import necessary dependencies
3. Define your component using React Hooks
4. Add styling in the corresponding CSS file
5. Export your component and import it where needed

### Handling User Data

User data is managed through React state in `App.js` and passed down to components via props. The app uses the following state structure:

```javascript
{
  userType: string,
  childName: string,
  childAge: string,
  character: string,
  interests: string[],
  joinDate: string,
  stats: {
    currentStreak: number,
    longestStreak: number,
    totalXP: number,
    storiesCompletedToday: number,
    totalStoriesCompleted: number
  }
}
```

## Feature Development Roadmap

- **Backend Integration**: Replace mock data with API calls
- **User Authentication**: Add login/registration functionality
- **Multiple Languages**: Support for additional languages
- **Offline Mode**: Cache stories for offline learning
- **Parent Dashboard**: Analytics and progress monitoring for parents
- **Teacher Tools**: Classroom management for educational settings

## Troubleshooting

### Common Issues

- **Component Import Errors**: Ensure you're using the correct import syntax (default vs named exports)
- **Styling Issues**: Check for CSS conflicts and ensure class names are unique
- **Routing Problems**: Verify that all routes are correctly defined in `App.js`

### Debugging

The application uses standard React development tools. Use the React Developer Tools browser extension for component inspection and debugging.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Duolingo ABC
- Designed for Swedish language education
- Created to make learning fun and engaging for children
