import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Provider } from "@/components/provider";
import { baseOptions } from "@/lib/layout.shared";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";
import "./global.css";
import "katex/dist/katex.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = createMetadata({
  title: {
    template: "%s | Cocos AI",
    default: "Cocos AI Docs",
  },
  description:
    "Documentation for Cocos AI, the open-source confidential computing platform from Ultraviolet.",
  metadataBase: new URL(baseUrl),
  openGraph: { url: baseUrl },
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen bg-background text-foreground font-mono antialiased">
        <Provider>
          <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
