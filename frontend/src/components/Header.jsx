import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Explore Fonts', path: '/explore' },
    { name: 'My Fonts', path: '/my-fonts' },
  ];

  // Mouse tracking for subtle lighting effects
  const updateMousePosition = useCallback((e) => {
    const headerRect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - headerRect.left,
      y: e.clientY - headerRect.top,
    });
  }, []);

  // Scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`w-full h-20 flex items-center justify-between px-8 md:px-12 lg:px-16 fixed top-0 left-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-black/20 backdrop-blur-lg border-b border-white/10'
      }`}
      onMouseMove={updateMousePosition}
      style={{
        background: isScrolled 
          ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.6) 100%), radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03), transparent 70%)`
          : `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.2) 100%), radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.02), transparent 70%)`
      }}
    >
      {/* FontifyAI Logo */}
      <Link 
        to="/home" 
        className="group relative flex items-center space-x-2 transition-all duration-300 hover:scale-105"
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl rotate-45 group-hover:rotate-90 transition-all duration-500"></div>
          <div className="absolute inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-lg rotate-12 group-hover:rotate-45 transition-all duration-700"></div>
          <span className="relative z-10 text-white font-bold text-lg">F</span>
        </div>
        
        <div className="flex flex-col">
          <span 
            className="text-2xl md:text-3xl font-bold tracking-wider bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent group-hover:from-white group-hover:via-white group-hover:to-white/90 transition-all duration-300"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textShadow: '0 0 20px rgba(255,255,255,0.1)'
            }}
          >
            FontifyAI
          </span>
          <div className="h-0.5 w-0 bg-gradient-to-r from-white/60 to-transparent group-hover:w-full transition-all duration-500 mt-1"></div>
        </div>
        
        <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl -m-4"></div>
      </Link>

      {/* Navigation with Focus Blur Effect */}
      <nav 
        className="hidden md:flex items-center space-x-8 lg:space-x-12"
        onMouseLeave={() => setHoveredItem(null)}
      >
        {navItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative text-white text-sm lg:text-base font-medium transition-all duration-300 ${
              location.pathname === item.path 
                ? 'text-white' 
                : 'text-white/80 hover:text-white'
            } ${
              hoveredItem && hoveredItem !== item.name ? 'blur-sm opacity-50' : 'blur-none opacity-100'
            }`}
            onMouseEnter={() => setHoveredItem(item.name)}
            style={{ 
              animationDelay: `${index * 100}ms`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <span className="relative z-10">{item.name}</span>
            
            <div className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-white/80 via-white/60 to-white/40 transition-all duration-500 ${
              location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></div>
            
            <div className="absolute inset-0 bg-white/3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -m-3 blur-sm"></div>
          </Link>
        ))}
      </nav>

      {/* Profile Section - NO BOXES, Clean Design */}
      <div className="flex items-center">
        <Link
          to="/profile"
          className={`group relative flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 ${
            hoveredItem && hoveredItem !== 'Profile' ? 'blur-sm opacity-50' : 'blur-none opacity-100'
          } ${
            location.pathname === '/profile' 
              ? 'text-white' 
              : 'text-white/90 hover:text-white'
          }`}
          onMouseEnter={() => setHoveredItem('Profile')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* Simple Profile Avatar - No box styling */}
          <div className="relative w-8 h-8 md:w-9 md:h-9">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center group-hover:from-white/25 group-hover:to-white/10 transition-all duration-300 backdrop-blur-sm">
              <span className="text-white text-sm md:text-base font-semibold group-hover:scale-110 transition-transform duration-300">
                U
              </span>
            </div>
            
            {/* Subtle online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400/80 rounded-full group-hover:bg-green-400 group-hover:scale-125 transition-all duration-300"></div>
          </div>
          
          {/* Profile Text - Same style as nav items */}
          <span className="hidden sm:block text-sm lg:text-base font-medium group-hover:translate-x-1 transition-all duration-300">
            Profile
          </span>
          
          {/* Bottom border like other nav items */}
          <div className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-white/80 via-white/60 to-white/40 transition-all duration-500 ${
            location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></div>
          
          {/* Same subtle glow as nav items */}
          <div className="absolute inset-0 bg-white/3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -m-3 blur-sm"></div>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-white/80 hover:text-white transition-colors duration-200 ml-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Decorative top border */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>
  );
};

export default Header;
