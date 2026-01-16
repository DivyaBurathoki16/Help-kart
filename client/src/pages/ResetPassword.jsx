import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import Card from '../components/ui/Card';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [otpInvalidated, setOtpInvalidated] = useState(false);
  const { resetPassword, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Timer countdown - only if OTP is not invalidated
    if (!otpInvalidated) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [email, navigate, otpInvalidated]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value.slice(-1);
    setFormData({ ...formData, otp: newOtp });

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setFormData({ ...formData, otp: newOtp.slice(0, 6) });

    const lastIndex = Math.min(pastedData.length - 1, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const otpString = formData.otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, otpString, formData.newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
      // Check if OTP is locked using structured flag (industry-standard approach)
      if (result.otpLocked) {
        setOtpInvalidated(true);
        setTimer(0); // Stop timer
      }
    }
  };

  const handleRequestNewOtp = async () => {
    setError('');
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      // Reset state and restart timer
      setOtpInvalidated(false);
      setTimer(600); // Reset to 10 minutes
      setFormData({
        otp: ['', '', '', '', '', ''],
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
      setSuccess('A new OTP has been sent to your email.');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-slate-600 dark:text-neutral-200">
            Enter the OTP sent to <br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>
        <Card className="p-8 dark:bg-neutral-800 dark:border-neutral-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-4">
              {!otpInvalidated && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-4 text-center">
                    Enter OTP Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={otpInvalidated}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 dark:border-neutral-600 dark:bg-neutral-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ))}
                  </div>
                  {timer > 0 && (
                    <p className="text-center text-sm text-slate-600 dark:text-neutral-400 mt-2">
                      OTP expires in: <span className="font-semibold">{formatTime(timer)}</span>
                    </p>
                  )}
                </div>
              )}

              {!otpInvalidated && (
                <>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 dark:bg-neutral-700 placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 dark:bg-neutral-700 placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 backdrop-blur-sm transition-all duration-300"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>

            {!otpInvalidated ? (
              <div>
                <PrimaryButton type="submit" disabled={loading || timer === 0} className="w-full">
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </PrimaryButton>
              </div>
            ) : (
              <div>
                <PrimaryButton
                  type="button"
                  onClick={handleRequestNewOtp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Sending New OTP...' : 'Request New OTP'}
                </PrimaryButton>
              </div>
            )}

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
