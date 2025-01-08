import { readFile } from "fs/promises";
import { compact } from "lodash-es";

import { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, relativize } from "@fern-api/fs-utils";

const BATCH_SIZE = 100; // Define a reasonable batch size

interface LoadPagesOptions {
    files: AbsoluteFilePath[];
    absolutePathToFernFolder: AbsoluteFilePath;
}

async function loadBatch({
    files,
    absolutePathToFernFolder
}: LoadPagesOptions): Promise<Record<RelativeFilePath, string>> {
    const pairs = await Promise.all(
        files.map(async (file) => {
            const content = await readFile(file, "utf-8");
            return [await relativize(absolutePathToFernFolder, file), content];
        })
    );
    return Object.fromEntries(pairs);
}

export async function loadAllPages({
    files,
    absolutePathToFernFolder
}: {
    files: AbsoluteFilePath[];
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<Record<RelativeFilePath, string>> {
    const result: Record<RelativeFilePath, string> = {};

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const batchResult = await loadBatch({
            files: batch,
            absolutePathToFernFolder
        });
        Object.assign(result, batchResult);
    }

    return result;
}

export function getAllPages({
    landingPage,
    navigation
}: {
    landingPage: docsYml.DocsNavigationItem.Page | undefined;
    navigation: docsYml.DocsNavigationConfiguration;
}): AbsoluteFilePath[] {
    return compact([landingPage?.absolutePath, ...getAllPagesFromNavigationConfig(navigation)]);
}

function getAllPagesFromNavigationConfig(navigation: docsYml.DocsNavigationConfiguration): AbsoluteFilePath[] {
    switch (navigation.type) {
        case "tabbed":
            return navigation.items.flatMap((tab) => {
                if (tab.child.type === "layout") {
                    return tab.child.layout.flatMap((item) => {
                        return getAllPagesFromNavigationItem({
                            item
                        });
                    });
                } else if (tab.child.type === "changelog") {
                    return tab.child.changelog;
                }
                return [];
            });
        case "untabbed":
            return navigation.items.flatMap((item) => {
                return getAllPagesFromNavigationItem({
                    item
                });
            });
        case "versioned":
            return navigation.versions.flatMap((version) => {
                return getAllPages({
                    landingPage: version.landingPage,
                    navigation: version.navigation
                });
            });
        default:
            assertNever(navigation);
    }
}

export function getAllPagesFromNavigationItem({ item }: { item: docsYml.DocsNavigationItem }): AbsoluteFilePath[] {
    switch (item.type) {
        case "apiSection":
            return compact([
                item.overviewAbsolutePath,
                ...item.navigation.flatMap((apiNavigation) =>
                    getAllPagesFromApiReferenceLayoutItem({ item: apiNavigation })
                )
            ]);
        case "link":
            return [];
        case "page":
            return [item.absolutePath];
        case "section":
            return compact([
                item.overviewAbsolutePath,
                ...item.contents.flatMap((subItem) => {
                    return getAllPagesFromNavigationItem({ item: subItem });
                })
            ]);
        case "changelog":
            return item.changelog;
        default:
            assertNever(item);
    }
}

function getAllPagesFromApiReferenceLayoutItem({
    item
}: {
    item: docsYml.ParsedApiReferenceLayoutItem;
}): AbsoluteFilePath[] {
    if (item.type === "page") {
        return [item.absolutePath];
    } else if (item.type === "package" || item.type === "section") {
        return compact([
            item.overviewAbsolutePath,
            ...item.contents.flatMap((subItem) => {
                return getAllPagesFromApiReferenceLayoutItem({ item: subItem });
            })
        ]);
    }
    return [];
}
