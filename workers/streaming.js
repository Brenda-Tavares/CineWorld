// Cloudflare Worker - Streaming API//
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
  
  const movieId = params.get('movie_id')
  
  if (!movieId) {
    return new Response(JSON.stringify({ error: 'ID do filme obrigatório' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  try {
    const response = await fetch(`${TMDB_BASE}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`)
    const data = await response.json()
    const providers = data.results || {}
    
    let streaming = []
    const freeServices = ['Tubi', 'Pluto TV', 'Peacock', 'Crackle']
    const checkFree = (name) => freeServices.some(f => name.toLowerCase().includes(f.toLowerCase()))
    
    const addProviders = (list, type) => {
      if (list && Array.isArray(list)) {
        list.forEach(p => {
          streaming.push({
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
            type: type,
            isFree: type === 'flatrate' && checkFree(p.provider_name),
            link: getPlatformLink(p.provider_name, '')
          })
        })
      }
    }
    
    const platformLinks = {
      'Netflix': 'https://www.netflix.com',
      'Amazon Prime Video': 'https://www.primevideo.com',
      'Disney+': 'https://www.disneyplus.com',
      'HBO Max': 'https://www.hbomax.com',
      'Globoplay': 'https://globoplay.globo.com',
      'Tubi': 'https://tubi.tv',
      'Pluto TV': 'https://pluto.tv',
      'YouTube': 'https://www.youtube.com'
    }
    
    const getPlatformLink = (name) => {
      for (const [platform, url] of Object.entries(platformLinks)) {
        if (name.toLowerCase().includes(platform.toLowerCase())) {
          return url
        }
      }
      return null
    }
    
    if (providers.BR) {
      addProviders(providers.BR.flatrate, 'flatrate')
      addProviders(providers.BR.rent, 'rent')
      addProviders(providers.BR.buy, 'buy')
    }
    
    if (streaming.length === 0 && providers.US) {
      addProviders(providers.US.flatrate, 'flatrate')
      addProviders(providers.US.rent, 'rent')
      addProviders(providers.US.buy, 'buy')
    }
    
    return new Response(JSON.stringify({ success: true, streaming }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar streaming' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
