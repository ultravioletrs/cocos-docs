import { type R2Bucket, serveFromR2 } from "./r2-proxy";

// Same reasoning as r2-proxy.ts: defined locally rather than relying on the
// gitignored, wrangler-generated worker-configuration.d.ts, which isn't
// present in a clean build (pnpm run build never regenerates it).
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: Fetcher;
  IMAGES_BUCKET: R2Bucket;
}

// This site is a fully static Next.js export (`output: "export"` in
// next.config.mjs) served by Cloudflare Workers' static assets handler —
// there's no Next.js server runtime in production, so images can't be
// proxied through a Next.js route handler the way a normal Next.js/Astro
// deployment would. Instead this Worker script sits in front of the asset
// handler.
//
// By default (no `run_worker_first` in wrangler.jsonc), Cloudflare serves
// any request that matches a file under `out/` directly, without invoking
// this Worker at all. Only requests with no matching static file reach
// `fetch` below — which, now that images are no longer committed under
// public/img/, is every request for one. Anything else that reaches here
// is a genuine 404, so it's handed to the asset binding's own not-found
// handling, unchanged from before this Worker existed.
const BASE_PATH = "/docs/cocos-ai";
const IMG_PREFIX = `${BASE_PATH}/img/`;

// Objects for this site live under this prefix in the shared "websites-images"
// R2 bucket, so they don't collide with other properties in the same bucket.
const R2_KEY_PREFIX = "cocos-docs";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith(IMG_PREFIX)) {
      const restPath = pathname.slice(IMG_PREFIX.length);
      return serveFromR2(env.IMAGES_BUCKET, R2_KEY_PREFIX, restPath);
    }

    return env.ASSETS.fetch(request);
  },
};
