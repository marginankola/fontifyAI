import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickedBubble, setClickedBubble] = useState(null);
  const animationFrameRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Memoize font families and letters for floating bubbles
  const fontFamilies = useMemo(() => [
    'Montez', 'Vampiro One', 'Marck Script', 'Butterfly Kids',
    'Dancing Script', 'Grenze Gotisch'
  ], []);

  const letters = useMemo(() => ['F', 'O', 'N', 'T', 'I', 'F'], []);

  // Mouse tracking for ambient effects
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
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [updateMousePosition]);

  // Handle bubble click
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
    <div className="min-h-screen w-screen bg-black text-white flex flex-col overflow-x-hidden relative">
      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montez&family=Vampiro+One&family=Marck+Script&family=Butterfly+Kids&family=Dancing+Script&family=Grenze+Gotisch:wght@100..900&display=swap"
        rel="stylesheet"
      />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-50" />

      {/* Dynamic background light following mouse */}
      <div 
        className="fixed pointer-events-none transition-all duration-500 ease-out z-0"
        style={{
          top: mousePosition.y - 150,
          left: mousePosition.x - 150,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <Header />

      <main className="flex-grow pt-20 w-full relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 relative">
          {/* Floating Font Bubbles */}
          {letters.map((letter, index) => {
            const isClicked = clickedBubble === index;
            const positions = [
              { top: '20%', left: '10%' },
              { top: '30%', right: '15%' },
              { top: '60%', left: '5%' },
              { top: '70%', right: '10%' },
              { top: '15%', left: '50%' },
              { top: '80%', right: '45%' }
            ];
            
            return (
              <div
                key={index}
                className={`
                  absolute w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center
                  cursor-pointer select-none transform transition-all duration-200 ease-out hover:scale-110 z-0
                  ${isClicked ? 'animate-poke' : ''}
                `}
                style={{
                  ...positions[index],
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  fontFamily: fontFamilies[index],
                  animationDelay: `${index * 0.2}s`
                }}
                onClick={() => handleBubbleClick(index)}
              >
                <span 
                  className="text-white text-xl sm:text-2xl lg:text-3xl font-bold select-none transition-all duration-200 ease-out hover:rotate-12"
                  style={{ 
                    fontFamily: fontFamilies[index],
                    textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {letter}
                </span>
                {isClicked && (
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
                )}
              </div>
            );
          })}

          {/* Main Content */}
          <div className="text-center max-w-6xl mx-auto relative z-10">
            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-wide leading-tight">
              <span className="block text-white/90 mb-2">Welcome to</span>
              <span 
                className="block text-white bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent"
                style={{ textShadow: '0 4px 20px rgba(255, 255, 255, 0.2)' }}
              >
                FontifyAI
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover, manage, and organize your perfect font bundles with the power of AI. 
              Transform your design workflow with intelligent font recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white text-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)'
                }}
              >
                Explore Fonts
              </button>
              <button className="px-8 py-4 text-white text-lg font-medium hover:text-gray-200 transition-all duration-200 hover:underline underline-offset-4">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-8 lg:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 text-white/90">
              Why Choose FontifyAI?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "AI-Powered Recommendations",
                  description: "Get intelligent font suggestions based on your design context and preferences.",
                  icon: "🤖"
                },
                {
                  title: "Vast Font Library",
                  description: "Access thousands of premium fonts from top foundries and independent designers.",
                  icon: "📚"
                },
                {
                  title: "Smart Organization",
                  description: "Organize fonts into collections, tags, and projects for better workflow management.",
                  icon: "🎯"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

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
      `}</style>
    </div>
  );
};

export default Home;
