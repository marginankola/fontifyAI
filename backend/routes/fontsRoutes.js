// backend/routes/fontsRoutes.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Simple in-memory cache (per-process)
const cache = new Map(); // key -> { expiresAt, data }
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function setCache(key, data, ttl = TTL_MS) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

// --- Helpers ---
function normalizeCSV(str) {
  if (!str) return [];
  return String(str)
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function filterFonts(fonts, { categories, subset, search }) {
  let result = fonts;

  if (categories?.length) {
    result = result.filter(f => categories.includes(String(f.category).toLowerCase()));
  }

  if (subset) {
    const s = String(subset).toLowerCase();
    result = result.filter(f => (f.subsets || []).map(x => x.toLowerCase()).includes(s));
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(f => f.family.toLowerCase().includes(q));
  }

  return result;
}

function paginate(items, page = 1, pageSize = 40) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 40));
  const start = (p - 1) * ps;
  const end = start + ps;
  return {
    page: p,
    pageSize: ps,
    total: items.length,
    items: items.slice(start, end),
  };
}

// Build a CSS2 URL for preview/loading fonts
function buildCss2Url({ family, weights = '400', ital = '0', display = 'swap' }) {
  // family must be URL encoded and spaces replaced with +
  const fam = encodeURIComponent(String(family)).replace(/%20/g, '+');

  // ital can be "0" or "0,1" (we’ll keep simple: single 0 or 1)
  // weights is CSV: "400,700"
  // If ital === "1" we’ll format "ital,wght@1,400;1,700"
  // If ital === "0" we’ll format "wght@400;700"
  const w = String(weights)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .join(';');

  let axisPart;
  if (ital === '1') {
    axisPart = `ital,wght@1,${w}`;
  } else {
    axisPart = `wght@${w}`;
  }

  return `https://fonts.googleapis.com/css2?family=${fam}:${axisPart}&display=${display}`;
}

// --- Endpoints ---

// GET /api/fonts/google
// Query: sort=popularity|alpha|date|trending|style; categories=serif,sans-serif,...; subset=latin; search=roboto; page=1; pageSize=40
router.get('/google', async (req, res) => {
  const {
    sort = 'popularity',
    categories: categoriesCSV,
    subset,
    search,
    page = '1',
    pageSize = '40',
  } = req.query;

  const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'GOOGLE_FONTS_API_KEY not set in backend' });

  // We cache the raw Google list per sort; we do filters/pagination locally.
  const cacheKey = `google:list:${sort}`;
  try {
    let fontsList = getCache(cacheKey);

    if (!fontsList) {
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=${encodeURIComponent(sort)}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      fontsList = data.items || [];
      setCache(cacheKey, fontsList);
    }

    const categories = normalizeCSV(categoriesCSV);
    const filtered = filterFonts(fontsList, { categories, subset, search });

    const { items, total, page: p, pageSize: ps } = paginate(filtered, page, pageSize);

    res.json({
      total,
      page: p,
      pageSize: ps,
      items: items.map(f => ({
        family: f.family,
        category: f.category,
        variants: f.variants,
        subsets: f.subsets,
        version: f.version,
        lastModified: f.lastModified,
        files: f.files, // direct TTF/WOFF links for some variants
      })),
    });
  } catch (err) {
    console.error('Google Fonts list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Google Fonts list' });
  }
});

// GET /api/fonts/google/family/:family
router.get('/google/family/:family', async (req, res) => {
  const { family } = req.params;
  const { sort = 'popularity' } = req.query;
  const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'GOOGLE_FONTS_API_KEY not set in backend' });

  try {
    // Reuse cached list per sort
    const cacheKey = `google:list:${sort}`;
    let fontsList = getCache(cacheKey);
    if (!fontsList) {
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=${encodeURIComponent(sort)}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      fontsList = data.items || [];
      setCache(cacheKey, fontsList);
    }
    const found = fontsList.find(f => f.family.toLowerCase() === String(family).toLowerCase());
    if (!found) return res.status(404).json({ error: 'Family not found' });

    res.json(found);
  } catch (err) {
    console.error('Google Fonts family error:', err.message);
    res.status(500).json({ error: 'Failed to fetch family details' });
  }
});

// GET /api/fonts/google/css2
// Query: family=Roboto&weights=400,700&ital=0|1&display=swap
router.get('/google/css2', (req, res) => {
  const { family, weights = '400', ital = '0', display = 'swap' } = req.query;
  if (!family) return res.status(400).json({ error: 'family is required' });

  const cssUrl = buildCss2Url({ family, weights, ital, display });
  res.json({ cssUrl });
});

// --- Local/offline dataset placeholder (replace with real 300–400 later) ---
const localFonts = [
  // Sample structure — later you’ll populate with your offline 300–400 fonts
  // { family: 'YourLocalFont', category: 'sans-serif', subsets: ['latin'], files: { regular: '/static/fonts/YourLocalFont-Regular.woff2' } }
];

// GET /api/fonts/local
router.get('/local', (req, res) => {
  res.json({ total: localFonts.length, items: localFonts });
});

// GET /api/fonts/combined
router.get('/combined', async (req, res) => {
  // For now this just returns local + first page of google (popularity)
  // Later, we can merge & de-duplicate properly
  try {
    const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'GOOGLE_FONTS_API_KEY not set in backend' });

    const cacheKey = `google:list:popularity`;
    let fontsList = getCache(cacheKey);
    if (!fontsList) {
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`;
      const { data } = await axios.get(url, { timeout: 15000 });
      fontsList = data.items || [];
      setCache(cacheKey, fontsList);
    }

    const googleTop = fontsList.slice(0, 150).map(f => ({
      family: f.family,
      category: f.category,
      subsets: f.subsets,
      files: f.files,
      source: 'google',
    }));

    const locals = localFonts.map(f => ({ ...f, source: 'local' }));
    res.json({ total: locals.length + googleTop.length, items: [...locals, ...googleTop] });
  } catch (err) {
    console.error('Combined fonts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch combined fonts' });
  }
});

module.exports = router;
