import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Mermaid } from "@/components/mdx/mermaid";
import { assetPath } from "@/lib/base-path";

// Content images (content/docs/**/*.mdx) are no longer bundled by Next's
// image pipeline -- see source.config.ts, where fumadocs-mdx's remarkImage
// plugin is disabled because it statically imports every markdown image at
// build time, which requires the file to exist on disk. These images live
// in R2 instead (see worker/index.ts, scripts/README.md). Markdown image
// syntax (`![]()`) always compiles through this `img:` key, so authors keep
// writing plain markdown with the same `/img/...` paths as before. Rendered
// as a plain, zoomable <img> -- no next/image, no width/height needed, so
// there's nothing to keep in sync when images change.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props: ComponentPropsWithoutRef<"img">) => {
      if (typeof props.src !== "string") return null;

      const { src: rawSrc, alt, ...rest } = props;
      const src = assetPath(rawSrc);

      return (
        // src/alt passed here too, not just to the inner <img>: ImageZoom's
        // zoomed-in view reads its image from these props directly, not
        // from `children`.
        <ImageZoom src={src} alt={alt ?? ""}>
          {/* biome-ignore lint/performance/noImgElement: doc content images are served from R2, not Next's image pipeline */}
          <img {...rest} src={src} alt={alt ?? ""} loading="lazy" />
        </ImageZoom>
      );
    },
    Mermaid,
    ...components,
  };
}
