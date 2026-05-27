import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

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

export interface FrontmatterMetadata {
    position: number | undefined;
    title: string | undefined;
    hidden: boolean | undefined;
    noindex: boolean | undefined;
}

/**
 * Extracts position, title, hidden, and noindex fields from markdown frontmatter in a single read.
 * Reads the file once and parses all navigation-relevant frontmatter fields together.
 */
export async function getFrontmatterMetadata({
    absolutePath,
    readFileFn = (path, encoding) => readFile(path, encoding)
}: {
    absolutePath: AbsoluteFilePath;
    readFileFn?: ReadFileFn;
}): Promise<FrontmatterMetadata> {
    try {
        const content = await readFileFn(absolutePath, "utf-8");
        const { data } = grayMatter(content);

        // Parse position
        let position: number | undefined;
        if (data.position != null) {
            const parsed = typeof data.position === "string" ? parseFloat(data.position) : data.position;
            if (typeof parsed === "number" && Number.isFinite(parsed)) {
                position = parsed;
            }
        }

        // Parse title
        const title = typeof data.title === "string" && data.title.trim().length > 0 ? data.title.trim() : undefined;

        // Parse hidden
        const hidden = data.hidden === true ? true : undefined;

        // Parse noindex
        const noindex = data.noindex === true ? true : undefined;

        return { position, title, hidden, noindex };
    } catch {
        return { position: undefined, title: undefined, hidden: undefined, noindex: undefined };
    }
}

function resolveTitle({
    frontmatterTitle,
    useFrontmatterTitles,
    fallbackName
}: {
    frontmatterTitle: string | undefined;
    useFrontmatterTitles: boolean;
    fallbackName: string;
}): string {
    if (useFrontmatterTitles && frontmatterTitle != null) {
        return frontmatterTitle;
    }
    return nameToTitle({ name: fallbackName });
}

interface NavigationItemWithMeta {
    item: docsYml.DocsNavigationItem;
    title: string;
    position?: number;
}

export async function buildNavigationForDirectory({
    directoryPath,
    titleSource,
    getDir = getDirectoryContents,
    readFileFn = (path, encoding) => readFile(path, encoding)
}: {
    directoryPath: AbsoluteFilePath;
    titleSource?: docsYml.RawSchemas.TitleSource;
    getDir?: typeof getDirectoryContents;
    readFileFn?: ReadFileFn;
}): Promise<docsYml.DocsNavigationItem[]> {
    const contents = await getDir(directoryPath);
    const useFrontmatterTitles = titleSource === "frontmatter";

    const markdownFiles = contents.filter(
        (item) =>
            item.type === "file" &&
            !item.name.startsWith("_") &&
            (item.name.toLowerCase().endsWith(".md") || item.name.toLowerCase().endsWith(".mdx"))
    );
    const subdirectories = contents.filter((item) => item.type === "directory" && !item.name.startsWith("_"));

    const pageMetadata = await Promise.all(
        markdownFiles.map((file) => getFrontmatterMetadata({ absolutePath: file.absolutePath, readFileFn }))
    );

    const pages: docsYml.DocsNavigationItem[] = markdownFiles.map((file, index) => {
        const metadata = pageMetadata[index];
        return {
            type: "page" as const,
            title: resolveTitle({ frontmatterTitle: metadata?.title, useFrontmatterTitles, fallbackName: file.name }),
            absolutePath: file.absolutePath,
            slug: nameToSlug({ name: file.name }),
            icon: undefined,
            hidden: metadata?.hidden,
            noindex: metadata?.noindex,
            viewers: undefined,
            orphaned: undefined,
            featureFlags: undefined,
            availability: undefined
        };
    });

    interface SectionWithPosition {
        section: docsYml.DocsNavigationItem;
        position: number | undefined;
    }

    // Build a set of subdirectory names (lowercased) for sibling-file matching.
    // When a markdown file shares its base name with a sibling directory
    // (e.g. adapters.mdx alongside adapters/), it becomes that section's
    // overview page instead of appearing as a separate page.
    const subdirectoryNames = new Set(subdirectories.map((dir) => dir.name.toLowerCase()));

    const siblingOverviewPages = new Map<string, docsYml.DocsNavigationItem.Page>();
    const remainingPages: { page: docsYml.DocsNavigationItem; metadata: FrontmatterMetadata }[] = [];
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const metadata = pageMetadata[i];
        if (page == null || metadata == null) {
            continue;
        }
        if (page.type === "page") {
            const baseName = page.slug;
            if (subdirectoryNames.has(baseName)) {
                siblingOverviewPages.set(baseName, page);
                continue;
            }
        }
        remainingPages.push({ page, metadata });
    }

    const sectionsWithPositions: SectionWithPosition[] = await Promise.all(
        subdirectories.map(async (dir) => {
            const subContents = await buildNavigationForDirectory({
                directoryPath: dir.absolutePath,
                titleSource,
                getDir,
                readFileFn
            });

            // Look for an index page inside the subdirectory first
            const indexPage = subContents.find(
                (item) =>
                    item.type === "page" &&
                    (item.slug === "index" ||
                        item.absolutePath.toLowerCase().endsWith("/index.mdx") ||
                        item.absolutePath.toLowerCase().endsWith("/index.md"))
            );

            // Fall back to a sibling markdown file with the same name as the directory
            const siblingPage = siblingOverviewPages.get(dir.name.toLowerCase());
            const overviewPage = indexPage ?? siblingPage;

            const filteredContents = indexPage ? subContents.filter((item) => item !== indexPage) : subContents;

            const overviewMetadata =
                overviewPage?.type === "page"
                    ? await getFrontmatterMetadata({ absolutePath: overviewPage.absolutePath, readFileFn })
                    : undefined;

            const sectionTitle = resolveTitle({
                frontmatterTitle: overviewMetadata?.title,
                useFrontmatterTitles,
                fallbackName: dir.name
            });

            return {
                section: {
                    type: "section" as const,
                    title: sectionTitle,
                    slug: nameToSlug({ name: dir.name }),
                    icon: undefined,
                    contents: filteredContents,
                    collapsed: undefined,
                    collapsible: undefined,
                    collapsedByDefault: undefined,
                    hidden: overviewMetadata?.hidden,
                    skipUrlSlug: false,
                    overviewAbsolutePath: overviewPage?.type === "page" ? overviewPage.absolutePath : undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined,
                    availability: undefined
                },
                position: overviewMetadata?.position
            };
        })
    );

    const itemsWithMeta: NavigationItemWithMeta[] = [
        ...remainingPages.map(({ page, metadata }) => ({
            item: page,
            title: page.type === "page" ? page.title : "",
            position: metadata?.position
        })),
        ...sectionsWithPositions.map((s) => ({
            item: s.section,
            title: s.section.type === "section" ? s.section.title : "",
            position: s.position
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
