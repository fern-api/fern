import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
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

    const tree = fromMarkdown(markdown);

    visit(tree, "image", (node) => {
        const src = node.url as string;
        if (typeof src === "string") {
            const resolvedPath = resolvePath(src);
            if (resolvedPath == null) {
                return;
            }
            filepaths.add(resolvedPath);
            node.url = resolvedPath;
        }
    });

    visit(tree, "html", (node) => {
        const srcRegex = /src=['"]([^'"]+)['"]/g;

        let match;
        while ((match = srcRegex.exec(node.value)) != null) {
            const [original, pathToImage] = match;
            if (original != null && pathToImage != null) {
                const resolvedPath = resolvePath(pathToImage);
                if (resolvedPath == null) {
                    return;
                }
                filepaths.add(resolvedPath);
                node.value =
                    node.value.slice(0, match.index) +
                    original.replace(pathToImage, resolvedPath) +
                    node.value.slice(match.index + original.length);
            }
        }
    });

    visit(tree, "text", (node) => {
        const srcRegex = /src={['"]([^'"]+)['"]}/g;

        let match;
        while ((match = srcRegex.exec(node.value)) != null) {
            const [original, pathToImage] = match;
            if (original != null && pathToImage != null) {
                const resolvedPath = resolvePath(pathToImage);
                if (resolvedPath == null) {
                    return;
                }
                filepaths.add(resolvedPath);
                node.value =
                    node.value.slice(0, match.index) +
                    original.replace(pathToImage, resolvedPath) +
                    node.value.slice(match.index + original.length);
            }
        }
    });

    markdown = toMarkdown(tree);

    return { filepaths: [...filepaths], markdown };
}

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//.test(url);
}

/**
 * This step should run after the images have been uploaded. It replaces the image paths in the markdown with the fileIDs.
 * In the frontend, the fileIDs are then used to securely fetch the images.
 */
export function replaceImagePaths(markdown: string, fileIdsMap: Map<RelativeFilePath, string>): string {
    const tree = fromMarkdown(markdown);

    visit(tree, "image", (node) => {
        const src = node.url as RelativeFilePath;
        if (typeof src === "string") {
            const fileId = fileIdsMap.get(src);
            if (fileId != null) {
                node.url = fileId;
            }
        }
    });

    visit(tree, "html", (node) => {
        const srcRegex = /src=['"]([^'"]+)['"]/g;

        let match;
        while ((match = srcRegex.exec(node.value)) != null) {
            const [original, pathToImage] = match;
            if (original != null && pathToImage != null) {
                const fileId = fileIdsMap.get(RelativeFilePath.of(pathToImage));
                if (fileId != null) {
                    node.value =
                        node.value.slice(0, match.index) +
                        original.replace(pathToImage, fileId) +
                        node.value.slice(match.index + original.length);
                }
            }
        }
    });

    visit(tree, "text", (node) => {
        const srcRegex = /src={['"]([^'"]+)['"]}/g;

        let match;
        while ((match = srcRegex.exec(node.value)) != null) {
            const [original, pathToImage] = match;
            if (original != null && pathToImage != null) {
                const fileId = fileIdsMap.get(RelativeFilePath.of(pathToImage));
                if (fileId != null) {
                    node.value =
                        node.value.slice(0, match.index) +
                        original.replace(pathToImage, fileId) +
                        node.value.slice(match.index + original.length);
                }
            }
        }
    });

    return toMarkdown(tree);
}
