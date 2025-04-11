import React, { useState } from 'react';
import Head from 'next/head';

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
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
              rows={1}
            />
            <div className="input-controls">
              <div className="submit">
                <button 
                  className="generate-button"
                  disabled={!inputText.trim()}
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
      </main>

      <style jsx>{`
        .container {
          display: flex;
          min-height: 100vh;
          background-color: #ffffff;
          color: #111827;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .main {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .greeting {
          font-size: 2.6rem;
          font-weight: 400;
          text-align: center;
          color: #111827;
          line-height: 1.4;
          white-space: nowrap;
        }

        .icon {
          color: #f97316;
          font-size: 2.2rem;
          margin-right: 0.5rem;
        }

        .input-container {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .text-input {
          width: 100%;
          padding: 1rem;
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
          color: #9ca3af;
        }

        .input-controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0.5rem 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .generate-button {
          background-color: #f97316;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .generate-button:hover:not(:disabled) {
          background-color: #ea580c;
        }

        .generate-button:disabled {
          background-color: #d1d5db;
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