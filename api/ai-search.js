const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const GEMINI_API_KEY = 'AIzaSyAb42Lbrz7g5FWLoqmWK5ChQ_4_EY4J7H4';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const languageMap = {
    'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
    'zh-CN': 'zh-CN', 'zh-HK': 'zh-TW', 'ja': 'ja-JP',
    'ru': 'ru-RU', 'ko': 'ko-KR'
};

const RATE_LIMIT = 10;
const CACHE_DURATION = 60 * 60 * 1000;

let requestCount = 0;
let lastReset = Date.now();
const cache = new Map();

const genreMap = {
    'acao': 28, 'action': 28, 'acao': 28,
    'comedia': 35, 'comedy': 35,
    'romance': 10749, 'amor': 10749, 'love': 10749,
    'terror': 27, 'horror': 27,
    'ficcao': 878, 'scifi': 878,
    'fantasia': 14, 'fantasy': 14,
    'anime': 16, 'animacao': 16,
    'drama': 18,
    'thriller': 53, 'suspense': 53,
    'misterio': 9648, 'mystery': 9648,
    'familia': 10751, 'family': 10751,
    'guerra': 10752, 'war': 10752,
    'crime': 80,
    'aventura': 12, 'adventure': 12,
    'documentario': 99
};

const contextKeywords = {
    'lgbt': [264386, 319872, 315382, 315383],
    'lesbico': [264386, 319872, 315385, 315382],
    'lesbiana': [264386, 319872, 315385, 315382],
    'lesbian': [264386, 319872, 315385],
    'gay': [264386, 308705],
    'homosexual': [264386],
    'trans': [4237, 4238, 4239],
    'drag': [4240],
    'queer': [264386, 319872],
    'wlw': [264386, 319872, 315385],
    
    'dinossauro': [470],
    'dinosaur': [470],
    
    'infantil': [10751, 16],
    'crianca': [10751, 16],
    'criança': [10751, 16],
    'familia': [10751],
    'kids': [10751],
    
    'nostalgia': [],
    'antigo': [],
    'velho': [],
    'anos 80': [],
    'anos 90': [],
    'anos 70': [],
    'anos 2000': [],
    'decada': []
};

const langMap = {
    'coreano': 'ko', 'japones': 'ja', 'japonesa': 'ja', 'japones': 'ja',
    'chines': 'zh', 'chinês': 'zh',
    'hindi': 'hi', 'indiano': 'hi',
    'brasileiro': 'pt', 'brasil': 'pt',
    'americano': 'en', 'ingles': 'en', 'americano': 'en',
    'espanhol': 'es', 'mexicano': 'es',
    'frances': 'fr', 'francês': 'fr',
    'italiano': 'it'
};

const decadeMap = {
    'anos 50': [1950, 1959],
    'anos 60': [1960, 1969],
    'anos 70': [1970, 1979],
    'anos 80': [1980, 1989],
    'anos 90': [1990, 1999],
    'anos 2000': [2000, 2009],
    'anos 2010': [2010, 2019],
    'anos 2020': [2020, 2029]
};

function resetRateLimit() {
    const now = Date.now();
    if (now - lastReset > 60000) {
        requestCount = 0;
        lastReset = now;
    }
}

function isRateLimited() {
    resetRateLimit();
    return requestCount >= RATE_LIMIT;
}

function getCachedResult(query) {
    const cached = cache.get(query);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.result;
    }
    return null;
}

function setCachedResult(query, result) {
    cache.set(query, { result, timestamp: Date.now() });
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
}

function extractDecade(query) {
    const q = query.toLowerCase();
    for (const [pattern, years] of Object.entries(decadeMap)) {
        if (q.includes(pattern)) {
            return years;
        }
    }
    const yearMatch = query.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return [year, year + 9];
    }
    return null;
}

