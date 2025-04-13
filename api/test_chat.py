#!/usr/bin/env python3
import requests
import json
import os
import argparse
from typing import Dict, List, Optional, Any

# Configuration
API_URL = "http://localhost:8080"
SAVE_FILE = "chat_session.json"

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

def save_session(session_data: Dict[str, Any]) -> None:
    """Save session data to a file"""
    with open(SAVE_FILE, 'w') as f:
        json.dump(session_data, f, indent=2)
    print_colored(f"Session saved to {SAVE_FILE}", Colors.GRAY)

def load_session() -> Dict[str, Any]:
    """Load session data from a file"""
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r') as f:
            return json.load(f)
    return {"session_id": None, "roadmap": None, "messages": []}

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
    """Generate a roadmap using the API"""
    try:
        data = {"description": description}
        
        print_colored(f"Generating roadmap for: {description}", Colors.YELLOW)
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

def chat_with_roadmap(message: str, session_id: Optional[str] = None, roadmap_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Send a message to the chat API"""
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
        print_colored("\nSending to API:", Colors.GRAY)
        debug_data = data.copy()
        if "roadmap_data" in debug_data:
            debug_data["roadmap_data"] = "... roadmap data included ..."
        print_colored(json.dumps(debug_data, indent=2), Colors.GRAY)
        
        # Send the request
        response = requests.post(
            f"{API_URL}/api/chat",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            return result
        else:
            print_colored(f"Error from chat API: {response.text}", Colors.RED)
            return {}
            
    except Exception as e:
        print_colored(f"Error sending chat message: {str(e)}", Colors.RED)
        return {}

def display_chat_history(messages: List[Dict[str, str]]) -> None:
    """Display the conversation history in a readable format"""
    print_colored("\n=== Chat History ===", Colors.CYAN, bold=True)
    for idx, msg in enumerate(messages):
        if msg["role"] == "user":
            print_colored(f"\nYOU: {msg['content']}", Colors.GREEN)
        elif msg["role"] == "assistant":
            print_colored(f"\nAI: {msg['content']}", Colors.BLUE)
        elif msg["role"] == "system":
            if idx == 0:  # Only show system prompt for the first message
                print_colored(f"\nSYSTEM PROMPT: {msg['content']}", Colors.GRAY)
    print_colored("\n==================", Colors.CYAN, bold=True)

def clear_session(session_id: str) -> bool:
    """Clear a chat session on the server"""
    try:
        response = requests.post(
            f"{API_URL}/api/clear-session",
            json={"session_id": session_id}
        )
        
        if response.status_code == 200:
            print_colored("Session cleared successfully", Colors.GREEN)
            return True
        else:
            print_colored(f"Error clearing session: {response.text}", Colors.RED)
            return False
            
    except Exception as e:
        print_colored(f"Error clearing session: {str(e)}", Colors.RED)
        return False

def interactive_session():
    """Run an interactive chat session"""
    # Load existing session if available
    session_data = load_session()
    session_id = session_data.get("session_id")
    roadmap = session_data.get("roadmap")
    messages = session_data.get("messages", [])
    
    # Check if we have an existing session
    if session_id:
        print_colored(f"Resuming existing session: {session_id}", Colors.GREEN)
        if messages:
            display_chat_history(messages)
    else:
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
        
        # Add first user message to history
        messages = [{"role": "user", "content": description}]
        
        # Add AI response about roadmap
        vision = roadmap.get("vision", "")
        ai_message = f"Here is your roadmap based on your business description.\n\nVision: {vision}"
        messages.append({"role": "assistant", "content": ai_message})
        
        # Save session
        session_data = {
            "session_id": session_id,
            "roadmap": roadmap,
            "messages": messages
        }
        save_session(session_data)
    
    # Interactive chat loop
    while True:
        try:
            # Get user input
            user_input = input(f"\n{Colors.GREEN}You: {Colors.ENDC}")
            
            # Exit command
            if user_input.lower() in ["exit", "quit", "q"]:
                print_colored("Exiting chat session", Colors.YELLOW)
                break
                
            # Clear session command
            if user_input.lower() in ["clear", "reset"]:
                if session_id:
                    if clear_session(session_id):
                        # Reset local session
                        session_id = None
                        roadmap = None
                        messages = []
                        session_data = {"session_id": None, "roadmap": None, "messages": []}
                        save_session(session_data)
                        print_colored("Session reset. Starting new session.", Colors.YELLOW)
                        
                        # Get business description for new roadmap
                        description = input(f"{Colors.GREEN}Enter business description: {Colors.ENDC}")
                        
                        # Generate roadmap
                        roadmap = generate_initial_roadmap(description)
                        
                        if not roadmap:
                            print_colored("Failed to generate roadmap. Exiting.", Colors.RED)
                            return
                            
                        # Save session ID
                        session_id = roadmap.get("session_id")
                        
                        # Add first user message to history
                        messages = [{"role": "user", "content": description}]
                        
                        # Add AI response about roadmap
                        vision = roadmap.get("vision", "")
                        ai_message = f"Here is your roadmap based on your business description.\n\nVision: {vision}"
                        messages.append({"role": "assistant", "content": ai_message})
                        
                        # Save session
                        session_data = {
                            "session_id": session_id,
                            "roadmap": roadmap,
                            "messages": messages
                        }
                        save_session(session_data)
                continue
                
            # Debug command
            if user_input.lower() in ["debug", "history"]:
                # Get session from server
                chat_response = chat_with_roadmap("Show me the debug information for this conversation", session_id)
                
                # Display chat history
                print_colored("\n--- DEBUG INFO ---", Colors.CYAN, bold=True)
                print_colored(f"Session ID: {session_id}", Colors.GRAY)
                print_colored(f"Local message count: {len(messages)}", Colors.GRAY)
                display_chat_history(messages)
                print_colored("-------------------", Colors.CYAN, bold=True)
                continue
            
            # Add user message to history
            messages.append({"role": "user", "content": user_input})
            
            # Send to chat API
            chat_response = chat_with_roadmap(user_input, session_id, None if session_id else roadmap)
            
            if chat_response:
                # Display AI response
                ai_message = chat_response.get("response", "")
                print_colored(f"\nAI: {ai_message}", Colors.BLUE)
                
                # Add AI response to history
                messages.append({"role": "assistant", "content": ai_message})
                
                # Update session ID if it's new
                if not session_id and "session_id" in chat_response:
                    session_id = chat_response["session_id"]
                    print_colored(f"New session ID: {session_id}", Colors.GRAY)
                
                # Save updated session
                session_data = {
                    "session_id": session_id,
                    "roadmap": roadmap,
                    "messages": messages
                }
                save_session(session_data)
            else:
                print_colored("Failed to get response from chat API", Colors.RED)
                
        except KeyboardInterrupt:
            print_colored("\nExiting chat session", Colors.YELLOW)
            break
        except Exception as e:
            print_colored(f"Error: {str(e)}", Colors.RED)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the Roadmap Chat API")
    parser.add_argument(
        "--api-url", 
        default="http://localhost:8080",
        help="API URL (default: http://localhost:8080)"
    )
    args = parser.parse_args()
    
    # Update API URL if provided
    API_URL = args.api_url
    
    print_colored("=== Roadmap Chat API Test Tool ===", Colors.CYAN, bold=True)
    print_colored(f"API URL: {API_URL}", Colors.GRAY)
    
    # Test health endpoint
    if test_health_endpoint():
        print_colored("API is healthy, starting interactive session", Colors.GREEN)
        interactive_session()
    else:
        print_colored("API health check failed. Make sure the API is running.", Colors.RED)