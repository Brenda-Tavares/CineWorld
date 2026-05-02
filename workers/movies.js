// Cloudflare Worker - Movies API
// Converted from Vercel Serverless Function

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const params = url.searchParams
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  const TMDB_API_KEY = CINEWORLD_TMDB_API_KEY
  const TMDB_BASE = 'https://api.themoviedb.org/3'
  
  let language = params.get('language') || 'pt-BR'
  let page = parseInt(params.get('page')) || 1
  let sort = params.get('sort') || 'popular'
  let q = params.get('q')
  let genre = params.get('genre')
  let origin = params.get('origin') || 'all'
  let year = params.get('year')
  
  const allowedLanguages = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR']
  const allowedSorts = ['popular', 'popularity', 'top', 'rating_desc', 'vote_average', 'worst', 'piores', 'upcoming']
  const allowedOrigins = ['all', 'BR', 'foreign']
  
  language = allowedLanguages.includes(language) ? language : 'pt-BR'
  page = Math.max(1, Math.min(500, page))
  sort = allowedSorts.includes(sort) ? sort : 'popular'
  origin = allowedOrigins.includes(origin) ? origin : 'all'
  
  let tmdbUrl = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&language=${language}&page=${page}`
  
  const sortMap = {
    'popular': 'popularity.desc',
    'popularity': 'popularity.desc',
    'top': 'vote_average.desc',
    'rating_desc': 'vote_average.desc',
    'vote_average': 'vote_average.desc',
    'worst': 'vote_average.asc',
    'piores': 'vote_average.asc'
  }
  
  if (q) {
    tmdbUrl = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=${language}&query=${encodeURIComponent(q)}&page=${page}`
  } else {
    tmdbUrl += `&sort_by=${sortMap[sort] || 'popularity.desc'}`
    if (genre && genre !== '0') tmdbUrl += `&with_genres=${genre}`
    if (origin === 'BR') tmdbUrl += '&with_origin_country=BR'
    if (origin === 'foreign') tmdbUrl += '&without_origin_country=BR'
    if (year) tmdbUrl += `&year=${year}`
  }
  
  try {
    const response = await fetch(tmdbUrl)
    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching movies' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
