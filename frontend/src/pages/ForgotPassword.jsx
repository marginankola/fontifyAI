import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter New Password
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      // TODO: Backend API Call to verify email exists & send code
      console.log('Verifying email:', formData.email);
      setStep(2);
    } else {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      // TODO: Backend API Call to reset password in DB
      console.log('Resetting password for', formData.email, 'with new password', formData.newPassword);
      alert('Password reset successful!');
      navigate('/login');
    }
  };

  // Mouse movement tracking for lighting effects
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  autoComplete="email"
                />
              </div>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Create new password"
                    value={formData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg border border-white/30 transition-all duration-200 backdrop-blur-sm transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
              }}
            >
              {step === 1 ? 'Next' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
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
