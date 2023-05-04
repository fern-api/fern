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
        audiences: ApiSectionAudiences;
    }
}

export type ApiSectionAudiences = ApiSectionAudiences.AllAudiences | ApiSectionAudiences.SelectAudiences;

export declare namespace ApiSectionAudiences {
    export interface AllAudiences {
        type: "all";
    }

    export interface SelectAudiences {
        type: "select";
        audiences: string[];
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ColorsConfiguration {}
