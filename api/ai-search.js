const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAqC8W549DIi3X-sQVoF9B0pI2n601k7po';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const languageMap = {
    'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
    'zh-CN': 'zh-CN', 'zh-HK': 'zh-TW', 'ja': 'ja-JP',
    'ru': 'ru-RU', 'ko': 'ko-KR'
};

const genreMap = {
    'ação': 28, 'acao': 28, 'action': 28,
    'comédia': 35, 'comedia': 35, 'comedy': 35,
    'romance': 10749, 'romântica': 10749, 'romantico': 10749, 'amor': 10749, 'love': 10749,
    'terror': 27, 'horror': 27, 'fear': 27,
    'ficção': 878, 'ficcao': 878, 'sci-fi': 878, 'science fiction': 878, 'scifi': 878,
    'fantasia': 14, 'fantasy': 14, 'magia': 14,
    'animação': 16, 'animacao': 16, 'animation': 16, 'anime': 16,
    'drama': 18,
    'thriller': 53, 'suspense': 53,
    'mistério': 9648, 'misterio': 9648, 'mystery': 9648,
    'família': 10751, 'familia': 10751, 'family': 10751,
    'guerra': 10752, 'war': 10752,
    'musical': 10402, 'music': 10402,
    'história': 36, 'historia': 36, 'history': 36,
    'crime': 80, 'policial': 80, 'police': 80,
    'avventura': 12, 'adventure': 12,
    'commedia': 35
};

const langMap = {
    'coreano': 'ko', 'korean': 'ko', 'kr': 'ko',
    'japonês': 'ja', 'japanese': 'ja', 'jp': 'ja',
    'chinês': 'zh', 'chinese': 'zh', 'cn': 'zh',
    'hindi': 'hi', 'indiano': 'hi', 'india': 'hi',
    'brasileiro': 'pt', 'brasil': 'pt', 'br': 'pt', 'português': 'pt',
    'americano': 'en', 'inglês': 'en', 'english': 'en', 'us': 'en', 'americano': 'en',
    'espanhol': 'es', 'mexicano': 'es', 'spanish': 'es',
    'francês': 'fr', 'french': 'fr',
    'italiano': 'it', 'italian': 'it',
    'alemão': 'de', 'german': 'de'
};

async function callGemini(query, language) {
    const langNames = {
        'pt-BR': 'português', 'en': 'inglês', 'es': 'espanhol',
        'zh-CN': 'chinês', 'zh-HK': 'cantonês', 'ja': 'japonês',
        'ru': 'russo', 'ko': 'coreano'
    };
    const userLang = langNames[language] || 'português';
    
    const prompt = `Você é um assistente de busca de filmes. O usuário quer encontrar um filme baseado nesta descrição: "${query}"

Analise a descrição e extraia os seguintes parâmetros de busca:
1. **palavras-chave** (keywords): palavras importantes para buscar no título/sinopse do filme
2. **gênero** (genre): o gênero do filme (ação, comédia, romance, terror, etc)
3. **idioma** (language): o idioma original do filme (se mencionado)
4. **ano** (year): o ano de lançamento aproximado (se mencionado, ex: "filme dos anos 80", "filme de 2010")
5. **outras pistas**: qualquer outra informação útil (ator, diretor, tema, etc)

Responda APENAS com um objeto JSON válido, sem nenhum texto adicional:
{
    "keywords": ["palavra1", "palavra2"],
    "genre": "nome do gênero em inglês",
    "language": "código do idioma (en, pt, es, ja, ko, zh, fr, it, de)",
    "year": null ou número,
    "other_clues": ["pista1", "pista2"]
}

Exemplo:
- Input: "filme de ação com homem que voa e usa capa vermelha"
- Output: {"keywords": ["homem voa", "capa vermelha", "super-herói"], "genre": "action", "language": null, "year": null, "other_clues": ["Marvel", "homem com poderes"]}

Input: "${query}"
Output:`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 500,
                    responseMimeType: 'application/json'
                }
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error('Erro Gemini:', error.message);
        return null;
    }
}

