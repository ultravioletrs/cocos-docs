#!/usr/bin/env node
// Maintainer-only. Uploads an image to the shared R2 bucket and purges it
// from Cloudflare's edge cache, so it's live right after this finishes.
// Requires CLOUDFLARE_API_TOKEN (scoped: R2 Edit on websites-images + Zone
// Cache Purge on the site's zone) and CLOUDFLARE_ZONE_ID.
//
// Usage:
//   pnpm run publish-image <local-file> <public-path>
//
// <public-path> is the path as it appears in content/docs MDX (i.e. after
// /docs/cocos-ai, which this script adds automatically), starting with
// "img/" to match the route the Worker proxies:
//   pnpm run publish-image ./overview.png img/agent/overview.png
//   # -> https://www.ultraviolet.rs/docs/cocos-ai/img/agent/overview.png

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname } from "node:path";
import process from "node:process";

const BUCKET_NAME = "websites-images";
const SITE_ORIGIN = "https://www.ultraviolet.rs";
// Keep in sync with next.config.mjs's BASE_PATH.
const BASE_PATH = "/docs/cocos-ai";

// Maps the leading path segment (the site route) to where objects for it
// live in the bucket. Keep in sync with worker/index.ts. This repo has no
// video content yet; add a "video" entry here (and a matching prefix check
// in worker/index.ts) if that changes.
const ROUTES = {
  img: { keyPrefix: "cocos-docs" },
};

const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

try {
  process.loadEnvFile(new URL("./.env.publish-image", import.meta.url));
} catch {
  // No local env file — assume CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID
  // are already exported (e.g. in CI).
}

// pnpm forwards a leading "--" to the underlying command instead of
// stripping it (unlike npm), so tolerate it either way.
const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const [localFile, publicPath] = cliArgs;

if (!localFile || !publicPath) {
  console.error(
    "Usage: pnpm run publish-image <local-file> <public-path>\n" +
      "Example: pnpm run publish-image ./overview.png img/agent/overview.png",
  );
  process.exit(1);
}

if (!existsSync(localFile)) {
  console.error(`Local file not found: ${localFile}`);
  process.exit(1);
}

const destKey = publicPath.replace(/^\/+/, "");
const [routeName, ...restParts] = destKey.split("/");
const route = ROUTES[routeName];
if (!route || restParts.length === 0) {
  console.error(
    `Destination must start with "img/" and include a path, got: ${destKey}`,
  );
  process.exit(1);
}
const restPath = restParts.join("/");

const contentType = MIME_TYPES[extname(restPath).toLowerCase()];
if (!contentType) {
  console.error(`Unrecognized file extension for: ${destKey}`);
  process.exit(1);
}

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
  console.error(
    "Missing CLOUDFLARE_API_TOKEN and/or CLOUDFLARE_ZONE_ID.\n" +
      "Copy scripts/.env.publish-image.example to scripts/.env.publish-image and fill in the token.",
  );
  process.exit(1);
}

const objectPath = `${BUCKET_NAME}/${route.keyPrefix}/${restPath}`;

console.log(`Uploading ${localFile} -> r2://${objectPath}`);
execFileSync(
  "wrangler",
  [
    "r2",
    "object",
    "put",
    objectPath,
    `--file=${localFile}`,
    `--content-type=${contentType}`,
    "--remote",
  ],
  { stdio: "inherit", env: process.env },
);

const publicUrl = `${SITE_ORIGIN}${BASE_PATH}/${destKey}`;

console.log(`Purging edge cache for ${publicUrl}`);
const purgeResponse = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: [publicUrl] }),
  },
);

const purgeResult = await purgeResponse.json();
if (!purgeResponse.ok || !purgeResult.success) {
  console.error("Cache purge failed:", JSON.stringify(purgeResult, null, 2));
  process.exit(1);
}

console.log(`Done. Live at ${publicUrl}`);
