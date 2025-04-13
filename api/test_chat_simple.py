#!/usr/bin/env python3
import requests
import json
import argparse
from typing import Dict, List, Optional, Any

# Configuration
API_URL = "http://localhost:8080"

# ANSI colors for prettier output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    GRAY = '\033[90m'

def print_colored(text: str, color: str, bold: bool = False) -> None:
    """Print text with color"""
    if bold:
        print(f"{color}{Colors.BOLD}{text}{Colors.ENDC}")
    else:
        print(f"{color}{text}{Colors.ENDC}")

def test_health_endpoint() -> bool:
    """Test the health endpoint"""
    try:
        response = requests.get(f"{API_URL}/api/health")
        print_colored(f"Health check status code: {response.status_code}", Colors.CYAN)
        print_colored(f"Response: {json.dumps(response.json(), indent=2)}", Colors.CYAN)
        return response.status_code == 200
    except Exception as e:
        print_colored(f"Error connecting to health endpoint: {str(e)}", Colors.RED)
        return False

def generate_initial_roadmap(description: str) -> Dict[str, Any]:
    """Generate a roadmap using the API and show the prompt"""
    try:
        data = {"description": description}
        
        print_colored(f"Generating roadmap for: {description}", Colors.YELLOW)
        
        # For debugging - we can't see the actual LLM prompt, but we can show what we know
        print_colored("\nAPI Request:", Colors.CYAN, bold=True)
        print_colored(json.dumps(data, indent=2), Colors.CYAN)
        print_colored("\nLLM Prompt Structure:", Colors.CYAN, bold=True)
        print_colored("System: 'You are a helpful assistant that generates business roadmap topics.'", Colors.CYAN)
        prompt_preview = f"""
Based on the following business description, suggest between 2 and 6 relevant topics for each category (Market, Product, Technology) for a business roadmap.
Make sure that the topics are short clear descriptions, not more than 6 words.
Make sure that the topics are not generic, but specific to the business description.
Business description: {description}

Provide your response as structured JSON...
"""
        print_colored(f"User: {prompt_preview}", Colors.CYAN)
        
        # Send request to the API
        response = requests.post(
            f"{API_URL}/api/generate-roadmap",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Print roadmap details
            print_colored("\nRoadmap generated successfully:", Colors.GREEN, bold=True)
            print_colored(f"\nVISION: {result.get('vision', 'No vision provided')}", Colors.YELLOW, bold=True)
            print_colored("\nMARKET:", Colors.BLUE, bold=True)
            for item in result.get('market', []):
                print(f"  • {item}")
                
            print_colored("\nPRODUCT:", Colors.GREEN, bold=True)
            for item in result.get('product', []):
                print(f"  • {item}")
                
            print_colored("\nTECH:", Colors.CYAN, bold=True)
            for item in result.get('tech', []):
                print(f"  • {item}")
                
            print_colored(f"\nSession ID: {result.get('session_id')}", Colors.GRAY)
                
            return result
        else:
            print_colored(f"Error generating roadmap: {response.text}", Colors.RED)
            return {}
            
    except Exception as e:
        print_colored(f"Error generating roadmap: {str(e)}", Colors.RED)
        return {}

def get_session_messages(session_id: str) -> List[Dict[str, str]]:
    """Get all messages in a session directly from server memory (for debugging)"""
    try:
        response = requests.get(f"{API_URL}/api/debug/{session_id}")
        
        if response.status_code == 200:
            debug_data = response.json()
            
            # Display full debug info
            print_colored("\nFull LLM Context from API:", Colors.YELLOW, bold=True)
            print_colored("Messages sent to LLM:", Colors.YELLOW)
            
            # Print message history in a readable format
            for idx, msg in enumerate(debug_data.get("messages", [])):
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                print_colored(f"\n[{idx}] {role.upper()}:", Colors.CYAN, bold=True)
                print_colored(content, Colors.WHITE)
                
            return debug_data.get("messages", [])
        else:
            print_colored(f"Error fetching debug data: {response.text}", Colors.RED)
            return []
    except Exception as e:
        print_colored(f"Error getting session messages: {str(e)}", Colors.RED)
        return []

def chat_with_roadmap(message: str, session_id: Optional[str] = None, roadmap_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Send a message to the chat API and show the full prompt"""
    try:
        # Prepare request data
        data = {
            "message": message,
            "session_id": session_id
        }
        
        # Include roadmap data for new sessions
        if roadmap_data:
            data["roadmap_data"] = roadmap_data
        
        # Display what's being sent to the API
        print_colored("\nSending to API:", Colors.CYAN, bold=True)
        print_colored(json.dumps(data, indent=2), Colors.CYAN)
        
        # If we have access to session messages, show the full context the LLM will see
        if session_id:
            # Peek into the server-side state (requires adding a debug endpoint to your API)
            messages = get_session_messages(session_id)
            if messages:
                print_colored("\nLLM Conversation Context:", Colors.YELLOW, bold=True)
                for msg in messages:
                    role = msg.get("role", "unknown")
                    content_preview = msg.get("content", "")
                    if len(content_preview) > 100:
                        content_preview = content_preview[:100] + "..."
                    print_colored(f"{role.upper()}: {content_preview}", Colors.YELLOW)
        
        # Send the request
        response = requests.post(
            f"{API_URL}/api/chat",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            print_colored("\nAPI Response:", Colors.GREEN, bold=True)
            print_colored(json.dumps(result, indent=2), Colors.GREEN)
            return result
        else:
            print_colored(f"Error from chat API: {response.text}", Colors.RED)
            return {}
            
    except Exception as e:
        print_colored(f"Error sending chat message: {str(e)}", Colors.RED)
        return {}

def interactive_session():
    """Run an interactive chat session without saving state"""
    print_colored("Starting new session", Colors.GREEN)
    
    # Get business description for new roadmap
    description = input(f"{Colors.GREEN}Enter business description: {Colors.ENDC}")
    
    # Generate roadmap
    roadmap = generate_initial_roadmap(description)
    
    if not roadmap:
        print_colored("Failed to generate roadmap. Exiting.", Colors.RED)
        return
        
    # Save session ID
    session_id = roadmap.get("session_id")
    
    print_colored(f"\nSession started with ID: {session_id}", Colors.GREEN)
    print_colored("You can now chat with your roadmap. Type 'exit' to quit.", Colors.GREEN)
    
    # Interactive chat loop
    while True:
        try:
            # Get user input
            user_input = input(f"\n{Colors.GREEN}You: {Colors.ENDC}")
            
            # Exit command
            if user_input.lower() in ["exit", "quit", "q"]:
                print_colored("Exiting chat session", Colors.YELLOW)
                break
            
            # Send to chat API
            chat_response = chat_with_roadmap(user_input, session_id)
            
            if chat_response:
                # Display AI response
                ai_message = chat_response.get("response", "")
                print_colored(f"\nAI: {ai_message}", Colors.BLUE)
            else:
                print_colored("Failed to get response from chat API", Colors.RED)
                
        except KeyboardInterrupt:
            print_colored("\nExiting chat session", Colors.YELLOW)
            break
        except Exception as e:
            print_colored(f"Error: {str(e)}", Colors.RED)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple test for the Roadmap Chat API")
    parser.add_argument(
        "--api-url", 
        default="http://localhost:8080",
        help="API URL (default: http://localhost:8080)"
    )
    args = parser.parse_args()
    
    # Update API URL if provided
    API_URL = args.api_url
    
    print_colored("=== Roadmap Chat API Simple Test Tool ===", Colors.CYAN, bold=True)
    print_colored(f"API URL: {API_URL}", Colors.GRAY)
    
    # Test health endpoint
    if test_health_endpoint():
        print_colored("API is healthy", Colors.GREEN)
        print_colored("This script will show the full prompts sent to the LLM using the debug endpoint", Colors.GREEN)
        
        # Start interactive session
        interactive_session()
    else:
        print_colored("API health check failed. Make sure the API is running.", Colors.RED)