// Cloudflare Worker - Movie Details API//
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
  const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'
  
  let id = params.get('id')
  let language = params.get('language') || 'pt-BR'
  
  const allowedLanguages = ['pt-BR', 'en-US', 'es-ES', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU', 'ko-KR']
  language = allowedLanguages.includes(language) ? language : 'pt-BR'
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID obrigatório' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  id = parseInt(id)
  if (!id || id < 1 || id > 2000000) {
    return new Response(JSON.stringify({ error: 'ID inválido: ' + id }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  try {
    // Fetch movie details
    const movieRes = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_API_KEY}&language=${language}`)
    const movieData = await movieRes.json()
    
    // Fetch streaming providers
    let providersRes
    try {
      providersRes = await fetch(`${TMDB_BASE}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`)
    } catch (e) {
      providersRes = { data: { results: {} } }
    }
    
    // Fetch videos/trailer
    let videosRes
    try {
      videosRes = await fetch(`${TMDB_BASE}/movie/${id}/videos?api_key=${TMDB_API_KEY}`)
    } catch (e) {
      videosRes = { data: { results: [] } }
    }
    
    // Process streaming - only 100% free platforms
    const freeStreamingServices = ['Tubi', 'Pluto TV', 'Peacock', 'Crackle']
    const checkFreeStreaming = (name) => freeStreamingServices.some(free => name.toLowerCase().includes(free.toLowerCase()))
    
    // Mapeamento de links diretos
    const platformLinks = {
      'Netflix': 'https://www.netflix.com',
      'Amazon Prime Video': 'https://www.primevideo.com',
      'Disney': 'https://www.disneyplus.com',
      'Disney+': 'https://www.disneyplus.com',
      'HBO Max': 'https://www.hbomax.com',
      'HBO': 'https://www.hbomax.com',
      'Apple TV': 'https://tv.apple.com',
      'Paramount': 'https://www.paramountplus.com',
      'Globo': 'https://globoplay.globo.com',
      'Tubi': 'https://tubi.tv',
      'Pluto TV': 'https://pluto.tv',
      'Peacock': 'https://www.peacocktv.com',
      'Crackle': 'https://www.crackle.com',
      'Viki': 'https://www.viki.com',
      'Rakuten': 'https://www.rakuten.tv',
      'Kanopy': 'https://www.kanopy.com',
      'Freevee': 'https://www.freevee.com',
      'Xumo': 'https://www.xumo.com',
      'Plex': 'https://www.plex.tv',
      'Crunchyroll': 'https://www.crunchyroll.com',
      'Muse': 'https://muse.ai',
      'Mubi': 'https://mubi.com',
      'Shudder': 'https://www.shudder.com',
      'Yidio': 'https://www.yidio.com',
      'Vudu': 'https://www.vudu.com',
      'Claro': 'https://www.clarotvplus.com.br',
      'Claro tv': 'https://www.clarotvplus.com.br',
      'Sky': 'https://www.sky.com.br',
      'Telecine': 'https://www.telecine.com.br',
      'Looke': 'https://www.looke.com.br',
      'PlayPlus': 'https://www.playplus.com',
      'Globoplay': 'https://globoplay.globo.com',
      'Amazon Channels': 'https://www.primevideo.com/channels',
      'Google Play': 'https://play.google.com/store/movies',
      'YouTube': 'https://www.youtube.com',
      'iTunes': 'https://tv.apple.com',
      'Microsoft': 'https://www.microsoft.com/store/movies'
    }
    
    const getPlatformLink = (name, movieTitle) => {
      const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      for (const [platform, url] of Object.entries(platformLinks)) {
        if (name.toLowerCase().includes(platform.toLowerCase())) {
          return url
        }
      }
      
      const searchName = name.toLowerCase()
      if (searchName.includes('netflix')) return 'https://www.netflix.com'
      if (searchName.includes('prime') || searchName.includes('amazon')) return 'https://www.primevideo.com'
      if (searchName.includes('disney') || searchName.includes('plus')) return 'https://www.disneyplus.com'
      if (searchName.includes('hbo')) return 'https://www.hbomax.com'
      if (searchName.includes('globoplay') || searchName.includes('globo')) return 'https://globoplay.globo.com'
      if (searchName.includes('apple') || searchName.includes('tv')) return 'https://tv.apple.com'
      if (searchName.includes('youtube')) return 'https://www.youtube.com'
      if (searchName.includes('play') || searchName.includes('google')) return 'https://play.google.com/store/movies'
      
      return null
    }
    
    let streaming = []
    const providers = providersRes.data.results || {}
    
    const addProviders = (list, type) => {
      if (list && Array.isArray(list)) {
        list.forEach(p => {
          const isFree = type === 'flatrate' && checkFreeStreaming(p.provider_name)
          streaming.push({
            name: p.provider_name,
            logo: p.logo_path ? 'https://image.tmdb.org/t/p/w92' + p.logo_path : null,
            type: type,
            isFree: isFree,
            link: getPlatformLink(p.provider_name, movieData.title)
          })
        })
      }
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
    
    // Fetch trailer
    let trailerUrl = null
    const videos = videosRes.data.results || []
    const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                    videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
    if (trailer) {
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`
    }
    
    const movie = {
      ...movieData,
      poster_path: movieData.poster_path ? TMDB_IMAGE + movieData.poster_path : null,
      backdrop_path: movieData.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + movieData.backdrop_path : null,
      streaming: streaming,
      trailer: trailerUrl
    }
    
    return new Response(JSON.stringify({ success: true, movie }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar filme: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
