import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernRegistry } from "@fern-fern/registry-node";

export interface DocsConfiguration {
    navigation: DocsNavigationConfiguration;
    title: string | undefined;
    logo: ImageReference | undefined;
    favicon: ImageReference | undefined;
    colors: FernRegistry.docs.v1.write.ColorsConfig;
    navbarLinks: FernRegistry.docs.v1.write.NavbarLink[] | undefined;
}

export interface ImageReference {
    filepath: AbsoluteFilePath;
}

export interface DocsNavigationConfiguration {
    items: DocsNavigationItem[];
}

export type DocsNavigationItem = DocsNavigationItem.Page | DocsNavigationItem.Section | DocsNavigationItem.ApiSection;

export declare namespace DocsNavigationItem {
    export interface Page {
        type: "page";
        title: string;
        absolutePath: AbsoluteFilePath;
    }

    export interface Section {
        type: "section";
        title: string;
        contents: DocsNavigationItem[];
    }

    export interface ApiSection {
        type: "apiSection";
        title: string;
        audiences: Audiences;
    }
}
