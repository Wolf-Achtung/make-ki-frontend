// filename: edge-functions/require-auth.ts
// Netlify Edge Function – protects /formular/* by validating JWT in cookie "ki_token".
import { verify } from "https://deno.land/x/djwt@v2.9/mod.ts";

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") || "";
  const match = /(?:^|;\s*)ki_token=([^;]+)/.exec(cookie);
  const token = match ? decodeURIComponent(match[1]) : null;
  const secret = Deno.env.get("JWT_SECRET") || "dev-secret";

  function redirectToLogin() {
    const next = encodeURIComponent(url.pathname + url.search + url.hash);
    return new Response(null, { status: 302, headers: { Location: "/login.html?next=" + next } });
  }

  if (!token) return redirectToLogin();
  try {
    const payload: any = await verify(token, secret, "HS256");
    if (!payload || (payload.exp && Date.now()/1000 >= payload.exp - 15)) {
      return redirectToLogin();
    }
    return await context.next();
  } catch (_e) {
    return redirectToLogin();
  }
};
