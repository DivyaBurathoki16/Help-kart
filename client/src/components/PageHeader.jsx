const PageHeader = ({ title, subtitle }) => {
  return (
    <header className="mb-10 md:mb-12">
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
        {title}
      </h1>
      {/* Accent line - refined spacing and proportions */}
      <div className="w-14 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-3 mb-4"></div>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 max-w-[600px] leading-relaxed mt-0">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
