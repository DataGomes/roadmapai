import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Xarrow from 'react-xarrows';

// Random strings for each category
const businessStrings = [
  "Market Research",
  "Funding Round",
  "International Expansion",
  "Customer Acquisition",
  "Brand Development",
  "Strategic Partnership",
  "Revenue Diversification",
  "Market Segmentation",
  "Competitive Analysis",
  "Franchise Model",
  "Merger & Acquisition",
  "B2B Development",
  "Vertical Integration",
  "Organizational Restructuring",
  "Stakeholder Engagement"
];

const productStrings = [
  "Platform MVP",
  "Feature Enhancement",
  "Global Service",
  "User Testing",
  "Product Roadmap",
  "UX Refinement",
  "Beta Testing",
  "Cross-platform Support",
  "Premium Features",
  "Mobile Integration",
  "Subscription Model",
  "Product Analytics",
  "Customer Feedback Loop",
  "Localization Strategy",
  "Design System"
];

const techStrings = [
  "Quantum Computing",
  "AI Integration",
  "Blockchain",
  "Cloud Migration",
  "Infrastructure Scaling",
  "Cybersecurity Framework",
  "Data Architecture",
  "DevOps Implementation",
  "Machine Learning Algorithms",
  "API Ecosystem",
  "Microservices Architecture",
  "Edge Computing",
  "Real-time Analytics",
  "IoT Integration",
  "Containerization"
];

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [messages, setMessages] = useState<{type: 'user' | 'ai', content: string}[]>([]);
  const [roadmapContent, setRoadmapContent] = useState<{
    business: string[],
    product: string[],
    tech: string[]
  }>({
    business: [],
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
    
    // Initialize roadmap content with random data if none exists
    if (showRoadmap && 
        roadmapContent.business.length === 0 && 
        roadmapContent.product.length === 0 && 
        roadmapContent.tech.length === 0) {
      
      // Generate random number of items (between 3-6) for each category
      const businessCount = getRandomNumber(3, 6);
      const productCount = getRandomNumber(3, 6);
      const techCount = getRandomNumber(3, 6);
      
      // Get random items for each category
      const business = getRandomItems(businessStrings, businessCount);
      const product = getRandomItems(productStrings, productCount);
      const tech = getRandomItems(techStrings, techCount);
      
      // Update roadmap content
      setRoadmapContent({
        business,
        product,
        tech
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoadmap, roadmapContent.business.length, roadmapContent.product.length, roadmapContent.tech.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Function to get random number between min and max (inclusive)
  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Function to get random items from an array
  const getRandomItems = (arr: string[], count: number): string[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    
    // Generate random number of items (between 3-6) for each category
    const businessCount = getRandomNumber(3, 6);
    const productCount = getRandomNumber(3, 6);
    const techCount = getRandomNumber(3, 6);
    
    // Get random items for each category
    const business = getRandomItems(businessStrings, businessCount);
    const product = getRandomItems(productStrings, productCount);
    const tech = getRandomItems(techStrings, techCount);
    
    // Update roadmap content
    setRoadmapContent({
      business,
      product,
      tech
    });
    
    const updatedMessages = [
      ...messages, 
      {type: 'user', content: inputText},
      {type: 'ai', content: 'Here is your roadmap based on your business description.'}
    ];
    
    // Update messages
    setMessages(updatedMessages);
    
    // Show roadmap
    setShowRoadmap(true);
    
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
            <div className="roadmap-image">
              <div className="business-roadmap">
                <div className="roadmap-header">
                  <div className="time-arrow">
                    <div className="time-label">TIME</div>
                    <div className="arrow">→</div>
                  </div>
                </div>
                
                <div className="roadmap-content">
                  <div className="categories">
                    <div className="category">BUSINESS</div>
                    <div className="category">PRODUCT</div>
                    <div className="category">TECH</div>
                  </div>
                  
                  <div className="roadmap-grid">
                    {/* Business/Market Row */}
                    <div className="grid-row business-row">
                      {roadmapContent.business.map((item, index) => (
                        <div 
                          key={`b${index}`} 
                          className="node business-node" 
                          id={`b${index}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    
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
                    
                    {/* Horizontal arrows for Business row */}
                    {roadmapContent.business.map((_, index) => {
                      if (index < roadmapContent.business.length - 1) {
                        return (
                          <Xarrow 
                            key={`b-arrow-${index}`}
                            start={`b${index}`}
                            end={`b${index + 1}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{stroke: 5}} 
                            headSize={5} 
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
                            dashness={{stroke: 5}} 
                            headSize={5} 
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
                            dashness={{stroke: 5}} 
                            headSize={5} 
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Vertical arrows between rows */}
                    {roadmapContent.business.map((_, index) => {
                      if (index < Math.min(roadmapContent.business.length, roadmapContent.product.length)) {
                        return (
                          <Xarrow 
                            key={`bp-arrow-${index}`}
                            start={`b${index}`}
                            end={`p${index}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{stroke: 5}} 
                            headSize={5} 
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {roadmapContent.product.map((_, index) => {
                      if (index < Math.min(roadmapContent.product.length, roadmapContent.tech.length)) {
                        return (
                          <Xarrow 
                            key={`pt-arrow-${index}`}
                            start={`p${index}`}
                            end={`t${index}`} 
                            color="#94a3b8" 
                            strokeWidth={2} 
                            dashness={{stroke: 5}} 
                            headSize={5} 
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
                  placeholder="Ask about your roadmap..."
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
          gap: 1.5rem;
          overflow: hidden;
        }

        .roadmap-image {
          width: 100%;
          display: flex;
          justify-content: center;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          background-color: #ffffff;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #f1f5f9;
          flex: 0 0 auto;
          max-height: 50%;
          overflow-x: auto; /* Enable horizontal scrolling */
        }
        
        .business-roadmap {
          width: 100%;
          min-width: min-content; /* Prevent squeezing */
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          background-color: white;
        }
        
        .roadmap-header {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .time-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.5rem;
          width: 100%;
        }
        
        .time-label {
          font-weight: 600;
          margin-right: 0.5rem;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }
        
        .arrow {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .roadmap-content {
          display: flex;
          width: 100%;
        }
        
        .categories {
          display: flex;
          flex-direction: column;
          margin-right: 0.5rem;
          width: 100px;
        }
        
        .category {
          height: 90px;
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 0.7rem;
          color: #475569;
          writing-mode: vertical-lr;
          transform: rotate(180deg);
          padding: 0.5rem;
          letter-spacing: 0.5px;
        }
        
        .roadmap-grid {
          flex: 1;
          position: relative;
          padding: 0 20px;
          overflow-x: auto;
          min-width: 0;
        }
        
        .grid-row {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 1rem;
          height: 90px;
          gap: 20px; /* Space between nodes */
          min-width: max-content; /* Ensure content doesn't wrap */
        }
        
        .node {
          min-width: 110px;
          width: 110px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          z-index: 2;
          position: relative;
          flex-shrink: 0; /* Prevent nodes from shrinking */
        }
        
        .tech-node {
          background-color: #e0f2fe;
          border: 1px solid #7dd3fc;
          color: #0369a1;
        }
        
        .product-node {
          background-color: #dcfce7;
          border: 1px solid #86efac;
          color: #16a34a;
        }
        
        .business-node {
          background-color: #fef9c3;
          border: 1px solid #fde047;
          color: #ca8a04;
        }
        
        /* Remove old arrow styles as we're using react-xarrows now */

        .chat-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .messages {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          min-height: 0;
        }
        
        .messages::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .message {
          width: 100%;
          padding: 1.25rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: flex-start;
          line-height: 1.6;
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
          margin-top: 1rem;
        }

        .text-input {
          width: 100%;
          padding: 1.25rem;
          background-color: transparent;
          border: none;
          color: #111827;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          resize: none;
          min-height: 60px;
          max-height: 500px;
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
          padding: 0.75rem 1.25rem;
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