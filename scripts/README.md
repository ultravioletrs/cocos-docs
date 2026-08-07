# Publishing images (maintainers only)

Images are no longer committed to this repo. They're stored in a shared Cloudflare R2
bucket (`websites-images`) and served at their usual `/img/...` URLs by a small Cloudflare
Worker script that sits in front of the site's static assets.

## Why a Worker script, not a Next.js route

This site builds with `output: "export"` (see `next.config.mjs`) and deploys the resulting
static files to Cloudflare Workers via `wrangler deploy` (see `wrangler.jsonc`'s `assets`
block). A static export has no server runtime in production — Next.js Route Handlers can't
read a request or a binding at request time in this mode — so there's no Next.js code path
that could proxy R2 the way a normal SSR deployment would.

Instead, [`worker/index.ts`](../worker/index.ts) is a plain Cloudflare Worker wired up as
`main` in `wrangler.jsonc`, alongside the existing `assets` config. By default, Cloudflare
serves any request that matches a file under `out/` directly, without invoking this Worker
at all; the Worker only runs for requests with no matching static file. Since images are no
longer built into `out/`, every request under `/docs/cocos-ai/img/...` reaches the Worker,
which looks the object up in R2 via [`worker/r2-proxy.ts`](../worker/r2-proxy.ts) and streams
it back. Anything else that reaches the Worker (a genuine 404) is handed back to the asset
binding's own not-found handling via `env.ASSETS.fetch(request)`, unchanged from before this
Worker existed.

Nothing in `content/docs/*.mdx` or components changes — they keep referencing
`/img/agent/overview.png` exactly as before; `assetPath()` in `lib/base-path.ts` still
prepends the `/docs/cocos-ai` base path the same way it always has.

Only maintainers publish images, using [`publish-image.mjs`](./publish-image.mjs). The
script is safe to have in a public repo because it's inert without a token — nobody can
upload to the bucket just by reading this file. See "Why maintainer-only" below.

## One-time setup

1. Create `scripts/.env.publish-image` from the template:

   ```bash
   cp scripts/.env.publish-image.example scripts/.env.publish-image
   ```

2. Create a Cloudflare API token: dashboard -> **My Profile -> API Tokens -> Create Token
   -> Custom Token**, with both permissions on the same token:
   - `Workers R2 Storage: Edit`
   - `Zone -> Cache Purge -> Purge`, **Zone Resources** scoped to the `ultraviolet.rs` zone

3. Paste the token into `CLOUDFLARE_API_TOKEN` in `scripts/.env.publish-image`.

4. Fill in `CLOUDFLARE_ZONE_ID` (the `ultraviolet.rs` zone ID, visible on the domain's
   Overview page in the Cloudflare dashboard — not secret, safe to share/commit once known,
   it can't authenticate anything by itself). It was left blank when this tooling was added
   because the zone ID wasn't available at the time; whoever completes setup should fill it
   in here and in `scripts/.env.publish-image.example`.

5. Sanity-check the token before first use:

   ```bash
   curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
   ```

   Should return `"status":"active"`. If it doesn't, the token value itself is wrong
   (bad copy/paste, expired, revoked) — fix that before troubleshooting anything else.

`scripts/.env.publish-image` is gitignored. Never commit it, never paste the token value
into a PR, issue, or chat.

## Publishing an image

```bash
pnpm run publish-image <local-file> <public-path>
```

`<public-path>` is the path as it appears in MDX content (i.e. after `/docs/cocos-ai`,
which the script adds automatically) — it must start with `img/` so the script knows it
belongs to the image route. Example:

```bash
pnpm run publish-image ./overview.png img/agent/overview.png
# -> https://www.ultraviolet.rs/docs/cocos-ai/img/agent/overview.png
```

Keep the public path identical to the site's existing `/img/...` convention (check
`content/docs/**/*.mdx` for `![...](/img/...)` references, or `public/img/` before it's
removed) so MDX references don't need to change.

