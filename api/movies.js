const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR'];
const ALLOWED_SORTS = ['popular', 'popularity', 'top', 'rating_desc', 'vote_average', 'worst', 'piores', 'upcoming'];
const ALLOWED_ORIGINS = ['all', 'BR', 'foreign'];
const MAX_PAGE = 500;
const MIN_PAGE = 1;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    let { language = 'pt-BR', page = 1, sort = 'popular', q, genre, origin, year } = req.query;
    
    language = ALLOWED_LANGUAGES.includes(language) ? language : 'pt-BR';
    page = Math.max(MIN_PAGE, Math.min(MAX_PAGE, parseInt(page) || 1));
    sort = ALLOWED_SORTS.includes(sort) ? sort : 'popular';
    origin = ALLOWED_ORIGINS.includes(origin) ? origin : 'all';
    
    if (genre) {
        genre = parseInt(genre) || 0;
    }
    
    // Validate year parameter (between 1900 and current year)
    const currentYear = new Date().getFullYear();
    if (year) {
        year = parseInt(year);
        if (isNaN(year) || year < 1900 || year > currentYear) {
            year = null;
        }
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
        
        // Se há busca (q), fazer busca inteligente
        if (q) {
            q = String(q).substring(0, 100).replace(/[<>]/g, '');
            const searchLower = q.toLowerCase();
            
            // Detectar idioma de origem
            const languageKeywords = {
                'coreano': 'ko', 'korean': 'ko', 'corea': 'ko',
                'japonês': 'ja', 'japanese': 'ja', 'japao': 'ja', 'japão': 'ja',
                'chinês': 'zh', 'chinese': 'zh', 'china': 'zh',
                'hindi': 'hi', 'indiano': 'hi', 'india': 'hi',
                'americano': 'en', 'americano': 'en', 'EUA': 'en',
                'brasileiro': 'pt', 'brasil': 'pt',
                'mexicano': 'es', 'mexico': 'es',
                'francês': 'fr', 'french': 'fr', 'franca': 'fr',
                'britânico': 'en', 'britanico': 'en', 'UK': 'en'
            };
            
            let detectedLang = null;
            for (const [keyword, langCode] of Object.entries(languageKeywords)) {
                if (searchLower.includes(keyword)) {
                    detectedLang = langCode;
                    break;
                }
            }
            
            
            
            // Mapeamento de palavras-chave para gêneros
            const keywordToGenre = {
                'ação': 28, 'acao': 28, 'action': 28,
                'comédia': 35, 'comedia': 35, 'comedy': 35,
                'romance': 10749, 'amor': 10749, 'romântica': 10749, 'romantica': 10749, 'romantico': 10749,
                'terror': 27, 'horror': 27, 'medo': 27, 'scary': 27,
                'ficção científica': 878, 'ficcao cientifica': 878, 'sci-fi': 878, 'sci fi': 878, 'scifi': 878,
                'fantasia': 14, 'magia': 14, 'fantasy': 14,
                'animação': 16, 'animacao': 16, 'desenho': 16, 'animation': 16, 'anime': 16,
                'drama': 18,
                'thriller': 53, 'suspense': 53,
                'mistério': 9648, 'misterio': 9648, 'mystery': 9648,
                'documentário': 99, 'documentario': 99, 'documentary': 99,
                'família': 10751, 'familia': 10751, 'family': 10751,
                'guerra': 10752, 'war': 10752,
                'western': 37,
                'música': 10402, 'musica': 10402, 'music': 10402,
                'história': 36, 'historia': 36, 'history': 36,
                'policial': 80, 'crime': 80, 'cop': 80,
                'vingança': 28, 'vinganca': 28, 'vengar': 28, 'revenge': 28, 'vingar': 28,
                'robô': 878, 'robo': 878, 'robot': 878, 'ai': 878,
                'zumbi': 27, 'zombie': 27, 'zumbi': 27,
                'assassinato': 80, 'morte': 80, 'kill': 80, 'death': 80,
                'kid': 10751, 'infantil': 10751, 'criança': 10751, 'crianca': 10751, 'children': 10751,
                'mulher': 10749, 'feminino': 10749, 'woman': 10749, 'female': 10749, 'mulheres': 10749,
                'psicologico': 53, 'psicológico': 53, 'psychological': 53,
                'slasher': 27,
                'esporte': 18, 'sports': 18,
                'musical': 10402, 'musical': 10402
            };
            
            let foundGenre = null;
            for (const [keyword, genreId] of Object.entries(keywordToGenre)) {
                if (searchLower.includes(keyword)) {
                    foundGenre = genreId;
                    break;
                }
            }
            
            // Busca avançada com filtros de gênero e idioma
            if (foundGenre || detectedLang) {
                const params = {
                    api_key: TMDB_API_KEY,
                    language: language,
                    page: page,
                    sort_by: 'popularity.desc',
                    'vote_count.gte': 3
                };
                
                if (foundGenre) params.with_genres = foundGenre;
                if (detectedLang) params.with_original_language = detectedLang;
                
                moviesRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params });
            } else {
                // Busca normal no título - mais ampla
                moviesRes = await axios.get(`${TMDB_BASE}/search/movie`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        language: language,
                        page: page,
                        query: q
                    }
                });
            }
        } else {
            const today = new Date().toISOString().split('T')[0];
            
            if (sort === 'upcoming') {
                moviesRes = await axios.get(`${TMDB_BASE}/movie/upcoming`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        language: language,
                        page: page,
                        region: 'BR'
                    }
                });
                const filteredResults = moviesRes.data.results.filter(m => 
                    !m.release_date || m.release_date > today
                );
                moviesRes.data.results = filteredResults;
                moviesRes.data.total = filteredResults.length;
            } else {
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
                
                if (year) {
                    params.primary_release_year = year;
                }
                
                if (origin === 'BR') {
                    params.with_original_language = 'pt';
                } else if (origin === 'foreign') {
                    params.with_original_language = 'en';
                }
                
                moviesRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params });
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
        res.status(500).json({ error: 'Erro ao buscar filmes: ' + error.message });
    }
};
