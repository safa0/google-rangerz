#!/usr/bin/env python3
import sqlite3
import json
import sys
import argparse
import uuid
import datetime
import requests

# Database utilities
def connect_db(db_name='users.db'):
    """Connect to the SQLite database"""
    conn = sqlite3.connect(db_name)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def get_all_users(conn):
    """Get all users from the database"""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    return cursor.fetchall()

def get_user_by_email(conn, email):
    """Get a user by email"""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    return cursor.fetchone()

def get_user_preferences(conn, user_id):
    """Get user preferences"""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
    return cursor.fetchone()

def dump_database(conn, output_file=None):
    """Dump the entire database contents in a readable format"""
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [table[0] for table in cursor.fetchall()]
    
    output = {}
    
    for table_name in tables:
        print(f"\n=== TABLE: {table_name} ===")
        
        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        print(f"Schema: {', '.join(column_names)}")
        
        # Get all records
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        print(f"Found {len(rows)} records")
        
        # Store table data
        table_data = []
        
        # Display each record
        for i, row in enumerate(rows):
            record = {}
            for j, value in enumerate(row):
                column_name = column_names[j]
                
                # Try to parse JSON strings
                if isinstance(value, str) and (value.startswith('[') or value.startswith('{')):
                    try:
                        parsed_value = json.loads(value)
                        record[column_name] = parsed_value
                    except json.JSONDecodeError:
                        record[column_name] = value
                else:
                    record[column_name] = value
            
            # Print record
            print(f"\nRecord #{i+1}:")
            print(json.dumps(record, indent=2, default=str))
            
            # Add to table data
            table_data.append(record)
        
        # Add table to output
        output[table_name] = table_data
    
    # Write to file if specified
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(output, f, indent=2, default=str)
        print(f"\nDatabase dump written to {output_file}")
    
    return output

def clear_database(conn, force=False):
    """Clear all data from the database while preserving the schema"""
    if not force:
        confirm = input("Are you sure you want to clear ALL data from the database? This cannot be undone! (yes/no): ")
        if confirm.lower() != 'yes':
            print("Database clearing cancelled.")
            return False
    
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    # Delete data from each table
    for table in tables:
        table_name = table[0]
        if table_name != 'sqlite_sequence':  # Skip SQLite internal tables
            print(f"Clearing table: {table_name}")
            cursor.execute(f"DELETE FROM {table_name}")
    
    conn.commit()
    print("Database cleared successfully.")
    return True

def add_test_user(conn, email=None, name=None):
    """Add a test user to the database"""
    # Generate unique values if not provided
    if not email:
        unique_id = uuid.uuid4().hex[:8]
        email = f"test_{unique_id}@example.com"
    if not name:
        unique_id = uuid.uuid4().hex[:6] if not email else email.split('@')[0]
        name = f"Test User {unique_id}"
    
    user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO users (id, email, name, picture, is_new_user, onboarding_completed, created_at, last_login) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, email, name, "https://ui-avatars.com/api/?name=" + name.replace(' ', '+'), 
          True, False, timestamp, timestamp))
    
    conn.commit()
    print(f"Added user: {email} with ID: {user_id}")
    return user_id, email

