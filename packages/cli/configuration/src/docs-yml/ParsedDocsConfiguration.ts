import { FdrAPI as CjsFdrSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";

import { Audiences } from "../commons/index.js";
import {
    AgentsConfig,
    AiChatConfig,
    AnnouncementConfig,
    Availability,
    DocsInstance,
    ExperimentalConfig,
    Language,
    LibraryLanguage,
    PlaygroundSettings,
    Target,
    ThemeConfig,
    TranslationConfig,
    VersionAvailability
} from "./schemas/index.js";

export interface ParsedCustomPageAction {
    title: string;
    subtitle: string | undefined;
    url: string;
    icon: string | AbsoluteFilePath | undefined;
    default: boolean | undefined;
}

export interface ParsedPageActionsConfig {
    default: CjsFdrSdk.docs.v1.commons.PageActionOption | undefined;
    options: {
        askAi: boolean;
        copyPage: boolean;
        viewAsMarkdown: boolean;
        openAi: boolean;
        claude: boolean;
        cursor: boolean;
        claudeCode: boolean;
        vscode: boolean;
        custom: ParsedCustomPageAction[];
    };
}

// TODO(kafkas): Remove this when we upgrade the fdr-sdk to latest
interface ParsedDocsSettingsConfig extends CjsFdrSdk.docs.v1.commons.DocsSettingsConfig {
    disableEnvironmentEditing: boolean | undefined;
    websocketOneofDisplay: "flat" | "grouped" | undefined;
}

export interface ParsedDocsConfiguration {
    instances: DocsInstance[];
    title: string | undefined;

    /* filepath of page to contents */
    pages: Record<RelativeFilePath, string>;

    /* per-locale translated page content: locale → { relativeFilePath → markdown } */
    translationPages: Record<string, Record<RelativeFilePath, string>> | undefined;

    /* RBAC declaration */
    roles: string[] | undefined;

    /* library documentation */
    libraries: Record<string, ParsedLibraryConfiguration> | undefined;

    /* navigation */
    landingPage: DocsNavigationItem.Page | undefined;
    navigation: DocsNavigationConfiguration;
    navbarLinks: CjsFdrSdk.docs.v1.commons.NavbarLink[] | undefined;
    footerLinks: CjsFdrSdk.docs.v1.commons.FooterLink[] | undefined;

    /* seo */
    metadata: ParsedMetadataConfig | undefined;
    redirects: CjsFdrSdk.docs.v1.commons.RedirectConfig[] | undefined;

    /* branding */
    logo: Logo | undefined;
    favicon: AbsoluteFilePath | undefined;
    backgroundImage: BackgroundImage | undefined;
    colors: CjsFdrSdk.docs.v1.write.ColorsConfigV3 | undefined;
    typography: TypographyConfig | undefined;
    layout: CjsFdrSdk.docs.v1.commons.DocsLayoutConfig | undefined;
    settings: ParsedDocsSettingsConfig | undefined;
    context7File: AbsoluteFilePath | undefined;
    llmsTxtFile: AbsoluteFilePath | undefined;
    llmsFullTxtFile: AbsoluteFilePath | undefined;
    languages: Language[] | undefined;
    translations: TranslationConfig[] | undefined;
    defaultLanguage: CjsFdrSdk.docs.v1.commons.ProgrammingLanguage | undefined;
    analyticsConfig: CjsFdrSdk.docs.v1.commons.AnalyticsConfig | undefined;
    announcement: AnnouncementConfig | undefined;
    theme: ThemeConfig | undefined;
    globalTheme: string | undefined;

    /* integrations */
    integrations: CjsFdrSdk.docs.v1.commons.IntegrationsConfig | undefined;

    /* scripts */
    css: CjsFdrSdk.docs.v1.commons.CssConfig | undefined;
    js: JavascriptConfig | undefined;

    aiChatConfig: AiChatConfig | undefined;

    agents: AgentsConfig | undefined;

    experimental: ExperimentalConfig | undefined;

    pageActions: ParsedPageActionsConfig | undefined;

    /* custom components */
    header: AbsoluteFilePath | undefined;
    footer: AbsoluteFilePath | undefined;
}

export interface AbsoluteJsFileConfig {
    absolutePath: AbsoluteFilePath;
    strategy?: CjsFdrSdk.docs.v1.commons.JsScriptStrategy;
}

export interface JavascriptConfig {
    remote?: CjsFdrSdk.docs.v1.commons.JsRemoteConfig[];
    files: AbsoluteJsFileConfig[];
}

export interface DocsColorsConfiguration {
    accentPrimary: ColorConfiguration | undefined;
    background: ColorConfiguration | undefined;
}

export interface ParsedMetadataConfig
    extends Omit<
        CjsFdrSdk.docs.v1.commons.MetadataConfig,
        "og:image" | "og:logo" | "twitter:image" | "og:background-image"
    > {
    "og:image": FilepathOrUrl | undefined;
    "og:logo": FilepathOrUrl | undefined;
    "twitter:image": FilepathOrUrl | undefined;
    "og:dynamic": boolean | undefined;
    "og:background-image": FilepathOrUrl | undefined;
    "og:dynamic:text-color": string | undefined;
    "og:dynamic:background-color": string | undefined;
    "og:dynamic:logo-color": "dark" | "light" | undefined;
    "og:dynamic:show-logo": boolean | undefined;
    "og:dynamic:show-section": boolean | undefined;
    "og:dynamic:show-description": boolean | undefined;
    "og:dynamic:show-url": boolean | undefined;
    "og:dynamic:show-gradient": boolean | undefined;
}

export type ColorConfiguration =
    | {
          type: "themed";
          dark: CjsFdrSdk.docs.v1.commons.RgbaColor | undefined;
          light: CjsFdrSdk.docs.v1.commons.RgbaColor | undefined;
      }
    | {
          type: "unthemed";
          color: CjsFdrSdk.docs.v1.commons.RgbaColor | undefined;
      };

export interface Logo {
    dark: AbsoluteFilePath | undefined;
    light: AbsoluteFilePath | undefined;
    height: CjsFdrSdk.docs.v1.write.Height | undefined;
    href: CjsFdrSdk.Url | undefined;
    rightText: string | undefined;
}

export interface BackgroundImage {
    dark: AbsoluteFilePath | undefined;
    light: AbsoluteFilePath | undefined;
}

export interface FontConfig {
    name: string | undefined;
    variants: FontVariant[];
    display: CjsFdrSdk.docs.v1.commons.FontDisplay | undefined;
    fallback: string[] | undefined;
    fontVariationSettings: string | undefined;
}

export interface FontVariant {
    absolutePath: AbsoluteFilePath;
    weight: string[] | undefined;
    style: CjsFdrSdk.docs.v1.commons.FontStyle | undefined;
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

export interface ProductGroupDocsNavigation {
    type: "productgroup";
    products: ProductInfo[];
}

export interface VersionInfo
    extends CjsFdrSdk.navigation.v1.WithPermissions,
        CjsFdrSdk.navigation.latest.WithFeatureFlags {
    landingPage: DocsNavigationItem.Page | undefined;
    navigation: UntabbedDocsNavigation | TabbedDocsNavigation;
    version: string;
    availability: VersionAvailability | undefined;
    slug: string | undefined;
    hidden: boolean | undefined;
    announcement: AnnouncementConfig | undefined;
}

export type ProductInfo = InternalProduct | ExternalProduct;

export interface InternalProduct
    extends CjsFdrSdk.navigation.v1.WithPermissions,
        CjsFdrSdk.navigation.latest.WithFeatureFlags {
    type: "internal";
    landingPage: DocsNavigationItem.Page | undefined;
    subtitle: string | undefined;
    product: string;
    navigation: UnversionedNavigationConfiguration | VersionedDocsNavigation;
    slug: string | undefined;
    icon: string | AbsoluteFilePath;
    image: AbsoluteFilePath | undefined;
    announcement: AnnouncementConfig | undefined;
}

export interface ExternalProduct
    extends CjsFdrSdk.navigation.v1.WithPermissions,
        CjsFdrSdk.navigation.latest.WithFeatureFlags {
    type: "external";
    subtitle: string | undefined;
    product: string;
    href: string | undefined;
    icon: string | AbsoluteFilePath;
    image: AbsoluteFilePath | undefined;
    target: Target | undefined;
}

export type DocsNavigationConfiguration =
    | UntabbedDocsNavigation
    | TabbedDocsNavigation
    | VersionedDocsNavigation
    | ProductGroupDocsNavigation;

export type UnversionedNavigationConfiguration = UntabbedDocsNavigation | TabbedDocsNavigation;

export interface TabbedNavigation
    extends CjsFdrSdk.navigation.v1.WithPermissions,
        CjsFdrSdk.navigation.latest.WithFeatureFlags {
    // tab: string;
    title: string;
    icon: string | AbsoluteFilePath | undefined;
    slug: string | undefined;
    skipUrlSlug: boolean | undefined;
    hidden: boolean | undefined;
    child: TabbedNavigationChild;
}

type TabbedNavigationChild =
    | TabbedNavigationChild.Layout
    | TabbedNavigationChild.Link
    | TabbedNavigationChild.Changelog
    | TabbedNavigationChild.Variants;

export declare namespace TabbedNavigationChild {
    export interface Layout {
        type: "layout";
        layout: DocsNavigationItem[];
    }

    export interface Link {
        type: "link";
        href: string;
        target: Target | undefined;
    }

    export interface Changelog {
        type: "changelog";
        changelog: AbsoluteFilePath[];
    }

    export interface Variants {
        type: "variants";
        variants: TabVariant[];
    }
}

export interface TabVariant
    extends CjsFdrSdk.navigation.v1.WithPermissions,
        CjsFdrSdk.navigation.latest.WithFeatureFlags {
    title: string;
    subtitle: string | undefined;
    icon: string | AbsoluteFilePath | undefined;
    layout: DocsNavigationItem[];
    slug: string | undefined;
    skipUrlSlug: boolean | undefined;
    hidden: boolean | undefined;
    default: boolean | undefined;
}

export type DocsNavigationItem =
    | DocsNavigationItem.Page
    | DocsNavigationItem.Section
    | DocsNavigationItem.ApiSection
    | DocsNavigationItem.LibrarySection
    | DocsNavigationItem.Link
    | DocsNavigationItem.Changelog;

export declare namespace DocsNavigationItem {
    export interface Page
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "page";
        title: string;
        icon: string | AbsoluteFilePath | undefined;
        absolutePath: AbsoluteFilePath;
        slug: string | undefined;
        hidden: boolean | undefined;
        noindex: boolean | undefined;
        availability: Availability | undefined;
    }

    export interface Section
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "section";
        title: string;
        icon: string | AbsoluteFilePath | undefined;
        contents: DocsNavigationItem[];
        collapsed: boolean | "open-by-default" | undefined;
        collapsible: boolean | undefined;
        collapsedByDefault: boolean | undefined;
        slug: string | undefined;
        hidden: boolean | undefined;
        skipUrlSlug: boolean | undefined;
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        availability: Availability | undefined;
    }

    export interface ApiSection
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "apiSection";
        title: string;
        icon: string | AbsoluteFilePath | undefined;
        apiName: string | undefined;
        openrpc: string | undefined;
        audiences: Audiences;
        availability: Availability | undefined;
        showErrors: boolean;
        tagDescriptionPages: boolean;
        snippetsConfiguration: SnippetsConfiguration | undefined;
        postman: string | undefined;
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        navigation: ParsedApiReferenceLayoutItem[];
        collapsed: boolean | "open-by-default" | undefined;
        hidden: boolean | undefined;
        slug: string | undefined;
        skipUrlSlug: boolean | undefined;
        alphabetized: boolean;
        flattened: boolean;
        paginated: boolean;
        playground: PlaygroundSettings | undefined;
    }

    export interface Link {
        type: "link";
        text: string;
        url: string;
        icon: string | AbsoluteFilePath | undefined;
        target: Target | undefined;
    }

    export interface Changelog
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "changelog";
        changelog: AbsoluteFilePath[];
        title: string;
        icon: string | AbsoluteFilePath | undefined;
        hidden: boolean | undefined;
        slug: string | undefined;
    }

    export interface LibrarySection
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "librarySection";
        /** The name of the library (must match a key in the `libraries` section) */
        libraryName: string;
        /** Override display title for this library reference */
        title: string | undefined;
        /** Override URL slug for this library reference */
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
        csharp: string | VersionedSnippetLanguageConfiguration | undefined;
        php: string | VersionedSnippetLanguageConfiguration | undefined;
        swift: string | VersionedSnippetLanguageConfiguration | undefined;
    }
}

