import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Xarrow from 'react-xarrows';
import { generateRoadmapTopics, chatWithRoadmap } from '../services/api';

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [messages, setMessages] = useState<{type: 'user' | 'ai', content: string}[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [roadmapContent, setRoadmapContent] = useState<{
    market: string[],
    product: string[],
    tech: string[],
    vision?: string
  }>({
    market: [],
    product: [],
    tech: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Focus input field when component mounts or showRoadmap changes
    inputRef.current?.focus();
  }, [showRoadmap]);
  
  // Check localStorage for existing session
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedSessionId = localStorage.getItem('roadmapSessionId');
      const savedRoadmap = localStorage.getItem('roadmapContent');
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
      
      if (savedRoadmap) {
        try {
          const parsedRoadmap = JSON.parse(savedRoadmap);
          setRoadmapContent(parsedRoadmap);
          
          // If we have a saved roadmap, show it
          if (parsedRoadmap.market?.length > 0) {
            setShowRoadmap(true);
          }
        } catch (error) {
          console.error('Error parsing saved roadmap:', error);
        }
      }
    }
  }, []);
  
  // Save session ID and roadmap to localStorage when they change
  useEffect(() => {
    if (sessionId && typeof window !== 'undefined') {
      localStorage.setItem('roadmapSessionId', sessionId);
    }
  }, [sessionId]);
  
  useEffect(() => {
    if (roadmapContent.market.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('roadmapContent', JSON.stringify(roadmapContent));
    }
  }, [roadmapContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const clearSession = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('roadmapSessionId');
      localStorage.removeItem('roadmapContent');
    }
    
    // Reset state
    setSessionId(undefined);
    setRoadmapContent({
      market: [],
      product: [],
      tech: []
    });
    setMessages([]);
    setShowRoadmap(false);
    
    // Clear session on server if we have a session ID
    if (sessionId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/clear-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(error => {
        console.error('Error clearing session:', error);
      });
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    // Add user message immediately
    const newMessages = [
      ...messages,
      {type: 'user' as const, content: inputText}
    ];
    setMessages(newMessages);
    
    // If roadmap is not shown yet, generate it
    if (!showRoadmap) {
      try {
        // Add loading message
        setMessages([
          ...newMessages,
          {type: 'ai' as const, content: 'Generating your roadmap...'}
        ]);
        
        // Call the API to generate roadmap topics
        const roadmapData = await generateRoadmapTopics(inputText);
        
        // Update roadmap content with API response
        setRoadmapContent(roadmapData);
        
        // Save session ID if provided
        if (roadmapData.session_id) {
          setSessionId(roadmapData.session_id);
        }
        
        // Update AI message with vision if available
        if (roadmapData.vision) {
          setMessages([
            ...newMessages,
            {type: 'ai' as const, content: `Here is your roadmap based on your business description. Vision: ${roadmapData.vision}`}
          ]);
        } else {
          setMessages([
            ...newMessages,
            {type: 'ai' as const, content: 'Here is your roadmap based on your business description.'}
          ]);
        }
        
        // Show roadmap
        setShowRoadmap(true);
      } catch (error) {
        console.error('Error generating roadmap:', error);
        
        // Update messages with error
        setMessages([
          ...newMessages,
          {type: 'ai' as const, content: 'Sorry, there was an error generating your roadmap. Please try again.'}
        ]);
      }
    } 
    // If roadmap is already shown, use chat API
    else {
      try {
        // Add loading message
        setMessages([
          ...newMessages,
          {type: 'ai' as const, content: 'Thinking...'}
        ]);
        
        // Call the chat API
        const chatResponse = await chatWithRoadmap(
          inputText, 
          sessionId, 
          !sessionId ? roadmapContent : undefined
        );
        
        // Save session ID if it's new
        if (!sessionId && chatResponse.session_id) {
          setSessionId(chatResponse.session_id);
        }
        
        // Update messages with AI response
        setMessages([
          ...newMessages,
          {type: 'ai' as const, content: chatResponse.response}
        ]);
      } catch (error) {
        console.error('Error chatting with roadmap:', error);
        
        // Update messages with error
        setMessages([
          ...newMessages,
          {type: 'ai' as const, content: 'Sorry, there was an error processing your message. Please try again.'}
        ]);
      }
    }
    
    // Clear input
    setInputText('');
  };

  return (
    <div className="container">
      <Head>
        <title>RoadmapAI - Business Roadmap Generator</title>
        <meta name="description" content="Generate professional business roadmaps with AI" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="main">
        {!showRoadmap ? (
          <div className="content">
            <div className="greeting">
              <span className="icon">✦</span> Build a business roadmap with AI
            </div>

            <div className="input-container">
              <textarea
                className="text-input"
                placeholder="What is your business?"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                ref={inputRef}
              />
              <div className="input-controls">
                <div className="submit">
                  <button 
                    className="generate-button"
                    disabled={!inputText.trim()}
                    onClick={handleSubmit}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="roadmap-container">
            <div className="roadmap-header-container">
              <button 
                className="clear-button" 
                onClick={clearSession}
              >
                New Roadmap
              </button>
            </div>
            <div className="roadmap-image">
              <div className="market-roadmap">
                <div className="roadmap-header">
                  <div className="time-arrow">
                    <div className="time-label">TIME</div>
                    <div className="arrow">→</div>
                  </div>
                </div>
                
                <div className="roadmap-content">
                  <div className="categories">
                    <div className="category">MARKET</div>
                    <div className="category">PRODUCT</div>
                    <div className="category">TECH</div>
                  </div>
                  
                  <div className="category-divider"></div>
                  
                  <div className="roadmap-grid">
                    {/* Market Row */}
                    <div className="grid-row market-row">
                      {roadmapContent.market.map((item, index) => (
                        <div 
                          key={`m${index}`} 
                          className="node market-node" 
                          id={`m${index}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* First horizontal divider */}
                    <div className="horizontal-divider"></div>
                    
                    {/* Product/Service Row */}
                    <div className="grid-row product-row">
                      {roadmapContent.product.map((item, index) => (
                        <div 
                          key={`p${index}`} 
                          className="node product-node" 
                          id={`p${index}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Second horizontal divider */}
                    <div className="horizontal-divider"></div>
                    
                    {/* Technology Row */}
                    <div className="grid-row tech-row">
                      {roadmapContent.tech.map((item, index) => (
                        <div 
                          key={`t${index}`} 
                          className="node tech-node" 
                          id={`t${index}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Horizontal arrows for Market row */}
                    {roadmapContent.market.map((_, index) => {
                      if (index < roadmapContent.market.length - 1) {
                        return (
                          <Xarrow 
                            key={`m-arrow-${index}`}
                            start={`m${index}`}
                            end={`m${index + 1}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{strokeLen: 5}} 
                            headSize={5} 
                            path="straight"
                            startAnchor="right"
                            endAnchor="left"
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Horizontal arrows for Product row */}
                    {roadmapContent.product.map((_, index) => {
                      if (index < roadmapContent.product.length - 1) {
                        return (
                          <Xarrow 
                            key={`p-arrow-${index}`}
                            start={`p${index}`}
                            end={`p${index + 1}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{strokeLen: 5}} 
                            headSize={5}
                            path="straight" 
                            startAnchor="right"
                            endAnchor="left"
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Horizontal arrows for Tech row */}
                    {roadmapContent.tech.map((_, index) => {
                      if (index < roadmapContent.tech.length - 1) {
                        return (
                          <Xarrow 
                            key={`t-arrow-${index}`}
                            start={`t${index}`}
                            end={`t${index + 1}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{strokeLen: 5}} 
                            headSize={5}
                            path="straight"
                            startAnchor="right"
                            endAnchor="left" 
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Vertical arrows from product to market */}
                    {roadmapContent.market.map((_, index) => {
                      if (index < Math.min(roadmapContent.market.length, roadmapContent.product.length)) {
                        return (
                          <Xarrow 
                            key={`mp-arrow-${index}`}
                            start={`p${index}`}
                            end={`m${index}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{strokeLen: 5}} 
                            headSize={5} 
                            path="straight"
                            startAnchor="top"
                            endAnchor="bottom"
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Vertical arrows from tech to product */}
                    {roadmapContent.product.map((_, index) => {
                      if (index < Math.min(roadmapContent.product.length, roadmapContent.tech.length)) {
                        return (
                          <Xarrow 
                            key={`pt-arrow-${index}`}
                            start={`t${index}`}
                            end={`p${index}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{strokeLen: 5}} 
                            headSize={5} 
                            path="straight"
                            startAnchor="top"
                            endAnchor="bottom"
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chat-container">
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="input-container">
                <textarea
                  className="text-input"
                  placeholder="Ask questions about your roadmap or strategies..."
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  ref={inputRef}
                />
                <div className="input-controls">
                  <div className="submit">
                    <button 
                      className="generate-button"
                      disabled={!inputText.trim()}
                      onClick={handleSubmit}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          display: flex;
          height: 100vh;
          background-color: #ffffff;
          color: #111827;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
          overflow: hidden;
        }

        .main {
          width: 100%;
          max-width: 1000px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .greeting {
          font-size: 3.2rem;
          font-weight: 400;
          text-align: center;
          color: #111827;
          line-height: 1.4;
          white-space: nowrap;
        }

        .icon {
          color: #6366f1;
          font-size: 2.2rem;
          margin-right: 0.5rem;
        }

        .roadmap-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow: hidden;
        }
        
        .roadmap-header-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.5rem;
        }
        
        .clear-button {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .clear-button:hover {
          background-color: #e2e8f0;
        }

        .roadmap-image {
          width: 100%;
          display: flex;
          justify-content: center;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          background-color: #ffffff;
          padding: 2.5rem 1rem 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #f1f5f9;
          flex: 0 0 auto;
          min-height: 450px;
          max-height: 60%;
          overflow-x: auto; /* Enable horizontal scrolling */
          position: relative;
        }
        
        .market-roadmap {
          width: 100%;
          min-width: min-content; /* Prevent squeezing */
          padding: 1.5rem;
          background-color: white;
          position: relative;
        }
        
        .roadmap-header {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          position: absolute;
          top: -30px;
          right: 20px;
          z-index: 3;
        }
        
        .time-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #111827;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          background-color: white;
        }
        
        .time-label {
          font-weight: 600;
          margin-right: 0.25rem;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        
        .arrow {
          font-size: 1.25rem;
          font-weight: bold;
        }
        
        .roadmap-content {
          display: flex;
          width: 100%;
          border: 2px solid #111827;
          border-radius: 0.75rem;
          overflow: hidden;
          position: relative;
        }
        
        .category-divider {
          position: absolute;
          left: 100px;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: #94a3b8;
          border-right: 1px dashed #94a3b8;
          z-index: 1;
        }
        
        .categories {
          display: flex;
          flex-direction: column;
          width: 100px;
          flex-shrink: 0;
          z-index: 2;
        }
        
        .category {
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .roadmap-grid {
          flex: 1;
          position: relative;
          padding: 10px;
          overflow-x: auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        
        .horizontal-divider {
          width: 100%;
          height: 1px;
          background-color: #94a3b8;
          border-top: 1px dashed #94a3b8;
          margin: 10px 0;
        }
        
        .grid-row {
          display: flex;
          justify-content: flex-start;
          height: 90px;
          gap: 20px; /* Space between nodes */
          min-width: max-content; /* Ensure content doesn't wrap */
          padding-left: 20px;
        }
        
        .node {
          min-width: 120px;
          width: 120px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          padding: 0.5rem;
          font-size: 0.7rem;
          font-weight: 500;
          text-align: center;
          z-index: 2;
          position: relative;
          flex-shrink: 0; /* Prevent nodes from shrinking */
          border: 1px solid #111827;
          border-radius: 8px;
        }
        
        .tech-node {
          background-color: #e0f2fe;
          border: 1px solid #111827;
          color: #0369a1;
        }
        
        .product-node {
          background-color: #dcfce7;
          border: 1px solid #111827;
          color: #16a34a;
        }
        
        .market-node {
          background-color: #fef9c3;
          border: 1px solid #111827;
          color: #ca8a04;
        }
        
        /* Remove old arrow styles as we're using react-xarrows now */

        .chat-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-height: 100px;
          max-height: 35%;
          overflow: hidden;
        }

        .messages {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          overflow-y: auto;
          padding: 0.25rem;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          min-height: 0;
        }
        
        .messages::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .message {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: flex-start;
          line-height: 1.4;
        }

        .message.user {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          position: relative;
          padding-left: 3rem;
        }

        .message.user:before {
          content: "AG";
          position: absolute;
          left: 1rem;
          top: 1.25rem;
          width: 1.5rem;
          height: 1.5rem;
          background-color: #e2e8f0;
          color: #475569;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .message.ai {
          background-color: #ffffff;
          color: #111827;
          position: relative;
          padding-left: 3rem;
          border: 1px solid #e2e8f0;
        }

        .message.ai:before {
          content: "";
          position: absolute;
          left: 1rem;
          top: 1.25rem;
          width: 1.5rem;
          height: 1.5rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E");
          background-size: contain;
        }

        .message-content {
          width: 100%;
          word-break: break-word;
        }

        .input-container {
          width: 100%;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-top: 0.5rem;
        }

        .text-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: none;
          color: #111827;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          resize: none;
          min-height: 40px;
          max-height: 100px;
          overflow-y: auto;
        }

        .text-input:focus {
          outline: none;
        }

        .text-input::placeholder {
          color: #94a3b8;
        }

        .input-controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border-top: 1px solid #e2e8f0;
        }

        .generate-button {
          background-color: #6366f1;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .generate-button:hover:not(:disabled) {
          background-color: #4f46e5;
        }

        .generate-button:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background-color: #ffffff;
          overflow: hidden;
          height: 100%;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        * {
          box-sizing: border-box;
        }
        
        /* Hide Next.js Developer Profile Badge */
        #__next-build-watcher,
        [data-nextjs-dialog-supporting],
        #nextjs-portal-root,
        circle > text {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default Home;