The script does two things, in order:

1. `wrangler r2 object put ... --remote` — uploads to the **real** bucket. `--remote` is
   required; without it, `wrangler` silently writes to a local simulated bucket and prints
   a normal-looking "Upload complete" with no error, and the object is never actually live.
2. Purges that exact URL from Cloudflare's edge cache (`POST /zones/{id}/purge_cache`), so
   the update is visible within seconds instead of waiting out the cache TTL.

If you re-run the same command for an existing path, it overwrites the object in place and
purges again — that's the intended way to update an image without changing its URL.

## Bulk-uploading via the R2 dashboard (initial migration)

For migrating the existing `public/img/` tree in bulk instead of one file at a time, you
can drag-and-drop folders into the bucket in the Cloudflare dashboard. **The keys have to
land under the exact prefix the Worker expects:**

| Site URL                                                        | Required R2 key                    |
| ----------------------------------------------------------------- | ----------------------------------- |
| `https://www.ultraviolet.rs/docs/cocos-ai/img/agent/overview.png` | `cocos-docs/agent/overview.png`     |
| `https://www.ultraviolet.rs/docs/cocos-ai/img/arch.png`           | `cocos-docs/arch.png`               |

So in the R2 dashboard, in the `websites-images` bucket, create/open a folder named
`cocos-docs`, and drag in the **contents** of `public/img/` (the `attestation/`, `agent/`
subfolders and the top-level files) — not the `img` folder itself as one more nested level.
Dragging `img/` in as a folder would produce `cocos-docs/img/agent/overview.png`, which the
Worker never looks up (it strips the leading `/docs/cocos-ai/img/` from the request path
and prepends `cocos-docs/`, nothing else) — every image would silently 404.

Only drag in what's actually referenced from `content/docs/`. At the time this migration
was done, every file under `public/img/` was confirmed referenced from MDX content.
`public/images/Cocos_logo-01.png` (the nav logo) and the favicon/PWA icons in `public/`
were intentionally left committed as-is — they're small UI-chrome assets, not content
images, and aren't part of this change.

## Why maintainer-only

This repo is public. The risk isn't the script being visible — it's inert without a
credential. The risk is _credential distribution_: whoever holds `CLOUDFLARE_API_TOKEN`
can write to the shared bucket. So nobody, internal or external, gets a personal R2 token.
Only a maintainer, holding this one scoped token, runs `publish-image`.

## Troubleshooting

- **`Local file not found: --`** — you ran `pnpm run publish-image -- <file> <dest>`. pnpm
  forwards a leading `--` to the script literally instead of stripping it like npm does.
  The script strips it defensively, but plain `pnpm run publish-image <file> <dest>` (no
  `--`) is the form to use.
- **`Destination must start with "img/"`** — the second argument must be the full public
  path including the `img/` route segment, e.g. `img/agent/overview.png`, not
  `agent/overview.png`.
- **`Resource location: local` in the upload output** — means `--remote` didn't get
  applied for some reason (e.g. running the underlying `wrangler` command by hand without
  copying the full flag list from the script). The object was never written to the real
  bucket even though the CLI reports success. Always use `pnpm run publish-image`, or add
  `--remote` yourself if invoking wrangler directly.
- **`Cache purge failed` / `Authentication error` (code 10000)** — Cloudflare reuses this
  code for both "bad token" and "token valid but missing this permission." Run the token
  verify curl command above first to rule out a bad token. If that succeeds, the token is
  missing `Zone -> Cache Purge -> Purge` for the `ultraviolet.rs` zone, or that permission's
  Zone Resources selector doesn't include it — edit the token in the dashboard and add it.
- To confirm an object actually made it into the bucket after a `--remote` upload:

  ```bash
  wrangler r2 object get websites-images/cocos-docs/<path-after-img/> --remote --file=/tmp/check
  ```
