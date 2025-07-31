import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e) => {
    const footerRect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - footerRect.left,
      y: e.clientY - footerRect.top,
    });
  }, []);

  const footerLinks = [
    { name: 'About', path: '/about' },
    { name: 'Terms', path: '/terms' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Support', path: '/support' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: <FaGithub />, url: 'https://github.com/marginankola' },
    { name: 'Twitter', icon: '𝕏', url: 'https://twitter.com/fontifyai' },
    { name: 'LinkedIn', icon: <FaLinkedin />, url: 'https://www.linkedin.com/in/margin-ankola-736b78302' },
  ];

  return (
    <footer 
      className="relative w-full mt-16 bg-black/30 backdrop-blur-lg border-t border-white/10 overflow-hidden"
      onMouseMove={updateMousePosition}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(15,15,15,0.3) 100%), radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.015), transparent 70%)`
      }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent"></div>
      </div>

      {/* Main Footer Content - Compact Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-8 md:py-10">
        
        {/* Top Section - Brand + Links in horizontal layout */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0 mb-8">
          
          {/* Brand Section - Compact */}
          <div className="flex flex-col space-y-3">
            <div className="group flex items-center space-x-3">
              {/* Small logo icon matching header */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 rounded-lg rotate-45 group-hover:rotate-90 transition-all duration-500"></div>
                <span className="relative z-10 text-white font-bold text-sm">F</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wider group-hover:scale-105 transition-transform duration-300">
                FontifyAI
              </h3>
            </div>
            
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              AI-powered typography discovery platform for modern designers.
            </p>
          </div>

          {/* Navigation Links - Horizontal */}
          <div className="flex items-center space-x-8 md:space-x-12">
            {footerLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className="group text-white/70 hover:text-white text-sm font-medium transition-all duration-300 relative"
              >
                <span className="group-hover:translate-y-0.5 transition-transform duration-300">
                  {link.name}
                </span>
                
                {/* Bottom border like header */}
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-white/60 to-transparent group-hover:w-full transition-all duration-500"></div>
              </Link>
            ))}
          </div>

          {/* Social Links - Minimal Design */}
          <div className="flex items-center space-x-3">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 backdrop-blur-sm"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-300 text-white/80 group-hover:text-white">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section - Single line, minimal */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-xs md:text-sm">
          <div className="text-white/50">
            © {new Date().getFullYear()} FontifyAI • Finding Perfect Font Bundles
          </div>
          
          <div className="flex items-center space-x-4 text-white/40">
            <span>Made for designers</span>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <a 
              href="mailto:support@fontifyai.com"
              className="hover:text-white/60 transition-colors duration-300"
            >
              support@fontifyai.com
            </a>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <span>v2.0.1</span>
          </div>
        </div>
      </div>

      {/* Minimal decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Subtle ambient lighting - less intense than header */}
      <div 
        className="fixed pointer-events-none transition-all duration-700 ease-out z-0 opacity-30"
        style={{
          top: mousePosition.y - 50,
          left: mousePosition.x - 50,
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </footer>
  );
};

export default Footer;
