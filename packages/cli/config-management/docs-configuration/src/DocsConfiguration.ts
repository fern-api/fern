import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DocsInstances } from "@fern-fern/docs-config/api";
import type { FernRegistry } from "@fern-fern/registry-node";

export interface DocsConfiguration {
    instances: DocsInstances[];
    navigation: DocsNavigationConfiguration;
    title: string | undefined;
    logo: Logo | undefined;
    favicon: ImageReference | undefined;
    backgroundImage: ImageReference | undefined;
    colors: FernRegistry.docs.v1.write.ColorsConfig;
    navbarLinks: FernRegistry.docs.v1.write.NavbarLink[] | undefined;
    typography: TypographyConfig | undefined;
}

export interface Logo {
    reference: ImageReference;
    height: FernRegistry.docs.v1.write.Height | undefined;
    href: FernRegistry.docs.v1.write.Url | undefined;
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

export interface UnversionedDocsNavigation {
    type: "unversioned";
    items: DocsNavigationItem[];
}

export interface VersionedDocsNavigation {
    type: "versioned";
    versions: {
        items: DocsNavigationItem[];
        version: string;
    }[];
}

export type DocsNavigationConfiguration = UnversionedDocsNavigation | VersionedDocsNavigation;

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
    }
}
