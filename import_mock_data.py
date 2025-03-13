import json
import sqlite3
import random

# Connect to an in-memory database
conn = sqlite3.connect("users.db")
cursor = conn.cursor()


# Mock data generation
user_id = "user_123"
story_title = "Maja's Temple Adventure"
story_status = "ongoing"
thumbnail_path = "/images/maja_thumbnail.png"
story_info = "A thrilling adventure of Maja exploring an ancient temple filled with mysteries and challenges."

# Insert a single story
cursor.execute("""
INSERT INTO stories (user_id, title, status, thumbnail, story_info)
VALUES (?, ?, ?, ?, ?)
""", (user_id, story_title, story_status, thumbnail_path, story_info))

# Get the inserted story's ID
story_id = cursor.lastrowid

# Generate 4 chapters
for i in range(1, 5):
    metadata = {
        "name": "Maja",
        "age": 10,
        "skill_level": "intermediate",
        "interests": ["adventure", "mystery"],
        "comfortable_words": ["templet", "mossiga", "vinstockar"],
        "struggling_words": ["spänning", "förväntan", "bruset"],
        "big_picture": "Maja's adventure in the ancient temple",
        "summary_of_previous_story": f"In the previous chapter, Maja reached checkpoint {i-1} in the temple.",
        "latest_choice": "Explore further" if i % 2 == 0 else "Solve the puzzle",
        "exercise_type": "comprehension_text",
        "progression": i,
        "total_steps": 5,
        "model": "gemini-2.0-flash-lite-001",
        "generate_image": True
    }

    raw_text = f"""
    <img>
    A young girl, Maja, with curly blonde hair, wearing a red adventure jacket, stands in a dimly lit ancient temple. 
    She holds a flickering torch, casting shadows on the moss-covered walls with ancient engravings. 
    The air is thick with mystery, and in front of her, an old stone pedestal holds a golden artifact.
    </img>
    <txt>
    Maja tog ett steg närmare [templet](temple) och lät sitt ljus skina på de gamla [runorna](runes). 
    En svag vind svepte genom hallen, och hon kunde känna [spänningen](excitement) i luften. 
    Framför henne fanns en [mystisk dörr](mysterious door) med en inristad symbol.
    Vad skulle hon göra härnäst?
    </txt>
    <opt>
    Vad ska Maja göra? [Undersök symbolen] [Försök öppna dörren] [Leta efter en ledtråd]
    </opt>
    <exe>
    Para ihop orden med deras betydelser:
    [runor](runes) [mystisk](mysterious) [spänning](excitement) [dörr](door)
    </exe>
    """

    image_path = f"/images/chapter_{i}.png"
    exe_result = "Correctly matched 3 out of 4 words."

    cursor.execute("""
    INSERT INTO chapters (story_id, chapter_number, metadata, raw_text, image, exe_result)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (story_id, i, json.dumps(metadata), raw_text.strip(), image_path, exe_result))

# Commit and display inserted data
conn.commit()
