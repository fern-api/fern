import { AbsoluteFilePath, dirname, RelativeFilePath, relative } from "@fern-api/fs-utils";

/**
 * Transforms import statements with '@/' prefix to relative paths.
 *
 * The '@/' prefix indicates an absolute path from the root of the fern folder.
 * This function converts such imports to relative paths based on the MDX file's location.
 *
 * Example:
 * - MDX file at: fern/docs/pages/guides/getting-started.mdx
 * - Import: import { Banner } from '@/components/Banner'
 * - Transformed: import { Banner } from '../../components/Banner'
 *
 * @param markdown - The markdown/MDX content to transform
 * @param absolutePathToFernFolder - The absolute path to the fern folder root
 * @param absolutePathToMarkdownFile - The absolute path to the current MDX file
 * @returns The transformed markdown with '@/' imports converted to relative paths
 */
export function transformAtPrefixImports({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMarkdownFile
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
}): string {
    // Match import statements with '@/' prefix
    // Handles various import formats:
    // - import { X } from '@/path'
    // - import X from '@/path'
    // - import * as X from '@/path'
    // - import '@/path'
    const importRegex = /(import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"])@\/([^'"]+)(['"])/g;

    const mdxDir = dirname(absolutePathToMarkdownFile);

    return markdown.replace(importRegex, (match, prefix, importPath, suffix) => {
        // Compute the absolute path of the imported file (from fern folder root)
        const absoluteImportPath = AbsoluteFilePath.of(`${absolutePathToFernFolder}/${importPath}`);

        // Compute the relative path from the MDX file's directory to the imported file
        let relativePath = relative(mdxDir, absoluteImportPath);

        // Ensure the path starts with './' or '../' for proper module resolution
        if (!relativePath.startsWith(".") && !relativePath.startsWith("/")) {
            relativePath = RelativeFilePath.of(`./${relativePath}`);
        }

        return `${prefix}${relativePath}${suffix}`;
    });
}
