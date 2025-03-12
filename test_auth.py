#!/usr/bin/env python3
import unittest
import json
import os
import sys
import uuid
import random
import string
from datetime import datetime
import sqlite3

# Add the current directory to the path so we can import the server module
sys.path.append(os.path.dirname(os.path.realpath(__file__)))

# Import server module - handle potential import errors gracefully
try:
    import server
    from server import app
except ModuleNotFoundError as e:
    print(f"Error: {e}")
    print("Please make sure you've installed all required dependencies:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

# Use a separate test database
TEST_DB = 'test_users.db'

def random_email():
    """Generate a random email for testing"""
    random_str = ''.join(random.choice(string.ascii_lowercase) for _ in range(10))
    return f"{random_str}@test.com"


def random_name():
    """Generate a random name for testing"""
    first_names = ["Alex", "Sam", "Taylor", "Jordan", "Morgan", "Casey", "Riley", "Quinn"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"


class TestAuthentication(unittest.TestCase):
    """Test suite for authentication functionality"""

    @classmethod
    def setUpClass(cls):
        """Set up the test environment once for all tests"""
        # Use a test database instead of the main one
        server.app.config['TESTING'] = True
        # Remove test database if it exists
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)

    def setUp(self):
        """Set up the test client and initialize test data"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Set a specific secret key for testing to ensure consistent sessions
        app.config['SECRET_KEY'] = 'test_secret_key'
        
        # Create test database
        conn = sqlite3.connect(TEST_DB)
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            name TEXT,
            picture TEXT,
            is_new_user BOOLEAN DEFAULT 1,
            onboarding_completed BOOLEAN DEFAULT 0,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id TEXT PRIMARY KEY,
            interests TEXT,
            age INTEGER,
            skill_level TEXT,
            character TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        conn.commit()
        conn.close()
        
        # Patch the database connection in server.py for testing
        def mock_connect(*args, **kwargs):
            return sqlite3.connect(TEST_DB)
        
        # Save the original connect function
        self.original_connect = sqlite3.connect
        # Replace with mock
        sqlite3.connect = mock_connect
        
        # Create test data
        self.new_user_email = random_email()
        self.new_user_name = random_name()
        
        # Create a test user that will be pre-inserted for login tests
        self.existing_user_email = random_email()
        self.existing_user_name = random_name()
        self.existing_user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, self.existing_user_email))
        
        # Add the existing user directly to the database
        conn = sqlite3.connect(TEST_DB)
        cursor = conn.cursor()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO users (id, email, name, picture, is_new_user, onboarding_completed, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (self.existing_user_id, self.existing_user_email, self.existing_user_name, 
             "https://ui-avatars.com/api/", 0, 0, timestamp, timestamp)
        )
        conn.commit()
        conn.close()

    def tearDown(self):
        """Clean up after each test"""
        # Restore the original sqlite3.connect
        sqlite3.connect = self.original_connect

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        # Remove test database
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)

    def test_signup_new_user(self):
        """Test signing up a new user"""
        response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.new_user_email,
                'name': self.new_user_name,
                'isNewUser': True
            },
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['user']['email'], self.new_user_email)
        self.assertEqual(data['user']['name'], self.new_user_name)
        self.assertTrue(data['user']['isNewUser'])
        self.assertFalse(data['user']['onboardingCompleted'])

    def test_login_existing_user(self):
        """Test logging in an existing user"""
        response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.existing_user_email,
                'name': self.existing_user_name,
                'isNewUser': False
            },
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['user']['email'], self.existing_user_email)
        self.assertEqual(data['user']['name'], self.existing_user_name)
        self.assertFalse(data['user']['isNewUser'])

    def test_signup_with_existing_email(self):
        """Test attempting to sign up with an email that already exists"""
        # First try to sign up with the existing user's email
        response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.existing_user_email,
                'name': 'New ' + self.existing_user_name,
                'isNewUser': True
            },
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        
        # Should still succeed but user should not be marked as new
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['user']['email'], self.existing_user_email)
        self.assertFalse(data['user']['isNewUser'])

    def test_get_user_authenticated(self):
        """Test getting user info when authenticated"""
        # First login to set session
        login_response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.existing_user_email,
                'name': self.existing_user_name,
                'isNewUser': False
            },
            content_type='application/json'
        )
        
        # Then try to get user info
        response = self.app.get('/api/auth/user')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['user']['email'], self.existing_user_email)

    def test_get_user_unauthenticated(self):
        """Test getting user info when not authenticated"""
        # Try to get user info without logging in first
        # Create a new client to ensure no session
        new_client = app.test_client()
        response = new_client.get('/api/auth/user')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], 'Not logged in')

    def test_logout(self):
        """Test logging out a user"""
        # First login to set session
        login_response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.existing_user_email,
                'name': self.existing_user_name,
                'isNewUser': False
            },
            content_type='application/json'
        )
        
        # Then logout
        logout_response = self.app.post('/api/auth/logout')
        logout_data = json.loads(logout_response.data)
        
        self.assertEqual(logout_response.status_code, 200)
        self.assertEqual(logout_data['status'], 'success')
        
        # Verify we're logged out by trying to get user info
        response = self.app.get('/api/auth/user')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['status'], 'error')

    def test_complete_onboarding(self):
        """Test completing the onboarding process"""
        # First login to set session
        login_response = self.app.post(
            '/api/auth/mock-google',
            json={
                'email': self.existing_user_email,
                'name': self.existing_user_name,
                'isNewUser': True
            },
            content_type='application/json'
        )
        
        # Then complete onboarding
        onboarding_response = self.app.post(
            '/api/user/complete-onboarding',
            json={
                'interests': ['language', 'culture', 'travel'],
                'age': 28,
                'skillLevel': 'beginner',
                'character': 'owl'
            },
            content_type='application/json'
        )
        
        onboarding_data = json.loads(onboarding_response.data)
        
        self.assertEqual(onboarding_response.status_code, 200)
        self.assertEqual(onboarding_data['status'], 'success')
        
        # Verify onboarding is completed by getting user info
        response = self.app.get('/api/auth/user')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertTrue(data['user']['onboardingCompleted'])
        self.assertFalse(data['user']['isNewUser'])


if __name__ == '__main__':
    unittest.main() 