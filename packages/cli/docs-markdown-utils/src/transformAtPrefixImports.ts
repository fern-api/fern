import { AbsoluteFilePath, dirname, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import grayMatter from "gray-matter";
import { CONTINUE, visit } from "unist-util-visit";
import { parseMarkdownBodyToTree } from "./parseMarkdownToTree.js";

/**
 * Match import statements with '@/' prefix
 * Handles various import formats:
 * - import { X } from '@/path'
 * - import X from '@/path'
 * - import * as X from '@/path'
 * - import '@/path'
 */
const IMPORT_REGEX = /(import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"])@\/([^'"]+)(['"])/g;

interface Range {
    start: number;
    end: number;
}

/**
 * Byte ranges of fenced code blocks and inline code spans. Import statements inside them are
 * documentation samples, not MDX imports, and must be rendered verbatim.
 */
function getCodeRanges(markdown: string, context: TaskContext | undefined): Range[] | undefined {
    try {
        // Node offsets are relative to the body, so frontmatter is stripped exactly once here and
        // the tree is built with `parseMarkdownBodyToTree`. Using `parseMarkdownToTree` would strip
        // it a second time and shift every offset out of sync with `bodyOffset`.
        const { content } = grayMatter(markdown);
        if (!markdown.endsWith(content)) {
            return undefined;
        }
        const bodyOffset = markdown.length - content.length;

        const tree = parseMarkdownBodyToTree(content);
        const ranges: Range[] = [];
        visit(tree, ["code", "inlineCode"], (node) => {
            const start = node.position?.start.offset;
            const end = node.position?.end.offset;
            if (start != null && end != null) {
                ranges.push({ start: start + bodyOffset, end: end + bodyOffset });
            }
            return CONTINUE;
        });
        return ranges;
    } catch (error) {
        context?.logger.debug(
            `Failed to locate code blocks while resolving "@/" imports; imports inside code samples may be rewritten: ${error instanceof Error ? error.message : String(error)}`
        );
        return undefined;
    }
}

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
 * @param context - Optional task context used to log when code blocks cannot be located
 * @returns The transformed markdown with '@/' imports converted to relative paths
 */
export function transformAtPrefixImports({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMarkdownFile,
    context
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
    context?: TaskContext;
}): string {
    if (!markdown.includes("@/")) {
        return markdown;
    }

    const mdxDir = dirname(absolutePathToMarkdownFile);
    const codeRanges = getCodeRanges(markdown, context);

    return markdown.replace(
        IMPORT_REGEX,
        (match, prefix: string, importPath: string, suffix: string, offset: number) => {
            if (codeRanges?.some((range) => offset >= range.start && offset < range.end)) {
                return match;
            }

            // Compute the absolute path of the imported file (from fern folder root)
            const absoluteImportPath = AbsoluteFilePath.of(`${absolutePathToFernFolder}/${importPath}`);

            // Compute the relative path from the MDX file's directory to the imported file
            let relativePath = relative(mdxDir, absoluteImportPath);

            // Ensure the path starts with './' or '../' for proper module resolution
            if (!relativePath.startsWith(".") && !relativePath.startsWith("/")) {
                relativePath = RelativeFilePath.of(`./${relativePath}`);
            }

            return `${prefix}${relativePath}${suffix}`;
        }
    );
}
