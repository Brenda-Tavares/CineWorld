// Cloudflare Worker - Genres API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const TMDB_BASE = 'https://api.themoviedb.org/3'

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
  const language = params.get('language') || 'pt-BR'

  const langMap = {
    'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES',
    'zh': 'zh-CN', 'zh-TW': 'zh-TW', 'ja': 'ja-JP',
    'ru': 'ru-RU', 'ko': 'ko-KR'
  }

  const tmdbLang = langMap[language] || 'pt-BR'

  try {
    const url = `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${tmdbLang}`
    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify({ genres: data.genres || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar gêneros' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}