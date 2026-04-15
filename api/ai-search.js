const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const languageMap = {
    'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
    'zh-CN': 'zh-CN', 'zh-HK': 'zh-TW', 'ja': 'ja-JP',
    'ru': 'ru-RU', 'ko': 'ko-KR'
};

module.exports = async (req, res) => {
    const { q = '', page = 1, language = 'pt-BR', year } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query obrigatória' });
    }
    
    const tmdbLang = languageMap[language] || 'pt-BR';
    const pageNum = Math.max(1, Math.min(500, parseInt(page) || 1));
    const qLower = q.toLowerCase();
    
    // Validate year parameter
    const currentYear = new Date().getFullYear();
    let yearFilter = null;
    if (year) {
        yearFilter = parseInt(year);
        if (isNaN(yearFilter) || yearFilter < 1900 || yearFilter > currentYear) {
            yearFilter = null;
        }
    }
    
    try {
        // Mapeamentos
        const genreMap = {
            'ação': 28, 'acao': 28, 'action': 28,
            'comédia': 35, 'comedia': 35, 'comedy': 35,
            'romance': 10749, 'romântica': 10749, 'romantico': 10749, 'amor': 10749,
            'terror': 27, 'horror': 27,
            'ficção': 878, 'sci-fi': 878, 'ficção científica': 878,
            'fantasia': 14, 'fantasy': 14,
            'animação': 16, 'animacao': 16,
            'anime': 16,
            'drama': 18,
            'thriller': 53, 'suspense': 53,
            'mistério': 9648, 'misterio': 9648,
            'família': 10751, 'familia': 10751,
            'guerra': 10752,
            'musical': 10402,
            'história': 36,
            'crime': 80, 'policial': 80
        };
        
        const langMap = {
            'coreano': 'ko', 'korean': 'ko',
            'japonês': 'ja', 'japanese': 'ja',
            'chinês': 'zh', 'chinese': 'zh',
            'hindi': 'hi', 'indiano': 'hi',
            'brasileiro': 'pt', 'brasil': 'pt',
            'americano': 'en', 'inglês': 'en',
            'espanhol': 'es', 'mexicano': 'es',
            'francês': 'fr'
        };
        
        // Detectar gênero
        let genreId = null;
        let isAnimeSearch = qLower.includes('anime');
        
        for (const [keyword, id] of Object.entries(genreMap)) {
            if (qLower.includes(keyword)) {
                genreId = id;
                break;
            }
        }
        
        // Detectar idioma
        let langCode = null;
        for (const [keyword, code] of Object.entries(langMap)) {
            if (qLower.includes(keyword)) {
                langCode = code;
                break;
            }
        }
        
        // Se pesquisou anime, forçar idioma japonês
        if (isAnimeSearch && !langCode) {
            langCode = 'ja';
        }
        
        let moviesRes;
        
        if (genreId || langCode || yearFilter) {
            // Busca com filtros
            const params = {
                api_key: TMDB_API_KEY,
                language: tmdbLang,
                page: pageNum,
                sort_by: 'popularity.desc',
                'vote_count.gte': 3
            };
            
            if (genreId) params.with_genres = genreId;
            if (langCode) params.with_original_language = langCode;
            if (yearFilter) params.primary_release_year = yearFilter;
            
            moviesRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params });
        } else {
            // Busca direta
            const params = {
                api_key: TMDB_API_KEY,
                language: tmdbLang,
                page: pageNum,
                query: q
            };
            
            if (yearFilter) params.primary_release_year = yearFilter;
            
            moviesRes = await axios.get(`${TMDB_BASE}/search/movie`, { params });
        }
        
        // Se é busca de anime, filtrar resultados que são realmente anime
        if (isAnimeSearch && moviesRes.data.results) {
            const animeKeywords = ['anime', 'shonen', 'shojo', 'seinen', 'japão', 'japanese animation'];
            const filtered = moviesRes.data.results.filter(m => {
                const title = (m.title || '').toLowerCase();
                const overview = (m.overview || '').toLowerCase();
                const origTitle = (m.original_title || '').toLowerCase();
                
                // aceitar se tem caracteres japoneses no título original
                const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(m.original_title || '');
                
                return hasJapaneseChars || 
                       animeKeywords.some(k => title.includes(k) || overview.includes(k) || origTitle.includes(k)) ||
                       m.original_language === 'ja';
            });
            
            if (filtered.length > 0) {
                moviesRes.data.results = filtered;
            }
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