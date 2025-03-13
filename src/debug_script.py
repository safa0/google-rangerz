#!/usr/bin/env python
"""
Debug script to check the database and manually add user preferences if needed
"""
import sqlite3
import json
import uuid

def connect_db(db_name='users.db'):
    """Connect to the SQLite database"""
    conn = sqlite3.connect(db_name)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def show_database_state():
    """Show the current state of the database"""
    conn = connect_db()
    cursor = conn.cursor()
    
    # Show users
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    
    print("=== USERS ===")
    for user in users:
        print(dict(user))
    
    # Show user preferences
    cursor.execute("SELECT * FROM user_preferences")
    preferences = cursor.fetchall()
    
    print("\n=== USER PREFERENCES ===")
    for pref in preferences:
        pref_dict = dict(pref)
        # Try to parse JSON
        if 'interests' in pref_dict and pref_dict['interests']:
            try:
                pref_dict['interests'] = json.loads(pref_dict['interests'])
            except:
                pass
        print(pref_dict)
    
    conn.close()

def manually_add_user_preferences():
    """Manually add user preferences for users that don't have them"""
    conn = connect_db()
    cursor = conn.cursor()
    
    # Get users without preferences
    cursor.execute("""
    SELECT users.id, users.email, users.name FROM users 
    LEFT JOIN user_preferences ON users.id = user_preferences.user_id
    WHERE user_preferences.user_id IS NULL
    """)
    
    users_without_prefs = cursor.fetchall()
    
    if not users_without_prefs:
        print("All users have preferences!")
        conn.close()
        return
    
    print(f"Found {len(users_without_prefs)} users without preferences")
    
    for user in users_without_prefs:
        user_id = user['id']
        email = user['email']
        name = user['name']
        
        print(f"\nAdding preferences for {name} ({email})")
        
        default_interests = ["language", "travel", "culture"]
        default_age = 30
        default_skill_level = "beginner"
        default_character = "owl"
        
        cursor.execute('''
        INSERT INTO user_preferences (user_id, interests, age, skill_level, character)
        VALUES (?, ?, ?, ?, ?)
        ''', (user_id, json.dumps(default_interests), default_age, default_skill_level, default_character))
        
        # Mark onboarding as completed
        cursor.execute('''
        UPDATE users SET is_new_user = 0, onboarding_completed = 1 WHERE id = ?
        ''', (user_id,))
        
        print(f"Added default preferences for {name}")
    
    conn.commit()
    conn.close()
    print("\nAll done! Default preferences added to all users.")

def main():
    print("Database Debug Tool")
    print("===================")
    print("1. Show current database state")
    print("2. Manually add user preferences")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ")
    
    if choice == '1':
        show_database_state()
    elif choice == '2':
        manually_add_user_preferences()
        # Show the updated state
        print("\nUpdated database state:")
        show_database_state()
    else:
        print("Exiting...")
        return
    
    print("\nDone!")

if __name__ == "__main__":
    main()