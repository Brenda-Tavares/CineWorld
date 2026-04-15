const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'SUA_CHAVE_TMDB_AQUI';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// ============ MEDIDAS DE SEGURANÇA ============
// 1. Rate Limiting (prevenir ataques DDoS/brute force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Helmet - Headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://image.tmdb.org"],
      connectSrc: ["'self'", "https://api.themoviedb.org"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false // Para permitir imagens do TMDB
}));

// 3. CORS configurado
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cineworld.web.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 horas
}));

// 4. Outros middlewares
app.use(express.json({ limit: '10kb' })); // Limitar tamanho do JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Headers de segurança personalizados
app.use((req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Política de referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissões de recursos
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// ============ ROTAS COM SEGURANÇA ============

// Health check (sem rate limit)
app.get('/', (req, res) => {
  res.json({ 
    message: 'CineWorld API TMDB - FILTRO POR GÊNERO', 
    status: 'online',
    version: '2.0.0',
    ano: 2026,
    endpoints: {
      genres: '/api/genres',
      movies: '/api/movies?genre=28',
      search: '/api/movies?query=avatar',
      health: '/api/health'
    },
    security: {
      rateLimit: '100 req/15min por IP',
      cors: 'Apenas origens permitidas',
      headers: 'Helmet + Security Headers'
    }
  });
});

// Health check detalhado
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tmdb: TMDB_API_KEY ? 'CONECTADO' : 'SEM CHAVE',
    memory: process.memoryUsage(),
    security: '✅ Rate limiting, CORS, Headers de segurança',
    ano: 2026
  });
});

// Aplicar rate limiting em todas as rotas API
app.use('/api/', apiLimiter);

// Lista de gêneros
app.get('/api/genres', (req, res) => {
  const genres = [
    {
      id: 0,
      name: 'Todos os Filmes',
      description: 'Filmes de todos os gêneros',
      icon: '🎬',
      color: '#4361ee'
    },
    // ... (seu array completo de gêneros aqui - mantém igual)
  ];
  
  res.json({ 
    success: true, 
    genres: genres,
    total: genres.length,
    security: '✅ Protegido por rate limiting',
    ano: 2026
  });
});

// Função de validação de entrada
const validateMovieParams = (req, res, next) => {
  const { page, genre, sort, query } = req.query;
  
  // Validar página (1-500)
  const pageNum = parseInt(page) || 1;
  if (pageNum < 1 || pageNum > 500) {
    return res.status(400).json({ 
      success: false, 
      error: 'Página inválida. Use valores entre 1 e 500.',
      code: 'INVALID_PAGE'
    });
  }
  
  // Validar gênero
  if (genre && !/^(\d+|0|all)$/.test(genre)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Gênero inválido. Use números, 0 ou "all".',
      code: 'INVALID_GENRE'
    });
  }
  
  // Validar ordenação
  const validSorts = ['popularity', 'rating_desc', 'rating_asc', 'release_desc', 'release_asc'];
  if (sort && !validSorts.includes(sort)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Ordenação inválida.',
      code: 'INVALID_SORT',
      validSorts: validSorts
    });
  }
  
  // Validar busca (max 100 caracteres)
  if (query && query.length > 100) {
    return res.status(400).json({ 
      success: false, 
      error: 'Busca muito longa. Máximo 100 caracteres.',
      code: 'QUERY_TOO_LONG'
    });
  }
  
  // Sanitizar inputs
  req.query.page = Math.min(Math.max(pageNum, 1), 500);
  req.query.genre = genre || '0';
  req.query.sort = validSorts.includes(sort) ? sort : 'popularity';
  req.query.query = query ? query.substring(0, 100) : '';
  
  next();
};

