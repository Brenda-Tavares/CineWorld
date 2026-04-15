const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAqC8W549DIi3X-sQVoF9B0pI2n601k7po';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const languageMap = {
    'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
    'zh-CN': 'zh-CN', 'zh-HK': 'zh-TW', 'ja': 'ja-JP',
    'ru': 'ru-RU', 'ko': 'ko-KR'
};

const genreMap = {
    'ação': 28, 'acao': 28, 'action': 28, 'acao': 28,
    'comédia': 35, 'comedia': 35, 'comedy': 35,
    'romance': 10749, 'romantica': 10749, 'romantico': 10749, 'amor': 10749, 'love': 10749,
    'terror': 27, 'horror': 27,
    'ficção': 878, 'ficcao': 878, 'sci-fi': 878, 'sci fi': 878,
    'fantasia': 14, 'fantasy': 14,
    'animação': 16, 'animacao': 16, 'anime': 16, 'animation': 16,
    'drama': 18,
    'thriller': 53, 'suspense': 53,
    'mistério': 9648, 'misterio': 9648, 'mystery': 9648,
    'família': 10751, 'familia': 10751, 'family': 10751,
    'guerra': 10752, 'war': 10752,
    'musical': 10402, 'music': 10402,
    'história': 36, 'history': 36,
    'crime': 80, 'policial': 80,
    'avventura': 12, 'adventure': 12
};

const langMap = {
    'coreano': 'ko', 'korean': 'ko',
    'japonês': 'ja', 'japanese': 'ja', 'anime': 'ja',
    'chinês': 'zh', 'chinese': 'zh',
    'hindi': 'hi', 'indiano': 'hi',
    'brasileiro': 'pt', 'brasil': 'pt',
    'americano': 'en', 'inglês': 'en', 'english': 'en',
    'espanhol': 'es', 'mexicano': 'es',
    'francês': 'fr', 'french': 'fr'
};

async function extractKeywordsWithGemini(query) {
    try {
        const prompt = `You are a movie search assistant. Extract 3-5 important keywords from this text: "${query}"

Respond ONLY with a JSON array of keywords in English, like ["keyword1", "keyword2", "keyword3"]`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 50,
                    responseMimeType: 'application/json'
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 8000
            }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            const keywords = JSON.parse(match[0]);
            if (Array.isArray(keywords) && keywords.length > 0) {
                return keywords;
            }
        }
        return null;
    } catch (error) {
        console.log('Gemini error (fallback):', error.message);
        return null;
    }
}

function extractFilters(query) {
    const q = query.toLowerCase();
    const filters = { genre: null, language: null, year: null };
    
    const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
        filters.year = parseInt(yearMatch[1]);
    }
    
    for (const [keyword, id] of Object.entries(genreMap)) {
        if (q.includes(keyword)) {
            filters.genre = id;
            break;
        }
    }
    
    for (const [keyword, code] of Object.entries(langMap)) {
        if (q.includes(keyword)) {
            filters.language = code;
            break;
        }
    }
    
    return filters;
}

function cleanKeywords(query) {
    const stopWords = ['filme', 'movie', 'que', 'com', 'uma', 'um', 'para', 'de', 'do', 'da', 'em', 'e', 'o', 'a', 'os', 'as', 'meu', 'minha', 'seu', 'sua', 'sobre', 'um', 'uma', 'acho', 'que', 'lembro', 'tipo', 'parecido'];
    return query
        .toLowerCase()
        .replace(/\d{4}/g, ' ')
        .split(/[\s,\-.;!?'"()]+/)
        .filter(w => w.length > 2 && !stopWords.includes(w))
        .slice(0, 5);
}

async function searchMovies(query, filters, tmdbLang, pageNum) {
    const resultsMap = new Map();
    
    const baseParams = {
        api_key: TMDB_API_KEY,
        language: tmdbLang,
        page: 1,
        'vote_count.gte': 5
    };
    
    if (filters.genre || filters.language || filters.year) {
        const discoverParams = { ...baseParams, sort_by: 'popularity.desc' };
        if (filters.genre) discoverParams.with_genres = filters.genre;
        if (filters.language) discoverParams.with_original_language = filters.language;
        if (filters.year) discoverParams.primary_release_year = filters.year;
        
        try {
            const res = await axios.get(`${TMDB_BASE}/discover/movie`, { params: discoverParams });
            for (const m of res.data.results || []) {
                resultsMap.set(m.id, {
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                });
            }
        } catch (e) {
            console.log('Discover error:', e.message);
        }
    }
    
    const keywords = cleanKeywords(query);
    for (const kw of keywords) {
        if (kw.length < 3) continue;
        
        try {
            const searchParams = { ...baseParams, query: kw };
            const res = await axios.get(`${TMDB_BASE}/search/movie`, { params: searchParams });
            
            for (const m of res.data.results || []) {
                if (!resultsMap.has(m.id)) {
                    resultsMap.set(m.id, {
                        ...m,
                        poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                        backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                    });
                }
            }
        } catch (e) {
            console.log('Search error:', e.message);
        }
        
        if (resultsMap.size >= 15) break;
    }
    
    return Array.from(resultsMap.values()).slice(0, 20);
}

module.exports = async (req, res) => {
    const { q = '', page = 1, language = 'pt-BR' } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query obrigatória' });
    }
    
    const tmdbLang = languageMap[language] || 'pt-BR';
    const pageNum = Math.max(1, Math.min(500, parseInt(page) || 1));
    
    try {
        const filters = extractFilters(q);
        
        const geminiKeywords = await extractKeywordsWithGemini(q);
        
        let allKeywords = cleanKeywords(q);
        if (geminiKeywords && geminiKeywords.length > 0) {
            allKeywords = [...new Set([...allKeywords, ...geminiKeywords])].slice(0, 5)];
        }
        
        const queryForSearch = allKeywords.length > 0 ? allKeywords.join(' ') : q;
        
        const movies = await searchMovies(queryForSearch, filters, tmdbLang, pageNum);
        
        if (movies.length === 0) {
            const directParams = {
                api_key: TMDB_API_KEY,
                language: tmdbLang,
                page: pageNum,
                query: q.trim().substring(0, 50)
            };
            
            const directRes = await axios.get(`${TMDB_BASE}/search/movie`, { params: directParams });
            const fallbackMovies = (directRes.data.results || []).slice(0, 20).map(m => ({
                ...m,
                poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
            }));
            
            return res.json({
                page: pageNum,
                total_pages: 1,
                results: fallbackMovies
            });
        }
        
        res.json({
            page: pageNum,
            total_pages: Math.max(1, Math.ceil(movies.length / 20)),
            results: movies
        });
        
    } catch (error) {
        console.error('Erro na busca:', error.message);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
};
