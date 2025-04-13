import { RoadmapContent, ChatResponse } from '../types';

// Get API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Calls the Python backend API to generate roadmap topics
 * based on the business description
 */
export async function generateRoadmapTopics(businessDescription: string): Promise<RoadmapContent> {
  try {
    console.log('Calling API with description:', businessDescription);
    
    const response = await fetch(`${API_URL}/api/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: businessDescription }),
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to generate roadmap topics: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error calling roadmap API:', error);
    throw error;
  }
}

/**
 * Sends a message to the chat API to get a response about the roadmap
 */
export async function chatWithRoadmap(
  message: string, 
  sessionId?: string, 
  roadmapData?: RoadmapContent
): Promise<ChatResponse> {
  try {
    console.log('Calling chat API with:', { message, sessionId, roadmapData: roadmapData ? 'provided' : 'not provided' });
    
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        session_id: sessionId,
        roadmap_data: roadmapData 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error response:', errorText);
      throw new Error(`Failed to chat with roadmap: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Chat API response data:', data);
    return data;
  } catch (error) {
    console.error('Error calling chat API:', error);
    throw error;
  }
}