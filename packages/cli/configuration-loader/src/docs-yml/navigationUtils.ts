import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";
import path from "path";

export function nameToSlug({ name }: { name: string }): string {
    return name
        .replace(/\.(md|mdx)$/i, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

export function nameToTitle({ name }: { name: string }): string {
    return name
        .replace(/\.(md|mdx)$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

type ReadFileFn = (path: AbsoluteFilePath, encoding: BufferEncoding) => Promise<string>;

/**
 * Extracts the position field from markdown frontmatter.
 * Returns a finite number if position is valid, undefined otherwise.
 * Accepts numeric values and numeric strings, treating invalid values as undefined.
 */
export async function getFrontmatterPosition({
    absolutePath,
    readFileFn = (path, encoding) => readFile(path, encoding)
}: {
    absolutePath: AbsoluteFilePath;
    readFileFn?: ReadFileFn;
}): Promise<number | undefined> {
    try {
        const content = await readFileFn(absolutePath, "utf-8");
        const { data } = grayMatter(content);

        if (data.position == null) {
            return undefined;
        }

        const position = typeof data.position === "string" ? parseFloat(data.position) : data.position;

        if (typeof position === "number" && Number.isFinite(position)) {
            return position;
        }

        return undefined;
    } catch {
        return undefined;
    }
}

interface NavigationItemWithMeta {
    item: docsYml.DocsNavigationItem;
    title: string;
    position?: number;
}

export async function buildNavigationForDirectory({
    directoryPath,
    getDir = getDirectoryContents,
    readFileFn = (path, encoding) => readFile(path, encoding)
}: {
    directoryPath: AbsoluteFilePath;
    getDir?: typeof getDirectoryContents;
    readFileFn?: ReadFileFn;
}): Promise<docsYml.DocsNavigationItem[]> {
    const contents = await getDir(directoryPath);

    const markdownFiles = contents.filter(
        (item) => item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))
    );
    const subdirectories = contents.filter((item) => item.type === "directory");

    const pagePositions = await Promise.all(
        markdownFiles.map((file) => getFrontmatterPosition({ absolutePath: file.absolutePath, readFileFn }))
    );

    const pages: docsYml.DocsNavigationItem[] = markdownFiles.map((file) => {
        return {
            type: "page" as const,
            title: nameToTitle({ name: file.name }),
            absolutePath: file.absolutePath,
            slug: nameToSlug({ name: file.name }),
            icon: undefined,
            hidden: undefined,
            noindex: undefined,
            viewers: undefined,
            orphaned: undefined,
            featureFlags: undefined,
            availability: undefined
        };
    });

    const sections: docsYml.DocsNavigationItem[] = await Promise.all(
        subdirectories.map(async (dir) => {
            const subContents = await buildNavigationForDirectory({
                directoryPath: dir.absolutePath,
                getDir,
                readFileFn
            });

            const folderSlug = nameToSlug({ name: dir.name });
            const matchingPageIndex = subContents.findIndex((item) => {
                if (item.type === "page") {
                    const pageSlug = nameToSlug({ name: path.basename(item.absolutePath) });
                    return pageSlug === folderSlug;
                }
                return false;
            });

            let overviewAbsolutePath: AbsoluteFilePath | undefined = undefined;
            let filteredContents = subContents;

            if (matchingPageIndex !== -1) {
                const matchingPage = subContents[matchingPageIndex];
                if (matchingPage != null && matchingPage.type === "page") {
                    overviewAbsolutePath = matchingPage.absolutePath;
                    filteredContents = subContents.filter((_, index) => index !== matchingPageIndex);
                }
            }

            return {
                type: "section" as const,
                title: nameToTitle({ name: dir.name }),
                slug: nameToSlug({ name: dir.name }),
                icon: undefined,
                contents: filteredContents,
                collapsed: undefined,
                hidden: undefined,
                skipUrlSlug: false,
                overviewAbsolutePath,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined,
                availability: undefined
            };
        })
    );

    const itemsWithMeta: NavigationItemWithMeta[] = [
        ...pages.map((page, index) => ({
            item: page,
            title: page.type === "page" ? page.title : "",
            position: pagePositions[index]
        })),
        ...sections.map((section) => ({
            item: section,
            title: section.type === "section" ? section.title : "",
            position: undefined
        }))
    ];

    itemsWithMeta.sort((a, b) => {
        const aHasPosition = typeof a.position === "number";
        const bHasPosition = typeof b.position === "number";

        if (aHasPosition && !bHasPosition) {
            return -1;
        }
        if (!aHasPosition && bHasPosition) {
            return 1;
        }

        if (typeof a.position === "number" && typeof b.position === "number") {
            const positionDiff = a.position - b.position;
            if (positionDiff !== 0) {
                return positionDiff;
            }
            return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        }

        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    });

    return itemsWithMeta.map((meta) => meta.item);
}
