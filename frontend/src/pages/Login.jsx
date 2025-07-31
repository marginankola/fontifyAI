import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api'; // Axios instance for API calls

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Enhanced state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Additional states for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickedBubble, setClickedBubble] = useState(null);
  const animationFrameRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Memoize font families and letters to prevent recreation on every render
  const fontFamilies = useMemo(() => [
    'Montez', 'Vampiro One', 'Marck Script', 'Butterfly Kids',
    'Dancing Script', 'Grenze Gotisch', 'Lugrasimo', 'Rubik Moonrocks',
    'Lavishly Yours', 'Neonderthaw', 'Just Me Again Down Here', 'Sedgwick Ave Display'
  ], []);

  const letters = useMemo(() => ['F', 'O', 'N', 'T', 'F', 'O', 'N', 'T', 'F', 'O', 'N', 'T'], []);

  // Check for data passed from signup page
  useEffect(() => {
    if (location.state) {
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      if (location.state.message) {
        setSuccessMessage(location.state.message);
        // Clear the message after showing it
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    }
  }, [location.state]);

  // Optimized mouse tracking with throttling to prevent lag
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

    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [updateMousePosition]);

  // Enhanced input change handler
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    
    // Clear errors when user starts typing
    setErrors({});
    setSuccessMessage('');
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Professional login form submission with comprehensive error handling
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    // Frontend validation
    const validationErrors = {};
    
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      validationErrors.password = 'Password is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare login data
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const response = await api.post('/auth/login', loginData);
      
      // Success handling
      console.log('Login successful:', response.data);
      
      // Store token if provided (for authentication)
      if (response.data.token) {
        if (rememberMe) {
          localStorage.setItem('authToken', response.data.token);
        } else {
          sessionStorage.setItem('authToken', response.data.token);
        }
      }
      
      // Show success message briefly
      setSuccessMessage('Login successful! Welcome back.');
      
      // Clear form
      setFormData({
        email: '',
        password: ''
      });
      
      // Redirect to home after brief delay
      setTimeout(() => {
        navigate('/home');
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      
      setIsLoading(false); // Reset loading state on error
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        // Handle specific backend errors
        if (err.response.status === 400) {
          if (errorData.msg && errorData.msg.includes('email')) {
            setErrors({ 
              email: 'Please enter a valid email address.' 
            });
          } else if (errorData.msg && errorData.msg.includes('password')) {
            setErrors({ 
              password: 'Password is required.' 
            });
          } else {
            setErrors({ 
              general: errorData.msg || 'Please check your login credentials.' 
            });
          }
        } else if (err.response.status === 401) {
          // Unauthorized - wrong credentials
          setErrors({ 
            general: 'Invalid email or password. Please check your credentials and try again.' 
          });
        } else if (err.response.status === 404) {
          // User not found
          setErrors({ 
            email: 'No account found with this email address. Please sign up first.' 
          });
        } else if (err.response.status === 422) {
          // Validation error
          setErrors({ 
            general: 'Please check your email and password format.' 
          });
        } else {
          setErrors({ 
            general: 'Login failed. Please try again later.' 
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
  }, [formData, rememberMe, navigate]);

  // Optimized shadow calculation with memoization
  const calculateShadow = useCallback((elementX, elementY) => {
    const deltaX = mousePosition.x - elementX;
    const deltaY = mousePosition.y - elementY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Create shadow on opposite side of mouse
    const shadowX = deltaX > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    const shadowY = deltaY > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    
    return `${shadowX}px ${shadowY}px 30px rgba(255, 255, 255, 0.18)`;
  }, [mousePosition]);

  // Handle bubble click with poke effect
  const handleBubbleClick = useCallback((index) => {
    setClickedBubble(index);
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setClickedBubble(null);
    }, 400);
  }, []);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montez&family=Vampiro+One&family=Marck+Script&family=Butterfly+Kids&family=Dancing+Script&family=Grenze+Gotisch:wght@100..900&family=Lugrasimo&family=Rubik+Moonrocks&family=Lavishly+Yours&family=Neonderthaw&family=Just+Me+Again+Down+Here&family=Sedgwick+Ave+Display&display=swap"
        rel="stylesheet"
      />
            
      {/* Main Container - Split Layout */}
      <div className="h-full flex">
        
        {/* Left Section - Design Area with Font Bubbles */}
        <div className="w-1/2 h-full flex items-center justify-center relative">
          {/* Background gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-50"></div>
          
          {/* Font Bubbles Grid - 3 rows x 4 columns */}
          <div className="grid grid-cols-4 gap-8 z-10 relative">
            {Array.from({ length: 12 }).map((_, index) => {
              // Calculate position for each bubble (for shadow calculation)
              const row = Math.floor(index / 4);
              const col = index % 4;
              const elementX = typeof window !== 'undefined' ? window.innerWidth * 0.25 + (col - 1.5) * 152 : 0;
              const elementY = typeof window !== 'undefined' ? window.innerHeight * 0.5 + (row - 1) * 152 : 0;
              
              const isClicked = clickedBubble === index;
              
              return (
                <div
                  key={index}
                  className={`
                    w-[100px] h-[100px] rounded-full flex items-center justify-center relative 
                    cursor-pointer select-none transform transition-all duration-200 ease-out 
                    hover:scale-105 active:scale-95
                    ${isClicked ? 'animate-poke' : ''}
                  `}
                  style={{
                    // Glassmorphism effect
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: `
                      ${calculateShadow(elementX, elementY)},
                      inset 0 1px 0 rgba(255, 255, 255, 0.1),
                      0 4px 20px rgba(0, 0, 0, 0.3)
                    `,
                    fontFamily: fontFamilies[index],
                    // Performance optimization: use transform3d for hardware acceleration
                    transform: isClicked ? 'translate3d(0, 8px, 0) scale(0.95)' : 'translate3d(0, 0, 0) scale(1)',
                  }}
                  onClick={() => handleBubbleClick(index)}
                  onMouseEnter={(e) => {
                    // Add hover effect without causing re-renders
                    e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    // Reset hover effect
                    e.currentTarget.style.transform = isClicked ? 'translate3d(0, 8px, 0) scale(0.95)' : 'translate3d(0, 0, 0) scale(1)';
                  }}
                >
                  {/* Letter inside bubble with hover rotation */}
                  <span 
                    className={`
                      text-white text-4xl font-bold select-none transition-all duration-200 ease-out
                      hover:rotate-12 transform-gpu
                    `}
                    style={{ 
                      fontFamily: fontFamilies[index],
                      textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
                      // Hardware acceleration for smooth rotation
                      backfaceVisibility: 'hidden',
                      perspective: '1000px',
                    }}
                  >
                    {letters[index]}
                  </span>
                  
                  {/* Click ripple effect */}
                  {isClicked && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Brand text below bubbles */}
          <div className="absolute bottom-20 text-center">
            <h1 className="text-white/60 text-2xl font-light tracking-widest">
              FontifyAI
            </h1>
            <p className="text-white/40 text-sm mt-2">Finding Perfect Font Bundles</p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-1/2 h-full flex items-center justify-center relative px-8">
          {/* Dynamic background shadow based on mouse position */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-200 ease-out"
            style={{
              background: typeof window !== 'undefined' ? 
                `radial-gradient(600px circle at ${mousePosition.x - window.innerWidth/2}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)` 
                : 'transparent'
            }}
          ></div>
          
          {/* Login Form Container */}
          <div 
            className="bg-black/40 backdrop-blur-xl p-10 rounded-2xl w-full max-w-md relative z-10 transform transition-all duration-300"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: typeof window !== 'undefined' ? `
                ${calculateShadow(window.innerWidth * 0.75, window.innerHeight * 0.5)},
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 8px 32px rgba(0, 0, 0, 0.4)
              ` : '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to access all fonts</p>
            </div>

            {/* Fixed Height Success/Error Message Container - No Layout Shifting */}
            <div className="w-full h-12 mb-6">
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

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input - Fixed Height Container */}
              <div className="h-20">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                    errors.email
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
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Input - Fixed Height Container */}
              <div className="h-20">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60'
                      : 'border-white/20 focus:ring-white/30 focus:border-white/40'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {/* Fixed height error container */}
                <div className="h-4 mt-1">
                  {errors.password && (
                    <p className="text-red-400 text-xs">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded bg-white/10 border-white/20"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button with Enhanced States */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-semibold py-3 rounded-lg border transition-all duration-200 backdrop-blur-sm transform ${
                  isLoading 
                    ? 'bg-white/5 border-white/20 text-white/50 cursor-not-allowed' 
                    : successMessage
                    ? 'bg-green-500/20 border-green-500/30 text-green-300 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{
                  boxShadow: isLoading ? 'none' : '0 4px 20px rgba(255, 255, 255, 0.1)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : successMessage ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 text-green-400">✓</div>
                    <span>Welcome Back!</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-white hover:text-gray-200 font-semibold transition-colors duration-200"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <div className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
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
      ></div>

      {/* Custom CSS for poke animation */}
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
        
        /* Hardware acceleration for better performance */
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default Login;
