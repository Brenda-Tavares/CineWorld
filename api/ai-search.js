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

const genreKeywords = {
    'acao': 28, 'action': 28,
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
    'crime': 80, 'policial': 80,
    'aventura': 12, 'adventure': 12
};

const langKeywords = {
    'coreano': 'ko', 'japones': 'ja', 'japones': 'ja', 'chinês': 'zh', 'hindi': 'hi',
    'brasileiro': 'pt', 'americano': 'en', 'ingles': 'en', 'espanhol': 'es',
    'frances': 'fr'
};

let geminiWorks = true;

async function getGeminiKeywords(query) {
    if (!geminiWorks) return null;
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: `Extract 3-5 movie search keywords from this: "${query}". Respond with JSON array like ["keyword1", "keyword2"]` }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 50, responseMimeType: 'application/json' }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
        
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\[[\s\S]*\]/);
        
        if (match) {
            const keywords = JSON.parse(match[0]);
            if (Array.isArray(keywords) && keywords.length > 0) {
                console.log('Gemini keywords:', keywords);
                return keywords;
            }
        }
        return null;
    } catch (error) {
        console.log('Gemini failed:', error.message);
        geminiWorks = false;
        return null;
    }
}

function extractFilters(query) {
    const q = query.toLowerCase();
    const filters = { genre: null, language: null, year: null };
    
    const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) filters.year = parseInt(yearMatch[1]);
    
    for (const [kw, id] of Object.entries(genreKeywords)) {
        if (q.includes(kw)) { filters.genre = id; break; }
    }
    
    for (const [kw, code] of Object.entries(langKeywords)) {
        if (q.includes(kw)) { filters.language = code; break; }
    }
    
    return filters;
}

function getKeywords(query) {
    const stop = ['filme', 'movie', 'que', 'com', 'uma', 'um', 'para', 'de', 'do', 'da', 'em', 'e', 'o', 'a', 'os', 'as'];
    return query.toLowerCase()
        .replace(/\d{4}/g, ' ')
        .split(/[\s,\-.;!?'"()]+/)
        .filter(w => w.length > 2 && !stop.includes(w))
        .slice(0, 5);
}

module.exports = async (req, res) => {
    const { q = '', page = 1, language = 'pt-BR' } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query obrigatória' });
    }
    
    const tmdbLang = languageMap[language] || 'pt-BR';
    const pageNum = Math.max(1, Math.min(500, parseInt(page) || 1));
    const filters = extractFilters(q);
    const keywords = getKeywords(q);
    
    const resultsMap = new Map();
    const baseParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: 1, 'vote_count.gte': 5 };
    
    try {
        if (filters.genre || filters.language || filters.year) {
            const discParams = { ...baseParams, sort_by: 'popularity.desc' };
            if (filters.genre) discParams.with_genres = filters.genre;
            if (filters.language) discParams.with_original_language = filters.language;
            if (filters.year) discParams.primary_release_year = filters.year;
            
            const discRes = await axios.get(TMDB_BASE + '/discover/movie', { params: discParams });
            for (const m of discRes.data.results || []) {
                resultsMap.set(m.id, {
                    ...m,
                    poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                    backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
                });
            }
        }
        
        const searchTerms = [...keywords];
        
        if (geminiWorks) {
            const geminiKw = await getGeminiKeywords(q);
            if (geminiKw) {
                searchTerms.push(...geminiKw);
            }
        }
        
        const uniqueTerms = [...new Set(searchTerms)];
        
        for (const kw of uniqueTerms) {
            if (kw.length < 3 || resultsMap.size >= 15) continue;
            
            const searchParams = { ...baseParams, query: kw };
            try {
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
            } catch (e) {
                console.log('Search error:', e.message);
            }
        }
        
        const movies = Array.from(resultsMap.values()).slice(0, 20);
        
        if (movies.length === 0) {
            const directParams = { ...baseParams, query: q.trim().substring(0, 40) };
            const directRes = await axios.get(TMDB_BASE + '/search/movie', { params: directParams });
            const fallback = (directRes.data.results || []).slice(0, 20).map(m => ({
                ...m,
                poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
            }));
            
            return res.json({ page: pageNum, total_pages: 1, results: fallback });
        }
        
        res.json({
            page: pageNum,
            total_pages: Math.max(1, Math.ceil(movies.length / 20)),
            results: movies
        });
        
    } catch (error) {
        console.error('Search error:', error.message);
        
        try {
            const fallbackParams = { api_key: TMDB_API_KEY, language: tmdbLang, page: pageNum, query: q };
            const fallbackRes = await axios.get(TMDB_BASE + '/search/movie', { params: fallbackParams });
            const fallback = (fallbackRes.data.results || []).slice(0, 20).map(m => ({
                ...m,
                poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
                backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
            }));
            
            return res.json({ page: pageNum, total_pages: 1, results: fallback });
        } catch (e2) {
            return res.status(500).json({ error: 'Erro ao buscar filmes' });
        }
    }
};
