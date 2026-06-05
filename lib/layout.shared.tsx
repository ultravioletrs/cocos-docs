import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { assetPath } from "@/lib/base-path";

export const gitConfig = {
  user: "ultravioletrs",
  repo: "cocos",
  branch: "main",
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <Image
          src={assetPath("/images/Cocos_logo-01.png")}
          alt="Cocos AI"
          width={120}
          height={40}
          className="h-10 w-auto dark:invert"
        />
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
