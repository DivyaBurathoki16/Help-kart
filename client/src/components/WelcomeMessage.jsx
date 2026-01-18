import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const WelcomeMessage = () => {
  const { user, isAuthenticated } = useAuth();
  const [showMessage, setShowMessage] = useState(false);
  const [messageData, setMessageData] = useState(null);

  useEffect(() => {
    // Only show welcome message if user is authenticated and flag exists
    if (isAuthenticated && user) {
      const welcomeFlag = localStorage.getItem('showWelcomeMessage');
      
      if (welcomeFlag) {
        try {
          const flagData = JSON.parse(welcomeFlag);
          // Only show if the role matches (to prevent showing wrong message)
          if (flagData.role === user.role) {
            setMessageData(flagData);
            setShowMessage(true);
            // Auto-hide after 8 seconds
            const timer = setTimeout(() => {
              setShowMessage(false);
              localStorage.removeItem('showWelcomeMessage');
            }, 8000);
            
            return () => clearTimeout(timer);
          } else {
            // Role mismatch, clear the flag
            localStorage.removeItem('showWelcomeMessage');
          }
        } catch (error) {
          console.error('Error parsing welcome message flag:', error);
          localStorage.removeItem('showWelcomeMessage');
        }
      }
    }
  }, [isAuthenticated, user]);

  const handleClose = () => {
    setShowMessage(false);
    localStorage.removeItem('showWelcomeMessage');
  };

  if (!showMessage || !messageData) return null;

  const getWelcomeContent = () => {
    if (messageData.role === 'customer') {
      return {
        title: 'Welcome to HelpKart! 🎉',
        message: 'We\'re thrilled to have you here! Enjoy finding trusted services near you and connecting with amazing service providers.',
        icon: '👋',
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      };
    } else if (messageData.role === 'provider') {
      return {
        title: 'Welcome to HelpKart! 🎉',
        message: 'We\'re excited to have you join our community! Start offering your services and connect with customers who need your expertise.',
        icon: '👋',
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      };
    }
    return null;
  };

  const content = getWelcomeContent();
  if (!content) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in max-w-md">
      <div className={`${content.bgColor} text-white rounded-2xl shadow-2xl p-6 border border-white/20 backdrop-blur-sm`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{content.icon}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{content.message}</p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
