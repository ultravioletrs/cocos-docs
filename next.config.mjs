import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const BASE_PATH = "/docs/cocos-ai";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
    NEXT_PUBLIC_BASE_URL: "https://www.ultraviolet.rs/docs/cocos-ai",
  },
};

export default withMDX(config);
