const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR'];
const CACHE_DURATION = 60 * 60 * 1000;
let genresCache = {};

module.exports = async (req, res) => {
    let { language = 'pt-BR' } = req.query;
    
    language = ALLOWED_LANGUAGES.includes(language) ? language : 'pt-BR';
    
    const cached = genresCache[language];
    if (cached && cached.timestamp && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return res.json(cached.data);
    }
    
    try {
        const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        genresCache[language] = {
            data: response.data.genres,
            timestamp: Date.now()
        };
        
        res.json(response.data.genres);
    } catch (error) {
        console.error('Erro ao buscar géneros:', error.message);
        res.status(500).json({ error: 'Erro ao buscar géneros' });
    }
};
