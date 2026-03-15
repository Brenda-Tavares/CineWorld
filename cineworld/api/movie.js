const axios = require('axios');

const TMDB_API_KEY = '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR'];

module.exports = async (req, res) => {
    let { id, language = 'pt-BR' } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'ID do filme e obrigatorio' });
    }
    
    id = parseInt(id);
    if (!id || id < 1 || id > 1000000) {
        return res.status(400).json({ error: 'ID invalido' });
    }
    
    language = ALLOWED_LANGUAGES.includes(language) ? language : 'pt-BR';
    
    try {
        // Busca detalhes do filme, provedores e videos
        const [movieRes, providersRes, videosRes] = await Promise.all([
            axios.get(`${TMDB_BASE}/movie/${id}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: language
                }
            }),
            axios.get(`${TMDB_BASE}/movie/${id}/watch/providers`, {
                params: {
                    api_key: TMDB_API_KEY
                }
            }),
            axios.get(`${TMDB_BASE}/movie/${id}/videos`, {
                params: {
                    api_key: TMDB_API_KEY
                }
            })
        ]);
        
        // Processa streaming
        let streaming = [];
        const providers = providersRes.data.results;
        
        if (providers.BR && providers.BR.flatrate) {
            streaming = providers.BR.flatrate.map(p => ({
                name: p.provider_name,
                logo: p.logo_path ? 'https://image.tmdb.org/t/p/w92' + p.logo_path : null
            }));
        } else if (providers.US && providers.US.flatrate) {
            streaming = providers.US.flatrate.map(p => ({
                name: p.provider_name,
                logo: p.logo_path ? 'https://image.tmdb.org/t/p/w92' + p.logo_path : null
            }));
        }
        
        // Busca trailer do YouTube
        let trailerUrl = null;
        const videos = videosRes.data.results;
        
        // Procura trailer em português primeiro, depois inglês
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
                       videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        
        if (trailer) {
            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
        }
        
        const movie = {
            ...movieRes.data,
            poster_path: movieRes.data.poster_path ? TMDB_IMAGE + movieRes.data.poster_path : null,
            backdrop_path: movieRes.data.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + movieRes.data.backdrop_path : null,
            streaming: streaming,
            trailer: trailerUrl
        };
        
        res.json({ success: true, movie });
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar detalhes do filme' });
    }
};
