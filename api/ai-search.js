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
    'ação': 28, 'acao': 28, 'action': 28,
    'comédia': 35, 'comedia': 35, 'comedy': 35,
    'romance': 10749, 'romântica': 10749, 'romantico': 10749, 'amor': 10749,
    'terror': 27, 'horror': 27,
    'ficção': 878, 'sci-fi': 878,
    'fantasia': 14, 'fantasy': 14,
    'animação': 16, 'anime': 16, 'animation': 16,
    'drama': 18,
    'thriller': 53, 'suspense': 53,
    'mistério': 9648, 'misterio': 9648, 'mystery': 9648,
    'família': 10751, 'familia': 10751, 'family': 10751,
    'guerra': 10752, 'war': 10752,
    'musical': 10402,
    'história': 36,
    'crime': 80, 'policial': 80,
    'avventura': 12, 'adventure': 12
};

const langMap = {
    'coreano': 'ko', 'japonês': 'ja', 'chinês': 'zh',
    'hindi': 'hi', 'brasileiro': 'pt', 'espanhol': 'es',
    'francês': 'fr', 'italiano': 'it', 'alemão': 'de'
};

async function callGemini(query) {
    const prompt = `Extract 3-5 important keywords from this movie search: "${query}"

Return ONLY JSON array with keywords in English:
Examples:
- "filme de ação com homem que voa" -> ["action", "flying superhero", "man with cape"]
- "comédia romântica anos 2000" -> ["romantic comedy", "2000s"]
- "anime japonês" -> ["anime", "japanese"]

Keywords:`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 100
                }
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            const keywords = JSON.parse(jsonMatch[0]);
            if (Array.isArray(keywords) && keywords.length > 0) {
                return keywords;
            }
        }
        return null;
    } catch (error) {
        console.error('Erro Gemini:', error.message);
        return null;
    }
}

async function searchTMDB(query, filters, tmdbLang, pageNum) {
    const results = new Map();
    
    if (filters.genre || filters.language || filters.year) {
        const discoverParams = {
            api_key: TMDB_API_KEY,
            language: tmdbLang,
            page: 1,
            'vote_count.gte': 10,
            sort_by: 'popularity.desc'
        };
        
        if (filters.genre) discoverParams.with_genres = filters.genre;
        if (filters.language) discoverParams.with_original_language = filters.language;
        if (filters.year) discoverParams.primary_release_year = filters.year;
        
        try {
            const discoverRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params: discoverParams });
            for (const m of discoverRes.data.results || []) {
                results.set(m.id, { ...m, poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null });
            }
        } catch (e) {
            console.error('Discover error:', e.message);
        }
    }
    
    const searchQueries = [query];
    if (filters.keywords) {
        searchQueries.push(...filters.keywords.slice(0, 2));
    }
    
    for (const sq of searchQueries) {
        if (sq.length < 2) continue;
        
        try {
            const searchParams = {
                api_key: TMDB_API_KEY,
                language: tmdbLang,
                page: 1,
                query: sq
            };
            
            const searchRes = await axios.get(`${TMDB_BASE}/search/movie`, { params: searchParams });
            
            for (const m of searchRes.data.results || []) {
                if (!results.has(m.id)) {
                    results.set(m.id, {
                        ...m,
                        poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                        backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                    });
                }
            }
        } catch (e) {
            console.error('Search error:', e.message);
        }
    }
    
    return Array.from(results.values()).slice(0, 20);
}

function extractFilters(query) {
    const qLower = query.toLowerCase();
    const filters = { genre: null, language: null, year: null, keywords: [] };
    
    const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
        filters.year = parseInt(yearMatch[1]);
    }
    
    for (const [keyword, id] of Object.entries(genreMap)) {
        if (qLower.includes(keyword)) {
            filters.genre = id;
            break;
        }
    }
    
    for (const [keyword, code] of Object.entries(langMap)) {
        if (qLower.includes(keyword)) {
            filters.language = code;
            break;
        }
    }
    
    return filters;
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
        
        const geminiKeywords = await callGemini(q);
        if (geminiKeywords) {
            filters.keywords = geminiKeywords;
        }
        
        const movies = await searchTMDB(q, filters, tmdbLang, pageNum);
        
        res.json({
            page: pageNum,
            total_pages: Math.ceil(movies.length / 20) || 1,
            results: movies
        });
        
    } catch (error) {
        console.error('Erro na busca:', error.message);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
};
