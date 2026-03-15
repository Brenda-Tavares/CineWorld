/*!
 CINEWORLD BACKEND API
 © 2026 Alabaster Developer
*/

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// TMDB API
const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Géneros (cache)
let genresCache = null;

async function getGenres(language = 'pt-BR') {
    if (genresCache && genresCache.lang === language) {
        return genresCache.data;
    }
    
    try {
        const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        genresCache = {
            lang: language,
            data: response.data.genres
        };
        
        return response.data.genres;
    } catch (error) {
        console.error('Erro ao buscar géneros:', error.message);
        return [];
    }
}

// Rota principal
app.get('/', (req, res) => {
    res.json({ 
        message: 'CineWorld API',
        status: 'online',
        ano: 2026
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ONLINE',
        timestamp: new Date().toISOString(),
        ano: 2026
    });
});

// Géneros
app.get('/api/genres', async (req, res) => {
    const language = req.query.language || 'pt-BR';
    
    try {
        const genres = await getGenres(language);
        
        const mappedGenres = genres.map(g => ({
            id: g.id,
            name: g.name,
            icon: 'fas fa-film'
        }));
        
        mappedGenres.unshift({
            id: 0,
            name: 'Todos',
            icon: 'fas fa-globe'
        });
        
        res.json({ success: true, genres: mappedGenres });
        
    } catch (error) {
        console.error('Erro géneros:', error.message);
        res.json({
            success: true,
            genres: [
                { id: 0, name: 'Todos', icon: 'fas fa-globe' },
                { id: 28, name: 'Ação', icon: 'fas fa-film' },
                { id: 35, name: 'Comédia', icon: 'fas fa-film' },
                { id: 27, name: 'Terror', icon: 'fas fa-film' },
                { id: 10749, name: 'Romance', icon: 'fas fa-film' },
                { id: 878, name: 'Ficção', icon: 'fas fa-film' }
            ]
        });
    }
});

// Filmes
app.get('/api/movies', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'popularity';
    const language = req.query.language || 'pt-BR';
    const genre = req.query.genre || '';
    
    const sortMap = {
        'popularity': 'popularity.desc',
        'rating_desc': 'vote_average.desc',
        'release_desc': 'release_date.desc'
    };
    
    try {
        const params = {
            api_key: TMDB_API_KEY,
            page: page,
            language: language,
            sort_by: sortMap[sort] || 'popularity.desc'
        };
        
        if (genre && genre !== '0') {
            params.with_genres = genre;
        }
        
        const response = await axios.get(`${TMDB_BASE}/discover/movie`, { params });
        
        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            poster_path: movie.poster_path ? TMDB_IMAGE + movie.poster_path : null,
            original_language: movie.original_language,
            original_title: movie.original_title,
            genre_ids: movie.genre_ids,
            popularity: movie.popularity
        }));
        
        res.json({
            success: true,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
            movies: movies
        });
        
    } catch (error) {
        console.error('Erro TMDB:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar filmes'
        });
    }
});

// Detalhes do filme
app.get('/api/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const language = req.query.language || 'pt-BR';
    
    try {
        const response = await axios.get(`${TMDB_BASE}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        const movie = response.data;
        
        // Streaming
        let streaming = [];
        try {
            const watchProviders = await axios.get(`${TMDB_BASE}/movie/${movieId}/watch/providers`, {
                params: { api_key: TMDB_API_KEY }
            });
            
            if (watchProviders.data.results?.BR?.flatrate) {
                streaming = watchProviders.data.results.BR.flatrate.map(p => ({
                    name: p.provider_name,
                    logo: 'https://image.tmdb.org/t/p/original' + p.logo_path,
                    type: 'flatrate'
                }));
            }
        } catch (e) {
            console.log('Streaming não disponível');
        }
        
        res.json({
            success: true,
            movie: {
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                poster_path: movie.poster_path ? TMDB_IMAGE + movie.poster_path : null,
                original_language: movie.original_language,
                original_title: movie.original_title,
                runtime: movie.runtime,
                genres: movie.genres,
                production_countries: movie.production_countries,
                streaming: streaming
            }
        });
        
    } catch (error) {
        console.error('Erro TMDB:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao buscar filme' });
    }
});

// Busca
app.get('/api/search', async (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const language = req.query.language || 'pt-BR';
    
    if (!query) {
        return res.json({ success: true, movies: [], totalResults: 0 });
    }
    
    try {
        const response = await axios.get(`${TMDB_BASE}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: query,
                page: page,
                language: language
            }
        });
        
        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            poster_path: movie.poster_path ? TMDB_IMAGE + movie.poster_path : null,
            original_language: movie.original_language,
            original_title: movie.original_title
        }));
        
        res.json({
            success: true,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
            movies: movies
        });
        
    } catch (error) {
        console.error('Erro TMDB:', error.message);
        res.status(500).json({ success: false, error: 'Erro na busca' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('========================================');
    console.log('CINEWORLD API - ONLINE');
    console.log('========================================');
    console.log('URL: http://localhost:' + PORT);
    console.log('========================================');
    console.log('');
    console.log('Endpoints:');
    console.log('- /api/movies - Lista de filmes');
    console.log('- /api/movie/:id - Detalhes do filme');
    console.log('- /api/genres - Géneros');
    console.log('- /api/search - Busca');
    console.log('========================================');
});
