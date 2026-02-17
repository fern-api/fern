import type { schemas } from "@fern-api/config";

/**
 * Docs navigation configuration. Discriminated by `type`.
 *
 * In the raw YAML, untabbed navigation is a flat array of items and
 * tabbed navigation is an array of tabbed items. Here we provide
 * a proper discriminated union with explicit `type` tags.
 */
export type Navigation = UntabbedNavigation | TabbedNavigation;

export interface UntabbedNavigation {
    type: "untabbed";
    items: NavigationItem[];
}

export interface TabbedNavigation {
    type: "tabbed";
    items: TabbedNavigationItem[];
}

/**
 * Navigation item discriminated union. Unlike the raw YAML which uses
 * key-presence discrimination (e.g., `page:` vs `section:`), these
 * use an explicit `type` field.
 */
export type NavigationItem =
    | NavigationItem.Page
    | NavigationItem.Section
    | NavigationItem.ApiReference
    | NavigationItem.Link
    | NavigationItem.Changelog
    | NavigationItem.Library
    | NavigationItem.Folder;

export declare namespace NavigationItem {
    interface Page {
        type: "page";
        /** Relative path to the page file */
        path: string;
        title?: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        noindex?: boolean;
    }

    interface Section {
        type: "section";
        title: string;
        contents: NavigationItem[];
        collapsed?: boolean;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        skipSlug?: boolean;
        /** Relative path to section overview page */
        overview?: string;
    }

    interface ApiReference {
        type: "apiReference";
        title?: string;
        api?: string;
        apiName?: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        audiences?: string[];
        showErrors?: boolean;
        snippets?: schemas.SnippetsConfigurationSchema;
        playground?: schemas.PlaygroundSettingsSchema;
        collapsed?: boolean;
        alphabetized?: boolean;
        flattened?: boolean;
        paginated?: boolean;
        /** Relative path to overview page */
        overview?: string;
    }

    interface Link {
        type: "link";
        text: string;
        href: string;
        icon?: string;
    }

    interface Changelog {
        type: "changelog";
        /** Relative path(s) to changelog directory */
        path: string | string[];
        title?: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
    }

    interface Library {
        type: "library";
        name: string;
        title?: string;
        slug?: string;
    }

    interface Folder {
        type: "folder";
        title: string;
        contents: NavigationItem[];
        collapsed?: boolean;
        slug?: string;
        icon?: string;
        hidden?: boolean;
    }
}

export interface TabbedNavigationItem {
    tab: string;
    layout?: NavigationItem[];
    variants?: TabVariant[];
}

export interface TabVariant {
    title: string;
    subtitle?: string;
    icon?: string;
    layout: NavigationItem[];
    slug?: string;
    default?: boolean;
}
