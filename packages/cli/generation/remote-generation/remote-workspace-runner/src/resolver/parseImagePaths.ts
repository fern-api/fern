import { AbsoluteFilePath, dirname, relative, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import grayMatter from "gray-matter";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";

interface AbsolutePathMetadata {
    absolutePathToMdx: AbsoluteFilePath;
    absolutePathToFernFolder: AbsoluteFilePath;
}

/**
 * Parse all images in the markdown. Since mdx filepath is a relative path from the root of the project,
 * we can use it to resolve the paths of the images they reference to.
 *
 * These resolved paths are also injected into the markdown, so that the images can be later replaced with fileIDs.
 */
export function parseImagePaths(
    markdown: string,
    metadata: AbsolutePathMetadata
): {
    filepaths: AbsoluteFilePath[];
    markdown: string;
} {
    const { content, data } = grayMatter(markdown);
    let replacedContent = content;

    const filepaths = new Set<AbsoluteFilePath>();

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
            const resolvedPath = resolvePath(src, metadata);
            if (src != null && resolvedPath != null) {
                filepaths.add(resolvedPath);
                node.url = resolvedPath;
                replaced = replaced.replace(src, resolvedPath);
            }
        }

        if (node.type === "html" || node.type === "text") {
            const srcRegex = /src={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = srcRegex.exec(node.value)) != null) {
                let pathToImage = trimAnchor(match[1]);
                const resolvedPath = resolvePath(pathToImage, metadata);
                if (pathToImage != null && resolvedPath != null) {
                    filepaths.add(resolvedPath);
                    replaced = replaced.replaceAll(pathToImage, resolvedPath);
                }
            }
        }

        if (replaced === original) {
            return;
        }

        replacedContent =
            replacedContent.slice(0, start + offset) + replaced + replacedContent.slice(start + offset + length);
        offset += replaced.length - length;
    });

    return { filepaths: [...filepaths], markdown: grayMatter.stringify(replacedContent, data) };
}

function resolvePath(
    pathToImage: string | undefined,
    { absolutePathToFernFolder, absolutePathToMdx }: AbsolutePathMetadata
): AbsoluteFilePath | undefined {
    if (pathToImage == null || isExternalUrl(pathToImage)) {
        return undefined;
    }

    const filepath = resolve(
        pathToImage.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMdx),
        RelativeFilePath.of(pathToImage.replace(/^\//, ""))
    );

    // if (doesPathExistSync(filepath)) {
    //     return filepath;
    // }

    return filepath;
}

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//.test(url);
}

/**
 * This step should run after the images have been uploaded. It replaces the image paths in the markdown with the fileIDs.
 * In the frontend, the fileIDs are then used to securely fetch the images.
 */
export function replaceImagePathsAndUrls(
    markdown: string,
    fileIdsMap: Map<AbsoluteFilePath, string>,
    markdownFilesToPathName: Map<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata,
    context: TaskContext
): string {
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
            const src = trimAnchor(node.url);
            if (src != null) {
                const fileId = fileIdsMap.get(AbsoluteFilePath.of(src));
                if (fileId != null) {
                    replaced = replaced.replace(src, `file:${fileId}`);
                }
            }
        }

        if (node.type === "html" || node.type === "text") {
            const srcRegex = /src={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = srcRegex.exec(node.value)) != null) {
                const pathToImage = trimAnchor(match[1]);
                if (pathToImage != null) {
                    const fileId = fileIdsMap.get(AbsoluteFilePath.of(pathToImage));
                    if (fileId != null) {
                        replaced = replaced.replaceAll(pathToImage, `file:${fileId}`);
                    }
                }
            }
        }

        if (node.type === "link") {
            const href = trimAnchor(node.url);
            if (href != null && (href.endsWith(".md") || href.endsWith(".mdx"))) {
                const absoluteFilePath = resolvePath(href, metadata);
                if (absoluteFilePath != null) {
                    const pathName = markdownFilesToPathName.get(absoluteFilePath);
                    if (pathName != null) {
                        replaced = replaced.replace(href, pathName);
                    } else {
                        context.logger.error(
                            `${relative(
                                metadata.absolutePathToFernFolder,
                                absoluteFilePath
                            )} has no slug defined but is referenced by ${relative(
                                metadata.absolutePathToFernFolder,
                                metadata.absolutePathToMdx
                            )}`
                        );
                    }
                }
            }
        }

        if (node.type === "html" || node.type === "text") {
            const hrefRegex = /href={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = hrefRegex.exec(node.value)) != null) {
                const href = trimAnchor(match[1]);
                if (href != null && (href.endsWith(".md") || href.endsWith(".mdx"))) {
                    const absoluteFilePath = resolvePath(href, metadata);
                    if (absoluteFilePath != null) {
                        const pathName = markdownFilesToPathName.get(absoluteFilePath);
                        if (pathName != null) {
                            replaced = replaced.replaceAll(href, pathName);
                        } else {
                            context.logger.error(
                                `${relative(
                                    metadata.absolutePathToFernFolder,
                                    absoluteFilePath
                                )} has no slug defined but is referenced by ${relative(
                                    metadata.absolutePathToFernFolder,
                                    metadata.absolutePathToMdx
                                )}`
                            );
                        }
                    }
                }
            }
        }

        if (replaced === original) {
            return;
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

function trimAnchor(text: unknown): string | undefined {
    if (typeof text !== "string") {
        return undefined;
    }
    return text.replace(/#.*$/, "");
}
