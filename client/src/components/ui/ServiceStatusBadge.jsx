const ServiceStatusBadge = ({ serviceStatus, className = '' }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Pending',
    },
    in_progress: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: (
        <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: 'In Progress',
    },
    completed: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: 'Completed',
    },
    default: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: null,
      label: serviceStatus || 'Unknown',
    },
  };

  const config = statusConfig[serviceStatus] || statusConfig.default;

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
      {config.icon}
      {config.label}
    </span>
  );
};

export default ServiceStatusBadge;
