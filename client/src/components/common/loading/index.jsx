import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress over 5 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until auth completes
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            overflow: hidden;
          }
          #loader {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: 1000;
            background: #151a1e;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-transition: 0.3s ease opacity;
            transition: 0.3s ease opacity;
          }
          .loading-container {
            text-align: center;
          }
          .loading-text {
            color: #fff;
            font-family: "Inter Tight", sans-serif;
            font-size: 24px;
            font-weight: 500;
            text-align: center;
            user-select: none;
            margin-bottom: 20px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top: 3px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          .progress-bar {
            width: 200px;
            height: 4px;
            background: #333;
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
          }
          .progress-fill {
            height: 100%;
            background: #fff;
            border-radius: 2px;
            transition: width 0.3s ease;
            width: ${progress}%;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div id="loader">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
