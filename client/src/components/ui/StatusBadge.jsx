const StatusBadge = ({ status, children, className = '', size = 'md', showDot = false }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-500/30',
      dot: 'bg-amber-500',
    },
    accepted: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-500/30',
      dot: 'bg-blue-500',
    },
    completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-500/30',
      dot: 'bg-rose-500',
    },
    rejected: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-500/30',
      dot: 'bg-rose-500',
    },
    reschedule_requested: {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-500/30',
      dot: 'bg-orange-500',
    },
    issue_reported: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-500/30',
      dot: 'bg-amber-500',
    },
    redo_required: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-500/30',
      dot: 'bg-blue-500',
    },
    redo_completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    refund_pending: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-500/30',
      dot: 'bg-purple-500',
    },
    resolved: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    default: {
      bg: 'bg-slate-50 dark:bg-slate-500/10',
      text: 'text-slate-700 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-500/30',
      dot: 'bg-slate-500',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const getDisplayText = () => {
    if (children) return children;
    if (!status) return '';
    if (status.toLowerCase() === 'reschedule_requested') return 'Reschedule Requested';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };
  const displayText = getDisplayText();

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        ${sizeClasses[size]}
        font-semibold tracking-wide uppercase
        border ${config.border}
        ${config.bg}
        ${config.text}
        ${className}
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {displayText}
    </span>
  );
};

export default StatusBadge;
