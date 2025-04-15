import React, { useEffect, useState } from 'react';
import { useRouter } from 'nextra/hooks';

interface MessageBannerProps {
  message?: string;
}

const messages = {
  en: "🚀 NERO Chain x AKINDO WaveHack has officially started! Join now: https://app.akindo.io/wave-hacks/VwQGxPraOF0zZJkX",
  ja: "🚀 NERO Chain × AKINDO WaveHackがついに開幕！今すぐ参加しよう：https://app.akindo.io/wave-hacks/VwQGxPraOF0zZJkX"
};


const MessageBanner: React.FC<MessageBannerProps> = ({ message }) => {
  const router = useRouter();
  const locale = router.locale || 'en';
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  
  useEffect(() => {
    // Function to handle scroll
    const handleScroll = () => {
      if (window.scrollY > 10 && isVisible && !isFading) { // Hide after scrolling down 10px
        setIsFading(true);
        // Start fade out transition
        setTimeout(() => {
          setIsVisible(false);
          document.body.classList.remove('has-banner');
        }, 300); // Match this duration with the CSS transition
      } else if (window.scrollY <= 10 && !isVisible) {
        setIsVisible(true);
        setIsFading(false);
      }
    };
    
    // Initial setup
    if (isVisible) {
      document.body.classList.add('has-banner');
    } else {
      document.body.classList.remove('has-banner');
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      document.body.classList.remove('has-banner');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible, isFading]);

  // Use provided message or fallback to localized message
  const displayMessage = message || messages[locale as keyof typeof messages] || messages.en;

  if (!isVisible) return null;

  return (
    <div className={`message-banner ${isFading ? 'fade-out' : ''}`}>
      <span>{displayMessage}</span>
    </div>
  );
};

export default MessageBanner;