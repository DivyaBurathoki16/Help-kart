const PrimaryButton = ({ 
  children, 
  className = '', 
  variant = 'primary',
  icon,
  iconPosition = 'right',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3
    font-semibold
    rounded-lg
    transition-all duration-300 ease-out
    shadow-md hover:shadow-lg
    active:translate-y-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md
  `;

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:-translate-y-0.5',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white hover:-translate-y-0.5',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5',
  };

  const iconClasses = iconPosition === 'right' 
    ? 'group-hover:translate-x-1' 
    : 'group-hover:-translate-x-1';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} group`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`transition-transform duration-300 ${iconClasses}`}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={`transition-transform duration-300 ${iconClasses}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default PrimaryButton;
