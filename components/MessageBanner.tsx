import React, { useEffect, useState } from 'react';
import { useRouter } from 'nextra/hooks';

interface MessageBannerProps {
  message?: string;
}

const messages = {
  en: {
    text: "Join NEROChain Communities and stay tuned for more!",
    linkText: "",
    url: ""
  },
  ja: {
    text: "NEROChainコミュニティに参加して、今後の情報をお待ちください！",
    linkText: "",
    url: ""
  }
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
  const messageData = messages[locale as keyof typeof messages] || messages.en;

  if (!isVisible) return null;

  return (
    <div className={`message-banner ${isFading ? 'fade-out' : ''}`}>
      {message ? (
        <span>{message}</span>
      ) : (
        <span>
          {messageData.text}
          {messageData.linkText && messageData.url && (
            <>
              {' '}
              <a 
                href={messageData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  transition: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
              >
                {messageData.linkText}
              </a>
              !
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default MessageBanner;