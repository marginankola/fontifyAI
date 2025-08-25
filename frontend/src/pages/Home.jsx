import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [selectedFont, setSelectedFont] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentTitleFont, setCurrentTitleFont] = useState(0);

  // Updated filter states based on Google Fonts API
  const [filters, setFilters] = useState({
    searchText: 'The quick brown fox jumps over the lazy dog',
    fontSize: 40,
    category: 'all',
    variants: 'all',
    subsets: 'all',
    sort: 'popularity'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // API state management
  const [fonts, setFonts] = useState([]);
  const [filteredFonts, setFilteredFonts] = useState([]);
  const [titleFonts, setTitleFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFonts, setTotalFonts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const animationFrameRef = useRef(null);
  const sectionsRef = useRef([]);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Google Fonts categories
  const fontCategories = useMemo(() => [
    { key: 'all', label: 'All Categories' },
    { key: 'serif', label: 'Serif' },
    { key: 'sans-serif', label: 'Sans Serif' },
    { key: 'display', label: 'Display' },
    { key: 'handwriting', label: 'Handwriting' },
    { key: 'monospace', label: 'Monospace' }
  ], []);

  // Font variants/weights based on Google Fonts API
  const fontVariants = useMemo(() => [
    { key: 'all', label: 'All Weights' },
    { key: '100', label: 'Thin (100)' },
    { key: '200', label: 'Extra Light (200)' },
    { key: '300', label: 'Light (300)' },
    { key: 'regular', label: 'Regular (400)' },
    { key: '500', label: 'Medium (500)' },
    { key: '600', label: 'Semi Bold (600)' },
    { key: '700', label: 'Bold (700)' },
    { key: '800', label: 'Extra Bold (800)' },
    { key: '900', label: 'Black (900)' },
    { key: 'italic', label: 'Italic' }
  ], []);

  // Font subsets based on Google Fonts API
  const fontSubsets = useMemo(() => [
    { key: 'all', label: 'All Languages' },
    { key: 'latin', label: 'Latin' },
    { key: 'latin-ext', label: 'Latin Extended' },
    { key: 'cyrillic', label: 'Cyrillic' },
    { key: 'cyrillic-ext', label: 'Cyrillic Extended' },
    { key: 'greek', label: 'Greek' },
    { key: 'greek-ext', label: 'Greek Extended' },
    { key: 'vietnamese', label: 'Vietnamese' },
    { key: 'arabic', label: 'Arabic' },
    { key: 'devanagari', label: 'Devanagari' },
    { key: 'hebrew', label: 'Hebrew' },
    { key: 'thai', label: 'Thai' },
    { key: 'korean', label: 'Korean' },
    { key: 'japanese', label: 'Japanese' }
  ], []);

  // Sort options
  const sortOptions = useMemo(() => [
    { key: 'popularity', label: 'Popular' },
    { key: 'trending', label: 'Trending' },
    { key: 'alpha', label: 'Alphabetical' },
    { key: 'date', label: 'Recently Added' },
    { key: 'style', label: 'Most Styles' }
  ], []);

  // Enhanced API functions - Fixed to properly handle filtering and show 8 results
  const fetchFonts = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sort: filters.sort,
        page: 1,
        pageSize: 32 // Fetch more to filter on frontend
      };

      // Backend filters (these work with your API)
      if (filters.category !== 'all') {
        params.categories = filters.category;
      }
      if (filters.subsets !== 'all') {
        params.subset = filters.subsets;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/fonts/google`, { params });

      if (response.data && response.data.items) {
        let newFonts = response.data.items;

        // Frontend filtering for variants (since backend doesn't support this)
        if (filters.variants !== 'all') {
          newFonts = newFonts.filter(font => {
            if (!font.variants) return false;
            return font.variants.includes(filters.variants);
          });
        }

        setFonts(newFonts);
        setTotalFonts(response.data.total || newFonts.length);
        setHasMore(newFonts.length > 8);
        setCurrentPage(2);
      }
    } catch (err) {
      console.error('Error fetching fonts:', err);
      setError('Unable to load fonts at the moment. Please try again.');
      setFonts([]);
      setTotalFonts(0);
    } finally {
      setLoading(false);
    }
  }, [filters.sort, filters.category, filters.variants, filters.subsets, searchQuery]);

  // Fetch random fonts for title animation
  const fetchTitleFonts = useCallback(async () => {
    // Always use your selected fonts instead of random API fonts
    setTitleFonts(['Montez', 'Vampiro One', 'Marck Script', 'Butterfly Kids', 'Dancing Script', 'Grenze Gotisch', 'Lugrasimo', 'Rubik Moonrocks', 'Lavishly Yours', 'Neonderthaw', 'Just Me Again Down Here', 'Sedgwick Ave Display']);
  }, []);


  // Load font CSS dynamically
  const loadFontCSS = useCallback(async (fontFamily) => {
    try {
      const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400&display=swap`;
      link.setAttribute('data-font', fontFamily);
      document.head.appendChild(link);
    } catch (err) {
      console.error(`Error loading font ${fontFamily}:`, err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFonts(true);
    fetchTitleFonts();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchFonts(true);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchFonts]);

  // Load title fonts CSS
  useEffect(() => {
    titleFonts.forEach(font => {
      loadFontCSS(font);
    });
  }, [titleFonts, loadFontCSS]);

  // Auto-change title font
  useEffect(() => {
    if (titleFonts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTitleFont((prev) => (prev + 1) % titleFonts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titleFonts.length]);

  // Enhanced mouse and scroll tracking
  const updateMousePosition = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const updateScrollPosition = useCallback(() => {
    setScrollY(window.scrollY);
    const windowHeight = window.innerHeight;
    const currentSection = Math.floor(window.scrollY / (windowHeight * 0.8));
    setActiveSection(currentSection);
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
    window.addEventListener('scroll', updateScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      window.removeEventListener('scroll', updateScrollPosition);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateMousePosition, updateScrollPosition]);

  // Filter fonts to show only 8
  useEffect(() => {
    setFilteredFonts(fonts.slice(0, 8));
  }, [fonts]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Enhanced reset function
  const resetAllFilters = useCallback(() => {
    setFilters({
      searchText: 'The quick brown fox jumps over the lazy dog',
      fontSize: 40,
      category: 'all',
      variants: 'all',
      subsets: 'all',
      sort: 'popularity'
    });
    setSearchQuery('');
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  // Handle variants selection
  const handleVariantsSelect = useCallback((variant) => {
    setFilters(prev => ({ ...prev, variants: variant }));
  }, []);

  // Handle subsets selection
  const handleSubsetsSelect = useCallback((subset) => {
    setFilters(prev => ({ ...prev, subsets: subset }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortType) => {
    setFilters(prev => ({ ...prev, sort: sortType }));
  }, []);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Load more fonts - redirect to explore-fonts page
  const handleLoadMore = useCallback(() => {
    const queryParams = new URLSearchParams({
      category: filters.category,
      variants: filters.variants,
      subsets: filters.subsets,
      sort: filters.sort,
      search: searchQuery
    }).toString();

    window.location.href = `/explore-fonts?${queryParams}`;
  }, [filters, searchQuery]);

  const openFontPopup = useCallback((font) => {
    setSelectedFont(font);
    setShowPopup(true);
    loadFontCSS(font.family);
  }, [loadFontCSS]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* Advanced Background System - No maze pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />

      {/* Enhanced Mouse Shadow Effect - Only gradients and parallax */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

        <div
          className="absolute w-80 h-80 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 160,
            top: mousePosition.y - 160,
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 30%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute w-40 h-40 pointer-events-none transition-all duration-200 ease-out"
          style={{
            left: mousePosition.x - 80,
            top: mousePosition.y - 80,
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(10px)',
          }}
        />
      </div>

      <Header />

      <main className="flex-grow pt-20 relative z-20" style={{ width: '100%' }}>
        {/* Enhanced Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative" style={{ width: '100%', padding: '0 1rem' }}>
          <div className="text-center relative z-10" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="relative mb-12">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
                <span className="block text-white/95 mb-6 relative">
                  Discover Perfect
                  <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/3 to-transparent blur-xl"></div>
                </span>
                <span className="block relative overflow-hidden">
                  <div style={{
                    minHeight: '1.4em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: '0.2em'
                  }}>
                    <span
                      className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent transition-all duration-1000 ease-in-out"
                      style={{
                        fontFamily: titleFonts[currentTitleFont] || 'Inter',
                        textShadow: '0 0 60px rgba(255,255,255,0.2)',
                        display: 'inline-block',
                        minWidth: '100%',
                        lineHeight: '1.2',
                        overflow: 'visible'
                      }}
                    >
                      Fonts Instantly
                    </span>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </span>
              </h1>
            </div>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-16 leading-relaxed font-light" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
              Explore, Preview, and Find Fonts with AI Assistance
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <button
                className="group relative px-12 py-6 overflow-hidden rounded-2xl text-white text-xl font-semibold transition-all duration-500 transform hover:scale-105"
                onClick={() => window.location.href = '/explore-fonts'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
                  <div className="w-full h-full bg-black/50 rounded-2xl"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                <span className="relative z-10 flex items-center gap-3">
                  Explore Fonts
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </button>

              <button
                className="group relative px-12 py-6 overflow-hidden rounded-2xl text-white text-xl font-semibold transition-all duration-500 transform hover:scale-105"
                onClick={() => window.location.href = '/ai-font-finder'}
              >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-700 rounded-full"></div>
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  AI Font Finder
                </span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center relative">
              <div className="w-1 h-3 bg-gradient-to-b from-white/60 to-transparent rounded-full mt-2 animate-pulse"></div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-xs font-light">Scroll</div>
            </div>
          </div>
        </section>
        {/* Enhanced Popular Fonts Section */}
        <section className="py-20 relative" style={{ width: '100%', padding: '5rem 1rem' }}>
          <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white/95">
                Popular Font Collection
              </h2>
              <p className="text-xl text-gray-300" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Handpicked fonts loved by designers worldwide
              </p>
            </div>

            {/* Enhanced Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white font-medium backdrop-blur-sm flex items-center justify-between hover:from-white/15 hover:to-white/10 transition-all duration-200"
              >
                <span>Filters & Options {(filters.category !== 'all' || filters.variants !== 'all' || filters.subsets !== 'all' || searchQuery) ? '(Active)' : ''}</span>
                <span className={`transform transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8" style={{ width: '100%' }}>
              {/* Updated Google Fonts API-based Sidebar */}
              <div className={`lg:w-96 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="sticky top-24">
                  <div className="bg-gradient-to-br from-white/8 via-white/4 to-white/8 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar shadow-2xl">

                    {/* Enhanced Reset Button */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                      <button
                        onClick={resetAllFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all duration-200 hover:border-white/20 hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset all
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all duration-200 lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Enhanced Preview Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>

                      <div className="mb-6">
                        <textarea
                          value={filters.searchText}
                          onChange={(e) => handleFilterChange('searchText', e.target.value)}
                          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 resize-none"
                          placeholder="Type something"
                        />
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-300">Font size</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="8"
                              max="84"
                              value={filters.fontSize}
                              onChange={(e) => handleFilterChange('fontSize', Math.min(84, Math.max(8, parseInt(e.target.value) || 8)))}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/15 transition-all duration-200"
                            />


                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="8"
                            max="84"
                            value={filters.fontSize}
                            onChange={(e) => handleFilterChange('fontSize', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <span className="text-white text-sm w-12 text-right">{filters.fontSize}px</span>
                        </div>
                      </div>
                    </div>

                    {/* Updated Google Fonts API Filter Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-6">Filters</h3>

                      {/* Sort Options */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                          </svg>
                          <h4 className="font-medium text-white">Sort by</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {sortOptions.map((sort) => (
                            <button
                              key={sort.key}
                              onClick={() => handleSortChange(sort.key)}
                              className={`p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${filters.sort === sort.key
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
                                }`}
                            >
                              <div className="text-sm font-medium">
                                {sort.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <h4 className="font-medium text-white">Category</h4>
                        </div>
                        <div className="space-y-2">
                          {fontCategories.map((category) => (
                            <button
                              key={category.key}
                              onClick={() => handleCategorySelect(category.key)}
                              className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${filters.category === category.key
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
                                }`}
                            >
                              <div className="text-sm font-medium">
                                {category.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variants/Weight Filter */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                          </svg>
                          <h4 className="font-medium text-white">Weight & Style</h4>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {fontVariants.map((variant) => (
                            <button
                              key={variant.key}
                              onClick={() => handleVariantsSelect(variant.key)}
                              className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${filters.variants === variant.key
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
                                }`}
                            >
                              <div className="text-sm font-medium">
                                {variant.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Subsets/Language Filter */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <h4 className="font-medium text-white">Language Support</h4>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {fontSubsets.map((subset) => (
                            <button
                              key={subset.key}
                              onClick={() => handleSubsetsSelect(subset.key)}
                              className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${filters.subsets === subset.key
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
                                }`}
                            >
                              <div className="text-sm font-medium">
                                {subset.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Right Content Area */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                {/* Enhanced Search with Real-time Results */}
                <div className="mb-8 relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search fonts by name..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full px-6 py-4 pl-14 bg-gradient-to-r from-white/8 to-white/4 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 backdrop-blur-xl text-lg hover:border-white/30"
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Enhanced Search Results Info */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                      {loading ? 'Searching...' : `Showing ${filteredFonts.length} of ${totalFonts} font families`}
                      {(filters.category !== 'all' || filters.variants !== 'all' || filters.subsets !== 'all' || searchQuery) && (
                        <span className="ml-2 text-blue-400">
                          • Filters active
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Sort: {sortOptions.find(s => s.key === filters.sort)?.label}
                    </div>
                  </div>
                </div>

                {/* Enhanced Loading State */}
                {loading && currentPage === 1 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400/60 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 text-lg font-medium mb-2">Discovering fonts...</p>
                      <p className="text-gray-400 text-sm">Fetching from Google Fonts API</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Error State */}
                {error && !loading && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Temporary Loading Issue</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => fetchFonts(true)}
                        className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all duration-200 hover:scale-105"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={resetAllFilters}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200 hover:scale-105"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Enhanced Font Grid - Shows 8 fonts */}
                {!loading && !error && (
                  <div className="space-y-6">
                    {filteredFonts.length > 0 ? (
                      filteredFonts.map((font) => (
                        <div
                          key={font.family}
                          className="group relative bg-gradient-to-br from-white/6 via-white/3 to-white/6 hover:from-white/10 hover:via-white/5 hover:to-white/10 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
                          onClick={() => openFontPopup(font)}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl translate-y-12 -translate-x-12"></div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex-1" style={{ minWidth: 0 }}>
                                <h3 className="text-2xl font-semibold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300 truncate">{font.family}</h3>
                                <p className="text-sm text-gray-400 capitalize flex items-center gap-2 flex-wrap">
                                  <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                                  {font.category} • {font.variants ? font.variants.length : 1} variants
                                  {font.subsets && font.subsets.length > 0 && (
                                    <span className="text-xs text-gray-500">• {font.subsets.slice(0, 2).join(', ')}</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <button
                                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl text-white text-sm transition-all duration-200 backdrop-blur-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFontPopup(font);
                                  }}
                                >
                                  Preview
                                </button>
                                <button
                                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add to favorites functionality here
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className="relative">
                              <div
                                className="text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-300 break-words"
                                style={{
                                  fontFamily: font.family,
                                  fontSize: `${filters.fontSize}px`,
                                  lineHeight: '1.4',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {filters.searchText}
                              </div>

                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No matching fonts found</h3>
                        <p className="text-gray-400 mb-6">Try adjusting your search criteria or explore our popular fonts below</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={resetAllFilters}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200 hover:scale-105"
                          >
                            Reset Filters
                          </button>
                          <button
                            onClick={() => window.location.href = '/explore-fonts'}
                            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all duration-200 hover:scale-105"
                          >
                            Browse All Fonts
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Load More Button - Redirects to explore-fonts */}
                {!loading && !error && filteredFonts.length > 0 && hasMore && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="group relative px-16 py-6 bg-gradient-to-r from-white/8 to-white/4 hover:from-white/12 hover:to-white/6 border border-white/20 hover:border-white/30 rounded-2xl text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>

                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Explore All Fonts
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Enhanced Why Choose FontifyAI */}
        <section className="py-32 relative overflow-hidden" style={{ width: '100%', padding: '8rem 1rem' }}>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
          </div>

          <div className="text-center relative z-10" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="mb-20">
              <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white/95 leading-tight">
                Why Designers Choose
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FontifyAI
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Experience the future of font discovery with our AI-powered platform designed for creative professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "AI-Powered Matching",
                  description: "Upload an image and let our AI identify and suggest similar fonts instantly with 95% accuracy using advanced computer vision.",
                  icon: (
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-purple-500/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ),
                  gradient: "from-purple-500/10 via-purple-500/5 to-pink-500/10",
                  delay: "0s"
                },
                {
                  title: "Curated Collections",
                  description: "Hand-picked font bundles organized by style, mood, and use case for professional projects and brand consistency.",
                  icon: (
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ),
                  gradient: "from-blue-500/10 via-blue-500/5 to-cyan-500/10",
                  delay: "0.2s"
                },
                {
                  title: "Lightning Fast Preview",
                  description: "See how fonts look in real-time with customizable preview text, instant rendering, and advanced typography controls.",
                  icon: (
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-yellow-500/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ),
                  gradient: "from-yellow-500/10 via-yellow-500/5 to-orange-500/10",
                  delay: "0.4s"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group relative p-10 rounded-3xl transform transition-all duration-700 hover:scale-105 cursor-pointer bg-gradient-to-br ${feature.gradient} border border-white/10 hover:border-white/20 backdrop-blur-2xl overflow-hidden`}
                  style={{
                    animationDelay: feature.delay,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl translate-y-12 -translate-x-12"></div>

                  <div className="relative z-10 text-center">
                    <div className="flex justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-100 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Font Statistics Section */}
        <section className="py-20 relative" style={{ width: '100%', padding: '5rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: totalFonts > 0 ? `${Math.floor(totalFonts / 1000)}K+` : "1,500+", label: "Google Fonts", icon: "📚", color: "from-blue-500/20 to-blue-600/20" },
                { number: "200+", label: "Languages", icon: "🌍", color: "from-purple-500/20 to-purple-600/20" },
                { number: "50M+", label: "Downloads", icon: "📥", color: "from-green-500/20 to-green-600/20" },
                { number: "24/7", label: "AI Support", icon: "🤖", color: "from-orange-500/20 to-orange-600/20" }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`group relative p-8 bg-gradient-to-br ${stat.color} backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 text-center overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl -translate-y-10 translate-x-10"></div>

                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-4xl lg:text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                      {stat.number}
                    </div>
                    <div className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-32 relative overflow-hidden" style={{ width: '100%', padding: '8rem 1rem' }}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center relative z-10" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="mb-20">
              <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white/95">
                What Designers Say
              </h2>
              <p className="text-xl text-gray-300" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Trusted by creative professionals worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "FontifyAI revolutionized my design workflow. The AI recommendations are incredibly accurate and save me hours of searching.",
                  author: "Sarah Chen",
                  role: "Senior Designer at Adobe",
                  avatar: "👩‍🎨",
                  rating: 5
                },
                {
                  quote: "The best font discovery platform I've ever used. Clean interface, fast performance, and incredibly powerful search capabilities.",
                  author: "Marcus Johnson",
                  role: "Creative Director",
                  avatar: "👨‍💼",
                  rating: 5
                },
                {
                  quote: "Finally, a font platform that understands designers' needs. The preview system is absolutely flawless and intuitive.",
                  author: "Elena Rodriguez",
                  role: "Brand Designer",
                  avatar: "👩‍💻",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="group p-8 bg-gradient-to-br from-white/8 via-white/4 to-white/8 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl -translate-y-12 translate-x-12"></div>

                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-gray-300 mb-8 italic text-lg leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg group-hover:text-blue-100 transition-colors duration-300">
                          {testimonial.author}
                        </div>
                        <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Enhanced Font Preview Popup */}
      {showPopup && selectedFont && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideIn"
            style={{ maxWidth: '1200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{selectedFont.family}</h2>
                <p className="text-gray-300 capitalize flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  {selectedFont.category} • {selectedFont.variants ? selectedFont.variants.length : 1} variants
                  {selectedFont.subsets && selectedFont.subsets.length > 0 && (
                    <span className="text-xs text-gray-500">• {selectedFont.subsets.join(', ')}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-2xl flex items-center justify-center text-white text-xl transition-all duration-200 hover:scale-105"
              >
                ✕
              </button>
            </div>

            <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Font Controls</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Font Size</label>
                  <select
                    value={filters.fontSize}
                    onChange={(e) => handleFilterChange('fontSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {[16, 24, 32, 40, 48, 64, 72, 84].map(size => (
                      <option key={size} value={size} className="bg-black">{size}px</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Style</label>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        const previewElement = document.querySelector('#popup-preview-text');
                        if (previewElement) {
                          previewElement.style.fontWeight = previewElement.style.fontWeight === 'bold' ? 'normal' : 'bold';
                        }
                      }}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        const previewElement = document.querySelector('#popup-preview-text');
                        if (previewElement) {
                          const computedStyle = window.getComputedStyle(previewElement);
                          const isItalic = computedStyle.fontStyle === 'italic';
                          previewElement.style.fontStyle = isItalic ? 'normal' : 'italic';
                        }
                      }}
                    >
                      <em>I</em>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Case</label>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        const previewElement = document.querySelector('#popup-preview-text');
                        if (previewElement) {
                          previewElement.style.textTransform = previewElement.style.textTransform === 'capitalize' ? 'none' : 'capitalize';
                        }
                      }}
                    >
                      Aa
                    </button>
                    <button
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        const previewElement = document.querySelector('#popup-preview-text');
                        if (previewElement) {
                          previewElement.style.textTransform = previewElement.style.textTransform === 'lowercase' ? 'none' : 'lowercase';
                        }
                      }}
                    >
                      aa
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Alignment</label>
                  <div className="flex gap-1">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          const previewElement = document.querySelector('#popup-preview-text');
                          if (previewElement) {
                            previewElement.style.textAlign = align;
                          }
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={align === 'left' ? "M3 6h18M3 12h12M3 18h6" :
                              align === 'center' ? "M3 6h18M7 12h10M9 18h6" :
                                "M3 6h18M9 12h12M15 18h6"} />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Size: {filters.fontSize}px</label>
                </div>
                <input
                  type="range"
                  min="8"
                  max="84"
                  value={filters.fontSize}
                  onChange={(e) => handleFilterChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Preview Text</label>
              <input
                type="text"
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                placeholder="Type your custom text here..."
              />
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
                <div
                  id="popup-preview-text"
                  className="text-white leading-tight transition-all duration-300"
                  style={{
                    fontFamily: selectedFont.family,
                    fontSize: `${filters.fontSize}px`,
                    lineHeight: '1.4'
                  }}
                >
                  {filters.searchText}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 px-8 py-4 bg-gradient-to-r from-white/15 to-white/10 hover:from-white/20 hover:to-white/15 border border-white/20 hover:border-white/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105">
                Download Font Bundle
              </button>
              <button
                className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => window.location.href = `/font-details/${selectedFont.family}`}
              >
                Explore Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
          
          .slider::-webkit-slider-thumb { 
            appearance: none; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, #fff, #e2e8f0); 
            cursor: pointer; 
            border: 2px solid rgba(255,255,255,0.3); 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          .slider::-moz-range-thumb { 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, #fff, #e2e8f0); 
            cursor: pointer; 
            border: 2px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from { transform: scale(0.95) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }

          .animation-delay-150 {
            animation-delay: 150ms;
          }

          html, body {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
          }

          body {
            position: relative;
          }
        `}</style>
    </div>
  );
};

export default Home;
