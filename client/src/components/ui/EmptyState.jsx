import PropTypes from 'prop-types';

const EmptyState = ({
    title = 'No data found',
    description = 'There are no items to display at this time.',
    icon,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                {icon || (
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                {title}
            </h3>

            <p className="text-slate-600 max-w-sm mb-6">
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="btn btn-primary"
                >
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                </button>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.node,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        icon: PropTypes.node,
    }),
};

export default EmptyState;
