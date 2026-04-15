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
    'lgbt': [4226, 4227, 4228, 4229, 4230, 4231, 4232, 4233, 4234, 4235, 4216],
    'lesbico': [4226, 4227, 4228, 4229, 4230, 4216],
    'lesbiana': [4226, 4227, 4228, 4229, 4230, 4216],
    'lesbian': [4226, 4227, 4228, 4229, 4230],
    'gay': [4226, 4227, 4228, 4216],
    'homosexual': [4226],
    'trans': [4237, 4238, 4239],
    'drag': [4240],
    'queer': [4226, 4233, 4216],
    'wlw': [4226, 4227],
    
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
    for (const [kw, ids] of Object.entries(contextKeywords)) {
        if (queryLower.includes(kw) && ids.length > 0) {
            filters.keywords.push(...ids);
        }
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
    
    let contextPrompt = 'You are a movie search assistant. ';
    
    if (filters.keywords.length > 0) {
        contextPrompt += `The user is looking for movies with these themes: ${filters.keywords.join(', ')}. `;
    }
    if (filters.decade) {
        contextPrompt += `The user mentioned decade: ${filters.decade[0]}-${filters.decade[1]}. `;
    }
    if (filters.genre) {
        contextPrompt += `Genre detected: ${filters.genre}. `;
    }
    
    contextPrompt += `\nUser query: "${query}"\n\nExtract search parameters in this JSON format:\n{"keywords": ["important", "search", "terms"], "genre": "genre_name_or_null", "year": "year_or_null", "context": "what_user_actually_wants"}\n\nExample: "filme lesbic@ romance" -> {"keywords": ["lesbian romance", "lgbt movie", "queer film"], "genre": "romance", "year": null, "context": "lesbian_romance_movie"}\n\nOutput:`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: contextPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
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

async function searchWithFilters(keywords, filters, tmdbLang, pageNum) {
    const resultsMap = new Map();
    const baseParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: 1, 'vote_count.gte': 5 };
    
    if (filters.keywords.length > 0) {
        const discParams = { ...baseParams, sort_by: 'popularity.desc', with_keywords: filters.keywords.join(',') };
        if (filters.genre) discParams.with_genres = filters.genre;
        if (filters.language) discParams.with_original_language = filters.language;
        if (filters.decade) {
            discParams['primary_release_date.gte'] = `${filters.decade[0]}-01-01`;
            discParams['primary_release_date.lte'] = `${filters.decade[1]}-12-31`;
        }
        
        try {
            const discRes = await axios.get(TMDB_BASE + '/discover/movie', { params: discParams });
            for (const m of discRes.data.results || []) {
                resultsMap.set(m.id, {
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                });
            }
        } catch (e) {
            console.log('Keyword search error:', e.message);
        }
    }
    
    if (filters.genre && filters.keywords.length === 0) {
        const discParams = { ...baseParams, sort_by: 'popularity.desc', with_genres: filters.genre };
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
        } catch (e) {
            console.log('Genre search error:', e.message);
        }
    }
    
    if (filters.decade) {
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
        
        const geminiResult = await callGeminiSmart(q, filters);
        if (geminiResult && geminiResult.keywords) {
            enhancedKeywords = [...new Set([...keywords, ...geminiResult.keywords])];
            
            if (geminiResult.genre && !filters.genre) {
                for (const [kw, id] of Object.entries(genreMap)) {
                    if (geminiResult.genre.toLowerCase().includes(kw)) {
                        filters.genre = id;
                        break;
                    }
                }
            }
        }
        
        const movies = await searchWithFilters(enhancedKeywords, filters, tmdbLang, pageNum);
        
        let finalResult;
        if (movies.length === 0) {
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
                total_pages: Math.max(1, Math.ceil(movies.length / 20)),
                results: movies
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
