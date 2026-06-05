import type { Metadata } from "next/types";

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://www.ultraviolet.rs/docs/cocos-ai";

function resolveTitle(title: Metadata["title"]): string {
  if (!title) return "Cocos AI Docs";
  if (typeof title === "string") return title;
  if ("default" in title && title.default) return title.default;
  return "Cocos AI Docs";
}

export function createMetadata(override: Metadata): Metadata {
  const ogUrl = `${baseUrl}/icon.png`;
  const resolvedTitle = resolveTitle(override.title);
  const canonicalUrl =
    override.alternates?.canonical ??
    (override.openGraph?.url as string | URL | undefined);
  const alternates = canonicalUrl
    ? {
        ...override.alternates,
        canonical: canonicalUrl,
      }
    : override.alternates;
  const openGraphUrl = override.openGraph?.url;

  return {
    ...override,
    ...(alternates ? { alternates } : {}),
    openGraph: {
      title: resolvedTitle,
      description: override.description ?? undefined,
      images: [
        {
          url: ogUrl,
          width: 96,
          height: 96,
          alt: "Cocos AI Docs",
        },
      ],
      siteName: "Cocos AI",
      ...(openGraphUrl ? { url: openGraphUrl } : {}),
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: override.description ?? undefined,
      images: [
        {
          url: ogUrl,
          width: 96,
          height: 96,
          alt: "Cocos AI Docs",
        },
      ],
      ...override.twitter,
    },
  };
}
