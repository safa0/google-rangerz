import json
import sqlite3
import random as rd
import subprocess
import re
import base64
from PIL import Image
import io

# Connect to an in-memory database
conn = sqlite3.connect("users.db")
cursor = conn.cursor()

# Starting the story
prog = 1
num_chaps = 5
choice = ""
summary = ""

# Base directory
base_dir = "./"

# Get story descriptions from init_story endpoint
# story_descriptions = []
# story_titles = []

# base JSON for story generation
init_json = {
    "name": "John Singer",
    "age": 12,
    "skill_level": "beginner",
    "interests": ["magic", "adventures", "fantasy", "mystery", "horror"]
}

curl_command = [
    "curl", "-X", "POST",
    "https://rangerz-backend-331294271019.europe-north2.run.app/initialize_story",
    "-H", "Content-Type: application/json", "-d", json.dumps(init_json)
]

result = subprocess.run(curl_command, capture_output=True, text=True)
try:
    response_data = json.loads(result.stdout)
except json.JSONDecodeError:
    print("Init Story Response is not in JSON format:")
    print(result.stdout)

init_raw_text = response_data['candidates'][0]['content']['parts'][0]['text']


# parse titles
titles = re.findall(r'<title>(.*?)</title>', init_raw_text, re.DOTALL)
# print(titles)

#strip titles
titles = [title.strip() for title in titles]

# parse descriptions
descriptions = re.findall(r'<txt>(.*?)</txt>', init_raw_text, re.DOTALL)
# print(descriptions)

#strip descriptions
descriptions = [desc.strip() for desc in descriptions]


# exit()



# Insert multiple stories
for story_index in range(3):
    user_id = f"user_{123 + story_index}"
    story_title = titles[story_index]
    story_status = "ongoing"
    thumbnail_path = f"/images/story_{story_index + 1}_thumbnail.png"
    big_picture = descriptions[story_index]

    cursor.execute("""
    INSERT INTO stories (user_id, title, status, thumbnail, story_info)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, story_title, story_status, thumbnail_path, big_picture))

    # Get the inserted story's ID
    story_id = cursor.lastrowid

    # Generate chapters for each story
    for i in range(num_chaps):
        print(f"Generating Chapter {i+1} for Story {story_index + 1}...")

        exe_typ = rd.choice(["fill_in_blanks", "comprehension_text"])

        init_json = {
            "name": "John Singer",
            "age": 12,
            "skill_level": "beginner",
            "interests": ["magic", "adventures", "fantasy", "mystery", "horror"],
            "comfortable_words": ["trollkarl", "slott", "äventyr"],
            "struggling_words": ["skola", "arbete", "resa"],
            "big_picture": big_picture,
            "summary_of_previous_story": summary,
            "latest_choice": choice,
            "exercise_type": exe_typ,
            "progression": prog,
            "total_steps": num_chaps
        }

        # Dump JSON for later reference
        with open(f"{base_dir}/{story_id}_chapter_{i+1}_gen.json", "w") as f:
            f.write(json.dumps(init_json))

        curl_command = [
            "curl", "-X", "POST",
            "https://rangerz-backend-331294271019.europe-north2.run.app/continue_story",
            "-H", "Content-Type: application/json",
            "-d", json.dumps(init_json)
        ]

        # Run the command and capture the output
        result = subprocess.run(curl_command, capture_output=True, text=True)

        # Try parsing JSON output
        try:
            response_data = json.loads(result.stdout)
        except json.JSONDecodeError:
            print("Text Response is not in JSON format:")
            print(result.stdout)

        # Parse to get image data
        raw_text = response_data['candidates'][0]['content']['parts'][0]['text']

        # Parse the text prompt
        txt_prompt = re.search(r'<txt>(.*?)</txt>', raw_text, re.DOTALL).group(1).strip()

        # Add to summary
        summary += txt_prompt + "\n"

        # Parse the options
        options = re.search(r'<opt>(.*?)</opt>', raw_text, re.DOTALL).group(1).strip()

        # Extract the options as a list
        options = re.findall(r'\[(.*?)\]', options)

        # Choose a random option
        choice = rd.choice(options)

        # Dump raw text
        with open(f"{base_dir}/{story_id}_chapter_{i+1}.txt", "w") as f:
            f.write(raw_text)
        # Instead of writing to file, dump to database

        img_prompt = re.search(r'<img>(.*?)</img>', raw_text, re.DOTALL).group(1).strip()

        # Send image generation API
        payload = json.dumps({
            "description": img_prompt
        })

        # Define the curl command
        curl_command = [
            "curl", "-X", "POST",
            "https://rangerz-backend-331294271019.europe-north2.run.app/generate_image",
            "-H", "Content-Type: application/json",
            "-d", payload
        ]

        # Run the command and capture the output
        img_result = subprocess.run(curl_command, capture_output=True, text=True)

        # Try parsing JSON output
        try:
            img_response_data = json.loads(img_result.stdout)
        except json.JSONDecodeError:
            print("Image Response is not in JSON format:")
            print(img_result.stdout)

        # Decode the image data
        decoded_image = base64.b64decode(img_response_data['image_base64'])

        # Save the image
        img = Image.open(io.BytesIO(decoded_image))
        img.save(f"./public/images/{story_id}_chapter_" + str(i+1) + ".png")

        # Insert chapter into database
        cursor.execute("""
        INSERT INTO chapters (story_id, chapter_number, metadata, raw_text, image, exe_result)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (story_id, i+1, json.dumps(init_json), raw_text.strip(), f"/images/{story_id}_chapter_{i+1}.png", "Correctly matched 3 out of 4 words."))

# Commit and display inserted data
conn.commit()