function extractFilters(query) {
    const q = query.toLowerCase();
    const filters = { genre: null, language: null, keywords: [], decade: null, year: null };
    
    filters.decade = extractDecade(query);
    
    const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch && !filters.decade) {
        filters.year = parseInt(yearMatch[1]);
    }
    
    for (const [kw, id] of Object.entries(genreMap)) {
        if (q.includes(kw)) { filters.genre = id; break; }
    }
    
    for (const [kw, code] of Object.entries(langMap)) {
        if (q.includes(kw)) { filters.language = code; break; }
    }
    
    const queryLower = query.toLowerCase();
    
    const specificKeywords = {
        'lesbico': [264386, 319872],
        'lesbiana': [264386, 319872],
        'lesbian': [264386, 319872],
        'wlw': [264386, 319872],
        'gay': [264386],
        'lgbt': [264386],
        'trans': [4237],
        'queer': [264386],
        'drag': [4240]
    };
    
    for (const [keyword, ids] of Object.entries(specificKeywords)) {
        if (queryLower.includes(keyword) && ids.length > 0) {
            filters.keywords.push(...ids);
        }
    }
    
    if (!filters.genre && filters.keywords.length > 0) {
        filters.genre = 10749;
    }
    
    return filters;
}

function cleanKeywords(query) {
    const stop = ['filme', 'movie', 'que', 'com', 'uma', 'um', 'para', 'de', 'do', 'da', 'em', 'e', 'o', 'a', 'os', 'as', 'meu', 'minha', 'seu', 'sua', 'acho', 'lembro', 'tipo', 'parecido', 'onde', 'assisti', 'vi'];
    return query.toLowerCase()
        .replace(/\d{4}/g, ' ')
        .split(/[\s,\-.;!?'"()]+/)
        .filter(w => w.length > 2 && !stop.includes(w))
        .slice(0, 5);
}

async function callGeminiSmart(query, filters) {
    if (isRateLimited()) {
        console.log('Rate limited, using fallback');
        return null;
    }
    
    requestCount++;
    
    let contextPrompt = `You are a movie search expert. Analyze this user query and extract what they're actually looking for.

User query: "${query}"

Analyze and return JSON with:
- "mood": What vibe/mood they want (relaxante, triste, engraçado, assustador, romantico, etc)
- "context": What's the context (pra assistir com familia, sozinho, com amigos, pra dormir, etc)
- "specifics": Any specific things mentioned (gatos, cachorros, robos, zombies, etc)
- "keywords": Traditional search keywords to use
- "genre_override": Override genre if detected (comedy, drama, horror, etc)
- "exclude_genres": Genres to avoid

Examples:
- "filme relaxante com gatos" -> {"mood": "light/relaxing", "context": "casual viewing", "specifics": ["cats", "animals"], "keywords": ["cat", "comedy", "family"], "genre_override": "comedy"}
- "filme pra chorar" -> {"mood": "emotional/sad", "context": "alone", "keywords": ["cry", "tearjerker", "emotional"], "genre_override": "drama"}
- "filme assustador pra dormir tarde" -> {"mood": "scary/tense", "context": "night viewing", "keywords": ["horror", "scary", "thriller"], "genre_override": "horror"}
- "comédia romântica indiana" -> {"mood": "romantic/fun", "context": "date night", "specifics": ["indian"], "keywords": ["indian", "romance"], "genre_override": "romance"}

Output JSON only, no extra text:`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: contextPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 300,
                    responseMimeType: 'application/json'
                }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        
        if (match) {
            const result = JSON.parse(match[0]);
            console.log('Gemini smart result:', result);
            return result;
        }
        return null;
    } catch (error) {
        console.log('Gemini error:', error.message);
        return null;
    }
}

