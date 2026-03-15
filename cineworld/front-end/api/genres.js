const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';

let genresCache = {};

module.exports = async (req, res) => {
    const { language = 'pt-BR' } = req.query;
    
    if (genresCache[language]) {
        return res.json(genresCache[language]);
    }
    
    try {
        const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        genresCache[language] = response.data.genres;
        res.json(response.data.genres);
    } catch (error) {
        console.error('Erro ao buscar géneros:', error.message);
        res.status(500).json({ error: 'Erro ao buscar géneros' });
    }
};
