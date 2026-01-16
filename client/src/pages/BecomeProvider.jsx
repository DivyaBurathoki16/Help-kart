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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a Service Provider
          </h1>
          <p className="text-xl text-gray-600">
            Join our platform and start offering your services to customers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Why Become a Provider?</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Earn Money</h3>
              <p className="text-gray-600 text-sm">
                Set your own prices and work on your schedule
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-semibold mb-2">Reach Customers</h3>
              <p className="text-gray-600 text-sm">
                Connect with customers looking for your services
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-semibold mb-2">Verified Platform</h3>
              <p className="text-gray-600 text-sm">
                Build trust with our verification system
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  1
                </span>
                <div>
                  <h4 className="font-semibold">Sign Up</h4>
                  <p className="text-gray-600 text-sm">
                    Create your provider account and complete your profile
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  2
                </span>
                <div>
                  <h4 className="font-semibold">Get Approved</h4>
                  <p className="text-gray-600 text-sm">
                    Our admin team will review and approve your application
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                  3
                </span>
                <div>
                  <h4 className="font-semibold">Start Earning</h4>
                  <p className="text-gray-600 text-sm">
                    Add your services and start receiving bookings
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
          >
            Get Started
          </button>
          <p className="mt-4 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
