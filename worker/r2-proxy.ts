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

// Shared bucket ("websites-images") holds assets for multiple properties;
// keyPrefix keeps this site's objects from colliding with the others.
export async function serveFromR2(
  bucket: R2Bucket,
  keyPrefix: string,
  restPath: string,
): Promise<Response> {
  if (!restPath) return notFound();

  const object = await bucket.get(`${keyPrefix}/${restPath}`);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-length", String(object.size));
  // Short browser TTL (revalidates quickly) + long edge TTL (until purged
  // explicitly by the publish-image script right after every upload).
  headers.set("cache-control", "public, max-age=300, s-maxage=31536000");

  return new Response(object.body, { headers });
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}
