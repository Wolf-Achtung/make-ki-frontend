// netlify/functions/proxy.js
// Diese Datei muss im Ordner "netlify/functions/" liegen

exports.handler = async (event, context) => {
  // Backend-URL aus Umgebungsvariable oder Fallback
  const BACKEND_URL = process.env.BACKEND_ORIGIN || 'https://sublime-consideration-production.up.railway.app';
  
  // Pfad extrahieren
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const url = `${BACKEND_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        // Remove Netlify-specific headers
        'host': undefined,
        'x-forwarded-for': undefined,
        'x-forwarded-proto': undefined,
        'x-forwarded-port': undefined,
        'x-nf-request-id': undefined
      },
      body: event.body
    });
    
    const body = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error', details: error.message })
    };
  }
};