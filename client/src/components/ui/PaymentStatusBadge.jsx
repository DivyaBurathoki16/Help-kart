const PaymentStatusBadge = ({ paymentStatus, paymentMethod, className = '' }) => {
  const getStatusConfig = () => {
    if (paymentStatus === 'paid') {
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: 'Paid',
      };
    }
    
    if (paymentStatus === 'unpaid' || !paymentStatus) {
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: paymentMethod === 'COD' ? 'COD - Pay on Delivery' : 'Unpaid',
      };
    }
    
    return {
      bg: 'bg-slate-500/15',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: null,
      label: paymentStatus || 'Unknown',
    };
  };

  const config = getStatusConfig();
  const getPaymentMethodLabel = () => {
    if (!paymentMethod) return '';
    const methods = {
      COD: 'Cash on Delivery',
      UPI: 'UPI',
      CARD: 'Card',
    };
    return methods[paymentMethod] || paymentMethod;
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span
        className={`
          inline-flex items-center
          rounded-full
          px-3 py-1
          text-xs font-medium
          border ${config.border}
          ${config.bg}
          ${config.text}
        `}
      >
        {config.icon}
        {config.label}
      </span>
      {paymentMethod && (
        <span className="text-xs text-slate-500 ml-1">
          {getPaymentMethodLabel()}
        </span>
      )}
    </div>
  );
};

export default PaymentStatusBadge;
