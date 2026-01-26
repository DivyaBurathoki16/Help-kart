const PrimaryButton = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 
      text-white shadow-lg shadow-blue-500/25 
      hover:shadow-xl hover:shadow-blue-500/30
      focus:ring-blue-500
      dark:shadow-blue-500/10 dark:hover:shadow-blue-500/20
    `,
    secondary: `
      bg-slate-100 hover:bg-slate-200 
      text-slate-700 
      dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200
      focus:ring-slate-400
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-green-600 
      hover:from-emerald-600 hover:to-green-700 
      text-white shadow-lg shadow-emerald-500/25 
      hover:shadow-xl hover:shadow-emerald-500/30
      focus:ring-emerald-500
    `,
    danger: `
      bg-gradient-to-r from-rose-500 to-red-600 
      hover:from-rose-600 hover:to-red-700 
      text-white shadow-lg shadow-rose-500/25 
      hover:shadow-xl hover:shadow-rose-500/30
      focus:ring-rose-500
    `,
    warning: `
      bg-gradient-to-r from-amber-500 to-orange-500 
      hover:from-amber-600 hover:to-orange-600 
      text-white shadow-lg shadow-amber-500/25 
      hover:shadow-xl hover:shadow-amber-500/30
      focus:ring-amber-500
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 
      hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700
      dark:border-blue-500 dark:text-blue-400 
      dark:hover:bg-blue-950/30 dark:hover:border-blue-400
      focus:ring-blue-500
    `,
    ghost: `
      text-slate-600 hover:bg-slate-100 hover:text-slate-900
      dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100
      focus:ring-slate-400
    `,
  };

  const iconClasses = iconPosition === 'right' 
    ? 'group-hover:translate-x-0.5' 
    : 'group-hover:-translate-x-0.5';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} group`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`transition-transform duration-200 ${iconClasses}`}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={`transition-transform duration-200 ${iconClasses}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default PrimaryButton;
