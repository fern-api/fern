import { DocsV1Read } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";

/**
 * Collects directories containing docs pages that are outside the fern folder.
 *
 * When users reference pages from outside the fern directory (e.g., `path: ../docs/page.mdx`),
 * the file watcher needs to also watch those external directories to detect changes.
 *
 * This function resolves all page IDs from the docs definition back to absolute paths
 * and returns the unique top-level directories that fall outside `absoluteFilePathToFern`.
 */
export function getExternalDocsWatchPaths(
    absoluteFilePathToFern: AbsoluteFilePath,
    docsDefinition: DocsV1Read.DocsDefinition
): AbsoluteFilePath[] {
    const fernDirWithSep = absoluteFilePathToFern + "/";
    const externalDirs = new Set<string>();

    for (const pageId of Object.keys(docsDefinition.pages)) {
        const absolutePath = resolve(absoluteFilePathToFern, pageId);
        // Check if the resolved path is outside the fern directory
        if (!absolutePath.startsWith(fernDirWithSep)) {
            const dir = dirname(absolutePath);
            externalDirs.add(dir);
        }
    }

    if (externalDirs.size === 0) {
        return [];
    }

    // Deduplicate: keep only the highest-level ancestor directories
    // so recursive watching covers all descendants without redundancy
    const sortedDirs = [...externalDirs].sort((a, b) => a.length - b.length);
    const rootDirs: string[] = [];

    for (const dir of sortedDirs) {
        const alreadyCovered = rootDirs.some((root) => dir.startsWith(root + "/") || dir === root);
        if (!alreadyCovered) {
            rootDirs.push(dir);
        }
    }

    return rootDirs.map(AbsoluteFilePath.of);
}
