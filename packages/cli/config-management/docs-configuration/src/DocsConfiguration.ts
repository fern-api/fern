import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface DocsConfiguration {
    navigation: DocsNavigationConfiguration;
    logo: LogoReference | undefined;
    colors: ColorsConfiguration;
}

export type LogoReference = LogoReference.Url | LogoReference.File;

export declare namespace LogoReference {
    export interface Url {
        type: "url";
        url: string;
    }

    export interface File {
        type: "file";
        filepath: AbsoluteFilePath;
    }
}

export interface DocsNavigationConfiguration {
    items: DocsNavigationItem[];
}

export type DocsNavigationItem = DocsNavigationItem.Page | DocsNavigationItem.Section | DocsNavigationItem.ApiSection;

export declare namespace DocsNavigationItem {
    export interface Page {
        type: "page";
        absolutePath: AbsoluteFilePath;
    }

    export interface Section {
        type: "section";
        title: string;
        items: DocsNavigationItem[];
    }

    export interface ApiSection {
        type: "apiSection";
        title: string;
        audiences: Audiences;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ColorsConfiguration {}