async function searchWithFilters(query, keywords, filters, tmdbLang, pageNum) {
    const resultsMap = new Map();
    const baseParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: 1, 'vote_count.gte': 5 };
    const q = query.toLowerCase();
    
    if (filters.keywords.length > 0) {
        let searchTerms = [];
        
        if (q.includes('lesbico') || q.includes('lesbiana') || q.includes('lesbian') || q.includes('wlw')) {
            searchTerms = ['lesbian romance', 'lesbian love', 'wlw movie', 'girl love movie'];
        } else if (q.includes('gay')) {
            searchTerms = ['gay romance', 'gay love', 'gay movie'];
        } else if (q.includes('trans')) {
            searchTerms = ['trans movie', 'transgender story'];
        } else if (q.includes('queer')) {
            searchTerms = ['queer film', 'queer movie'];
        } else {
            searchTerms = [query];
        }
        
        for (const term of searchTerms) {
            if (resultsMap.size >= 15) break;
            try {
                const searchParams = { ...baseParams, query: term, sort_by: 'popularity.desc' };
                const searchRes = await axios.get(TMDB_BASE + '/search/movie', { params: searchParams });
                for (const m of searchRes.data.results || []) {
                    resultsMap.set(m.id, {
                        ...m,
                        poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                        backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                    });
                }
            } catch (e) {
                console.log('Search error:', e.message);
            }
        }
    }
    
    if ((filters.genre) && resultsMap.size < 5) {
        const discParams = { ...baseParams, sort_by: 'popularity.desc' };
        if (filters.genre) discParams.with_genres = filters.genre;
        if (filters.language) discParams.with_original_language = filters.language;
        
        try {
            const discRes = await axios.get(TMDB_BASE + '/discover/movie', { params: discParams });
            for (const m of discRes.data.results || []) {
                resultsMap.set(m.id, {
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                });
            }
        } catch (e) {}
    }
    
    if (filters.decade && resultsMap.size < 10) {
        for (const kw of keywords) {
            if (kw.length < 3 || resultsMap.size >= 15) continue;
            try {
                const searchParams = { ...baseParams, query: kw, year: filters.decade[0] };
                const searchRes = await axios.get(TMDB_BASE + '/search/movie', { params: searchParams });
                for (const m of searchRes.data.results || []) {
                    if (!resultsMap.has(m.id)) {
                        resultsMap.set(m.id, {
                            ...m,
                            poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                            backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                        });
                    }
                }
            } catch (e) {}
        }
    }
    
    if (keywords.length > 0 && resultsMap.size < 5) {
        for (const kw of keywords) {
            if (kw.length < 3 || resultsMap.size >= 15) continue;
            try {
                const searchParams = { ...baseParams, query: kw };
                const searchRes = await axios.get(TMDB_BASE + '/search/movie', { params: searchParams });
                for (const m of searchRes.data.results || []) {
                    if (!resultsMap.has(m.id)) {
                        resultsMap.set(m.id, {
                            ...m,
                            poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                            backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                        });
                    }
                }
            } catch (e) {}
        }
    }
    
    return Array.from(resultsMap.values()).slice(0, 20);
}

