const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';

module.exports = async (req, res) => {
    const { movie_id } = req.query;
    
    if (!movie_id) {
        return res.status(400).json({ error: 'ID do filme e obrigatorio' });
    }
    
    const id = parseInt(movie_id);
    if (!id || id < 1 || id > 1000000) {
        return res.status(400).json({ error: 'ID invalido' });
    }
    
    try {
        // Busca streaming no Brasil
        const response = await axios.get(`${TMDB_BASE}/movie/${id}/watch/providers`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        
        const providers = response.data.results;
        let streaming = [];
        
        // Serviços gratuitos conhecidos
        const freeServices = ['YouTube', 'Tubi', 'Pluto TV', ' Peacock', 'Peacock', ' Crackle', 'Crackle', 'Viki', 'Rakuten', 'Kanopy', 'Freevee', 'Xumo', 'Plex', 'Hoopla'];
        
        // Brasil
        if (providers.BR) {
            if (providers.BR.flatrate) {
                streaming = streaming.concat(providers.BR.flatrate.map(p => ({ ...p, type: 'flatrate' })));
            }
            if (providers.BR.rent) {
                streaming = streaming.concat(providers.BR.rent.map(p => ({ ...p, type: 'rent' })));
            }
            if (providers.BR.buy) {
                streaming = streaming.concat(providers.BR.buy.map(p => ({ ...p, type: 'buy' })));
            }
        }
        
        // Fallback: EUA se Brasil não tiver
        if (streaming.length === 0 && providers.US) {
            if (providers.US.flatrate) {
                streaming = streaming.concat(providers.US.flatrate.map(p => ({ ...p, type: 'flatrate' })));
            }
            if (providers.US.rent) {
                streaming = streaming.concat(providers.US.rent.map(p => ({ ...p, type: 'rent' })));
            }
            if (providers.US.buy) {
                streaming = streaming.concat(providers.US.buy.map(p => ({ ...p, type: 'buy' })));
            }
        }
        
        // Verificar se é gratuito
        const checkFree = (name) => freeServices.some(free => name.toLowerCase().includes(free.toLowerCase()));
        
        // Pegar só nome e logo
        const result = streaming.map(p => ({
            name: p.provider_name,
            logo: p.logo_path ? 'https://image.tmdb.org/t/p/w92' + p.logo_path : null,
            type: p.type || 'flatrate',
            isFree: checkFree(p.provider_name),
            link: `https://www.google.com/search?q=${encodeURIComponent(p.provider_name + ' ' + movie_id + ' filme')}`
        }));
        
        res.json({ success: true, streaming: result });
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar streaming' });
    }
};