async function searchTMDB(params, tmdbLang, pageNum) {
    let moviesRes;
    
    const apiParams = {
        api_key: TMDB_API_KEY,
        language: tmdbLang,
        page: pageNum,
        'vote_count.gte': 3
    };
    
    const hasFilters = params.genre || params.language || params.year;
    
    if (hasFilters) {
        if (params.genre) apiParams.with_genres = params.genre;
        if (params.language) apiParams.with_original_language = params.language;
        if (params.year) apiParams.primary_release_year = params.year;
        apiParams.sort_by = 'popularity.desc';
        
        moviesRes = await axios.get(`${TMDB_BASE}/discover/movie`, { params: apiParams });
    } else {
        apiParams.query = params.keywords.join(' ');
        if (params.year) apiParams.primary_release_year = params.year;
        
        moviesRes = await axios.get(`${TMDB_BASE}/search/movie`, { params: apiParams });
    }
    
    let results = moviesRes.data.results || [];
    
    if (params.keywords.length > 0 && results.length < 5) {
        const searchQuery = params.keywords.join(' ');
        const searchParams = {
            api_key: TMDB_API_KEY,
            language: tmdbLang,
            page: 1,
            query: searchQuery
        };
        
        const searchRes = await axios.get(`${TMDB_BASE}/search/movie`, { params: searchParams });
        
        if (searchRes.data.results) {
            const existingIds = new Set(results.map(m => m.id));
            for (const movie of searchRes.data.results) {
                if (!existingIds.has(movie.id)) {
                    results.push(movie);
                }
            }
        }
    }
    
    return results.map(movie => ({
        ...movie,
        poster_path: movie.poster_path ? TMDB_IMAGE + movie.poster_path : null,
        backdrop_path: movie.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + movie.backdrop_path : null
    }));
}

module.exports = async (req, res) => {
    const { q = '', page = 1, language = 'pt-BR' } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query obrigatória' });
    }
    
    const tmdbLang = languageMap[language] || 'pt-BR';
    const pageNum = Math.max(1, Math.min(500, parseInt(page) || 1));
    
    try {
        const params = await callGemini(q, language);
        
        if (!params) {
            const fallbackParams = {
                keywords: q.toLowerCase().split(' ').filter(w => w.length > 2),
                genre: null,
                language: null,
                year: null,
                other_clues: []
            };
            return res.json(await searchTMDB(fallbackParams, tmdbLang, pageNum));
        }
        
        let genreId = null;
        if (params.genre) {
            const genreLower = params.genre.toLowerCase();
            for (const [keyword, id] of Object.entries(genreMap)) {
                if (genreLower.includes(keyword)) {
                    genreId = id;
                    break;
                }
            }
        }
        
        let langCode = null;
        if (params.language) {
            const langLower = params.language.toLowerCase();
            for (const [keyword, code] of Object.entries(langMap)) {
                if (langLower.includes(keyword)) {
                    langCode = code;
                    break;
                }
            }
        }
        
        const searchParams = {
            keywords: params.keywords || [],
            genre: genreId,
            language: langCode,
            year: params.year,
            other_clues: params.other_clues || []
        };
        
        const movies = await searchTMDB(searchParams, tmdbLang, pageNum);
        
        if (movies.length === 0 && searchParams.keywords.length > 0) {
            const simpleSearch = {
                keywords: searchParams.keywords.slice(0, 2),
                genre: null,
                language: null,
                year: null
            };
            const fallbackMovies = await searchTMDB(simpleSearch, tmdbLang, pageNum);
            
            return res.json({
                page: pageNum,
                total_pages: 1,
                results: fallbackMovies
            });
        }
        
        res.json({
            page: pageNum,
            total_pages: Math.min(10, Math.ceil(movies.length / 20)),
            results: movies
        });
        
    } catch (error) {
        console.error('Erro na busca:', error.message);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
};
