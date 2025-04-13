import os
import json
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active roadmaps (in a production app, this would be a database)
roadmap_sessions = {}

# Define request models for chat
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    roadmap_data: Optional[Dict] = None

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/generate-roadmap")
async def generate_roadmap(request: Request):
    """Generate roadmap topics based on business description"""
    try:
        # Get request body
        data = await request.json()
        business_description = data.get("description", "")
        
        if not business_description:
            return {"error": "Business description is required"}, 400
        
        print(f"Generating roadmap for: {business_description[:50]}...")
        
        # Create the OpenAI prompt for roadmap topics
        prompt = f"""
Based on the following business description, suggest between 2 and 6 relevant topics for each category (Market, Product, Technology) for a business roadmap. Make sure the topics are relevant to the business description. you dont have to necessarilly use all 6 topics, just the ones that are most relevant to the business description.
Make sure that the topics are short clear descriptions, not more than 6 words.
Make sure that the topics are not generic, but specific to the business description.
Business description: {business_description}

Provide your response as structured JSON exactly matching this format:
{{
  "market": ["Topic 1", "Topic 2", ...],
  "product": ["Topic 1", "Topic 2", ...],
  "tech": ["Topic 1", "Topic 2", ...]
}}

Choose the most appropriate topics based on the business description. Each category should have between 3-6 items.
"""
        
        # Call OpenAI for roadmap topics
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates business roadmap topics."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        print(f"OpenAI roadmap response: {content[:100]}...")
        
        roadmap_data = json.loads(content)
        
        # Ensure response has expected structure
        if not all(key in roadmap_data for key in ['market', 'product', 'tech']):
            roadmap_data = {
                "market": roadmap_data.get('market', []),
                "product": roadmap_data.get('product', []),
                "tech": roadmap_data.get('tech', [])
            }
        
        # Now generate a business vision based on the roadmap
        vision_prompt = f"""
I've created a business roadmap with the following topics:

Market: {', '.join(roadmap_data['market'])}
Product: {', '.join(roadmap_data['product'])}
Technology: {', '.join(roadmap_data['tech'])}

Based on this roadmap and the business description: "{business_description}"

Create a very concise, inspiring vision statement (just one sentence) that captures the essence of the business's future direction.
"""
        
        # Call OpenAI for vision generation
        vision_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a strategic business consultant who creates compelling visions based on roadmap elements."},
                {"role": "user", "content": vision_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Parse the vision response
        vision_content = vision_response.choices[0].message.content
        print(f"OpenAI vision response: {vision_content[:100]}...")
        
        # Add vision to the roadmap data
        roadmap_data["vision"] = vision_content
        
        # Create a session for this roadmap
        session_id = str(uuid.uuid4())
        roadmap_sessions[session_id] = {
            "roadmap": roadmap_data,
            "messages": [
                {"role": "system", "content": create_system_prompt(roadmap_data)}
            ]
        }
        
        # Return roadmap data with session ID
        roadmap_data["session_id"] = session_id
        
        return roadmap_data
    
    except Exception as e:
        print(f"Error generating roadmap: {str(e)}")
        return {"error": str(e)}, 500

def create_system_prompt(roadmap_data):
    """Create a system prompt based on the roadmap data"""
    market_items = ", ".join(roadmap_data.get("market", []))
    product_items = ", ".join(roadmap_data.get("product", []))
    tech_items = ", ".join(roadmap_data.get("tech", []))
    vision = roadmap_data.get("vision", "No vision provided")
    
    return f"""You are a helpful business strategy assistant that helps users understand their business roadmap.

The user's roadmap contains the following information:

VISION: {vision}

MARKET: {market_items}

PRODUCT: {product_items}

TECHNOLOGY: {tech_items}

When answering questions:
1. Reference specific elements of their roadmap when relevant
2. Provide practical advice about implementing the roadmap
3. Suggest potential strategies that align with their roadmap items
4. Be concise but thorough in your explanations
5. If asked about topics not in the roadmap, suggest how they might fit in
6. Maintain a professional, constructive, and encouraging tone
7. You can make reasonable assumptions about the business based on the roadmap content

Your goal is to help the user better understand and implement their roadmap strategy.
"""

@app.post("/api/chat")
async def chat_with_roadmap(request: ChatRequest):
    """Chat about a roadmap"""
    try:
        session_id = request.session_id
        user_message = request.message
        
        # If no session_id provided, create a new one
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # If this is a new session with roadmap data, store it
        if request.roadmap_data and session_id not in roadmap_sessions:
            roadmap_sessions[session_id] = {
                "roadmap": request.roadmap_data,
                "messages": [
                    {"role": "system", "content": create_system_prompt(request.roadmap_data)}
                ]
            }
        
        # If session doesn't exist, return error
        if session_id not in roadmap_sessions:
            raise HTTPException(status_code=404, detail="Session not found. Please provide roadmap data to start a new chat.")
        
        # Add the user message to the conversation history
        roadmap_sessions[session_id]["messages"].append(
            {"role": "user", "content": user_message}
        )
        
        # Get conversation history for this session
        messages = roadmap_sessions[session_id]["messages"]
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract response content
        ai_message = response.choices[0].message.content
        
        # Add the assistant response to the conversation history
        roadmap_sessions[session_id]["messages"].append(
            {"role": "assistant", "content": ai_message}
        )
        
        # Keep the conversation history to a reasonable size (last 20 messages)
        if len(roadmap_sessions[session_id]["messages"]) > 20:
            # Always keep the system message
            system_message = roadmap_sessions[session_id]["messages"][0]
            roadmap_sessions[session_id]["messages"] = [system_message] + roadmap_sessions[session_id]["messages"][-19:]
        
        return {
            "response": ai_message,
            "session_id": session_id
        }
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clear-session")
async def clear_session(request: Request):
    """Clear a chat session"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        
        if session_id in roadmap_sessions:
            del roadmap_sessions[session_id]
            return {"status": "success", "message": f"Session {session_id} cleared"}
        else:
            return {"status": "not_found", "message": f"Session {session_id} not found"}
    
    except Exception as e:
        print(f"Error clearing session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/debug/{session_id}")
async def debug_session(session_id: str):
    """Get debug information for a session - ONLY FOR DEVELOPMENT"""
    if session_id not in roadmap_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": roadmap_sessions[session_id]["messages"],
        "roadmap": roadmap_sessions[session_id]["roadmap"]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting server on port {port}")
    uvicorn.run("roadmap_generator:app", host="0.0.0.0", port=port, reload=True)