/**
 * Netlify Function: API proxy to Railway backend
 *
 * Configure on Netlify:
 *   BACKEND_ORIGIN = https://<your-railway-service>.up.railway.app
 *
 * All requests to /api/* will be forwarded to `${BACKEND_ORIGIN}/api/*`.
 * - Method, headers, query, and body are preserved.
 * - Binary responses (e.g., PDFs) are returned base64-encoded.
 * - Set-Cookie headers are passed through.
 */
export async function handler(event) {
  try {
    const origin = (process.env.BACKEND_ORIGIN || "").replace(/\/+$/, "");
    if (!origin) {
      return {
        statusCode: 500,
        body: "Netlify env var BACKEND_ORIGIN is not set. Please configure it to your Railway origin."
      };
    }

    // Build target URL
    const path = (event.path || "").replace(/^\/+/, ""); // e.g., "api/login"
    const upstreamPath = path.replace(/^api\/?/, "api/"); // ensure starts with "api/"
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const url = `${origin}/${upstreamPath}${query}`;

    // Prepare headers
    const incoming = event.headers || {};
    const headers = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (!v) continue;
      const lk = k.toLowerCase();
      if (["host", "content-length", "connection"].includes(lk)) continue;
      headers[lk] = v;
    }

    // Prepare body
    const method = event.httpMethod || "GET";
    const init = { method, headers, redirect: "manual" };
    const hasBody = !["GET", "HEAD"].includes(method);

    if (hasBody && typeof event.body === "string") {
      init.body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
    }

    // Forward request
    const res = await fetch(url, init);

    // Collect headers (pass through as-is)
    const respHeaders = {};
    res.headers.forEach((v, k) => {
      // Netlify functions allow multiple set-cookie, but we need to map them correctly
      if (k.toLowerCase() === "set-cookie") {
        // Netlify supports multi-value headers via array
        respHeaders["set-cookie"] = res.headers.getSetCookie ? res.headers.getSetCookie() : v;
      } else {
        respHeaders[k] = v;
      }
    });

    // Detect binary
    const ct = res.headers.get("content-type") || "";
    const isBinary = /(^application\/pdf\b)|(^image\/)|(\boctet-stream\b)/i.test(ct);
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);

    return {
      statusCode: res.status,
      headers: respHeaders,
      body: isBinary ? buf.toString("base64") : buf.toString("utf8"),
      isBase64Encoded: isBinary
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: `Proxy error: ${(err && err.message) || String(err)}`
    };
  }
}