def add_user_preferences(conn, user_id, interests=None, age=None, skill_level=None, character=None):
    """Add user preferences"""
    if not interests:
        interests = ["swedish", "language learning", "travel"]
    
    if not age:
        age = 30
    
    if not skill_level:
        skill_level = "beginner"
    
    if not character:
        character = "owl"
    
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR REPLACE INTO user_preferences (user_id, interests, age, skill_level, character)
    VALUES (?, ?, ?, ?, ?)
    ''', (user_id, json.dumps(interests), age, skill_level, character))
    
    # Mark onboarding as completed
    cursor.execute('''
    UPDATE users SET is_new_user = 0, onboarding_completed = 1 WHERE id = ?
    ''', (user_id,))
    
    conn.commit()
    print(f"Added preferences for user ID: {user_id}")
    print(f"  Interests: {interests}")
    print(f"  Age: {age}")
    print(f"  Skill Level: {skill_level}")
    print(f"  Character: {character}")
    return True

def display_user(user, include_all=False):
    """Pretty print a user"""
    if not user:
        print("No user found")
        return
    
    # Convert SQLite row to dict
    if hasattr(user, 'keys'):
        user_dict = dict(user)
    else:
        # Handle case where user is a tuple
        cursor = sqlite3.connect(':memory:').cursor()
        cursor.execute("SELECT * FROM users LIMIT 0")
        columns = [description[0] for description in cursor.description]
        user_dict = dict(zip(columns, user))
    
    # Format for better display
    formatted_user = {
        'id': user_dict.get('id'),
        'email': user_dict.get('email'),
        'name': user_dict.get('name'),
        'is_new_user': bool(user_dict.get('is_new_user')),
        'onboarding_completed': bool(user_dict.get('onboarding_completed')),
    }
    
    if include_all:
        # Include all fields
        for key, value in user_dict.items():
            if key not in formatted_user:
                formatted_user[key] = value
    
    print(json.dumps(formatted_user, indent=2, default=str))

def display_preferences(preferences):
    """Pretty print user preferences"""
    if not preferences:
        print("No preferences found")
        return
    
    # Convert SQLite row to dict
    if hasattr(preferences, 'keys'):
        pref_dict = dict(preferences)
    else:
        # Handle case where preferences is a tuple
        cursor = sqlite3.connect(':memory:').cursor()
        cursor.execute("SELECT * FROM user_preferences LIMIT 0")
        columns = [description[0] for description in cursor.description]
        pref_dict = dict(zip(columns, preferences))
    
    # Parse interests from JSON string if needed
    if 'interests' in pref_dict and isinstance(pref_dict['interests'], str):
        try:
            pref_dict['interests'] = json.loads(pref_dict['interests'])
        except json.JSONDecodeError:
            # If not valid JSON, treat it as comma-separated string
            pref_dict['interests'] = pref_dict['interests'].split(',')
    
    print(json.dumps(pref_dict, indent=2, default=str))

# API Testing Utilities
def test_signup(email=None, name=None):
    """Test signing up a user via API"""
    # Generate unique values if not provided
    if not email:
        unique_id = uuid.uuid4().hex[:8]
        email = f"api_test_{unique_id}@example.com"
    if not name:
        unique_id = email.split('@')[0]
        name = f"API Test User {unique_id}"
    
    print(f"Signing up test user: {email}...")
    
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/mock-google',
            json={
                'email': email,
                'name': name,
                'isNewUser': True
            }
        )
        
        if response.status_code == 200:
            print("Signup successful!")
            print(json.dumps(response.json(), indent=2))
            return response.cookies, email, response.json()['user']['id']
        else:
            print(f"Signup failed with status {response.status_code}")
            print(response.text)
            return None, email, None
    except Exception as e:
        print(f"Error during signup: {e}")
        return None, email, None

def test_complete_onboarding(cookies, interests=None, age=None, skill_level=None, character=None):
    """Test completing onboarding via API"""
    if not interests:
        interests = ["swedish", "language learning", "travel"]
    
    if not age:
        age = 30
    
    if not skill_level:
        skill_level = "beginner"
    
    if not character:
        character = "owl"
    
    print("\nCompleting onboarding...")
    
    try:
        response = requests.post(
            'http://localhost:5000/api/user/complete-onboarding',
            json={
                'interests': interests,
                'age': age,
                'skillLevel': skill_level,
                'character': character
            },
            cookies=cookies
        )
        
        if response.status_code == 200:
            print("Onboarding completed successfully!")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"Onboarding completion failed with status {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error during onboarding completion: {e}")
        return False

def get_user_info(cookies):
    """Get user info via API using the provided cookies"""
    print("\nGetting user info...")
    
    try:
        response = requests.get(
            'http://localhost:5000/api/auth/user',
            cookies=cookies
        )
        
        if response.status_code == 200:
            print("User info retrieved successfully!")
            print(json.dumps(response.json(), indent=2))
            return response.json()
        else:
            print(f"Getting user info failed with status {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error getting user info: {e}")
        return None

def check_database_for_api_user(db_conn, user_id):
    """Check if the API user is correctly stored in the database"""
    print("\nChecking database for user data...")
    
    user = None
    preferences = None
    
    cursor = db_conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if user:
        print("User found in database!")
        display_user(user, include_all=True)
        
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
        preferences = cursor.fetchone()
        
        if preferences:
            print("\nUser preferences found in database!")
            display_preferences(preferences)
        else:
            print("\nNo preferences found for this user.")
    else:
        print(f"User with ID {user_id} not found in database!")
    
    return user, preferences

def main():
    parser = argparse.ArgumentParser(description='Utility for checking and managing user data')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # List users command
    list_parser = subparsers.add_parser('list', help='List all users')
    list_parser.add_argument('--db', default='users.db', help='Database file to use')
    list_parser.add_argument('--all', action='store_true', help='Show all fields')
    
    # Create test user command
    create_parser = subparsers.add_parser('create', help='Create a test user')
    create_parser.add_argument('--db', default='users.db', help='Database file to use')
    create_parser.add_argument('--email', help='Email for the test user')
    create_parser.add_argument('--name', help='Name for the test user')
    create_parser.add_argument('--add-preferences', action='store_true', help='Add preferences for the user')
    
    # Show user command
    show_parser = subparsers.add_parser('show', help='Show a specific user')
    show_parser.add_argument('email', help='Email of the user to show')
    show_parser.add_argument('--db', default='users.db', help='Database file to use')
    show_parser.add_argument('--all', action='store_true', help='Show all fields')
    show_parser.add_argument('--preferences', action='store_true', help='Show user preferences')
    
    # API test command
    api_parser = subparsers.add_parser('api-test', help='Test the API')
    api_parser.add_argument('--email', help='Email for the test user')
    api_parser.add_argument('--name', help='Name for the test user')
    api_parser.add_argument('--db', default='users.db', help='Database file to check after API test')
    api_parser.add_argument('--skip-onboarding', action='store_true', help='Skip onboarding completion')
    
    # Verify command
    verify_parser = subparsers.add_parser('verify', help='Verify database contains correct user data')
    verify_parser.add_argument('--db', default='users.db', help='Database file to use')
    verify_parser.add_argument('--min-users', type=int, default=1, help='Minimum number of users expected')
    verify_parser.add_argument('--check-preferences', action='store_true', help='Check if users have preferences')
    
    # Clear database command
    clear_parser = subparsers.add_parser('clear', help='Clear all data from the database')
    clear_parser.add_argument('--db', default='users.db', help='Database file to clear')
    clear_parser.add_argument('--force', action='store_true', help='Skip confirmation prompt')
    
    # Dump database command
    dump_parser = subparsers.add_parser('dump', help='Dump the entire database contents')
    dump_parser.add_argument('--db', default='users.db', help='Database file to dump')
    dump_parser.add_argument('--output', help='Output file to write the dump to (JSON format)')
    
    args = parser.parse_args()
    
    if args.command == 'list':
        conn = connect_db(args.db)
        users = get_all_users(conn)
        print(f"Found {len(users)} users:")
        for user in users:
            print("\n---")
            display_user(user, include_all=args.all)
        conn.close()
    
    elif args.command == 'create':
        conn = connect_db(args.db)
        user_id, email = add_test_user(conn, args.email, args.name)
        
        if args.add_preferences:
            add_user_preferences(conn, user_id)
        
        conn.close()
        print(f"Test user created successfully: {email}")
    
    elif args.command == 'show':
        conn = connect_db(args.db)
        user = get_user_by_email(conn, args.email)
        
        if user:
            print("User found:")
            display_user(user, include_all=args.all)
            
            if args.preferences:
                preferences = get_user_preferences(conn, user['id'])
                print("\nUser preferences:")
                display_preferences(preferences)
        else:
            print(f"No user found with email: {args.email}")
        
        conn.close()
    
    elif args.command == 'api-test':
        # Test signup
        cookies, email, user_id = test_signup(args.email, args.name)
        
        if cookies and user_id:
            # Complete onboarding if not skipped
            if not args.skip_onboarding:
                test_complete_onboarding(cookies)
            
            # Get user info
            user_info = get_user_info(cookies)
            
            # Check database
            conn = connect_db(args.db)
            check_database_for_api_user(conn, user_id)
            conn.close()
            
            print("\nAPI test completed. To verify user persistence after server restart:")
            print(f"python check_user_data.py show {email} --preferences")
        else:
            print("API test could not be completed due to signup failure.")
    
    elif args.command == 'verify':
        conn = connect_db(args.db)
        users = get_all_users(conn)
        
        if len(users) < args.min_users:
            print(f"VERIFICATION FAILED: Expected at least {args.min_users} users, but found {len(users)}")
            sys.exit(1)
        else:
            print(f"VERIFICATION PASSED: Found {len(users)} users (expected at least {args.min_users})")
        
        if args.check_preferences:
            preferences_count = 0
            for user in users:
                pref = get_user_preferences(conn, user['id'])
                if pref:
                    preferences_count += 1
            
            if preferences_count < args.min_users:
                print(f"VERIFICATION FAILED: Expected at least {args.min_users} users with preferences, but found {preferences_count}")
                sys.exit(1)
            else:
                print(f"VERIFICATION PASSED: Found {preferences_count} users with preferences (expected at least {args.min_users})")
        
        conn.close()
    
    elif args.command == 'clear':
        conn = connect_db(args.db)
        clear_database(conn, args.force)
        conn.close()
    
    elif args.command == 'dump':
        conn = connect_db(args.db)
        dump_database(conn, args.output)
        conn.close()
    
    else:
        # No command or invalid command
        parser.print_help()

if __name__ == "__main__":
    main() 