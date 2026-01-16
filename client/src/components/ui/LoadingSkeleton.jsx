const LoadingSkeleton = ({
    type = 'card',
    count = 1,
    className = ''
}) => {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`card p-6 ${className}`}>
                        <div className="animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={`bg-white rounded-xl p-4 ${className}`}>
                        <div className="animate-pulse flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'stat':
                return (
                    <div className={`card p-6 ${className}`}>
                        <div className="animate-pulse">
                            <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                            <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`bg-white rounded-xl overflow-hidden ${className}`}>
                        <div className="animate-pulse">
                            <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-100">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-4 bg-slate-200 rounded"></div>
                                ))}
                            </div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-slate-100">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="h-3 bg-slate-200 rounded"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={`h-20 bg-slate-200 rounded-xl animate-pulse ${className}`}></div>
                );
        }
    };

    return (
        <div className="space-y-4">
            {skeletons.map((i) => (
                <div key={i}>{renderSkeleton()}</div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
