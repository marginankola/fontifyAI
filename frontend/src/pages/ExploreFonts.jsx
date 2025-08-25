// src/pages/ExploreFonts.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const ExploreFonts = () => {
  // Mouse tracking for parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const animationFrameRef = useRef(null);

  // State management
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Filter states from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    variants: searchParams.get('variants') || 'all',
    subsets: searchParams.get('subsets') || 'all',
    sort: searchParams.get('sort') || 'popularity',
    search: searchParams.get('search') || '',
    fontSize: 32,
    searchText: 'The quick brown fox jumps over the lazy dog'
  });

  // Filter options (same as Home)
  const fontCategories = useMemo(() => [
    { key: 'all', label: 'All Categories' },
    { key: 'serif', label: 'Serif' },
    { key: 'sans-serif', label: 'Sans Serif' },
    { key: 'display', label: 'Display' },
    { key: 'handwriting', label: 'Handwriting' },
    { key: 'monospace', label: 'Monospace' }
  ], []);

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

  const sortOptions = useMemo(() => [
    { key: 'popularity', label: 'Popular' },
    { key: 'trending', label: 'Trending' },
    { key: 'alpha', label: 'Alphabetical' },
    { key: 'date', label: 'Recently Added' },
    { key: 'style', label: 'Most Styles' }
  ], []);

  // Load font CSS dynamically
  const loadFontCSS = useCallback((fontFamily) => {
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

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch fonts API
  const fetchFonts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sort: filters.sort,
        page,
        pageSize: 40,
      };

      // Backend filters
      if (filters.category !== 'all') {
        params.categories = filters.category;
      }
      if (filters.subsets !== 'all') {
        params.subset = filters.subsets;
      }
      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/fonts/google`, { params });

      if (response.data && response.data.items) {
        let newFonts = response.data.items;
        
        // Frontend filtering for variants
        if (filters.variants !== 'all') {
          newFonts = newFonts.filter(font => {
            if (!font.variants) return false;
            return font.variants.includes(filters.variants);
          });
        }
        
        setFonts(newFonts);
        setTotal(response.data.total || newFonts.length);

        // Load fonts CSS
        newFonts.forEach(font => loadFontCSS(font.family));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load fonts. Please try again.');
      setFonts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, loadFontCSS]);

  // Mouse tracking and scroll effects
  const updateMousePosition = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.scrollY;
    setScrollY(scrollTop);
    setShowScrollTop(scrollTop > 400);
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

  useEffect(() => {
    fetchFonts();
  }, [fetchFonts]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all' && k !== 'fontSize' && k !== 'searchText') {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    handleFilterChange('category', category);
  }, [handleFilterChange]);

  // Handle variants selection
  const handleVariantsSelect = useCallback((variant) => {
    handleFilterChange('variants', variant);
  }, [handleFilterChange]);

  // Handle subsets selection
  const handleSubsetsSelect = useCallback((subset) => {
    handleFilterChange('subsets', subset);
  }, [handleFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((sortType) => {
    handleFilterChange('sort', sortType);
  }, [handleFilterChange]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    const resetFilters = {
      category: 'all',
      variants: 'all',
      subsets: 'all',
      sort: 'popularity',
      search: '',
      fontSize: 32,
      searchText: 'The quick brown fox jumps over the lazy dog'
    };
    setFilters(resetFilters);
    setPage(1);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Enhanced pagination logic
  const totalPages = Math.ceil(total / 40);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, page - halfVisible);
      let endPage = Math.min(totalPages, page + halfVisible);
      
      // Adjust if we're near the beginning or end
      if (page <= halfVisible) {
        endPage = maxVisiblePages;
      } else if (page > totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      // Add visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Handle page change with scroll to top
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      scrollToTop();
    }
  }, [page, totalPages, scrollToTop]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* Enhanced Background System */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      
      {/* Dynamic Background Patterns */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{ 
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
               backgroundSize: '400px 400px'
             }}>
        </div>
      </div>
      
      {/* Enhanced Mouse Shadow Effect */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/2 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }} />
        
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

      <main className="flex-grow pt-20 relative z-20 flex" style={{ width: '100%' }}>
        {/* Enhanced Left Filter Panel - Full Height */}
        <aside className="w-80 flex-shrink-0 h-screen sticky top-0 pt-20">
          <div className="h-full bg-gradient-to-br from-white/8 via-white/4 to-white/8 backdrop-blur-2xl border-r border-white/10 p-6 overflow-y-auto custom-scrollbar shadow-2xl">
            
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Filters</h2>
              </div>
              <button 
                onClick={resetAllFilters}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all duration-200 hover:border-white/20 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>

            {/* Enhanced Preview Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Preview</h3>
              </div>
              
              <div className="mb-6">
                <textarea
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="w-full h-20 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 resize-none"
                  placeholder="Type preview text..."
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Font size</label>
                  <input
                    type="number"
                    min="8"
                    max="84"
                    value={filters.fontSize}
                    onChange={(e) => handleFilterChange('fontSize', Math.min(84, Math.max(8, parseInt(e.target.value) || 8)))}
                    className="w-20 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/15 transition-all duration-200"
                  />
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

            {/* Search */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h4 className="font-medium text-white">Search</h4>
              </div>
              <input
                type="text"
                placeholder="Search fonts by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
              />
            </div>

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
                    className={`p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${
                      filters.sort === sort.key 
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
                    className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${
                      filters.category === category.key 
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
                    className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${
                      filters.variants === variant.key 
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
                    className={`w-full p-3 border border-white/10 rounded-lg text-left transition-all duration-200 ${
                      filters.subsets === subset.key 
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
        </aside>

        {/* Enhanced Right Content - Fonts List */}
        <section className="flex-1 p-8" style={{ minWidth: 0 }}>
          
          {/* Enhanced Header with Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white/95">
                Explore Fonts
              </h1>
              
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-gray-400">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    Loading fonts...
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span>{total.toLocaleString()} fonts available</span>
                    {(filters.category !== 'all' || filters.variants !== 'all' || filters.subsets !== 'all' || filters.search) && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters applied
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zM8 8v8M12 8v8M16 8v8" />
                </svg>
                Page {page} of {totalPages}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400/60 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-lg font-medium mb-2">Discovering amazing fonts...</p>
                <p className="text-gray-400 text-sm">Fetching from Google Fonts API</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Fonts</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button 
                onClick={fetchFonts}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all duration-200 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Enhanced Fonts Grid */}
          {!loading && !error && (
            <>
              {fonts.length > 0 ? (
                <div className="space-y-6 mb-12">
                  {fonts.map((font) => (
                    <div
                      key={font.family}
                      className="group relative bg-gradient-to-br from-white/6 via-white/3 to-white/6 hover:from-white/10 hover:via-white/5 hover:to-white/10 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-500 cursor-pointer transform hover:scale-[1.01] hover:shadow-2xl overflow-hidden"
                      onClick={() => (window.location.href = `/fonts/${encodeURIComponent(font.family)}`)}
                    >
                      {/* Enhanced Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl translate-y-12 -translate-x-12"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-xl"></div>
                      
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
                              className="px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/15 border border-white/20 hover:border-white/30 rounded-xl text-white text-sm transition-all duration-200 backdrop-blur-sm hover:shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/fonts/${encodeURIComponent(font.family)}`;
                              }}
                            >
                              <span className="flex items-center gap-2">
                                View Details
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No fonts found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your search criteria or reset filters</p>
                  <button 
                    onClick={resetAllFilters}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200 hover:scale-105"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Enhanced Pagination with Number Buttons */}
              {fonts.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8">
                  
                  {/* Previous Button */}
                  <button
                    disabled={!hasPrevPage}
                    onClick={() => handlePageChange(page - 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/8 to-white/4 hover:from-white/12 hover:to-white/6 border border-white/20 hover:border-white/30 rounded-2xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/5 to-white/3 border border-white/10 rounded-2xl backdrop-blur-xl">
                    {getPageNumbers().map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === '...' ? (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                              pageNum === page
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    disabled={!hasNextPage}
                    onClick={() => handlePageChange(page + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/8 to-white/4 hover:from-white/12 hover:to-white/6 border border-white/20 hover:border-white/30 rounded-2xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl hover:shadow-lg"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Page Info */}
              {fonts.length > 0 && (
                <div className="text-center text-gray-400 text-sm py-4">
                  Showing {((page - 1) * 40 + 1).toLocaleString()} - {Math.min(page * 40, total).toLocaleString()} of {total.toLocaleString()} fonts
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 shadow-2xl animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
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
      `}</style>
    </div>
  );
};

export default ExploreFonts;
