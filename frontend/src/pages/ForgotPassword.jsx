import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  // Enhanced input validation
  const validateField = (field, value) => {
    const newFieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newFieldErrors.email = 'Please enter a valid email address';
        } else {
          delete newFieldErrors.email;
        }
        break;
        
      case 'newPassword':
        if (value.length > 0 && value.length < 6) {
          newFieldErrors.newPassword = 'Password must be at least 6 characters';
        } else {
          delete newFieldErrors.newPassword;
        }
        break;
        
      case 'confirmPassword':
        if (value.length > 0 && value !== formData.newPassword) {
          newFieldErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newFieldErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    
    setErrors({});
    setSuccessMessage('');
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (value.length > 0) {
      setTimeout(() => validateField(field, value), 300);
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData.newPassword]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      if (step === 1) {
        if (!formData.email.trim()) {
          setErrors({ email: 'Email is required' });
          return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setErrors({ email: 'Please enter a valid email address' });
          return;
        }

        setIsLoading(true);

        const emailData = { email: formData.email.trim().toLowerCase() };
        const response = await api.post('/auth/forgot-password', emailData);
        
        setSuccessMessage('Email verified! Now create your new password.');
        
        setTimeout(() => {
          setStep(2);
          setSuccessMessage('');
          setIsLoading(false);
        }, 1500);

      } else {
        const validationErrors = {};
        
        if (!formData.newPassword) {
          validationErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
          validationErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
          validationErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
          validationErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        setIsLoading(true);

        const resetData = {
          email: formData.email.trim().toLowerCase(),
          newPassword: formData.newPassword
        };

        const response = await api.post('/auth/reset-password', resetData);
        
        setSuccessMessage('Password reset successful! Redirecting to login...');
        
        setFormData({
          email: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          navigate('/login', {
            state: {
              email: resetData.email,
              message: 'Password reset successful! Please sign in with your new password.'
            }
          });
        }, 2000);
      }

    } catch (err) {
      console.error('Forgot password error:', err);
      setIsLoading(false);
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        if (err.response.status === 404) {
          setErrors({ 
            email: 'No account found with this email address. Please check your email or create a new account.' 
          });
        } else if (err.response.status === 400) {
          if (step === 1) {
            setErrors({ 
              email: errorData.msg || errorData.message || 'Please enter a valid email address.' 
            });
          } else {
            setErrors({ 
              general: errorData.msg || errorData.message || 'Password reset failed. Please try again.' 
            });
          }
        } else {
          setErrors({ 
            general: 'Something went wrong. Please try again later.' 
          });
        }
      } else {
        setErrors({ 
          general: 'Network error. Please check your connection and try again.' 
        });
      }
    }
  }, [step, formData, navigate]);

  const updateMousePosition = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const throttledMouseMove = (e) => {
      if (animationFrameRef.current) return;
      animationFrameRef.current = requestAnimationFrame(() => {
        updateMousePosition(e);
        animationFrameRef.current = null;
      });
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateMousePosition]);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-50" />

      {/* Dynamic background shadow based on mouse position */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-200 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)`
        }}
      />

      {/* Main Form Container */}
      <div className="h-full w-full flex items-center justify-center relative z-10">
        <div 
          className="bg-black/40 backdrop-blur-xl p-10 rounded-2xl w-full max-w-md relative z-20 transform transition-all duration-300"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
            <p className="text-gray-400">
              {step === 1 ? 'Enter your registered email' : 'Create your new password'}
            </p>
          </div>

          {/* FIXED: Always render message container with fixed height - NO OVERLAPPING */}
          <div className="w-full mb-6" style={{ minHeight: '60px' }}>
            {successMessage && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-green-300 text-xs text-center">{successMessage}</p>
              </div>
            )}
            {!successMessage && errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-red-300 text-xs text-center break-words">{errors.general}</p>
              </div>
            )}
          </div>

          {/* Form with GUARANTEED SPACING */}
          <div className="space-y-6">
            {step === 1 && (
              /* Email Input with FIXED SPACING */
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                    errors.email || fieldErrors.email
                      ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                      : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
                {/* FIXED: Error message with reserved space */}
                <div className="mt-2" style={{ minHeight: '16px' }}>
                  {(errors.email || fieldErrors.email) && (
                    <p className="text-red-400 text-xs break-words">{errors.email || fieldErrors.email}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                {/* New Password Input with FIXED SPACING */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                      errors.newPassword || fieldErrors.newPassword
                        ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                        : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                    }`}
                    placeholder="Create new password"
                    value={formData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    minLength={6}
                  />
                  {/* FIXED: Error message with reserved space */}
                  <div className="mt-2" style={{ minHeight: '16px' }}>
                    {(errors.newPassword || fieldErrors.newPassword) && (
                      <p className="text-red-400 text-xs break-words">{errors.newPassword || fieldErrors.newPassword}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password Input with FIXED SPACING */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                      errors.confirmPassword || fieldErrors.confirmPassword
                        ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                        : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                    }`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    minLength={6}
                  />
                  {/* FIXED: Error message with reserved space */}
                  <div className="mt-2" style={{ minHeight: '16px' }}>
                    {(errors.confirmPassword || fieldErrors.confirmPassword) && (
                      <p className="text-red-400 text-xs break-words">{errors.confirmPassword || fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* FIXED: Submit Button with GUARANTEED SEPARATION */}
            <div className="pt-6">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || Object.keys(fieldErrors).length > 0}
                className={`w-full font-semibold py-3 rounded-lg border transition-all duration-200 backdrop-blur-sm transform ${
                  isLoading 
                    ? 'bg-white/5 border-white/20 text-white/50 cursor-not-allowed' 
                    : Object.keys(fieldErrors).length > 0
                    ? 'bg-white/5 border-white/20 text-white/50 cursor-not-allowed'
                    : successMessage
                    ? 'bg-green-500/20 border-green-500/30 text-green-300 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{
                  boxShadow: (isLoading || Object.keys(fieldErrors).length > 0) ? 'none' : '0 4px 20px rgba(255, 255, 255, 0.1)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                    <span>{step === 1 ? 'Verifying Email...' : 'Resetting Password...'}</span>
                  </div>
                ) : successMessage ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 text-green-400">✓</div>
                    <span>{step === 1 ? 'Email Verified!' : 'Password Reset!'}</span>
                  </div>
                ) : (
                  step === 1 ? 'Verify Email' : 'Reset Password'
                )}
              </button>
            </div>

            {/* Back to Login Link - FIXED POSITIONING */}
            <div className="text-center pt-4">
              <p className="text-gray-400">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200 font-semibold transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>

      {/* Brand text at bottom */}
      <div className="absolute bottom-10 text-center w-full">
        <h1 className="text-white/60 text-2xl font-light tracking-widest">
          FontifyAI
        </h1>
        <p className="text-white/40 text-sm mt-2">Finding Perfect Font Bundles</p>
      </div>

      {/* Ambient lighting effect */}
      <div 
        className="fixed pointer-events-none transition-all duration-500 ease-out z-0"
        style={{
          top: mousePosition.y - 100,
          left: mousePosition.x - 100,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default ForgotPassword;
