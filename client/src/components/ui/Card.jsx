const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
        border border-slate-200 dark:border-neutral-700
        rounded-xl
        shadow-sm
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
