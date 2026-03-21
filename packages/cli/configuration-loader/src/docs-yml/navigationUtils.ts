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

/**
 * Extracts the title field from markdown frontmatter.
 * Returns the title string if valid, undefined otherwise.
 */
export async function getFrontmatterTitle({
    absolutePath,
    readFileFn = (path, encoding) => readFile(path, encoding)
}: {
    absolutePath: AbsoluteFilePath;
    readFileFn?: ReadFileFn;
}): Promise<string | undefined> {
    try {
        const content = await readFileFn(absolutePath, "utf-8");
        const { data } = grayMatter(content);

        if (typeof data.title === "string" && data.title.trim().length > 0) {
            return data.title.trim();
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

    const [pagePositions, pageTitles] = await Promise.all([
        Promise.all(
            markdownFiles.map((file) => getFrontmatterPosition({ absolutePath: file.absolutePath, readFileFn }))
        ),
        useFrontmatterTitles
            ? Promise.all(
                  markdownFiles.map((file) => getFrontmatterTitle({ absolutePath: file.absolutePath, readFileFn }))
              )
            : Promise.resolve(markdownFiles.map(() => undefined))
    ]);

    const pages: docsYml.DocsNavigationItem[] = markdownFiles.map((file, index) => {
        return {
            type: "page" as const,
            title: pageTitles[index] ?? nameToTitle({ name: file.name }),
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

    interface SectionWithPosition {
        section: docsYml.DocsNavigationItem;
        position: number | undefined;
    }

    const sectionsWithPositions: SectionWithPosition[] = await Promise.all(
        subdirectories.map(async (dir) => {
            const subContents = await buildNavigationForDirectory({
                directoryPath: dir.absolutePath,
                titleSource,
                getDir,
                readFileFn
            });

            const indexPage = subContents.find(
                (item) =>
                    item.type === "page" &&
                    (item.slug === "index" ||
                        item.absolutePath.toLowerCase().endsWith("/index.mdx") ||
                        item.absolutePath.toLowerCase().endsWith("/index.md"))
            );

            const filteredContents = indexPage ? subContents.filter((item) => item !== indexPage) : subContents;

            // Only check frontmatter for section title when title-source is "frontmatter"
            const indexFileFrontmatterTitle = useFrontmatterTitles
                ? indexPage?.type === "page"
                    ? await getFrontmatterTitle({ absolutePath: indexPage.absolutePath, readFileFn })
                    : undefined
                : undefined;

            const sectionTitle = indexFileFrontmatterTitle ?? nameToTitle({ name: dir.name });

            const sectionPosition =
                indexPage?.type === "page"
                    ? await getFrontmatterPosition({ absolutePath: indexPage.absolutePath, readFileFn })
                    : undefined;

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
                    hidden: undefined,
                    skipUrlSlug: false,
                    overviewAbsolutePath: indexPage?.type === "page" ? indexPage.absolutePath : undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined,
                    availability: undefined
                },
                position: sectionPosition
            };
        })
    );

    const itemsWithMeta: NavigationItemWithMeta[] = [
        ...pages.map((page, index) => ({
            item: page,
            title: page.type === "page" ? page.title : "",
            position: pagePositions[index]
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
