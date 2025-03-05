import React, { useEffect } from 'react';

interface MessageBannerProps {
  message?: string;
}

const MessageBanner: React.FC<MessageBannerProps> = ({ 
  message = "NERO Chain is currently running in TestNet"
}) => {
  useEffect(() => {
    document.body.classList.add('has-banner');
    return () => {
      document.body.classList.remove('has-banner');
    };
  }, []);

  return (
    <div className="message-banner">
      {message}
    </div>
  );
};

export default MessageBanner;