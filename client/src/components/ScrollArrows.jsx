import { useState, useEffect } from 'react';

const ScrollArrows = () => {
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = documentHeight - (scrollTop + windowHeight);

      // Show up arrow if scrolled down more than 100px
      setShowUpArrow(scrollTop > 100);

      // Show down arrow if not at bottom (with 50px threshold)
      setShowDownArrow(scrollBottom > 50);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollDown = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!showUpArrow && !showDownArrow) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
      {showUpArrow && (
        <button
          onClick={scrollUp}
          className="group w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:-translate-y-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
      {showDownArrow && (
        <button
          onClick={scrollDown}
          className="group w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:translate-y-1 active:scale-95 flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScrollArrows;
