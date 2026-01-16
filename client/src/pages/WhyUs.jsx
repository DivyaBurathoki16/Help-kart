import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const reasons = [
  {
    title: 'Verified professionals',
    description:
      'All providers are background-checked, identity-verified, and rated by real customers.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    title: 'Transparent pricing',
    description:
      'Clear, upfront pricing with no hidden fees. Know what you\'ll pay before you book.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    title: 'Fast, reliable support',
    description:
      'Our support team is available to help with bookings, reschedules, and any issues.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    title: 'Coverage for every need',
    description:
      'From plumbing to cleaning, AC repair to handyman tasks — find experts for every job.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'sky',
  },
];

const stats = [
  { label: 'Customer rating', value: '4.9/5', color: 'blue' },
  { label: 'Jobs completed', value: '75k+', color: 'indigo' },
  { label: 'Verified providers', value: '2,500+', color: 'sky' },
  { label: 'Cities covered', value: '120+', color: 'emerald' },
];

const WhyUs = () => {
  return (
    <div className="bg-slate-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        <PageHeader
          title="Why HelpKart"
          subtitle="Built to make home services simple, safe, and dependable — for customers and professionals alike."
        />

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {stats.map((stat) => {
            const colorConfig = {
              blue: {
                bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20',
                border: 'border-blue-200/50 dark:border-blue-800/50',
                text: 'text-blue-700 dark:text-blue-300',
              },
              indigo: {
                bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20',
                border: 'border-indigo-200/50 dark:border-indigo-800/50',
                text: 'text-indigo-700 dark:text-indigo-300',
              },
              sky: {
                bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-900/30 dark:to-sky-800/20',
                border: 'border-sky-200/50 dark:border-sky-800/50',
                text: 'text-sky-700 dark:text-sky-300',
              },
              emerald: {
                bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20',
                border: 'border-emerald-200/50 dark:border-emerald-800/50',
                text: 'text-emerald-700 dark:text-emerald-300',
              },
            };
            const colors = colorConfig[stat.color];
            return (
              <div
                key={stat.label}
                className={`${colors.bg} rounded-3xl shadow-sm border ${colors.border} px-5 py-4 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
              >
                <p className={`text-xl sm:text-2xl font-black ${colors.text}`}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 mt-1 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {reasons.map((reason) => {
            const colorClasses = {
              blue: {
                bg: 'bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-800/20',
                icon: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200/30 dark:border-blue-800/30',
              },
              emerald: {
                bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-900/30 dark:to-emerald-800/20',
                icon: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-200/30 dark:border-emerald-800/30',
              },
              indigo: {
                bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-900/30 dark:to-indigo-800/20',
                icon: 'text-indigo-600 dark:text-indigo-400',
                border: 'border-indigo-200/30 dark:border-indigo-800/30',
              },
              sky: {
                bg: 'bg-gradient-to-br from-sky-50 to-sky-100/30 dark:from-sky-900/30 dark:to-sky-800/20',
                icon: 'text-sky-600 dark:text-sky-400',
                border: 'border-sky-200/30 dark:border-sky-800/30',
              },
            };
            const colors = colorClasses[reason.color];
            return (
              <div
                key={reason.title}
                className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 border ${colors.border} dark:border-neutral-700 px-7 py-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon} flex-shrink-0 shadow-sm`}>
                    {reason.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">
                      {reason.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final message */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-800 dark:to-neutral-800/50 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 border border-blue-100/50 dark:border-neutral-700 px-8 py-7 max-w-3xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
            A better way to book local services.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-neutral-400 mb-6">
            With HelpKart, you get the ease of online booking, the trust of verified
            professionals, and the peace of mind that every job is tracked from request
            to completion.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/services"
              className="px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
            >
              Browse services
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3 rounded-full bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 text-sm font-semibold border border-slate-200 dark:border-neutral-700 shadow-sm hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300"
            >
              Learn how it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyUs;

