import React, { useState, useEffect } from 'react';

interface PageFeedbackProps {
  path?: string;
}

const PageFeedback: React.FC<PageFeedbackProps> = ({ path }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show the feedback popup after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If submitted, start the exit animation after 2 seconds
    if (submitted) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        // Hide component completely after animation
        setTimeout(() => {
          setIsVisible(false);
        }, 300); // Match animation duration
      }, 2000);

      return () => clearTimeout(exitTimer);
    }
  }, [submitted]);

  const handleSubmit = async () => {
    if (!feedback || submitted) return;
    
    setSubmitted(true);

    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // @ts-ignore
        window.gtag('event', 'page_feedback', {
          event_category: 'Documentation',
          event_label: path || window.location.pathname,
          value: feedback === 'yes' ? 1 : 0
        });
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    // Hide component completely after animation
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  if (submitted) {
    return (
      <div className={`page-feedback ${isExiting ? 'exit' : ''}`}>
        <div className="feedback-thank-you">
          <svg xmlns="http://www.w3.org/2000/svg" className="feedback-check-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-feedback ${isExiting ? 'exit' : ''}`}>
      <button onClick={handleClose} className="feedback-close" aria-label="Close feedback">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <p className="feedback-question">Was this content helpful?</p>
      <div className="feedback-options">
        <label className="feedback-option">
          <input
            type="radio"
            name="feedback"
            checked={feedback === 'yes'}
            onChange={() => setFeedback('yes')}
          />
          <span className="feedback-radio"></span>
          <span className="feedback-label">
            <span className="feedback-emoji">👍</span> Yes
          </span>
        </label>
        <label className="feedback-option">
          <input
            type="radio"
            name="feedback"
            checked={feedback === 'no'}
            onChange={() => setFeedback('no')}
          />
          <span className="feedback-radio"></span>
          <span className="feedback-label">
            <span className="feedback-emoji">👎</span> No
          </span>
        </label>
      </div>
      <button
        onClick={handleSubmit}
        className={`feedback-submit ${feedback ? 'active' : ''}`}
        disabled={!feedback}
      >
        Next
      </button>
    </div>
  );
};

export default PageFeedback; 