export declare namespace ParsedApiReferenceLayoutItem {
    export interface Section
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "section";
        title: string; // title
        referencedSubpackages: string[]; // subpackage IDs
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        contents: ParsedApiReferenceLayoutItem[];
        slug: string | undefined;
        hidden: boolean | undefined;
        icon: string | AbsoluteFilePath | undefined;
        skipUrlSlug: boolean | undefined;
        collapsed: boolean | "open-by-default" | undefined;
        collapsible: boolean | undefined;
        collapsedByDefault: boolean | undefined;
        availability: Availability | undefined;
        playground: PlaygroundSettings | undefined;
    }
    export interface Package
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "package";
        title: string | undefined; // defaults to subpackage title
        package: string; // subpackage ID
        overviewAbsolutePath: AbsoluteFilePath | undefined;
        contents: ParsedApiReferenceLayoutItem[];
        slug: string | undefined;
        hidden: boolean | undefined;
        icon: string | AbsoluteFilePath | undefined;
        skipUrlSlug: boolean | undefined;
        availability: Availability | undefined;
        playground: PlaygroundSettings | undefined;
    }

    export interface Endpoint
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "endpoint";
        endpoint: string; // endpoint locator
        title: string | undefined;
        icon: string | AbsoluteFilePath | undefined;
        slug: string | undefined;
        hidden: boolean | undefined;
        availability: Availability | undefined;
        playground: PlaygroundSettings | undefined;
    }

    export interface Operation
        extends CjsFdrSdk.navigation.v1.WithPermissions,
            CjsFdrSdk.navigation.latest.WithFeatureFlags {
        type: "operation";
        operation: string; // GraphQL operation locator (e.g., "QUERY account" or "QUERY namespace.createUser")
        title: string | undefined;
        slug: string | undefined;
        hidden: boolean | undefined;
        availability: Availability | undefined;
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
    | ParsedApiReferenceLayoutItem.Operation
    | DocsNavigationItem.Page
    | DocsNavigationItem.Link;

/**
 * Parsed configuration for a library documentation source.
 * Used by `fern docs md generate` to generate MDX files from library source code.
 */
export interface ParsedLibraryConfiguration {
    /** Configuration for the library source location */
    input: {
        /** GitHub URL to the repository containing the library source code */
        git: string;
        /** Optional path within the repository to the library source */
        subpath: string | undefined;
    };
    /** Configuration for the library documentation output */
    output: {
        /** The output directory where MDX files will be generated */
        path: string;
    };
    /** The programming language of the library source code */
    lang: LibraryLanguage;
}
