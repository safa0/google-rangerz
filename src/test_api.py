#!/usr/bin/env python3
import argparse
import requests
import json
import base64
from PIL import Image
import io
import os

def save_image(base64_string, output_path):
    """Save a base64 encoded image to a file"""
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    image.save(output_path)
    print(f"Image saved to {output_path}")

def generate_image(args):
    """Call the generate_image endpoint"""
    url = f"{args.base_url}/generate_image"
    payload = {"description": args.description}
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        if args.output:
            save_image(data["image_base64"], args.output)
        else:
            print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def initialize_story(args):
    """Call the initialize_story endpoint"""
    url = f"{args.base_url}/initialize_story"
    payload = {
        "name": args.name,
        "age": args.age,
        "skill_level": args.skill_level,
        "interests": args.interests.split(","),
        "model": args.model
    }
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Response saved to {args.output}")
        else:
            print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def continue_story(args):
    """Call the continue_story endpoint"""
    url = f"{args.base_url}/continue_story"
    payload = {
        "name": args.name,
        "age": args.age,
        "skill_level": args.skill_level,
        "interests": args.interests.split(","),
        "comfortable_words": args.comfortable_words.split(","),
        "struggling_words": args.struggling_words.split(","),
        "big_picture": args.big_picture,
        "summary_of_previous_story": args.summary,
        "latest_choice": args.choice,
        "exercise_type": args.exercise_type,
        "progression": args.progression,
        "total_steps": args.total_steps,
        "model": args.model
    }
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Response saved to {args.output}")
        else:
            print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def generate_text(args):
    """Call the generate_text endpoint"""
    url = f"{args.base_url}/generate_text"
    payload = {
        "prompt": args.prompt,
        "model": args.model
    }
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Response saved to {args.output}")
        else:
            print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def check_api(args):
    """Check if the API is running"""
    url = f"{args.base_url}/"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("API is running!")
            print(response.json())
        else:
            print(f"API returned status code: {response.status_code}")
            print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {e}")

def main():
    parser = argparse.ArgumentParser(description="Test the Rangerz API endpoints")
    parser.add_argument("--base-url", default="https://rangerz-backend-331294271019.europe-north2.run.app/", 
                        help="Base URL for the API (default: http://localhost:8080)")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Check API parser
    check_parser = subparsers.add_parser("check", help="Check if the API is running")
    check_parser.set_defaults(func=check_api)
    
    # Generate Image parser
    image_parser = subparsers.add_parser("image", help="Generate an image")
    image_parser.add_argument("--description", required=True, 
                             help="Description for the image to generate")
    image_parser.add_argument("--output", help="Output file path for the image")
    image_parser.set_defaults(func=generate_image)
    
    # Initialize Story parser
    init_parser = subparsers.add_parser("init-story", help="Initialize a story")
    init_parser.add_argument("--name", default="Alex", help="User's name")
    init_parser.add_argument("--age", default=10, type=int, help="User's age")
    init_parser.add_argument("--skill-level", default="beginner", 
                            choices=["beginner", "intermediate", "advanced"],
                            help="User's skill level")
    init_parser.add_argument("--interests", default="animals,adventure,space", 
                            help="Comma-separated list of interests")
    init_parser.add_argument("--model", default="gemini-2.0-flash-lite-001", 
                            help="Model to use for generation")
    init_parser.add_argument("--output", help="Output file path for the response")
    init_parser.set_defaults(func=initialize_story)
    
    # Continue Story parser
    cont_parser = subparsers.add_parser("continue-story", help="Continue a story")
    cont_parser.add_argument("--name", default="Alex", help="User's name")
    cont_parser.add_argument("--age", default=10, type=int, help="User's age")
    cont_parser.add_argument("--skill-level", default="beginner", 
                            choices=["beginner", "intermediate", "advanced"],
                            help="User's skill level")
    cont_parser.add_argument("--interests", default="animals,adventure,space", 
                            help="Comma-separated list of interests")
    cont_parser.add_argument("--comfortable-words", default="hej,tack,ja,nej", 
                            help="Comma-separated list of comfortable words")
    cont_parser.add_argument("--struggling-words", default="", 
                            help="Comma-separated list of struggling words")
    cont_parser.add_argument("--big-picture", default="Learning basic Swedish greetings", 
                            help="Big picture of the learning journey")
    cont_parser.add_argument("--summary", default="Alex met a friendly Swedish owl who started teaching basic greetings", 
                            help="Summary of the previous story")
    cont_parser.add_argument("--choice", default="Learn more greetings", 
                            help="Latest choice made by the user")
    cont_parser.add_argument("--exercise-type", default="multiple_choice", 
                            choices=["multiple_choice", "fill_in_blank", "matching"],
                            help="Type of exercise")
    cont_parser.add_argument("--progression", default=1, type=int, 
                            help="Current progression step")
    cont_parser.add_argument("--total-steps", default=5, type=int, 
                            help="Total number of steps")
    cont_parser.add_argument("--model", default="gemini-2.0-flash-lite-001", 
                            help="Model to use for generation")
    cont_parser.add_argument("--output", help="Output file path for the response")
    cont_parser.set_defaults(func=continue_story)
    
    # Generate Text parser
    text_parser = subparsers.add_parser("text", help="Generate text")
    text_parser.add_argument("--prompt", required=True, 
                            help="Prompt for text generation")
    text_parser.add_argument("--model", default="gemini-2.0-flash-lite-001", 
                            help="Model to use for generation")
    text_parser.add_argument("--output", help="Output file path for the response")
    text_parser.set_defaults(func=generate_text)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    args.func(args)

if __name__ == "__main__":
    main() 