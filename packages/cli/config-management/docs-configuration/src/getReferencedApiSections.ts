import { assertNever } from "@fern-api/core-utils";
import {
    DocsNavigationItem,
    ParsedDocsConfiguration,
    TabbedDocsNavigation,
    UntabbedDocsNavigation
} from "./ParsedDocsConfiguration";

export type ReferencedApisResponse = DefaultAPIReferenced | NamedAPIReferenced;

/**
 * When there is only a single API present and it is automatically referenced.
 */
export interface DefaultAPIReferenced {
    type: "default";
}

/**
 * When there are multiple APIs referenced by name.
 */
export interface NamedAPIReferenced {
    type: "named";
    apiNames: string[];
}

export function getReferencedApiSections(config: ParsedDocsConfiguration): ReferencedApisResponse | undefined {
    const collector = new ApiSectionCollector();
    switch (config.navigation.type) {
        case "tabbed":
        case "untabbed":
            visitNavigation({ navigation: config.navigation, collector });
            break;
        case "versioned":
            config.navigation.versions.forEach((version) => {
                visitNavigation({ navigation: version.navigation, collector });
            });
            break;
        default:
            assertNever(config.navigation);
    }
    return collector.getReferences();
}

export function visitNavigation({
    navigation,
    collector
}: {
    navigation: UntabbedDocsNavigation | TabbedDocsNavigation;
    collector: ApiSectionCollector;
}): void {
    switch (navigation.type) {
        case "tabbed":
            navigation.items.forEach((tab) => {
                tab.layout.forEach((item) => {
                    visitDocsNavigationItem({ item, collector });
                });
            });
            break;
        case "untabbed":
            navigation.items.forEach((item) => {
                visitDocsNavigationItem({ item, collector });
            });
            break;
        default:
            assertNever(navigation);
    }
}

export function visitDocsNavigationItem({
    item,
    collector
}: {
    item: DocsNavigationItem;
    collector: ApiSectionCollector;
}): void {
    switch (item.type) {
        case "apiSection":
            collector.collect(item);
            return;
        case "section":
            item.contents.forEach((subItem) => {
                visitDocsNavigationItem({ item: subItem, collector });
            });
            return;
        case "page":
        case "link":
            return;
        default:
            assertNever(item);
    }
}

class ApiSectionCollector {
    private namedApis: Set<string> = new Set();
    private defaultApi = false;

    collect(section: DocsNavigationItem.ApiSection): void {
        if (section.apiName != null) {
            this.namedApis.add(section.apiName);
        } else {
            this.defaultApi = true;
        }
    }

    getReferences(): ReferencedApisResponse | undefined {
        if (this.defaultApi) {
            return {
                type: "default"
            };
        } else if (Object.keys(this.namedApis).length > 0) {
            return {
                type: "named",
                apiNames: [...this.namedApis]
            };
        }
        return undefined;
    }
}
