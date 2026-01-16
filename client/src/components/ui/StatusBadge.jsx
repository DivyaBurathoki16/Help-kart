const StatusBadge = ({ status, children, className = '' }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    accepted: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    completed: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    cancelled: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    rejected: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    reschedule_requested: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    issue_reported: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    redo_required: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    redo_completed: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    refund_pending: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    default: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
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
        inline-flex items-center
        rounded-full
        px-3 py-1
        text-xs font-medium
        border ${config.border}
        ${config.bg}
        ${config.text}
        ${className}
      `}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
