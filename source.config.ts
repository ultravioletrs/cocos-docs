import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // Content images (content/docs/**/*.mdx) are served at runtime from R2
    // via worker/index.ts (see scripts/README.md), not committed to this
    // repo. fumadocs-mdx's remarkImage plugin statically imports every
    // markdown image at build time, which requires the file to exist on
    // disk -- exactly what we're avoiding -- so it's disabled here.
    // mdx-components.tsx's `img:` override renders the resulting `<img>`
    // tag as a plain, zoomable image instead.
    remarkImageOptions: false,
    remarkPlugins: [remarkMdxMermaid],
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      langs: ["bash", "go"],
    },
    // MDX options
  },
});
