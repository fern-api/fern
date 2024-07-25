import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { Audiences } from "../commons";
import { WithoutQuestionMarks } from "../commons/WithoutQuestionMarks";
import { DocsInstance, ExperimentalConfig, VersionAvailability } from "./schemas";

export interface ParsedDocsConfiguration {
    instances: DocsInstance[];
    title: string | undefined;

    /* filepath of page to contents */
    pages: Record<RelativeFilePath, string>;

    /* navigation */
    landingPage: DocsNavigationItem.Page | undefined;
    navigation: DocsNavigationConfiguration;
    navbarLinks: DocsV1Write.NavbarLink[] | undefined;
    footerLinks: DocsV1Write.FooterLink[] | undefined;

    /* seo */
    metadata: ParsedMetadataConfig | undefined;
    redirects: DocsV1Write.RedirectConfig[] | undefined;

    /* branding */
    logo: Logo | undefined;
    favicon: AbsoluteFilePath | undefined;
    backgroundImage: BackgroundImage | undefined;
    colors: DocsV1Write.ColorsConfigV3 | undefined;
    typography: TypographyConfig | undefined;
    layout: WithoutQuestionMarks<DocsV1Write.DocsLayoutConfig> | undefined;

    /* integrations */
    integrations: DocsV1Write.IntegrationsConfig | undefined;

    /* scripts */
    css: DocsV1Write.CssConfig | undefined;
    js: JavascriptConfig | undefined;

    experimental: ExperimentalConfig | undefined;
}

export interface AbsoluteJsFileConfig {
    absolutePath: AbsoluteFilePath;
    strategy?: DocsV1Write.JsScriptStrategy;
}

export interface JavascriptConfig {
    remote?: DocsV1Write.JsRemoteConfig[];
    files: AbsoluteJsFileConfig[];
}

export interface DocsColorsConfiguration {
    accentPrimary: ColorConfiguration | undefined;
    background: ColorConfiguration | undefined;
}

export interface ParsedMetadataConfig
    extends Omit<WithoutQuestionMarks<DocsV1Write.MetadataConfig>, "og:image" | "og:logo" | "twitter:image"> {
    "og:image": FilepathOrUrl | undefined;
    "og:logo": FilepathOrUrl | undefined;
    "twitter:image": FilepathOrUrl | undefined;
}

export type ColorConfiguration =
    | {
          type: "themed";
          dark: DocsV1Write.RgbaColor | undefined;
          light: DocsV1Write.RgbaColor | undefined;
      }
    | {
          type: "unthemed";
          color: DocsV1Write.RgbaColor | undefined;
      };

export interface Logo {
    dark: AbsoluteFilePath | undefined;
    light: AbsoluteFilePath | undefined;
    height: DocsV1Write.Height | undefined;
    href: DocsV1Write.Url | undefined;
}

export interface BackgroundImage {
    dark: AbsoluteFilePath | undefined;
    light: AbsoluteFilePath | undefined;
}

export interface FontConfig {
    name: string | undefined;
    variants: FontVariant[];
    display: DocsV1Write.FontDisplay | undefined;
    fallback: string[] | undefined;
    fontVariationSettings: string | undefined;
}

export interface FontVariant {
    absolutePath: AbsoluteFilePath;
    weight: string[] | undefined;
    style: DocsV1Write.FontStyle | undefined;
}

export interface TypographyConfig {
    /**
     * The font family applied to all headings in the docs.
     * If this is not supplied, it defaults to the body font family.
     */
    headingsFont: FontConfig | undefined;
    /**
     * The font family applied to all paragraph content in the docs.
     */
    bodyFont: FontConfig | undefined;
    /**
     * The font family applied to all code blocks and inline
     * code snippets in the documentation site.
     */
    codeFont: FontConfig | undefined;
}

export type FilepathOrUrl = { type: "filepath"; value: AbsoluteFilePath } | { type: "url"; value: string };

export interface UntabbedDocsNavigation {
    type: "untabbed";
    items: DocsNavigationItem[];
}

export interface TabbedDocsNavigation {
    type: "tabbed";
    items: TabbedNavigation[];
}

export interface VersionedDocsNavigation {
    type: "versioned";
    versions: VersionInfo[];
}

export interface VersionInfo {
    landingPage: DocsNavigationItem.Page | undefined;
    navigation: UntabbedDocsNavigation | TabbedDocsNavigation;
    version: string;
    availability: VersionAvailability | undefined;
    slug: string | undefined;
}

