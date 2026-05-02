// Cloudflare Pages Function - API Proxy
// This file handles /api/* requests and proxies them to Cloudflare Workers

const WORKERS = {
  '/api/movies': 'https://cineworld-movies.brenda-tavares.workers.dev',
  '/api/genres': 'https://cineworld-genres.brenda-tavares.workers.dev',
  '/api/movie': 'https://cineworld-movie.brenda-tavares.workers.dev',
  '/api/ai-search': 'https://cineworld-ai-search.brenda-tavares.workers.dev',
  '/api/streaming': 'https://cineworld-streaming.brenda-tavares.workers.dev'
}

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const path = url.pathname

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let targetWorker = null
  for (const [route, workerUrl] of Object.entries(WORKERS)) {
    if (path.startsWith(route)) {
      targetWorker = workerUrl
      break
    }
  }

  if (!targetWorker) {
    return new Response(JSON.stringify({ error: 'API route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const targetUrl = targetWorker + path.replace('/api', '') + url.search
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers
  })

  const responseBody = await response.text()
  return new Response(responseBody, {
    status: response.status,
    headers: { ...corsHeaders, ...Object.fromEntries(response.headers) }
  })
}
