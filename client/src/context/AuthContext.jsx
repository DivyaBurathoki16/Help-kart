import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      // If OTP is required, return email for OTP verification
      if (response.data.message && response.data.message.includes('OTP')) {
        return {
          success: true,
          requiresOTP: true,
          email: response.data.email,
          message: response.data.message,
        };
      }
      
      // Direct login (for admin or if OTP is bypassed)
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp,
      });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        message: errorData.message || 'OTP verification failed',
        otpLocked: errorData.otpLocked || false,
        remainingAttempts: errorData.remainingAttempts,
        errorCode: errorData.errorCode,
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email,
      });
      return {
        success: true,
        message: response.data.message || 'Password reset OTP sent to your email.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset OTP',
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
      };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        message: errorData.message || 'Password reset failed',
        otpLocked: errorData.otpLocked || false,
        remainingAttempts: errorData.remainingAttempts,
        errorCode: errorData.errorCode,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed';
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Validation errors
        errorMessage = errorData.errors.map(err => err.msg || err.message).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyOTP,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
