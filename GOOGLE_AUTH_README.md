# Google Authentication Setup for Svenska Ugglan

This guide will walk you through setting up Google Authentication for the Svenska Ugglan application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Python 3.x installed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"

## Step 2: Set Up OAuth 2.0 Client ID

1. Click "Create Credentials" and select "OAuth client ID"
2. For Application type, select "Web application"
3. Name your client (e.g., "Svenska Ugglan Auth")
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL if applicable
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production URL if applicable
6. Click "Create"
7. Note your Client ID and Client Secret

## Step 3: Update the Application Code

1. Open `src/components/onboarding/Welcome.js`
2. Replace the placeholder Google Client ID with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
   ```

## Step 4: Run the Application

1. Make the start script executable:
   ```bash
   chmod +x start.sh
   ```

2. Run the application:
   ```bash
   ./start.sh
   ```

This will:
- Create a Python virtual environment if it doesn't exist
- Install backend dependencies
- Start the backend server on port 5000
- Start the frontend development server on port 3000

## How It Works

1. When a user clicks "LOGIN WITH GOOGLE," they will see a Google sign-in popup
2. After successful authentication with Google, the user's information is sent to the backend
3. The backend verifies the token with Google and stores the user information in a SQLite database
4. A session is created for the user
5. The user is redirected to the stories page
6. If the user logs out and logs back in, their information will be retrieved from the database

## Troubleshooting

- **Backend Connection Error**: Make sure the backend server is running on port 5000
- **Google Sign-In Not Working**: Verify that your Client ID is correct and that you've set up the correct origins in the Google Cloud Console
- **Session Not Persisting**: Ensure that cookies are enabled in your browser

## Security Notes

- For production deployment, ensure you use HTTPS for all communication
- Consider implementing more robust session management
- Store the Google Client ID in environment variables rather than hardcoding it
- Implement CSRF protection for production use 