import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface MessageBannerProps {
  message?: string;
}

const messages = {
  en: "NERO Chain is currently running in TestNet",
  ja: "NERO Chainは現在TestNetで稼働中です"
};

const MessageBanner: React.FC<MessageBannerProps> = ({ message }) => {
  const { locale = 'en' } = useRouter();
  
  useEffect(() => {
    document.body.classList.add('has-banner');
    return () => {
      document.body.classList.remove('has-banner');
    };
  }, []);

  // Use provided message or fallback to localized message
  const displayMessage = message || messages[locale as keyof typeof messages] || messages.en;

  return (
    <div className="message-banner">
      {displayMessage}
    </div>
  );
};

export default MessageBanner;