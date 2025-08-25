// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from './pages/LoadingScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ExploreFonts from './pages/Explorefonts';   // NEW
import FontDetails from './pages/FontDetails';     // Placeholder (later use)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />

        {/* New Routes */}
        <Route path="/explore-fonts" element={<ExploreFonts />} />
        <Route path="/fonts/:family" element={<FontDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
