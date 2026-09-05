import { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { compact } from "lodash-es";

const BATCH_SIZE = 100; // Define a reasonable batch size

/**
 * A page to load. `absolutePath` is the key the page is registered under; `sourceAbsolutePath`
 * is the file read from disk. They only differ for pages rendered as a content variant.
 */
export interface PageFile {
    absolutePath: AbsoluteFilePath;
    sourceAbsolutePath: AbsoluteFilePath;
    variant: string | undefined;
}

interface LoadPagesOptions {
    files: PageFile[];
    absolutePathToFernFolder: AbsoluteFilePath;
}

async function loadBatch({
    files,
    absolutePathToFernFolder
}: LoadPagesOptions): Promise<Record<RelativeFilePath, string>> {
    const pairs = await Promise.all(
        files.map(async (file) => {
            const content = await readFile(file.sourceAbsolutePath, "utf-8");
            return [relativize(absolutePathToFernFolder, file.absolutePath), content];
        })
    );
    return Object.fromEntries(pairs);
}

export async function loadAllPages({
    files,
    absolutePathToFernFolder
}: {
    files: PageFile[];
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

function toPageFile(absolutePath: AbsoluteFilePath, variant?: docsYml.PageVariant): PageFile {
    return {
        absolutePath,
        sourceAbsolutePath: variant?.sourceAbsolutePath ?? absolutePath,
        variant: variant?.id
    };
}

function pageToPageFile(page: docsYml.DocsNavigationItem.Page): PageFile {
    return toPageFile(page.absolutePath, page.variant);
}

/**
 * Maps every variant page to its source file and variant, failing if a page references a
 * variant that is not declared under `variants` in docs.yml.
 */
export async function getVariantPages({
    files,
    variants,
    absolutePathToFernFolder,
    context
}: {
    files: PageFile[];
    variants: Record<string, Record<string, string>> | undefined;
    absolutePathToFernFolder: AbsoluteFilePath;
    context: TaskContext;
}): Promise<Record<RelativeFilePath, docsYml.VariantPageSource>> {
    const result: Record<RelativeFilePath, docsYml.VariantPageSource> = {};
    const errors: string[] = [];
    for (const file of files) {
        if (file.variant == null) {
            continue;
        }
        const sourceRelativeFilePath = relativize(absolutePathToFernFolder, file.sourceAbsolutePath);
        const relativeFilePath = relativize(absolutePathToFernFolder, file.absolutePath);
        if (variants == null || variants[file.variant] == null) {
            errors.push(
                `Page ${sourceRelativeFilePath} uses variant "${file.variant}", which is not declared under \`variants\` in docs.yml.`
            );
        }
        if (await doesPathExist(file.absolutePath)) {
            errors.push(
                `Page ${sourceRelativeFilePath} with variant "${file.variant}" is registered as ${relativeFilePath}, but a file already exists at that path. Rename the file or the variant.`
            );
        }
        result[relativeFilePath] = {
            variant: file.variant,
            sourceRelativeFilePath
        };
    }
    if (errors.length > 0) {
        context.failAndThrow(errors.join("\n"), undefined, { code: CliError.Code.ConfigError });
    }
    return result;
}

/**
 * Returns every markdown file on disk referenced by the navigation (deduplicated).
 */
export function getAllPages({
    landingPage,
    navigation
}: {
    landingPage: docsYml.DocsNavigationItem.Page | undefined;
    navigation: docsYml.DocsNavigationConfiguration;
}): AbsoluteFilePath[] {
    return Array.from(new Set(getAllPageFiles({ landingPage, navigation }).map((file) => file.sourceAbsolutePath)));
}

/**
 * Returns every page to register, including one entry per content variant of a shared markdown file.
 */
export function getAllPageFiles({
    landingPage,
    navigation
}: {
    landingPage: docsYml.DocsNavigationItem.Page | undefined;
    navigation: docsYml.DocsNavigationConfiguration;
}): PageFile[] {
    return compact([
        landingPage != null ? pageToPageFile(landingPage) : undefined,
        ...getAllPagesFromNavigationConfig(navigation)
    ]);
}

function getAllPagesFromNavigationConfig(navigation: docsYml.DocsNavigationConfiguration): PageFile[] {
    switch (navigation.type) {
        case "tabbed":
            return navigation.items.flatMap((tab) => {
                if (tab.child.type === "layout") {
                    return tab.child.layout.flatMap((item) => {
                        return getAllPagesFromNavigationItem({
                            item
                        });
                    });
                } else if (tab.child.type === "variants") {
                    return tab.child.variants.flatMap((variant) =>
                        variant.layout.flatMap((item) => {
                            return getAllPagesFromNavigationItem({
                                item
                            });
                        })
                    );
                } else if (tab.child.type === "changelog") {
                    return tab.child.changelog.map((absolutePath) => toPageFile(absolutePath));
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
                return getAllPageFiles({
                    landingPage: version.landingPage,
                    navigation: version.navigation
                });
            });
        case "productgroup":
            return navigation.products.flatMap((product) => {
                if (product.type === "external") {
                    return [];
                }

                return getAllPageFiles({
                    landingPage: product.landingPage,
                    navigation: product.navigation
                });
            });
        default:
            assertNever(navigation);
    }
}

export function getAllPagesFromNavigationItem({ item }: { item: docsYml.DocsNavigationItem }): PageFile[] {
    switch (item.type) {
        case "apiSection":
            return compact([
                item.overviewAbsolutePath != null ? toPageFile(item.overviewAbsolutePath) : undefined,
                ...item.navigation.flatMap((apiNavigation) =>
                    getAllPagesFromApiReferenceLayoutItem({ item: apiNavigation })
                )
            ]);
        case "link":
            return [];
        case "page":
            return [pageToPageFile(item)];
        case "section":
            return compact([
                item.overviewAbsolutePath != null
                    ? toPageFile(item.overviewAbsolutePath, item.overviewVariant)
                    : undefined,
                ...item.contents.flatMap((subItem) => {
                    return getAllPagesFromNavigationItem({ item: subItem });
                })
            ]);
        case "changelog":
            return item.changelog.map((absolutePath) => toPageFile(absolutePath));
        case "librarySection":
            // Library docs pages are generated locally, but referenced via _navigation.yml
            return [];
        default:
            assertNever(item);
    }
}

function getAllPagesFromApiReferenceLayoutItem({ item }: { item: docsYml.ParsedApiReferenceLayoutItem }): PageFile[] {
    if (item.type === "page") {
        return [pageToPageFile(item)];
    } else if (item.type === "package" || item.type === "section") {
        return compact([
            item.overviewAbsolutePath != null ? toPageFile(item.overviewAbsolutePath) : undefined,
            ...item.contents.flatMap((subItem) => {
                return getAllPagesFromApiReferenceLayoutItem({ item: subItem });
            })
        ]);
    }
    return [];
}
