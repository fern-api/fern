import grayMatter from "gray-matter";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdx } from "micromark-extension-mdx";
import { visit } from "unist-util-visit";
import { z } from "zod";

import { AbsoluteFilePath, RelativeFilePath, dirname, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";

import { parseMarkdownToTree } from "./parseMarkdownToTree";

interface AbsolutePathMetadata {
    absolutePathToMdx: AbsoluteFilePath;
    absolutePathToFernFolder: AbsoluteFilePath;
}

const STR_SEGMENT = "['\"]([^'\"]+)['\"]";
const STR_REGEX = new RegExp(`^${STR_SEGMENT}$`);
const SRC_REGEX = new RegExp(`src={?${STR_SEGMENT}(?! \\+)}?`, "g");

const MEDIA_NODE_NAMES = ["img", "video", "audio", "source", "embed"];

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
    // Don't remove {}! https://github.com/jonschlinkert/gray-matter/issues/43#issuecomment-318258919
    const { content, data } = grayMatter(markdown, {});
    let replacedContent = content;

    const filepaths = new Set<AbsoluteFilePath>();

    function mapImage(image: string | undefined) {
        const resolvedPath = resolvePath(image, metadata);
        if (resolvedPath != null) {
            filepaths.add(resolvedPath);
            return resolvedPath;
        }
        return;
    }

    visitFrontmatterImages(data, ["image", "og:image", "og:logo", "twitter:image"], mapImage);
    replaceFrontmatterImagesforLogo(data, mapImage);

    const tree = parseMarkdownToTree(content);

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

        if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
            if (node.name && MEDIA_NODE_NAMES.includes(node.name)) {
                const srcAttr = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "src");

                if (srcAttr?.value) {
                    let srcValue = srcAttr.value;
                    if (typeof srcValue !== "string") {
                        const match = srcValue.value.match(STR_REGEX);
                        if (match?.[1]) {
                            srcValue = match[1];
                        }
                    }

                    const pathToImage = trimAnchor(srcValue);
                    const resolvedPath = resolvePath(pathToImage, metadata);
                    if (pathToImage != null && resolvedPath != null) {
                        filepaths.add(resolvedPath);
                        node.attributes = node.attributes.map((attr) => {
                            if (attr.type === "mdxJsxAttribute" && attr.name === "src") {
                                return { ...attr, value: resolvedPath };
                            }
                            return attr;
                        });
                        replaced = replaced.replace(pathToImage, resolvedPath);
                    }
                }
            } else {
                node.attributes.forEach((attr) => {
                    if (attr.type === "mdxJsxAttribute" && attr.value && typeof attr.value !== "string") {
                        const match = SRC_REGEX.exec(attr.value.value);
                        if (match?.[1]) {
                            const pathToImage = trimAnchor(match[1]);
                            const resolvedPath = resolvePath(pathToImage, metadata);
                            if (pathToImage != null && resolvedPath != null) {
                                filepaths.add(resolvedPath);
                                attr.value.value = resolvedPath;
                                replaced = replaced.replace(pathToImage, resolvedPath);
                            }
                        }
                    }
                });
            }
        }

        if (node.type === "html" || node.type === "text" || node.type === "mdxTextExpression") {
            const isInlineCode = /^`[^`]*`$/.test(node.value);
            if (!isInlineCode) {
                let match;
                while ((match = SRC_REGEX.exec(node.value)) != null) {
                    const pathToImage = trimAnchor(match[1]);
                    const resolvedPath = resolvePath(pathToImage, metadata);
                    if (pathToImage != null && resolvedPath != null) {
                        filepaths.add(resolvedPath);
                        replaced = replaced.replaceAll(pathToImage, resolvedPath);
                    }
                }
            }
        }

        if (replaced === original && filepaths.size === 0) {
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
    if (pathToImage == null || isExternalUrl(pathToImage) || isDataUrl(pathToImage)) {
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

function isDataUrl(url: string): boolean {
    return url.startsWith("data:");
}

/**
 * This step should run after the images have been uploaded. It replaces the image paths in the markdown with the fileIDs.
 * In the frontend, the fileIDs are then used to securely fetch the images.
 */
export function replaceImagePathsAndUrls(
    markdown: string,
    fileIdsMap: ReadonlyMap<AbsoluteFilePath, string>,
    markdownFilesToPathName: ReadonlyMap<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata,
    context: TaskContext
): string {
    const { content, data } = grayMatter(markdown, {});
    let replacedContent = content;

    const tree = fromMarkdown(content, {
        extensions: [mdx()],
        mdastExtensions: [mdxFromMarkdown()]
    });

    let offset = 0;

    function mapImage(image: string | undefined) {
        if (image != null && !isExternalUrl(image) && !isDataUrl(image)) {
            try {
                const fileId = fileIdsMap.get(AbsoluteFilePath.of(image));
                if (fileId != null) {
                    return `file:${fileId}`;
                }
            } catch (e) {
                // do nothing
                return;
            }
        }
        return;
    }

    visitFrontmatterImages(data, ["image", "og:image", "og:logo", "twitter:image"], mapImage);
    replaceFrontmatterImagesforLogo(data, mapImage);

    visit(tree, (node) => {
        if (node.position == null) {
            return;
        }
        const { start, length } = getPosition(content, node.position);
        const original = replacedContent.slice(start + offset, start + offset + length);
        let replaced = original;

        function replaceSrc(src: string | undefined) {
            const imageSrc = mapImage(src);
            if (src && imageSrc) {
                replaced = replaced.replace(src, imageSrc);
            }
        }

        function replaceHref(href: string | undefined) {
            if (href == null) {
                return;
            }
            if (href.endsWith(".md") || href.endsWith(".mdx")) {
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

        if (node.type === "image") {
            const src = trimAnchor(node.url);
            replaceSrc(src);
        }

        if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
            if (node.name && MEDIA_NODE_NAMES.includes(node.name)) {
                const srcAttr = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "src");

                if (srcAttr?.value) {
                    let srcValue = srcAttr.value;
                    if (typeof srcValue !== "string") {
                        const match = srcValue.value.match(STR_REGEX);
                        if (match?.[1]) {
                            srcValue = match[1];
                        }
                    }

                    const pathToImage = trimAnchor(srcValue);
                    replaceSrc(pathToImage);
                }
            } else {
                node.attributes.forEach((attr) => {
                    if (attr.type === "mdxJsxAttribute" && attr.value && typeof attr.value !== "string") {
                        const match = SRC_REGEX.exec(attr.value.value);
                        if (match?.[1]) {
                            const pathToImage = trimAnchor(match[1]);
                            replaceSrc(pathToImage);
                        }
                    }
                });
            }
        }

        if (node.type === "html" || node.type === "text" || node.type === "mdxTextExpression") {
            const srcRegex = /src={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = srcRegex.exec(node.value)) != null) {
                const pathToImage = trimAnchor(match[1]);
                replaceSrc(pathToImage);
            }
        }

        if (node.type === "link") {
            replaceHref(trimAnchor(node.url));
        }

        if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
            if (node.name === "a") {
                const hrefAttr = node.attributes.find(
                    (attr) => attr.type === "mdxJsxAttribute" && attr.name === "href"
                );

                if (hrefAttr?.value) {
                    let href = hrefAttr.value;
                    if (typeof href !== "string") {
                        const match = href.value.match(STR_REGEX);
                        if (match?.[1]) {
                            href = match[1];
                        }
                    }
                    replaceHref(trimAnchor(href));
                }
            }
        }

        if (node.type === "html" || node.type === "text" || node.type === "mdxTextExpression") {
            const hrefRegex = /href={?['"]([^'"]+)['"](?! \+)}?/g;

            let match;
            while ((match = hrefRegex.exec(node.value)) != null) {
                const href = trimAnchor(match[1]);
                replaceHref(href);
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

function visitFrontmatterImages(
    data: Record<string, string | CjsFdrSdk.docs.v1.commons.FileIdOrUrl>,
    keys: string[],
    mapImage: (image: string | undefined) => string | undefined
) {
    for (const key of keys) {
        const value = data[key];
        if (value != null) {
            // realtime validation, this also assumes there can be other stuff in the object, but we only care about the valid keys
            if (typeof value === "object") {
                if (value.type === "fileId") {
                    data[key] = {
                        type: "fileId",
                        value: CjsFdrSdk.FileId(mapImage(value.value) ?? value.value)
                    };
                }
            } else if (typeof value === "string") {
                const mappedImage = mapImage(value);
                data[key] = mappedImage
                    ? {
                          type: "fileId",
                          value: CjsFdrSdk.FileId(mappedImage)
                      }
                    : {
                          type: "url",
                          value: CjsFdrSdk.Url(value)
                      };
            }
            // else do nothing
        }
    }
}

const LogoOverrideFrontmatterSchema = z.union([
    z.string(),
    z.object({
        light: z.string().optional(),
        dark: z.string().optional()
    })
]);

export function convertImageToFileIdOrUrl(
    value: string,
    mapImage: (image: string | undefined) => string | undefined
): CjsFdrSdk.docs.latest.FileIdOrUrl {
    const mappedImage = mapImage(value);
    return mappedImage
        ? {
              type: "fileId",
              value: CjsFdrSdk.FileId(mappedImage)
          }
        : {
              type: "url",
              value: CjsFdrSdk.Url(value)
          };
}

function replaceFrontmatterImagesforLogo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>,
    mapImage: (image: string | undefined) => string | undefined
) {
    const parsedValue = LogoOverrideFrontmatterSchema.safeParse(data.logo);
    if (!parsedValue.success) {
        return;
    }
    const parsedFrontmatterLogo = parsedValue.data;

    if (typeof parsedFrontmatterLogo === "string") {
        data.logo = convertImageToFileIdOrUrl(parsedFrontmatterLogo, mapImage);
    } else {
        if (parsedFrontmatterLogo.light != null) {
            data.logo.light = convertImageToFileIdOrUrl(parsedFrontmatterLogo.light, mapImage);
        }
        if (parsedFrontmatterLogo.dark != null) {
            data.logo.dark = convertImageToFileIdOrUrl(parsedFrontmatterLogo.dark, mapImage);
        }
    }
}