// BUSCA DE FILMES COM VALIDAÇÃO
app.get('/api/movies', validateMovieParams, async (req, res) => {
  try {
    const { 
      genre = '0',
      page = 1, 
      query = '',
      language = 'pt-BR',
      sort = 'popularity'
    } = req.query;
    
    console.log(`[SEGURANÇA] Request de ${req.ip} - genre:${genre}, page:${page}, sort:${sort}`);
    
    // Configurar ordenação
    let sortBy = 'popularity.desc';
    if (sort === 'rating_desc') sortBy = 'vote_average.desc';
    else if (sort === 'rating_asc') sortBy = 'vote_average.asc';
    else if (sort === 'release_desc') sortBy = 'primary_release_date.desc';
    else if (sort === 'release_asc') sortBy = 'primary_release_date.asc';
    
    let url, params = {
      api_key: TMDB_API_KEY,
      page: parseInt(page),
      language: language,
      include_adult: false
    };
    
    // Lógica de busca (mantém igual à sua)
    if (query && query.trim() !== '') {
      url = TMDB_BASE_URL + '/search/movie';
      params.query = query;
    } else if (genre === '0' || genre === 'all') {
      if (sort === 'rating_desc' || sort === 'rating_asc' || 
          sort === 'release_desc' || sort === 'release_asc') {
        url = TMDB_BASE_URL + '/discover/movie';
        params.sort_by = sortBy;
        params['vote_count.gte'] = 50;
      } else {
        url = TMDB_BASE_URL + '/movie/popular';
      }
    } else {
      url = TMDB_BASE_URL + '/discover/movie';
      params.with_genres = genre;
      params.sort_by = sortBy;
      params['vote_count.gte'] = 50;
    }
    
    const response = await axios.get(url, { params, timeout: 10000 }); // Timeout de 10s
    
    // Processar resultados
    let processedMovies = response.data.results;
    
    if (query || sort === 'rating_desc' || sort === 'rating_asc' || 
        sort === 'release_desc' || sort === 'release_asc') {
      processedMovies = sortMovies(processedMovies, sort);
    }
    
    processedMovies = processedMovies.map(movie => ({
      ...movie,
      production_country: getCountryFromLanguage(movie.original_language),
      language_name: getLanguageName(movie.original_language)
    }));
    
    res.json({
      success: true,
      page: response.data.page,
      totalPages: response.data.total_pages > 500 ? 500 : response.data.total_pages,
      totalResults: response.data.total_results,
      movies: processedMovies,
      genre: genre,
      query: query || null,
      sort: sort,
      security: '✅ Validação de entrada + Rate limiting',
      ano: 2026
    });
    
  } catch (error) {
    console.error('[ERRO SEGURANÇA] TMDB:', error.message);
    
    // Fallback seguro
    let mockMovies = getMockMoviesByGenre(req.query.genre || '0');
    const sort = req.query.sort || 'popularity';
    mockMovies = sortMovies(mockMovies, sort);
    
    const pageSize = 20;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedMovies = mockMovies.slice(startIndex, startIndex + pageSize);
    
    res.json({
      success: true,
      page: page,
      totalPages: Math.ceil(mockMovies.length / pageSize),
      totalResults: mockMovies.length,
      movies: paginatedMovies,
      genre: req.query.genre || '0',
      query: req.query.query || null,
      sort: sort,
      warning: 'Usando dados de exemplo - TMDB offline',
      security: '✅ Modo fallback seguro',
      ano: 2026
    });
  }
});

// Handler de erros global
app.use((err, req, res, next) => {
  console.error('[ERRO GLOBAL]', err.stack);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload muito grande',
      message: 'O corpo da requisição excede o limite permitido.',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro interno.',
    code: 'INTERNAL_ERROR'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe.`,
    code: 'ROUTE_NOT_FOUND',
    availableRoutes: {
      home: '/',
      health: '/api/health',
      genres: '/api/genres',
      movies: '/api/movies'
    }
  });
});

// Funções auxiliares (mantém suas funções sortMovies, getMockMoviesByGenre, etc.)
function sortMovies(movies, sortType) {
  // ... (sua função sortMovies aqui)
}

function getMockMoviesByGenre(genreId) {
  // ... (sua função getMockMoviesByGenre aqui)
}

function getLanguageName(languageCode) {
  // ... (sua função getLanguageName aqui)
}

function getCountryFromLanguage(languageCode) {
  // ... (sua função getCountryFromLanguage aqui)
}

// Iniciar servidor
const server = app.listen(PORT, () => {
  const ano = new Date().getFullYear();
  console.log('\n' + '='.repeat(80));
  console.log(`🔥 CINEWORLD BACKEND ${ano} - MODO SEGURANÇA ATIVADO!`);
  console.log('='.repeat(80));
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔐 Segurança: Rate limiting, Helmet, CORS, Validação de entrada`);
  console.log(`📊 TMDB: ${TMDB_API_KEY ? '✅ CONECTADO' : '⚠️ SEM CHAVE (usando mock)'}`);
  console.log(`⚡ Rate Limit: 100 req/15min por IP`);
  console.log('='.repeat(80));
  console.log('\n🚀 ENDPOINTS SEGUROS:');
  console.log(`Home: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Gêneros: http://localhost:${PORT}/api/genres`);
  console.log(`Filmes: http://localhost:${PORT}/api/movies?genre=28&sort=rating_desc`);
  console.log('='.repeat(80) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SEGURANÇA] Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('[SEGURANÇA] Servidor encerrado com segurança.');
    process.exit(0);
  });
});