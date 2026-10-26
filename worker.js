import { onRequest } from './functions/api/[[catchall]].js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API Endpoints: tangani request /api/* dengan Supabase handler
    if (url.pathname.startsWith('/api')) {
      return onRequest({ request, env, params: {} });
    }

    // 2. Static Assets: sajikan file Vite frontend (HTML, JS, CSS, gambar, lagu)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
