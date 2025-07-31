import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const fonts = ['Montez','Vampiro One','Marck Script','Rubik Moonrocks'];

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      {/* Google fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Montez&family=Vampiro+One&family=Marck+Script&family=Rubik+Moonrocks&display=swap" rel="stylesheet" />
      
      {/* Bouncing "FONT" bubbles - centered */}
      <div className="flex space-x-5 justify-center">
        {['F','O','N','T'].map((l,i)=>(
          <div
            key={i}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/20 animate-bounce"
            style={{
              animationDelay:`${i*0.12}s`,
              fontFamily:fonts[i],
              boxShadow:'0 4px 15px rgba(255,255,255,0.08)',
              backdropFilter:'blur(8px)'
            }}
          >
            <span className="text-2xl font-bold text-white">{l}</span>
          </div>
        ))}
      </div>

      {/* Loading text - centered */}
      <div className="mt-8 text-center">
        <h1 className="text-white/60 text-xl font-light tracking-widest">FontifyAI</h1>
        <p className="text-gray-400 tracking-widest animate-pulse text-sm mt-2">Welcome…</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
