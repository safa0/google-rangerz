#!/usr/bin/env python3
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import sqlite3
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import json
import secrets
import uuid
import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = secrets.token_hex(16)  # Generate a random secret key

# Setup and migrate database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # First, check if users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    users_table_exists = cursor.fetchone() is not None
    
    if not users_table_exists:
        # Create the users table with all columns if it doesn't exist
        cursor.execute('''
        CREATE TABLE users (
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
    else:
        # Table exists, check for missing columns and add them safely
        # SQLite doesn't allow adding columns with non-constant default values,
        # so we need to add them without defaults and then update them
        
        # Check for needed columns
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add missing columns without defaults
        if 'is_new_user' not in existing_columns:
            print("Adding is_new_user column...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_new_user BOOLEAN")
            cursor.execute("UPDATE users SET is_new_user = 0")
            
        if 'onboarding_completed' not in existing_columns:
            print("Adding onboarding_completed column...")
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN")
            cursor.execute("UPDATE users SET onboarding_completed = 0")
            
        if 'created_at' not in existing_columns:
            print("Adding created_at column...")
            cursor.execute("ALTER TABLE users ADD COLUMN created_at TIMESTAMP")
            cursor.execute("UPDATE users SET created_at = CURRENT_TIMESTAMP")
            
        # Handle NULL values in existing columns
        cursor.execute("UPDATE users SET is_new_user = 0 WHERE is_new_user IS NULL")
        cursor.execute("UPDATE users SET onboarding_completed = 0 WHERE onboarding_completed IS NULL")
    
    # Create user_preferences table if it doesn't exist
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
    print("Database initialization and migration completed.")

@app.route('/')
def index():
    return jsonify({"status": "API is running"})

@app.route('/api/auth/mock-google', methods=['POST'])
def mock_google_login():
    """
    Mock Google login without actual Google authentication
    This is for development/testing only
    """
    try:
        email = request.json.get('email')
        name = request.json.get('name')
        is_signup = request.json.get('isNewUser', False)
        
        if not email or not name:
            return jsonify({
                'status': 'error',
                'message': 'Email and name are required'
            }), 400
        
        # Generate a mock user ID (in production this would come from Google)
        # Using the email to ensure the same user gets the same ID
        userid = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))
        
        # Use a default profile picture based on first letter of name
        picture = f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random"
        
        # Connect to database
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id, is_new_user, onboarding_completed FROM users WHERE email = ?', (email,))
        existing_user = cursor.fetchone()
        
        current_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        if existing_user:
            # User exists
            is_new = False
            onboarding_completed = existing_user[2] if existing_user[2] is not None else False
            
            # Update the user's information
            cursor.execute('''
            UPDATE users 
            SET name = ?, picture = ?, last_login = ?
            WHERE id = ?
            ''', (name, picture, current_timestamp, userid))
            
            # If it's a signup request but user exists, we'll just log them in
            if is_signup:
                # Maybe we could add a message about existing account, but for simplicity we'll just log them in
                pass
        else:
            # New user
            is_new = True
            onboarding_completed = False
            
            # Insert the new user
            cursor.execute('''
            INSERT INTO users (id, email, name, picture, is_new_user, onboarding_completed, created_at, last_login) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (userid, email, name, picture, True, False, current_timestamp, current_timestamp))
        
        conn.commit()
        
        # Get user data from database to return
        cursor.execute('SELECT id, email, name, picture, is_new_user, onboarding_completed FROM users WHERE id = ?', (userid,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            user_data = {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'picture': user[3],
                'isNewUser': bool(user[4]) if user[4] is not None else True,
                'onboardingCompleted': bool(user[5]) if user[5] is not None else False
            }
            
            # Store user ID in session
            session['user_id'] = userid
            
            return jsonify({
                'status': 'success',
                'user': user_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to retrieve user data'
            }), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    try:
        # Get the token from the request
        token = request.json.get('token')
        
        # Specify the CLIENT_ID of the app that accesses the backend
        # This would typically come from an environment variable in production
        CLIENT_ID = request.json.get('client_id')  # You'll need to provide this from the frontend
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        
        # Get user info
        userid = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Store user info in the database
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('''
        INSERT OR REPLACE INTO users (id, email, name, picture, last_login) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (userid, email, name, picture))
        conn.commit()
        
        # Get user data from database to return
        cursor.execute('SELECT id, email, name, picture FROM users WHERE id = ?', (userid,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            user_data = {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'picture': user[3]
            }
            
            # Store user ID in session
            session['user_id'] = userid
            
            return jsonify({
                'status': 'success',
                'user': user_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to retrieve user data'
            }), 500
            
    except ValueError as e:
        # Invalid token
        return jsonify({
            'status': 'error',
            'message': f'Invalid token: {str(e)}'
        }), 401
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    # Clear the session
    session.pop('user_id', None)
    return jsonify({'status': 'success', 'message': 'Logged out successfully'})

@app.route('/api/auth/user', methods=['GET'])
def get_user():
    # Check if user is logged in
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Not logged in'
        }), 401
    
    # Get user data from database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, name, picture, is_new_user, onboarding_completed FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'status': 'success',
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'picture': user[3],
                'isNewUser': bool(user[4]) if user[4] is not None else True,
                'onboardingCompleted': bool(user[5]) if user[5] is not None else False
            }
        })
    else:
        session.pop('user_id', None)  # Clear invalid session
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404

@app.route('/api/user/complete-onboarding', methods=['POST'])
def complete_onboarding():
    # Check if user is logged in
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Not logged in'
        }), 401
    
    try:
        # Get preferences data
        data = request.json
        interests = data.get('interests', [])
        age = data.get('age')
        skill_level = data.get('skillLevel')
        character = data.get('character')
        
        # Update user preferences
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Update user preferences
        cursor.execute('''
        INSERT OR REPLACE INTO user_preferences (user_id, interests, age, skill_level, character)
        VALUES (?, ?, ?, ?, ?)
        ''', (user_id, json.dumps(interests), age, skill_level, character))
        
        # Mark onboarding as completed
        cursor.execute('''
        UPDATE users SET is_new_user = 0, onboarding_completed = 1 WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Onboarding completed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000) 