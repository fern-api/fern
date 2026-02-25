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
 * use an explicit `type` field while preserving the original schema
 * property names (kebab-case).
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
        page: string;
        path: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        noindex?: boolean;
    }

    interface Section {
        type: "section";
        section: string;
        path?: string;
        contents: NavigationItem[];
        collapsed?: boolean;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        "skip-slug"?: boolean;
    }

    interface ApiReference {
        type: "apiReference";
        api: string;
        "api-name"?: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
        audiences?: string | string[];
        "display-errors"?: boolean;
        snippets?: schemas.SnippetsConfigurationSchema;
        playground?: schemas.PlaygroundSettingsSchema;
        collapsed?: boolean;
        alphabetized?: boolean;
        flattened?: boolean;
        paginated?: boolean;
    }

    interface Link {
        type: "link";
        link: string;
        href: string;
        icon?: string;
    }

    interface Changelog {
        type: "changelog";
        changelog: string;
        title?: string;
        slug?: string;
        icon?: string;
        hidden?: boolean;
    }

    interface Library {
        type: "library";
        library: string;
        title?: string;
        slug?: string;
    }

    interface Folder {
        type: "folder";
        folder: string;
        title?: string;
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
