import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";

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

export async function buildNavigationForDirectory({
    directoryPath,
    getDir = getDirectoryContents
}: {
    directoryPath: AbsoluteFilePath;
    getDir?: typeof getDirectoryContents;
}): Promise<docsYml.DocsNavigationItem[]> {
    const contents = await getDir(directoryPath);

    const markdownFiles = contents.filter(
        (item) => item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))
    );
    const subdirectories = contents.filter((item) => item.type === "directory");

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
                getDir
            });

            return {
                type: "section" as const,
                title: nameToTitle({ name: dir.name }),
                slug: nameToSlug({ name: dir.name }),
                icon: undefined,
                contents: subContents,
                collapsed: undefined,
                hidden: undefined,
                skipUrlSlug: false,
                overviewAbsolutePath: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined,
                availability: undefined
            };
        })
    );

    const allItems = [...pages, ...sections];
    allItems.sort((a, b) => {
        const aTitle = a.type === "page" || a.type === "section" ? a.title : "";
        const bTitle = b.type === "page" || b.type === "section" ? b.title : "";
        return aTitle.localeCompare(bTitle, undefined, { sensitivity: "base" });
    });

    return allItems;
}
