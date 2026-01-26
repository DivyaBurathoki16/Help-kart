const Card = ({ children, className = '', hover = true, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800',
    glass: 'bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-white/20 dark:border-neutral-800/50',
    elevated: 'bg-white dark:bg-neutral-900 border-transparent shadow-lg dark:shadow-neutral-950/50',
    outlined: 'bg-transparent border-slate-300 dark:border-neutral-700',
    gradient: 'bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-950 border-slate-200/50 dark:border-neutral-800/50',
  };

  return (
    <div
      className={`
        border rounded-2xl
        ${variants[variant] || variants.default}
        ${hover ? 'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-neutral-950/50 hover:-translate-y-0.5' : ''}
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
