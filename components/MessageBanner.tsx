import React, { useEffect, useState } from 'react';
import { useRouter } from 'nextra/hooks';

interface MessageBannerProps {
  message?: string;
}

const messages = {
  en: "NERO Chain x AKINDO Wavehack is comming! More info soon!",
  ja: "NERO Chain × AKINDO Wavehack、まもなく開催！詳細は近日公開予定です。お楽しみに！"
};

const MessageBanner: React.FC<MessageBannerProps> = ({ message }) => {
  const router = useRouter();
  const locale = router.locale || 'en';
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Add banner class to body
    document.body.classList.add('has-banner');
    
    // Function to handle scroll
    const handleScroll = () => {
      if (window.scrollY > 10) { // Hide after scrolling down 10px
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      document.body.classList.remove('has-banner');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Use provided message or fallback to localized message
  const displayMessage = message || messages[locale as keyof typeof messages] || messages.en;

  if (!isVisible) return null;

  return (
    <div className="message-banner">
      <span>{displayMessage}</span>
    </div>
  );
};

export default MessageBanner;