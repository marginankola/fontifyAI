import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Axios instance for API calls

const Signup = () => {
  const navigate = useNavigate();
  
  // Updated formData to match backend requirements
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Enhanced state management for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickedBubble, setClickedBubble] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });
  
  // Refs for performance optimization
  const animationFrameRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Memoize constants for better performance
  const constants = useMemo(() => ({
    BUBBLE_COUNT: 12,
    BUBBLE_RADIUS: 340,
    FORM_SIZE: 550,
    BUBBLE_SIZE: 100
  }), []);

  // Memoize font families and letters
  const fontFamilies = useMemo(() => [
    'Montez', 'Vampiro One', 'Marck Script', 'Butterfly Kids',
    'Dancing Script', 'Grenze Gotisch', 'Lugrasimo', 'Rubik Moonrocks',
    'Lavishly Yours', 'Neonderthaw', 'Just Me Again Down Here', 'Sedgwick Ave Display'
  ], []);

  const letters = useMemo(() => ['F', 'O', 'N', 'T', 'F', 'O', 'N', 'T', 'F', 'O', 'N', 'T'], []);

  // Fixed: Now bubble positions update when window size changes
  const bubblePositions = useMemo(() => {
    return Array.from({ length: constants.BUBBLE_COUNT }).map((_, index) => {
      const angle = (index * 360) / constants.BUBBLE_COUNT;
      const centerX = windowSize.width / 2;
      const centerY = windowSize.height / 2;
      
      const x = centerX + constants.BUBBLE_RADIUS * Math.cos((angle * Math.PI) / 180);
      const y = centerY + constants.BUBBLE_RADIUS * Math.sin((angle * Math.PI) / 180);
      
      return { x, y, angle };
    });
  }, [constants.BUBBLE_COUNT, constants.BUBBLE_RADIUS, windowSize.width, windowSize.height]);

  // Handle window resize
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  // Optimized mouse tracking with throttling
  const updateMousePosition = useCallback((e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  useEffect(() => {
    const throttledMouseMove = (e) => {
      if (animationFrameRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(() => {
        updateMousePosition(e);
        animationFrameRef.current = null;
      });
    };

    // Add resize listener
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [updateMousePosition, handleResize]);

  // Simplified input validation - only basic checks
  const validateField = (field, value) => {
    const newFieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'username':
        if (value.length > 0 && value.length < 3) {
          newFieldErrors.username = 'Username must be at least 3 characters';
        } else if (value.length > 20) {
          newFieldErrors.username = 'Username must be less than 20 characters';
        } else if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
          newFieldErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newFieldErrors.username;
        }
        break;
        
      case 'email':
        if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newFieldErrors.email = 'Please enter a valid email address';
        } else {
          delete newFieldErrors.email;
        }
        break;
        
      case 'password':
        // Simplified - just 6 characters minimum
        if (value.length > 0 && value.length < 6) {
          newFieldErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newFieldErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (value.length > 0 && value !== formData.password) {
          newFieldErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newFieldErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  // Optimized form input handler with real-time validation
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    
    // Clear previous errors
    setErrors({});
    setSuccessMessage('');
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation with debounce
    if (value.length > 0) {
      setTimeout(() => validateField(field, value), 300);
    } else {
      // Clear field error if empty
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData.password]);

  // Simplified form submission
  const handleSignup = useCallback(async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    // Simplified frontend validation
    const validationErrors = {};
    
    if (!formData.username.trim()) {
      validationErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      validationErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }

    // Simplified password validation - just 6 characters and matching
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const signupData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const response = await api.post('/auth/signup', signupData);
      
      // Success handling like live websites
      console.log('Signup successful:', response.data);
      
      // Show success message briefly
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after a brief delay (like live websites)
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: signupData.email,
            message: 'Account created successfully! Please sign in with your new account.'
          }
        });
      }, 1500);
      
    } catch (err) {
      console.error('Signup error:', err);
      
      setIsLoading(false); // Reset loading state on error
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        // Handle specific backend validation errors
        if (err.response.status === 400) {
          if (errorData.msg && errorData.msg.includes('email')) {
            setErrors({ 
              email: 'This email is already registered. Please use a different email or sign in.' 
            });
          } else if (errorData.msg && errorData.msg.includes('username')) {
            setErrors({ 
              username: 'This username is already taken. Please choose a different username.' 
            });
          } else if (errorData.errors) {
            // Handle validation errors from backend
            const backendErrors = {};
            errorData.errors.forEach(error => {
              if (error.path) {
                backendErrors[error.path] = error.msg;
              }
            });
            setErrors(backendErrors);
          } else {
            setErrors({ 
              general: errorData.msg || 'Registration failed. Please check your information and try again.' 
            });
          }
        } else if (err.response.status === 409) {
          // Conflict - user already exists
          setErrors({ 
            email: 'An account with this email already exists. Please sign in instead.' 
          });
        } else if (err.response.status === 422) {
          // Validation error
          setErrors({ 
            general: 'Please check your information and ensure all fields are filled correctly.' 
          });
        } else {
          setErrors({ 
            general: 'Registration failed. Please try again later.' 
          });
        }
      } else if (err.request) {
        // Network error
        setErrors({ 
          general: 'Network error. Please check your internet connection and try again.' 
        });
      } else {
        // Other error
        setErrors({ 
          general: 'An unexpected error occurred. Please try again.' 
        });
      }
    }
  }, [formData, navigate]);

  // Optimized shadow calculation with memoization
  const calculateShadow = useCallback((elementX, elementY) => {
    const deltaX = mousePosition.x - elementX;
    const deltaY = mousePosition.y - elementY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const shadowX = deltaX > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    const shadowY = deltaY > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    
    return `${shadowX}px ${shadowY}px 30px rgba(255, 255, 255, 0.18)`;
  }, [mousePosition.x, mousePosition.y]);

  // Optimized bubble click handler
  const handleBubbleClick = useCallback((index) => {
    setClickedBubble(index);
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setClickedBubble(null);
    }, 400);
  }, []);

  // Fixed: Center position now updates with window size
  const centerPosition = useMemo(() => ({
    x: windowSize.width / 2,
    y: windowSize.height / 2
  }), [windowSize.width, windowSize.height]);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montez&family=Vampiro+One&family=Marck+Script&family=Butterfly+Kids&family=Dancing+Script&family=Grenze+Gotisch:wght@100..900&family=Lugrasimo&family=Rubik+Moonrocks&family=Lavishly+Yours&family=Neonderthaw&family=Just+Me+Again+Down+Here&family=Sedgwick+Ave+Display&display=swap"
        rel="preload"
        as="style"
        onLoad={(e) => { e.target.onload = null; e.target.rel = 'stylesheet'; }}
      />

      {/* Background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-50" />

      {/* Dynamic background shadow based on mouse position */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-200 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)`
        }}
      />

      {/* Central Circular Form Container */}
      <div className="h-full w-full flex items-center justify-center relative">
        {/* Circular Form */}
        <div 
          className="bg-black/40 backdrop-blur-xl p-8 rounded-full flex flex-col items-center justify-center relative z-20 transform transition-all duration-300"
          style={{
            width: `${constants.FORM_SIZE}px`,
            height: `${constants.FORM_SIZE}px`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              ${calculateShadow(centerPosition.x, centerPosition.y)},
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Join FontifyAI</h2>
            <p className="text-gray-400 text-sm">Create your account</p>
          </div>

          {/* Fixed Height Success/Error Message Container - No Layout Shifting */}
          <div className="w-full max-w-[280px] h-12 mb-4">
            {successMessage && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-green-300 text-xs text-center">{successMessage}</p>
              </div>
            )}
            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-red-300 text-xs text-center">{errors.general}</p>
              </div>
            )}
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-3 w-full max-w-[280px]">
            {/* Username Input - Fixed Height Container */}
            <div className="h-16">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 text-sm bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                  errors.username || fieldErrors.username
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                    : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                }`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                autoComplete="username"
                disabled={isLoading}
                minLength={3}
                maxLength={20}
              />
              {/* Fixed height error container */}
              <div className="h-4 mt-1">
                {(errors.username || fieldErrors.username) && (
                  <p className="text-red-400 text-xs">{errors.username || fieldErrors.username}</p>
                )}
              </div>
            </div>

            {/* Email Input - Fixed Height Container */}
            <div className="h-16">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className={`w-full px-3 py-2 text-sm bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
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
              {/* Fixed height error container */}
              <div className="h-4 mt-1">
                {(errors.email || fieldErrors.email) && (
                  <p className="text-red-400 text-xs">{errors.email || fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Password Input - Fixed Height Container */}
            <div className="h-16">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                className={`w-full px-3 py-2 text-sm bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                  errors.password || fieldErrors.password
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                    : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                }`}
                placeholder="Create password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={6}
              />
              {/* Fixed height error container */}
              <div className="h-4 mt-1">
                {(errors.password || fieldErrors.password) && (
                  <p className="text-red-400 text-xs">{errors.password || fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password Input - Fixed Height Container */}
            <div className="h-16">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full px-3 py-2 text-sm bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                  errors.confirmPassword || fieldErrors.confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                    : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                }`}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={6}
              />
              {/* Fixed height error container */}
              <div className="h-4 mt-1">
                {(errors.confirmPassword || fieldErrors.confirmPassword) && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword || fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(fieldErrors).length > 0}
              className={`w-full font-semibold py-2.5 rounded-lg border transition-all duration-200 backdrop-blur-sm transform text-sm mt-4 ${
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : successMessage ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 text-green-400">✓</div>
                  <span>Redirecting...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-400 text-xs">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-white hover:text-gray-200 font-semibold transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Font Bubbles Around the Circle */}
        {bubblePositions.map((position, index) => {
          const isClicked = clickedBubble === index;
          
          return (
            <div
              key={index}
              className={`
                rounded-full flex items-center justify-center absolute
                cursor-pointer select-none transform transition-all duration-200 ease-out 
                hover:scale-105 active:scale-95 z-10
                ${isClicked ? 'animate-poke' : ''}
              `}
              style={{
                width: `${constants.BUBBLE_SIZE}px`,
                height: `${constants.BUBBLE_SIZE}px`,
                left: position.x - constants.BUBBLE_SIZE / 2,
                top: position.y - constants.BUBBLE_SIZE / 2,
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: `
                  ${calculateShadow(position.x, position.y)},
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 4px 20px rgba(0, 0, 0, 0.3)
                `,
                fontFamily: fontFamilies[index],
                transform: isClicked ? 'translate3d(0, 8px, 0) scale(0.95)' : 'translate3d(0, 0, 0) scale(1)',
              }}
              onClick={() => handleBubbleClick(index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isClicked ? 'translate3d(0, 8px, 0) scale(0.95)' : 'translate3d(0, 0, 0) scale(1)';
              }}
            >
              <span 
                className="text-white text-4xl font-bold select-none transition-all duration-200 ease-out hover:rotate-12 transform-gpu"
                style={{ 
                  fontFamily: fontFamilies[index],
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
                  backfaceVisibility: 'hidden',
                  perspective: '1000px',
                }}
              >
                {letters[index]}
              </span>
              
              {isClicked && (
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
              )}
            </div>
          );
        })}

        {/* Brand text at bottom */}
        <div className="absolute bottom-10 text-center w-full">
          <h1 className="text-white/60 text-2xl font-light tracking-widest">
            FontifyAI
          </h1>
          <p className="text-white/40 text-sm mt-2">Finding Perfect Font Bundles</p>
        </div>
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes poke {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          25% { transform: translate3d(0, 8px, 0) scale(0.95); }
          50% { transform: translate3d(0, 12px, 0) scale(0.9); }
          75% { transform: translate3d(0, 4px, 0) scale(0.98); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        
        .animate-poke {
          animation: poke 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default Signup;
