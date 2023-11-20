import { Audiences } from "@fern-api/config-management-commons";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { DocsInstances, TabConfig, VersionAvailability } from "@fern-fern/docs-config/api";

export interface ParsedDocsConfiguration {
    absoluteFilepath: AbsoluteFilePath;
    instances: DocsInstances[];
    tabs?: Record<RelativeFilePath, TabConfig>;
    navigation: DocsNavigationConfiguration;
    title: string | undefined;
    logo: Logo | undefined;
    favicon: ImageReference | undefined;
    backgroundImage: ImageReference | undefined;
    colors: DocsColorsConfiguration | undefined;
    navbarLinks: DocsV1Write.NavbarLink[] | undefined;
    typography: TypographyConfig | undefined;
    /* filepath of page to contents */
    pages: Record<RelativeFilePath, string>;
}

export interface DocsColorsConfiguration {
    accentPrimary: ColorConfiguration | undefined;
    background: ColorConfiguration | undefined;
}

export type ColorConfiguration =
    | {
          type: "themed";
          dark: DocsV1Write.RgbColor | undefined;
          light: DocsV1Write.RgbColor | undefined;
      }
    | {
          type: "unthemed";
          color: DocsV1Write.RgbColor | undefined;
      };

export interface Logo {
    dark: ImageReference | undefined;
    light: ImageReference | undefined;
    height: DocsV1Write.Height | undefined;
    href: DocsV1Write.Url | undefined;
}

export interface FontConfig {
    name: string | undefined;
    absolutePath: AbsoluteFilePath;
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

export type DocsNavigationItem = DocsNavigationItem.Page | DocsNavigationItem.Section | DocsNavigationItem.ApiSection;

export declare namespace DocsNavigationItem {
    export interface Page {
        type: "page";
        title: string;
        absolutePath: AbsoluteFilePath;
        slug: string | undefined;
    }

    export interface Section {
        type: "section";
        title: string;
        contents: DocsNavigationItem[];
        collapsed: boolean | undefined;
        slug: string | undefined;
    }

    export interface ApiSection {
        type: "apiSection";
        title: string;
        apiName: string | undefined;
        audiences: Audiences;
        showErrors: boolean;
        snippetsConfiguration: SnippetsConfiguration | undefined;
    }

    export interface SnippetsConfiguration {
        python: string | undefined;
        typescript: string | undefined;
        go: string | undefined;
        java: string | undefined;
    }
}
