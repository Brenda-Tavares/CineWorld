const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

let genresCache = {};

async function getGenres(language = 'pt-BR') {
    if (genresCache[language]) {
        return genresCache[language];
    }
    
    try {
        const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        genresCache[language] = response.data.genres;
        return response.data.genres;
    } catch (error) {
        console.error('Erro ao buscar géneros:', error.message);
        return [];
    }
}

module.exports = async (req, res) => {
    const { language = 'pt-BR', page = 1, sort = 'popular' } = req.query;
    
    const sortMap = {
        'popular': 'popularity.desc',
        'top': 'vote_average.desc',
        'now_playing': 'release_date.desc',
        'upcoming': 'primary_release_date.desc'
    };
    
    try {
        const [genresRes, moviesRes] = await Promise.all([
            getGenres(language),
            axios.get(`${TMDB_BASE}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: language,
                    page: page,
                    sort_by: sortMap[sort] || 'popularity.desc',
                    'vote_count.gte': 10
                }
            })
        ]);
        
        const movies = moviesRes.data.results.map(movie => ({
            ...movie,
            poster_path: movie.poster_path ? TMDB_IMAGE + movie.poster_path : null,
            backdrop_path: movie.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + movie.backdrop_path : null
        }));
        
        res.json({
            page: moviesRes.data.page,
            total_pages: moviesRes.data.total_pages,
            results: movies
        });
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
};
