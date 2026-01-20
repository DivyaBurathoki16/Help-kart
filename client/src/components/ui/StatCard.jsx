import PropTypes from 'prop-types';

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'blue',
    link
}) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        indigo: 'from-indigo-500 to-indigo-600',
        purple: 'from-purple-500 to-purple-600',
    };

    const textColorClasses = {
        blue: 'text-blue-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        rose: 'text-rose-600',
        indigo: 'text-indigo-600',
        purple: 'text-purple-600',
    };

    return (
        <div className="card p-6 group hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d={trend === 'up'
                                ? "M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                : "M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                            } clipRule="evenodd" />
                        </svg>
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                <p className={`text-4xl font-extrabold font-display ${textColorClasses[color]} mb-2`}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-slate-500">{subtitle}</p>
                )}
            </div>

            {link && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <a href={link.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group/link">
                        {link.label}
                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.node.isRequired,
    trend: PropTypes.oneOf(['up', 'down']),
    trendValue: PropTypes.string,
    color: PropTypes.oneOf(['blue', 'emerald', 'amber', 'rose', 'indigo', 'purple']),
    link: PropTypes.shape({
        href: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }),
};

export default StatCard;
