import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { Audiences } from "../commons";
import { WithoutQuestionMarks } from "../commons/WithoutQuestionMarks";
import { DocsInstances, TabConfig, VersionAvailability } from "./schemas";

export interface ParsedDocsConfiguration {
    absoluteFilepath: AbsoluteFilePath;
    instances: DocsInstances[];
    tabs?: Record<RelativeFilePath, TabConfig>;
    navigation: DocsNavigationConfiguration;
    title: string | undefined;
    logo: Logo | undefined;
    favicon: ImageReference | undefined;
    backgroundImage: BackgroundImage | undefined;
    colors: DocsV1Write.ColorsConfigV3 | undefined;
    navbarLinks: DocsV1Write.NavbarLink[] | undefined;
    typography: TypographyConfig | undefined;
    layout: WithoutQuestionMarks<DocsV1Write.DocsLayoutConfig> | undefined;
    /* filepath of page to contents */
    pages: Record<RelativeFilePath, string>;
    css: DocsV1Write.CssConfig | undefined;
    js: JavascriptConfig | undefined;
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
    dark: ImageReference | undefined;
    light: ImageReference | undefined;
    height: DocsV1Write.Height | undefined;
    href: DocsV1Write.Url | undefined;
}

export interface BackgroundImage {
    dark: ImageReference | undefined;
    light: ImageReference | undefined;
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

export interface ImageReference {
    filepath: AbsoluteFilePath;
}

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
    navigation: UntabbedDocsNavigation | TabbedDocsNavigation;
    version: string;
    availability: VersionAvailability | undefined;
    slug: string | undefined;
}

export type DocsNavigationConfiguration = UntabbedDocsNavigation | TabbedDocsNavigation | VersionedDocsNavigation;

export type UnversionedNavigationConfiguration = UntabbedDocsNavigation | TabbedDocsNavigation;

export interface TabbedNavigation {
    tab: string;
    layout: DocsNavigationItem[];
}

export type DocsNavigationItem =
    | DocsNavigationItem.Page
    | DocsNavigationItem.Section
    | DocsNavigationItem.ApiSection
    | DocsNavigationItem.Link;

export declare namespace DocsNavigationItem {
    export interface Page {
        type: "page";
        title: string;
        icon: string | undefined;
        absolutePath: AbsoluteFilePath;
        slug: string | undefined;
        hidden: boolean | undefined;
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
    }

    export interface ApiSection {
        type: "apiSection";
        title: string;
        icon: string | undefined;
        apiName: string | undefined;
        audiences: Audiences;
        showErrors: boolean;
        snippetsConfiguration: SnippetsConfiguration | undefined;
        summaryAbsolutePath: AbsoluteFilePath | undefined;
        navigation: ParsedApiNavigationItem[];
        hidden: boolean | undefined;
        skipUrlSlug: boolean | undefined;
    }

    export interface Link {
        type: "link";
        text: string;
        url: string;
    }

    export interface SnippetsConfiguration {
        python: string | undefined;
        typescript: string | undefined;
        go: string | undefined;
        java: string | undefined;
    }
}

export declare namespace ParsedApiNavigationItem {
    export interface Subpackage {
        type: "subpackage";
        subpackageId: string;
        summaryAbsolutePath: AbsoluteFilePath | undefined;
        items: ParsedApiNavigationItem[];
    }

    export interface Item {
        type: "item";
        value: string; // this could be either an endpoint or subpackage.
    }
}

export type ParsedApiNavigationItem =
    | ParsedApiNavigationItem.Item
    | ParsedApiNavigationItem.Subpackage
    | DocsNavigationItem.Page;