module.exports = async (req, res) => {
    const { q = '', page = 1, language = 'pt-BR' } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query obrigatória' });
    }
    
    const cacheKey = `${q}_${language}`;
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
        console.log('Using cached result');
        return res.json(cachedResult);
    }
    
    const tmdbLang = languageMap[language] || 'pt-BR';
    const pageNum = Math.max(1, Math.min(500, parseInt(page) || 1));
    const filters = extractFilters(q);
    const keywords = cleanKeywords(q);
    
    try {
        let enhancedKeywords = keywords;
        let searchMood = null;
        let searchContext = null;
        let searchSpecifics = [];
        
        const geminiResult = await callGeminiSmart(q, filters);
        if (geminiResult) {
            if (geminiResult.keywords) {
                enhancedKeywords = [...new Set([...keywords, ...geminiResult.keywords])];
            }
            
            if (geminiResult.genre_override && !filters.genre) {
                const genreName = geminiResult.genre_override.toLowerCase();
                for (const [kw, id] of Object.entries(genreMap)) {
                    if (genreName.includes(kw)) {
                        filters.genre = id;
                        break;
                    }
                }
            }
            
            searchMood = geminiResult.mood;
            searchContext = geminiResult.context;
            searchSpecifics = geminiResult.specifics || [];
        }
        
        const movies = await searchWithFilters(q, enhancedKeywords, filters, tmdbLang, pageNum);
        
        // Enhance results with mood-based filtering using TMDB's additional queries
        let finalMovies = movies;
        
        // If we have mood info, try to get better results from TMDB
        if (searchMood && movies.length < 10) {
            try {
                // Use TMDB's "with_keywords" to find movies with specific themes
                let keywordIds = [];
                
                // Map moods to TMDB keyword IDs
                const moodKeywords = {
                    'relaxing': [210024, 190413], // feel-good, relaxing
                    'light': [210024, 190413],
                    'fun': [41075, 179103], // comedy, fun
                    'emotional': [110505, 105140], // tearjerker, emotional
                    'sad': [110505],
                    'scary': [4200, 8711], // horror, scary
                    'tense': [106961, 4315], // thriller, suspense
                    'romantic': [5344, 3172], // romance, love
                    'romance': [5344, 3172],
                    'dark': [4344, 4179], // dark, thriller
                    'uplifting': [210024, 186030], // inspiring, uplifting
                };
                
                const moodLower = searchMood.toLowerCase();
                for (const [mood, ids] of Object.entries(moodKeywords)) {
                    if (moodLower.includes(mood)) {
                        keywordIds = ids;
                        break;
                    }
                }
                
                if (keywordIds.length > 0) {
                    const moodParams = {
                        api_key: TMDB_API_KEY,
                        language: tmdbLang,
                        page: 1,
                        with_keywords: keywordIds.join(','),
                        sort_by: 'popularity.desc',
                        'vote_count.gte': 10
                    };
                    
                    const moodRes = await axios.get(TMDB_BASE + '/discover/movie', { params: moodParams });
                    
                    // Add new results to our map
                    for (const m of moodRes.data.results || []) {
                        if (!finalMovies.find(existing => existing.id === m.id)) {
                            finalMovies.push({
                                ...m,
                                poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                                backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                            });
                        }
                    }
                }
            } catch (e) {
                console.log('Mood search error:', e.message);
            }
        }
        
        // Handle specifics (like "gatos", "cachorros")
        if (searchSpecifics.length > 0 && finalMovies.length < 15) {
            for (const specific of searchSpecifics) {
                try {
                    const specificParams = {
                        api_key: TMDB_API_KEY,
                        language: tmdbLang,
                        page: 1,
                        query: specific,
                        sort_by: 'popularity.desc',
                        'vote_count.gte': 5
                    };
                    
                    const specificRes = await axios.get(TMDB_BASE + '/search/movie', { params: specificParams });
                    
                    for (const m of specificRes.data.results || []) {
                        if (!finalMovies.find(existing => existing.id === m.id)) {
                            finalMovies.push({
                                ...m,
                                poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                                backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                            });
                        }
                    }
                } catch (e) {
                    console.log('Specific search error:', e.message);
                }
            }
        }
        
        let finalResult;
        if (finalMovies.length === 0) {
            const directParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: pageNum, query: q.trim().substring(0, 40) };
            const directRes = await axios.get(TMDB_BASE + '/search/movie', { params: directParams });
            finalResult = {
                page: pageNum,
                total_pages: 1,
                results: (directRes.data.results || []).slice(0, 20).map(m => ({
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                }))
            };
        } else {
            finalResult = {
                page: pageNum,
                total_pages: Math.max(1, Math.ceil(finalMovies.length / 20)),
                results: finalMovies
            };
        }
        
        setCachedResult(cacheKey, finalResult);
        res.json(finalResult);
        
    } catch (error) {
        console.error('Search error:', error.message);
        
        try {
            const fallbackParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: pageNum, query: q };
            const fallbackRes = await axios.get(TMDB_BASE + '/search/movie', { params: fallbackParams });
            const fallback = {
                page: pageNum,
                total_pages: 1,
                results: (fallbackRes.data.results || []).slice(0, 20).map(m => ({
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                }))
            };
            setCachedResult(cacheKey, fallback);
            res.json(fallback);
        } catch (e2) {
            res.status(500).json({ error: 'Erro ao buscar filmes' });
        }
    }
};
