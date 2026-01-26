import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import usePageContent from '../hooks/usePageContent';

const HowItWorks = () => {
  const { data: pageContent } = usePageContent('how-it-works');

  const mapStepsWithIcons = (steps, iconSet) =>
    steps.map((step, index) => ({
      ...step,
      icon: iconSet[index % iconSet.length],
    }));

  const defaultCustomerSteps = [
    {
      title: 'Browse services',
      description: 'Explore categories and choose the service you need.',
    },
    {
      title: 'Book in minutes',
      description: 'Pick a time and place your request with a few clicks.',
    },
    {
      title: 'Track status',
      description: 'Stay updated as your booking progresses from request to completion.',
    },
    {
      title: 'Pay & review',
      description: 'Complete payment and leave feedback to help the community.',
    },
  ];

  const defaultProviderSteps = [
    {
      title: 'Set up your profile',
      description: 'Create your provider profile and list your services.',
    },
    {
      title: 'Receive requests',
      description: 'Get booking requests from nearby customers.',
    },
    {
      title: 'Accept & complete jobs',
      description: 'Manage your schedule and complete work professionally.',
    },
    {
      title: 'Get paid',
      description: 'Track bookings and monitor your earnings in one place.',
    },
  ];

  const customerIcons = [
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m4-7a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a1 1 0 012 0v7.382l3.447 3.447a1 1 0 01-1.414 1.414L11 11.414V3z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  ];

  const providerIcons = [
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-slate-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  ];

  const stepsCustomer = mapStepsWithIcons(
    pageContent?.customerSteps || defaultCustomerSteps,
    customerIcons
  );

  const stepsProvider = mapStepsWithIcons(
    pageContent?.providerSteps || defaultProviderSteps,
    providerIcons
  );
  return (
    <div className="bg-slate-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        <PageHeader
          title={pageContent?.title || 'How HelpKart works'}
          subtitle={
            pageContent?.subtitle ||
            'A simple, guided flow for customers and providers — designed to be fast, transparent, and reliable.'
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Customers column */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-1">For customers</h2>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">
              {pageContent?.customerIntro || 'Book trusted services in a few steps.'}
            </p>

            <div className="space-y-5">
              {stepsCustomer.map((step, index) => (
                <div
                  key={step.title}
                  className="bg-white dark:bg-neutral-800 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 px-6 py-5 sm:px-8 sm:py-6 flex items-start gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-neutral-950/60 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-neutral-100">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Providers column */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-1">For service providers</h2>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">
              {pageContent?.providerIntro || 'Manage requests, jobs, and earnings with clarity.'}
            </p>

            <div className="space-y-5">
              {stepsProvider.map((step, index) => (
                <div
                  key={step.title}
                  className="bg-white dark:bg-neutral-800 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 px-6 py-5 sm:px-8 sm:py-6 flex items-start gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-neutral-950/60 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-neutral-100">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA row */}
        <div className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 px-8 py-8 flex-1 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-neutral-950/60">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
              {pageContent?.bottomCta?.heading || 'Ready to get started?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-neutral-400">
              {pageContent?.bottomCta?.description ||
                'Explore services, book an expert, and get it done — the HelpKart way.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={pageContent?.bottomCta?.primaryCta?.link || '/services'}
              className="px-7 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 text-center"
            >
              {pageContent?.bottomCta?.primaryCta?.label || 'Browse services'}
            </Link>
            <Link
              to={pageContent?.bottomCta?.secondaryCta?.link || '/become-provider'}
              className="px-7 py-3 rounded-full bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 text-sm font-semibold border border-slate-200 dark:border-neutral-700 shadow-sm hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 text-center"
            >
              {pageContent?.bottomCta?.secondaryCta?.label || 'Become a provider'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
