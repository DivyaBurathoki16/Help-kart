import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
<<<<<<< HEAD

const reviews = [
  {
    name: 'Aarav Sharma',
    service: 'Electrical',
    rating: 5,
    text: 'Booked an electrician through HelpKart — quick response, clean work, and transparent pricing.',
    date: '2 weeks ago',
    avatar: 'AS',
  },
  {
    name: 'Priya Verma',
    service: 'Cleaning',
    rating: 5,
    text: 'Super easy booking. The cleaning team was punctual and the house looks amazing.',
    date: '1 month ago',
    avatar: 'PV',
  },
  {
    name: 'Rahul Mehta',
    service: 'Plumbing',
    rating: 4,
    text: 'Great plumber. Fixed the leak fast and explained everything clearly. Would book again.',
    date: '3 weeks ago',
    avatar: 'RM',
  },
  {
    name: 'Neha Gupta',
    service: 'AC Repair',
    rating: 5,
    text: 'AC servicing was smooth from start to finish. Loved the status updates.',
    date: '1 week ago',
    avatar: 'NG',
  },
  {
    name: 'Karan Singh',
    service: 'Mechanic',
    rating: 4,
    text: 'Mechanic arrived on time and got my bike running perfectly. Professional and polite.',
    date: '2 months ago',
    avatar: 'KS',
  },
  {
    name: 'Sana Khan',
    service: 'General',
    rating: 5,
    text: 'The provider was verified and the experience felt trustworthy. Booking was effortless.',
    date: '3 weeks ago',
    avatar: 'SK',
  },
];
=======
import usePageContent from '../hooks/usePageContent';
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={`text-base ${index < rating ? 'text-amber-400 dark:text-amber-500' : 'text-slate-300 dark:text-neutral-600'}`}
      >
        ★
      </span>
    ))}
  </div>
);

const Reviews = () => {
<<<<<<< HEAD
=======
  const { data: pageContent } = usePageContent('reviews');

  const reviews =
    pageContent?.reviews || [
      {
        name: 'Aarav Sharma',
        service: 'Electrical',
        rating: 5,
        text:
          'Booked an electrician through HelpKart — quick response, clean work, and transparent pricing.',
        date: '2 weeks ago',
        avatar: 'AS',
      },
      {
        name: 'Priya Verma',
        service: 'Cleaning',
        rating: 5,
        text:
          'Super easy booking. The cleaning team was punctual and the house looks amazing.',
        date: '1 month ago',
        avatar: 'PV',
      },
      {
        name: 'Rahul Mehta',
        service: 'Plumbing',
        rating: 4,
        text:
          'Great plumber. Fixed the leak fast and explained everything clearly. Would book again.',
        date: '3 weeks ago',
        avatar: 'RM',
      },
      {
        name: 'Neha Gupta',
        service: 'AC Repair',
        rating: 5,
        text: 'AC servicing was smooth from start to finish. Loved the status updates.',
        date: '1 week ago',
        avatar: 'NG',
      },
      {
        name: 'Karan Singh',
        service: 'Mechanic',
        rating: 4,
        text:
          'Mechanic arrived on time and got my bike running perfectly. Professional and polite.',
        date: '2 months ago',
        avatar: 'KS',
      },
      {
        name: 'Sana Khan',
        service: 'General',
        rating: 5,
        text:
          'The provider was verified and the experience felt trustworthy. Booking was effortless.',
        date: '3 weeks ago',
        avatar: 'SK',
      },
    ];

>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  return (
    <div className="bg-slate-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        <PageHeader
<<<<<<< HEAD
          title="Customer reviews"
          subtitle="Real feedback from customers who booked services through HelpKart."
=======
          title={pageContent?.title || 'Customer reviews'}
          subtitle={
            pageContent?.subtitle ||
            'Real feedback from customers who booked services through HelpKart.'
          }
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
        />

        <div className="flex flex-wrap gap-4 mb-10">
          <Link
<<<<<<< HEAD
            to="/services"
            className="px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            Book a service
          </Link>
          <Link
            to="/why-us"
              className="px-6 py-3 rounded-full bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 text-sm font-semibold border border-slate-200 dark:border-neutral-700 shadow-sm hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300"
          >
            Why HelpKart
=======
            to={pageContent?.ctaPrimary?.link || '/services'}
            className="px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            {pageContent?.ctaPrimary?.label || 'Book a service'}
          </Link>
          <Link
            to={pageContent?.ctaSecondary?.link || '/why-us'}
              className="px-6 py-3 rounded-full bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 text-sm font-semibold border border-slate-200 dark:border-neutral-700 shadow-sm hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300"
          >
            {pageContent?.ctaSecondary?.label || 'Why HelpKart'}
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="bg-white dark:bg-neutral-800 rounded-3xl shadow-md shadow-slate-200/80 dark:shadow-neutral-950/50 px-7 py-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-neutral-950/60 hover:-translate-y-1"
            >
              <header className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100">
                    {review.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">{review.service}</p>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">{review.date}</p>
                </div>
              </header>
              <StarRow rating={review.rating} />
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed flex-1">"{review.text}"</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Reviews;

