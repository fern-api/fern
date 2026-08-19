// this file was manually generated on April 22, 2024 based on
// https://mintlify.com/schema.json

export interface MintJsonSchema {
    $schema?: string;
    mintlify?: string;
    name: string;
    logo?:
        | string
        | {
              light: string;
              dark: string;
              href?: string;
          };
    /**
     * A path pointing to the favicon file in your docs folder, including the file extension. We recommend using an .svg or .png file. The favicon will automatically be resized to the appropriate sizes
     */
    favicon: string;
    /**
     * A string or an array of strings of absolute or relative urls pointing to your OpenAPI files
     */
    openapi?: string | string[];
    api?: {
        baseUrl?: string | string[];
        auth?: {
            method?: "bearer" | "basic" | "key" | "cobo";
            name?: string;
            inputPrefix?: string;
        };
        playground?: {
            mode?: "show" | "simple" | "hide";
        };
        request?: {
            example?: {
                showOptionalParams?: boolean;
            };
        };
        maintainOrder?: boolean;
    };
    modeToggle?: {
        default?: "light" | "dark";
        isHidden?: boolean;
    };
    versions?: [
        (
            | string
            | {
                  name: string;
                  url: string;
              }
        ),
        ...(
            | string
            | {
                  name: string;
                  url: string;
              }
        )[]
    ];
    metadata?: Record<string, string>;
    /**
     * The colors to use in your documentation. At the very least, you must define the primary color. For example: { "colors": { "primary": "#ff0000" } }
     */
    colors: {
        primary: string;
        light?: string;
        dark?: string;
        background?: {
            light?: string;
            dark?: string;
        };
        anchors?:
            | string
            | {
                  from: string;
                  via?: string;
                  to: string;
              };
    };
    /**
     * An object containing the configuration for a Call-to-Action button. The object can have { "type": "link" } (the default) if you define a url and a name. For links to your GitHub repo, use { "type": "github" }
     */
    topbarCtaButton?:
        | {
              type?: "link";
              name: string;
              url: string;
          }
        | {
              type: "github";
              /**
               * A link to your GitHub repository
               */
              url: string;
          };
    /**
     * An object containing the configuration for a Call-to-Action button. The object can have { "type": "link" } (the default) if you define a url and a name. For links to your GitHub repo, use { "type": "github" }
     */
    topbarLinks?: (
        | {
              type?: "link";
              name: string;
              url: string;
          }
        | {
              type: "github";
              /**
               * A link to your GitHub repository
               */
              url: string;
          }
    )[];
    navigation: MintNavigationItem[];
    primaryTab?: {
        name: string;
    };
    topAnchor?: {
        name: string;
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
    };
    anchors?: {
        name: string;
        url: string;
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
        color?:
            | string
            | {
                  from: string;
                  via?: string;
                  to: string;
              };
        isDefaultHidden?: boolean;
        version?: string;
        openapi?: string;
    }[];
    tabs?: {
        name: string;
        url: string;
        version?: string;
        isDefaultHidden?: boolean;
    }[];
    /**
     * An object in which each key is the name of a social media platform, and each value is the url to your profile. For example: { "twitter": "https://twitter.com/mintlify" }
     */
    footerSocials?:
        | {
              type: string;
              url: string;
          }[]
        | Record<string, string>;
    backgroundImage?: string;
    feedback?: {
        thumbsRating?: boolean;
        suggestEdit?: boolean;
        raiseIssue?: boolean;
    };
    analytics?: {
        amplitude?: {
            apiKey: string;
        };
        clearbit?: {
            publicApiKey: string;
        };
        fathom?: {
            siteId: string;
        };
        ga4?: {
            measurementId: string;
        };
        gtm?: {
            tagId: string;
        };
        heap?: {
            appId: string;
        };
        hotjar?: {
            hjid: string;
            hjsv: string;
        };
        koala?: {
            publicApiKey: string;
        };
        logrocket?: {
            appId: string;
        };
        mixpanel?: {
            projectToken: string;
        };
        pirsch?: {
            id: string;
        };
        posthog?: {
            apiKey: string;
            apiHost?: string;
        };
        plausible?: {
            domain: string;
        };
    };
    integrations?: {
        intercom?: string;
        frontchat?: string;
        osano?: Record<string, unknown> & string;
    };
    isWhiteLabeled?: boolean;
    search?: {
        prompt?: string;
    };
    redirects?: {
        source: string;
        destination: string;
    }[];
    seo?: {
        indexHiddenPages?: boolean;
    };
}

export type MintNavigationItemPage = string | MintNavigationItem;

export interface MintNavigationItem {
    /**
     * The label for this group in the navigation sidebar
     */
    group: string;
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
    version?: string;
    pages: [MintNavigationItemPage, ...MintNavigationItemPage[]];
}

export interface MintlifyFrontmatter {
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
