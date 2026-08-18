import * as RawSchemas from "./schemas/index.js";

export function getChangelogFolderFromNavigationItem(
    item: RawSchemas.NavigationItem
): RawSchemas.ChangelogFolderRelativePath | undefined {
    if ("changelog" in item) {
        return item.changelog;
    }
    if ("blog" in item) {
        return item.blog;
    }
    return undefined;
}

export function getChangelogFolderFromTabConfig(
    tab: RawSchemas.TabConfig
): RawSchemas.ChangelogFolderRelativePath | undefined {
    return tab.changelog ?? tab.blog;
}
