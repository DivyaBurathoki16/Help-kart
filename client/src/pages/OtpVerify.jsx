import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';
import Card from '../components/ui/Card';

const OtpVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [otpInvalidated, setOtpInvalidated] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
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
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    const result = await verifyOTP(email, otpString);
    setLoading(false);

    if (result.success) {
      const from = location.state?.from || '/';
      navigate(from);
    } else {
      setError(result.message);
      // Check if OTP is locked using structured flag (industry-standard approach)
      if (result.otpLocked) {
        setOtpInvalidated(true);
        setTimer(0); // Stop timer
      }
    }
  };

  const handleRequestNewOtp = () => {
    // Navigate back to login - user will need to re-enter password
    navigate('/login', { 
      state: { 
        email: email,
        from: location.state?.from || '/'
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-slate-600 dark:text-neutral-200">
            Enter the 6-digit code sent to <br />
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

            <div className="space-y-4">
              {!otpInvalidated && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-4 text-center">
                    Enter OTP Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
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
                </div>
              )}

              {!otpInvalidated && timer > 0 && (
                <p className="text-center text-sm text-slate-600 dark:text-neutral-400">
                  OTP expires in: <span className="font-semibold">{formatTime(timer)}</span>
                </p>
              )}

              {!otpInvalidated && timer === 0 && (
                <p className="text-center text-sm text-rose-600 dark:text-rose-400">
                  OTP has expired. Please go back to login and request a new OTP.
                </p>
              )}
            </div>

            {!otpInvalidated ? (
              <div>
                <PrimaryButton type="submit" disabled={loading || timer === 0} className="w-full">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </PrimaryButton>
              </div>
            ) : (
              <div>
                <PrimaryButton
                  type="button"
                  onClick={handleRequestNewOtp}
                  className="w-full"
                >
                  Request New OTP
                </PrimaryButton>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default OtpVerify;
