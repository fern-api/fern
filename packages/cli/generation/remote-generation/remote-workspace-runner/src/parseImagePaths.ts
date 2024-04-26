import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import grayMatter from "gray-matter";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";

/**
 * Parse all images in the markdown. Since mdx filepath is a relative path from the root of the project,
 * we can use it to resolve the paths of the images they reference to.
 *
 * These resolved paths are also injected into the markdown, so that the images can be later replaced with fileIDs.
 */
export function parseImagePaths(
    pathToMdx: RelativeFilePath,
    markdown: string
): {
    filepaths: RelativeFilePath[];
    markdown: string;
} {
    const { content, data } = grayMatter(markdown);
    let replacedContent = content;

    const filepaths = new Set<RelativeFilePath>();

    function resolvePath(pathToImage: string): RelativeFilePath | undefined {
        if (isExternalUrl(pathToImage)) {
            return undefined;
        }

        if (pathToImage.startsWith("/")) {
            return RelativeFilePath.of(pathToImage.replace(/^\//, ""));
        }

        return join(dirname(pathToMdx), RelativeFilePath.of(pathToImage));
    }

    const tree = fromMarkdown(content);

    let offset = 0;

    visit(tree, (node) => {
        if (node.position == null) {
            return;
        }
        const { start, length } = getPosition(content, node.position);
        const original = replacedContent.slice(start + offset, start + offset + length);
        let replaced = original;
        if (node.type === "image") {
            const src = trimAnchor(node.url);
            if (typeof src === "string") {
                const resolvedPath = resolvePath(src);
                if (resolvedPath == null) {
                    return;
                }
                filepaths.add(resolvedPath);
                node.url = resolvedPath;
                replaced = replaced.replace(src, resolvedPath);
            }
        }

        if (node.type === "html" || node.type === "text") {
            const srcRegex = /src={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = srcRegex.exec(node.value)) != null) {
                const matchedSnippet = match[0];
                let pathToImage = match[1];
                if (matchedSnippet != null && pathToImage != null) {
                    pathToImage = trimAnchor(pathToImage);
                    const resolvedPath = resolvePath(pathToImage);
                    if (resolvedPath == null) {
                        return;
                    }
                    filepaths.add(resolvedPath);
                    replaced = replaced.replaceAll(pathToImage, resolvedPath);
                }
            }
        }

        replacedContent =
            replacedContent.slice(0, start + offset) + replaced + replacedContent.slice(start + offset + length);
        offset += replaced.length - length;
    });

    return { filepaths: [...filepaths], markdown: grayMatter.stringify(replacedContent, data) };
}

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//.test(url);
}

/**
 * This step should run after the images have been uploaded. It replaces the image paths in the markdown with the fileIDs.
 * In the frontend, the fileIDs are then used to securely fetch the images.
 */
export function replaceImagePaths(markdown: string, fileIdsMap: Map<RelativeFilePath, string>): string {
    const { content, data } = grayMatter(markdown);
    let replacedContent = content;

    const tree = fromMarkdown(content);

    let offset = 0;

    visit(tree, (node) => {
        if (node.position == null) {
            return;
        }
        const { start, length } = getPosition(content, node.position);
        const original = replacedContent.slice(start + offset, start + offset + length);
        let replaced = original;
        if (node.type === "image") {
            const src = node.url as string;
            if (typeof src === "string") {
                const fileId = fileIdsMap.get(RelativeFilePath.of(src));
                if (fileId != null) {
                    replaced = replaced.replace(src, `file:${fileId}`);
                }
            }
        }

        if (node.type === "html" || node.type === "text") {
            const srcRegex = /src={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = srcRegex.exec(node.value)) != null) {
                const matchedSnippet = match[0];
                let pathToImage = match[1];
                if (matchedSnippet != null && pathToImage != null) {
                    pathToImage = trimAnchor(pathToImage);
                    const fileId = fileIdsMap.get(RelativeFilePath.of(pathToImage));
                    if (fileId != null) {
                        replaced = replaced.replaceAll(pathToImage, `file:${fileId}`);
                    }
                }
            }
        }

        replacedContent =
            replacedContent.slice(0, start + offset) + replaced + replacedContent.slice(start + offset + length);
        offset += replaced.length - length;
    });

    return grayMatter.stringify(replacedContent, data);
}

function getPosition(
    markdown: string,
    position: { start: { line: number; column: number }; end: { line: number; column: number } }
) {
    const lines = markdown.split("\n");
    let start = position.start.column - 1;
    for (let i = 0; i < position.start.line - 1; i++) {
        const line = lines[i];
        if (line == null) {
            break;
        }
        start += line.length + 1;
    }

    let length = 0 - position.start.column + position.end.column;

    for (let i = position.start.line - 1; i < position.end.line - 1; i++) {
        const line = lines[i];
        if (line == null) {
            break;
        }
        length += line.length + 1;
    }

    return { start, length };
}

function trimAnchor(text: string) {
    return text.replace(/#.*$/, "");
}
