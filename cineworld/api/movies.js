const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR'];
const ALLOWED_SORTS = ['popular', 'popularity', 'top', 'rating_desc', 'vote_average', 'worst', 'piores', 'upcoming'];
const ALLOWED_ORIGINS = ['all', 'BR', 'foreign'];
const MAX_PAGE = 500;
const MIN_PAGE = 1;

module.exports = async (req, res) => {
    let { language = 'pt-BR', page = 1, sort = 'popular', q, genre, origin } = req.query;
    
    language = ALLOWED_LANGUAGES.includes(language) ? language : 'pt-BR';
    page = Math.max(MIN_PAGE, Math.min(MAX_PAGE, parseInt(page) || 1));
    sort = ALLOWED_SORTS.includes(sort) ? sort : 'popular';
    origin = ALLOWED_ORIGINS.includes(origin) ? origin : 'all';
    
    if (genre) {
        genre = parseInt(genre) || 0;
    }
    
    if (q) {
        q = String(q).substring(0, 100).replace(/[<>]/g, '');
    }
    
    const sortMap = {
        'popular': 'popularity.desc',
        'popularity': 'popularity.desc',
        'top': 'vote_average.desc',
        'rating_desc': 'vote_average.desc',
        'vote_average': 'vote_average.desc',
        'worst': 'vote_average.asc',
        'piores': 'vote_average.asc'
    };
    
    try {
        let moviesRes;
        const today = new Date().toISOString().split('T')[0];
        
        // Usa endpoint específico para futuros lançamentos
        if (sort === 'upcoming') {
            moviesRes = await axios.get(`${TMDB_BASE}/movie/upcoming`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: language,
                    page: page,
                    region: 'BR'
                }
            });
            
            // Filtra só filmes que ainda vão lançar
            const filteredResults = moviesRes.data.results.filter(m => 
                !m.release_date || m.release_date > today
            );
            moviesRes.data.results = filteredResults;
            moviesRes.data.total = filteredResults.length;
        } else if (q) {
            // Busca
            moviesRes = await axios.get(`${TMDB_BASE}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: language,
                    page: page,
                    query: q
                }
            });
        } else {
            // Descobrir filmes
            const params = {
                api_key: TMDB_API_KEY,
                language: language,
                page: page,
                sort_by: sortMap[sort] || 'popularity.desc',
                'vote_count.gte': 50
            };
            
            if (genre && genre !== '0') {
                params.with_genres = genre;
            }
            
            if (origin === 'BR') {
                params.with_original_language = 'pt';
            } else if (origin === 'foreign') {
                params.with_original_language = 'en';
            }
            
            moviesRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params });
        }
        
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
