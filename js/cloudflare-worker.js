// Cloudflare Worker code for proxying image requests to avoid CORS issues
// Deploy this code to your Cloudflare Worker

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Parse URL and query parameters
  const url = new URL(request.url)
  const fileId = url.searchParams.get('fileId')
  
  // Check if fileId is provided
  if (!fileId) {
    return new Response('Missing fileId parameter', { status: 400 })
  }
  
  // Construct Google Drive direct download URL
  const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
  
  try {
    // Fetch the image from Google Drive
    const response = await fetch(driveUrl)
    
    // Check if the response is successful
    if (!response.ok) {
      return new Response(`Error fetching image: ${response.statusText}`, { status: response.status })
    }
    
    // Get the image content type
    const contentType = response.headers.get('Content-Type') || 'image/jpeg'
    
    // Create a new response with CORS headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
        'Vary': 'Origin'
      }
    })
    
    return modifiedResponse
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
