import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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

  // Optimized form input handler
  const handleInputChange = useCallback((field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  // Optimized form submission
  const handleSignup = useCallback((e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // TODO: Add MongoDB signup logic here
    console.log('Signing up with', formData);
    navigate('/home');
  }, [formData, navigate]);

  // Optimized shadow calculation with memoization
  const calculateShadow = useCallback((elementX, elementY) => {
    const deltaX = mousePosition.x - elementX;
    const deltaY = mousePosition.y - elementY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Create shadow on opposite side of mouse with clamping
    const shadowX = deltaX > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    const shadowY = deltaY > 0 ? -Math.min(10, distance / 20) : Math.min(10, distance / 20);
    
    return `${shadowX}px ${shadowY}px 30px rgba(255, 255, 255, 0.18)`;
  }, [mousePosition.x, mousePosition.y]);

  // Optimized bubble click handler
  const handleBubbleClick = useCallback((index) => {
    setClickedBubble(index);
    
    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Set new timeout
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

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4 w-full max-w-[280px]">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                autoComplete="name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                placeholder="Create password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg border border-white/30 transition-all duration-200 backdrop-blur-sm transform hover:scale-[1.02] active:scale-[0.98] text-sm mt-6"
              style={{
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
              }}
            >
              Create Account
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

        {/* Font Bubbles Around the Circle - Now Responsive */}
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
              {/* Letter inside bubble with hover rotation */}
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
              
              {/* Click ripple effect */}
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
