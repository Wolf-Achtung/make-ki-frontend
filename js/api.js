/* filename: js/api.js
 * Minimal SDK for KI-Status-Report Backend (Gold-Standard+)
 * - Base URL: window.ENV_BACKEND OR <meta name="backend" content="...">
 * - Fetch wrapper with retry/backoff and JSON error mapping
 * - Public methods: analyze(), result(), generatePdf(), sendFeedback(), health()
 */
(function(global){
  function getBaseUrl(){
    if (global.ENV_BACKEND) return global.ENV_BACKEND;
    const m = document.querySelector('meta[name="backend"]');
    if (m && m.content) return m.content;
    return ''; // same-origin (only for local dev)
  }
  const DEFAULTS = {
    get baseUrl(){ return getBaseUrl(); },
    retries: 2,
    timeoutMs: 20000
  };

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function rid(){ return (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2); }

  async function request(path, opts={}){
    const base = DEFAULTS.baseUrl || '';
    const url = base + path;
    const headers = Object.assign({
      'Content-Type': 'application/json',
      'X-Request-ID': rid()
    }, opts.headers || {});
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULTS.timeoutMs);
    let lastErr;
    for (let attempt=0; attempt <= DEFAULTS.retries; attempt++){
      try {
        const res = await fetch(url, Object.assign({method:'GET', headers, signal: controller.signal}, opts));
        if (!res.ok){
          const text = await res.text().catch(()=> '');
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        clearTimeout(timer);
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text();
      } catch(err){
        lastErr = err;
        if (attempt < DEFAULTS.retries) await sleep(400 * (attempt+1));
      }
    }
    throw lastErr;
  }

  async function analyze(payload){ return request('/analyze', {method:'POST', body: JSON.stringify(payload)}); }
  async function result(reportId){ return request(`/result/${encodeURIComponent(reportId)}`); }
  async function generatePdf(html, filename='report.pdf'){ return request('/generate-pdf', {method:'POST', body: JSON.stringify({html, filename})}); }
  async function sendFeedback(item){ return request('/feedback', {method:'POST', body: JSON.stringify(item)}); }
  async function health(){ return request('/healthz'); }

  global.KIAPI = { analyze, result, generatePdf, sendFeedback, health };
})(window);
