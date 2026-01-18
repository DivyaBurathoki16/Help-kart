import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/ui/PasswordInput';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleFromUrl === 'provider' ? 'provider' : 'customer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      if (formData.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-neutral-950/50 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-6">Create your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                style={{ caretColor: '#3b82f6' }}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ caretColor: '#3b82f6' }}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Phone (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{ caretColor: '#3b82f6' }}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                I want to
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Find Services</option>
                <option value="provider">Offer Services</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-blue-500/30 ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign up'
              )}
            </button>

            <div className="text-center">
              <span className="text-sm text-slate-600 dark:text-neutral-300">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
