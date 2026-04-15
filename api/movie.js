const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR'];

module.exports = async (req, res) => {
    let { id, language = 'pt-BR' } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'ID obrigatório' });
    }
    
    id = parseInt(id);
    if (!id || id < 1 || id > 2000000) {
        return res.status(400).json({ error: 'ID inválido: ' + id });
    }
    
    language = ALLOWED_LANGUAGES.includes(language) ? language : 'pt-BR';
    
    try {
        // Buscar detalhes do filme
        const movieRes = await axios.get(`${TMDB_BASE}/movie/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: language
            }
        });
        
        // Buscar provedores de streaming
        let providersRes;
        try {
            providersRes = await axios.get(`${TMDB_BASE}/movie/${id}/watch/providers`, {
                params: { api_key: TMDB_API_KEY }
            });
        } catch (e) {
            providersRes = { data: { results: {} } };
        }
        
        // Buscar vídeos/trailer
        let videosRes;
        try {
            videosRes = await axios.get(`${TMDB_BASE}/movie/${id}/videos`, {
                params: { api_key: TMDB_API_KEY }
            });
        } catch (e) {
            videosRes = { data: { results: [] } };
        }
        
        // Processa streaming
        const freeStreamingServices = ['Tubi', 'Pluto TV', 'Peacock', 'Crackle', 'Viki', 'Rakuten', 'Kanopy', 'Freevee', 'Xumo', 'Plex', 'Hoopla', 'Muse', 'Mubi', 'RetroPlex', 'Shudder', 'Screambox', 'Fandor', 'Filmrise', 'Popcornflix', 'Yidio', 'Vudu', 'CONtv', 'Dekkoo', 'Revry', 'Asiancrush', 'Hi-YAH', 'Viki'];
        const checkFreeStreaming = (name) => freeStreamingServices.some(free => name.toLowerCase().includes(free.toLowerCase()));
        
        // Mapeamento de links diretos para plataformas populares
        const platformLinks = {
            // Streamings principais
            'Netflix': 'https://www.netflix.com',
            'Amazon Prime Video': 'https://www.primevideo.com',
            'Disney': 'https://www.disneyplus.com',
            'Disney+': 'https://www.disneyplus.com',
            'HBO Max': 'https://www.hbomax.com',
            'HBO': 'https://www.hbomax.com',
            'Apple TV': 'https://tv.apple.com',
            'Paramount': 'https://www.paramountplus.com',
            'Globo': 'https://globoplay.globo.com',
            'Netflix': 'https://www.netflix.com',
            
            // Streamings gratuitos
            'Tubi': 'https://tubi.tv',
            'Pluto TV': 'https://pluto.tv',
            'Peacock': 'https://www.peacocktv.com',
            'Crackle': 'https://www.crackle.com',
            'Viki': 'https://www.viki.com',
            'Rakuten': 'https://www.rakuten.tv',
            'Kanopy': 'https://www.kanopy.com',
            'Freevee': 'https://www.freevee.com',
            'Xumo': 'https://www.xumo.com',
            'Plex': 'https://www.plex.tv',
            'Crunchyroll': 'https://www.crunchyroll.com',
            'Muse': 'https://muse.ai',
            'Mubi': 'https://mubi.com',
            'Shudder': 'https://www.shudder.com',
            'Yidio': 'https://www.yidio.com',
            'Vudu': 'https://www.vudu.com',
            
            // Streamings brasileiros
            'Claro': 'https://www.clarotvplus.com.br',
            'Claro tv': 'https://www.clarotvplus.com.br',
            'Sky': 'https://www.sky.com.br',
            'Telecine': 'https://www.telecine.com.br',
            'Looke': 'https://www.looke.com.br',
            'PlayPlus': 'https://www.playplus.com',
            'Glogin': 'https://globoplay.globo.com',
            'Amazon Channels': 'https://www.primevideo.com/channels',
            
            // Outros
            'Google Play': 'https://play.google.com/store/movies',
            'YouTube': 'https://www.youtube.com',
            'iTunes': 'https://tv.apple.com',
            'Microsoft': 'https://www.microsoft.com/store/movies'
        };
        
        const getPlatformLink = (name, movieTitle) => {
            // Verifica se é uma plataforma conhecida
            for (const [platform, url] of Object.entries(platformLinks)) {
                if (name.toLowerCase().includes(platform.toLowerCase())) {
                    return url;
                }
            }
            // Fallback: busca no Google
            return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + movieTitle + ' filme')}`;
        };
        
        let streaming = [];
        const providers = providersRes.data.results || {};
        
        const addProviders = (list, type) => {
            if (list && Array.isArray(list)) {
                list.forEach(p => {
                    // youtube só é gratuito se for streaming, não rent/buy
                    const isFree = type === 'flatrate' && checkFreeStreaming(p.provider_name);
                    streaming.push({
                        name: p.provider_name,
                        logo: p.logo_path ? 'https://image.tmdb.org/t/p/w92' + p.logo_path : null,
                        type: type,
                        isFree: isFree,
                        link: getPlatformLink(p.provider_name, movieRes.data.title)
                    });
                });
            }
        };
        
        if (providers.BR) {
            addProviders(providers.BR.flatrate, 'flatrate');
            addProviders(providers.BR.rent, 'rent');
            addProviders(providers.BR.buy, 'buy');
        }
        
        if (streaming.length === 0 && providers.US) {
            addProviders(providers.US.flatrate, 'flatrate');
            addProviders(providers.US.rent, 'rent');
            addProviders(providers.US.buy, 'buy');
        }
        
        // Add free alternatives only if no streaming paid available
        const hasPaidStreaming = streaming.some(s => s.type === 'flatrate' && !s.isFree);
        
        if (!hasPaidStreaming) {
            const freeAlternatives = [
                { name: 'Stremio', logo: null, link: 'https://www.stremio.com/', isFree: true, type: 'free-alt' },
                { name: 'Pluto TV', logo: null, link: 'https://pluto.tv/', isFree: true, type: 'free-alt' },
                { name: 'Tubi', logo: null, link: 'https://tubi.tv/', isFree: true, type: 'free-alt' },
                { name: 'Google Play', logo: null, link: 'https://play.google.com/store/movies', isFree: true, type: 'free-alt' },
                { name: 'Plex', logo: null, link: 'https://www.plex.tv/', isFree: true, type: 'free-alt' },
                { name: 'Viki', logo: null, link: 'https://www.viki.com/', isFree: true, type: 'free-alt' },
                { name: 'Crackle', logo: null, link: 'https://www.crackle.com/', isFree: true, type: 'free-alt' }
            ];
            streaming = [...streaming, ...freeAlternatives];
        }
        
        // Busca trailer
        let trailerUrl = null;
        const videos = videosRes.data.results || [];
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                    videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
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
        console.error('movie.js error:', error.message);
        res.status(500).json({ error: 'Erro ao buscar filme: ' + error.message });
    }
};