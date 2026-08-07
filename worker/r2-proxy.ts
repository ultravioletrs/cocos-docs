// Minimal structural types for what this file touches -- avoids depending
// on the gitignored, `wrangler types`-generated worker-configuration.d.ts,
// which pnpm run build never regenerates (only the separate types:check
// script does), so it isn't present in a clean checkout/CI build.
export interface R2ObjectBody {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface CFCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}
interface CFCacheStorage {
  readonly default: CFCache;
}

// Shared bucket ("websites-images") holds assets for multiple properties;
// keyPrefix keeps this site's objects from colliding with the others.
export async function serveFromR2(
  request: Request,
  bucket: R2Bucket,
  keyPrefix: string,
  restPath: string,
  ctx: ExecutionContext,
): Promise<Response> {
  if (!restPath) return notFound();

  // bucket.get() is an R2 binding call, not an HTTP subrequest -- it never
  // touches Cloudflare's HTTP cache. Without explicitly writing the
  // response into the Cache API, every request (from every visitor, at
  // every edge location) would re-read from R2, no matter what
  // Cache-Control header gets set on the returned Response. Using the
  // request's own URL (unmodified) as the cache key keeps this purgeable by
  // the existing purge-by-URL call in the publish-image script.
  const cache = (caches as unknown as CFCacheStorage).default;
  const cacheKey = new Request(request.url, request);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const object = await bucket.get(`${keyPrefix}/${restPath}`);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-length", String(object.size));
  // Browser TTL long enough to skip most repeat-visit requests, short
  // enough to self-heal within the hour if a purge is ever missed. Edge TTL
  // is effectively unbounded -- the publish-image script purges it
  // explicitly and immediately on every upload, so there's no benefit to a
  // shorter one, and every edge location that has ever served an image now
  // actually caches it (see the Cache API use above).
  headers.set("cache-control", "public, max-age=3600, s-maxage=31536000");

  const response = new Response(object.body, { headers });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}