export type DocsNavigationConfiguration = UntabbedDocsNavigation | TabbedDocsNavigation | VersionedDocsNavigation;

export type UnversionedNavigationConfiguration = UntabbedDocsNavigation | TabbedDocsNavigation;

export interface TabbedNavigation {
    // tab: string;
    title: string;
    icon: string | undefined;
    slug: string | undefined;
    skipUrlSlug: boolean | undefined;
    hidden: boolean | undefined;
    child: TabbedNavigationChild;
}

type TabbedNavigationChild =
    | TabbedNavigationChild.Layout
    | TabbedNavigationChild.Link
    | TabbedNavigationChild.Changelog;

export declare namespace TabbedNavigationChild {
    export interface Layout {
        type: "layout";
        layout: DocsNavigationItem[];
    }

    export interface Link {
        type: "link";
        href: string;
    }

    export interface Changelog {
        type: "changelog";
        changelog: AbsoluteFilePath[];
    }
}

export type DocsNavigationItem =
    | DocsNavigationItem.Page
    | DocsNavigationItem.Section
    | DocsNavigationItem.ApiSection
    | DocsNavigationItem.Link
    | DocsNavigationItem.Changelog;

export declare namespace DocsNavigationItem {
    export interface Page {
        type: "page";
        title: string;
        icon: string | undefined;
        absolutePath: AbsoluteFilePath;
        slug: string | undefined;
        hidden: boolean | undefined;
        noindex: boolean | undefined;
    }

    export interface Section {
        type: "section";
        title: string;
        icon: string | undefined;
        contents: DocsNavigationItem[];
        collapsed: boolean | undefined;
        slug: string | undefined;
        hidden: boolean | undefined;
        skipUrlSlug: boolean | undefined;
        overviewAbsolutePath: AbsoluteFilePath | undefined;
    }

    export interface ApiSection {
        type: "apiSection";
        title: string;
        icon: string | undefined;
        apiName: string | undefined;
        audiences: Audiences;
        showErrors: boolean;
        snippetsConfiguration: SnippetsConfiguration | undefined;
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        navigation: ParsedApiReferenceLayoutItem[];
        hidden: boolean | undefined;
        slug: string | undefined;
        skipUrlSlug: boolean | undefined;
        alphabetized: boolean;
        flattened: boolean;
        paginated: boolean;
    }

    export interface Link {
        type: "link";
        text: string;
        url: string;
        icon: string | undefined;
    }

    export interface Changelog {
        type: "changelog";
        changelog: AbsoluteFilePath[];
        title: string;
        icon: string | undefined;
        hidden: boolean | undefined;
        slug: string | undefined;
    }

    export interface VersionedSnippetLanguageConfiguration {
        package: string;
        version: string;
    }

    export interface SnippetsConfiguration {
        python: string | VersionedSnippetLanguageConfiguration | undefined;
        typescript: string | VersionedSnippetLanguageConfiguration | undefined;
        go: string | VersionedSnippetLanguageConfiguration | undefined;
        java: string | VersionedSnippetLanguageConfiguration | undefined;
        ruby: string | VersionedSnippetLanguageConfiguration | undefined;
    }
}

export declare namespace ParsedApiReferenceLayoutItem {
    export interface Section {
        type: "section";
        title: string; // title
        referencedSubpackages: string[]; // subpackage IDs
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        contents: ParsedApiReferenceLayoutItem[];
        slug: string | undefined;
        hidden: boolean | undefined;
        icon: string | undefined;
        skipUrlSlug: boolean | undefined;
    }
    export interface Package {
        type: "package";
        title: string | undefined; // defaults to subpackage title
        package: string; // subpackage ID
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        contents: ParsedApiReferenceLayoutItem[];
        slug: string | undefined;
        hidden: boolean | undefined;
        icon: string | undefined;
        skipUrlSlug: boolean | undefined;
    }

    export interface Endpoint {
        type: "endpoint";
        endpoint: string; // endpoint locator
        title: string | undefined;
        icon: string | undefined;
        slug: string | undefined;
        hidden: boolean | undefined;
    }

    export interface Item {
        type: "item";
        value: string; // this could be either an endpoint or subpackage.
    }
}

export type ParsedApiReferenceLayoutItem =
    | ParsedApiReferenceLayoutItem.Item
    | ParsedApiReferenceLayoutItem.Section
    | ParsedApiReferenceLayoutItem.Package
    | ParsedApiReferenceLayoutItem.Endpoint
    | DocsNavigationItem.Page
    | DocsNavigationItem.Link;
