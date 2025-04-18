export interface ParsedFrontmatter {
    title?: string;
    sidebarTitle?: string;
    description?: string;
    api?: string;
    openapi?: string;
    icon?: string;
    iconType?:
        | "brands"
        | "duotone"
        | "light"
        | "regular"
        | "sharp-light"
        | "sharp-regular"
        | "sharp-solid"
        | "sharp-thin"
        | "solid"
        | "thin";
    mode?: "wide" | "custom";
    url?: string;

    // SEO
    "og:site_name"?: string;
    "og:title"?: string;
    "og:description"?: string;
    "og:url"?: string;
    "og:image"?: string;
    "og:locale"?: string;
    "og:logo"?: string;
    "article:publisher"?: string;
    "twitter:title"?: string;
    "twitter:description"?: string;
    "twitter:url"?: string;
    "twitter:image"?: string;
    "twitter:site"?: string;
    "og:image:width"?: string;
    "og:image:height": string;
}
