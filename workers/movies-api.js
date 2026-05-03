// Cloudflare Worker - Movies List API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'

const languageMap = {
  'pt-BR': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
  'zh-CN': 'zh-CN', 'zh-HK': 'zh-TW', 'ja': 'ja-JP',
  'ru': 'ru-RU', 'ko': 'ko-KR'
}

const genreMap = {
  'acao': 28, 'action': 28,
  'comedia': 35, 'comedy': 35,
  'romance': 10749, 'amor': 10749,
  'terror': 27, 'horror': 27,
  'ficcao': 878, 'scifi': 878,
  'fantasia': 14, 'fantasy': 14,
  'anime': 16, 'animacao': 16,
  'drama': 18,
  'thriller': 53, 'suspense': 53,
  'misterio': 9648, 'mystery': 9648,
  'familia': 10751, 'family': 10751,
  'guerra': 10752, 'war': 10752,
  'crime': 80,
  'aventura': 12, 'adventure': 12,
  'documentario': 99
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const params = url.searchParams

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const TMDB_API_KEY = CINEWORLD_TMDB_API_KEY

  const page = params.get('page') || '1'
  const language = params.get('language') || 'pt-BR'
  const sortBy = params.get('sort_by') || 'popularity.desc'
  const genre = params.get('genre')
  const year = params.get('year')

  const tmdbLang = languageMap[language] || 'pt-BR'

  try {
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: tmdbLang,
      page: page,
      sort_by: sortBy
    })

    if (genre && genreMap[genre.toLowerCase()]) {
      queryParams.set('with_genres', genreMap[genre.toLowerCase()])
    }

    if (year) {
      queryParams.set('primary_release_year', year)
    }

    const endpoint = params.get('endpoint') || 'popular'
    let url = `${TMDB_BASE}/movie/${endpoint}?${queryParams}`

    if (params.get('q')) {
      url = `${TMDB_BASE}/search/movie?${queryParams}&query=${encodeURIComponent(params.get('q'))}`
    }

    const response = await fetch(url)
    const data = await response.json()

    const movies = (data.results || []).map(m => ({
      ...m,
      poster_path: m.poster_path ? TMDB_IMAGE + m.poster_path : null,
      backdrop_path: m.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + m.backdrop_path : null
    }))

    return new Response(JSON.stringify({
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: movies
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar filmes' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}