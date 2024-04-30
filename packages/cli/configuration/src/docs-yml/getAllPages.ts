import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { DocsNavigationConfiguration, DocsNavigationItem, ParsedApiNavigationItem } from "./ParsedDocsConfiguration";

export async function getAllPages({
    navigation,
    absolutePathToFernFolder
}: {
    navigation: DocsNavigationConfiguration;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<Record<RelativeFilePath, string>> {
    switch (navigation.type) {
        case "tabbed":
            return combineMaps(
                await Promise.all(
                    navigation.items.map(async (tab) => {
                        if (tab.layout == null) {
                            return {};
                        }
                        return combineMaps(
                            await Promise.all(
                                tab.layout.map(async (item) => {
                                    return await getAllPagesFromNavigationItem({
                                        item,
                                        absolutePathToFernFolder
                                    });
                                })
                            )
                        );
                    })
                )
            );
        case "untabbed":
            return combineMaps(
                await Promise.all(
                    navigation.items.map(async (item) => {
                        return await getAllPagesFromNavigationItem({
                            item,
                            absolutePathToFernFolder
                        });
                    })
                )
            );
        case "versioned":
            return combineMaps(
                await Promise.all(
                    navigation.versions.map(async (version) => {
                        return await getAllPages({
                            navigation: version.navigation,
                            absolutePathToFernFolder
                        });
                    })
                )
            );
        default:
            assertNever(navigation);
    }
}

export async function getAllPagesFromNavigationItem({
    item,
    absolutePathToFernFolder
}: {
    item: DocsNavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<Record<RelativeFilePath, string>> {
    switch (item.type) {
        case "apiSection": {
            const toRet = combineMaps(
                await Promise.all(
                    item.navigation.map((apiNavigation) =>
                        getAllPagesFromApiNavigationItem({ item: apiNavigation, absolutePathToFernFolder })
                    )
                )
            );
            if (item.summaryAbsolutePath != null) {
                toRet[await relativize(absolutePathToFernFolder, item.summaryAbsolutePath)] = (
                    await readFile(item.summaryAbsolutePath)
                ).toString();
            }
            return toRet;
        }
        case "link":
            return {};
        case "page":
            return {
                [await relativize(absolutePathToFernFolder, item.absolutePath)]: (
                    await readFile(item.absolutePath)
                ).toString()
            };
        case "section":
            return combineMaps(
                await Promise.all(
                    item.contents.map(async (sectionItem) => {
                        return await getAllPagesFromNavigationItem({ item: sectionItem, absolutePathToFernFolder });
                    })
                )
            );
        default:
            assertNever(item);
    }
}

function combineMaps(maps: Record<RelativeFilePath, string>[]) {
    return maps.reduce((acc, record) => ({ ...acc, ...record }), {});
}

async function getAllPagesFromApiNavigationItem({
    item,
    absolutePathToFernFolder
}: {
    item: ParsedApiNavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<Record<RelativeFilePath, string>> {
    if (item.type === "page") {
        return {
            [await relativize(absolutePathToFernFolder, item.absolutePath)]: (
                await readFile(item.absolutePath)
            ).toString()
        };
    } else if (item.type === "subpackage") {
        const toRet = combineMaps(
            await Promise.all(
                item.items.map(async (subItem) => {
                    return await getAllPagesFromApiNavigationItem({ item: subItem, absolutePathToFernFolder });
                })
            )
        );

        if (item.summaryAbsolutePath != null) {
            toRet[await relativize(absolutePathToFernFolder, item.summaryAbsolutePath)] = (
                await readFile(item.summaryAbsolutePath)
            ).toString();
        }

        return toRet;
    }
    return {};
}
