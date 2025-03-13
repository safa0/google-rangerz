import sqlite3

# Setup and migrate database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                name TEXT,
                picture TEXT,
                is_new_user BOOLEAN DEFAULT 1,
                onboarding_completed BOOLEAN DEFAULT 0,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
            user_id TEXT PRIMARY KEY,
            interests TEXT,
            age INTEGER,
            skill_level TEXT,
            character TEXT,
            comfortable_words TEXT,
            struggling_words TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        thumbnail TEXT,
        story_info TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        story_id INTEGER NOT NULL,
        chapter_number INTEGER NOT NULL,
        metadata TEXT,
        raw_text TEXT,
        image TEXT,
        exe_result TEXT,
        FOREIGN KEY (story_id) REFERENCES stories(id)
    );
    """
    )
    
    conn.commit()
    conn.close()
    print("Database initialization and migration completed.")
