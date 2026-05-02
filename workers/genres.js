// Cloudflare Worker - Genres API

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

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
  const TMDB_BASE = 'https://api.themoviedb.org/3'
  
  let language = params.get('language') || 'pt-BR'
  const allowedLanguages = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR']
  language = allowedLanguages.includes(language) ? language : 'pt-BR'
  
  // Simple cache (Cloudflare Workers has no global cache like Node.js)
  try {
    const response = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${language}`)
    const data = await response.json()
    return new Response(JSON.stringify(data.genres), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching genres' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
