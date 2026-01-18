import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BecomeProvider = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/register?role=provider');
    } else if (user.role !== 'provider') {
      navigate('/provider/setup');
    } else {
      navigate('/provider/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-neutral-100 mb-4 font-display tracking-tight">
            Become a Service Provider
          </h1>
          <p className="text-xl text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Join our platform and start offering your services to customers
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-soft-xl dark:shadow-soft dark:border dark:border-neutral-800 p-8 md:p-10 mb-8 animate-slide-up transition-colors duration-300">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-8 font-display">
            Why Become a Provider?
          </h2>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30 hover:shadow-md transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-2 text-lg">Earn Money</h3>
              <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Set your own prices and work on your schedule
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-2 text-lg">Reach Customers</h3>
              <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Connect with customers looking for your services
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-2 text-lg">Verified Platform</h3>
              <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Build trust with our verification system
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="border-t border-slate-200 dark:border-neutral-700 pt-8 mt-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-6 font-display">
              How It Works
            </h3>
            <ol className="space-y-6">
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </span>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 mb-1 text-lg">Sign Up</h4>
                  <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                    Create your provider account and complete your profile
                  </p>
                </div>
              </li>
              
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </span>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 mb-1 text-lg">Get Approved</h4>
                  <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                    Our admin team will review and approve your application
                  </p>
                </div>
              </li>
              
              <li className="flex items-start group">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </span>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 mb-1 text-lg">Start Earning</h4>
                  <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                    Add your services and start receiving bookings
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            Get Started
          </button>
          <p className="mt-6 text-slate-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline-offset-4 hover:underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
