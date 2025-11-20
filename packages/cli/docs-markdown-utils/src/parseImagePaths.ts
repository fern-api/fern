import { FdrAPI as CjsFdrSdk, DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import type { Node as EstreeNode } from "estree";
import grayMatter from "gray-matter";
import { isAbsolute } from "path";
import { CONTINUE, visit } from "unist-util-visit";
import { z } from "zod";

import { extractAttributeValueLiteral, extractSingleLiteral } from "./extract-literals";
import { isMdxExpression, isMdxJsxAttribute, isMdxJsxElement, isMdxJsxExpressionAttribute } from "./is-mdx-element";
import { parseMarkdownToTree } from "./parseMarkdownToTree";
import { walkEstreeJsxAttributes } from "./walk-estree-jsx-attributes";

const LARGE_FILE_BYTES = parseInt(process.env.FERN_DOCS_LARGE_FILE_BYTES ?? "5000000", 10); // 5MB default
const LARGE_FILE_SKIP_ESTREE = process.env.FERN_DOCS_LARGE_FILE_SKIP_ESTREE !== "false"; // true by default

interface Edit {
    start: number;
    end: number;
    replacement: string;
}

interface AbsolutePathMetadata {
    absolutePathToMarkdownFile: AbsoluteFilePath;
    absolutePathToFernFolder: AbsoluteFilePath;
}

function precomputeLineStarts(content: string): number[] {
    const lineStarts: number[] = [0];
    for (let i = 0; i < content.length; i++) {
        if (content[i] === "\n") {
            lineStarts.push(i + 1);
        }
    }
    return lineStarts;
}

function getPositionUsingLineStarts(
    lineStarts: number[],
    position: { start: { line: number; column: number }; end: { line: number; column: number } }
): { start: number; length: number } {
    const startLine = position.start.line - 1;
    const endLine = position.end.line - 1;
    const lineStart = lineStarts[startLine];
    if (lineStart == null) {
        return { start: 0, length: 0 };
    }
    const start = lineStart + position.start.column - 1;
    let length = position.end.column - position.start.column;
    for (let i = startLine; i < endLine; i++) {
        const nextLineStart = lineStarts[i + 1];
        const currentLineStart = lineStarts[i];
        if (nextLineStart != null && currentLineStart != null) {
            length += nextLineStart - currentLineStart;
        }
    }
    return { start, length };
}

function applyEdits(content: string, edits: Edit[]): string {
    if (edits.length === 0) {
        return content;
    }
    edits.sort((a, b) => b.start - a.start);
    let result = content;
    for (const edit of edits) {
        result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
    }
    return result;
}

/**
 * Parse all images in the markdown. Since mdx filepath is a relative path from the root of the project,
 * we can use it to resolve the paths of the images they reference to.
 *
 * These resolved paths are also injected into the markdown, so that the images can be later replaced with fileIDs.
 */
export function parseImagePaths(
    markdown: string,
    metadata: AbsolutePathMetadata,
    context?: TaskContext
): {
    filepaths: AbsoluteFilePath[];
    markdown: string;
} {
    const { content, data } = grayMatter(markdown, {});
    const filepaths = new Set<AbsoluteFilePath>();

    function mapImage(image: string | undefined) {
        const resolvedPath = resolvePath(image, metadata);
        if (image && resolvedPath != null) {
            filepaths.add(resolvedPath);
            return resolvedPath;
        }
        return;
    }

    visitFrontmatterImages(data, ["image", "og:image", "og:logo", "twitter:image"], mapImage);
    replaceFrontmatterImagesforLogo(data, mapImage);

    const contentBytes = Buffer.byteLength(content, "utf8");
    const isLargeFile = contentBytes > LARGE_FILE_BYTES;
    const skipEstree = isLargeFile && LARGE_FILE_SKIP_ESTREE;

    if (skipEstree && context) {
        context.logger.debug(
            `Large file fast path: skipping dynamic expression analysis for ${metadata.absolutePathToMarkdownFile} (${(contentBytes / 1024 / 1024).toFixed(2)} MB)`
        );
    }

    const tree = parseMarkdownToTree(content);
    const lineStarts = precomputeLineStarts(content);
    const edits: Edit[] = [];

    const nodeTypeFilter = (node: unknown): boolean => {
        const n = node as { type?: string };
        return (
            n.type === "image" ||
            n.type === "link" ||
            n.type === "mdxJsxFlowElement" ||
            n.type === "mdxJsxTextElement" ||
            n.type === "mdxFlowExpression" ||
            n.type === "mdxTextExpression"
        );
    };

    visit(tree, nodeTypeFilter, (node) => {
        if (node.position == null) {
            return;
        }
        const { start, length } = getPositionUsingLineStarts(lineStarts, node.position);
        const original = content.slice(start, start + length);
        let replaced = original;

        if (node.type === "image") {
            const src = trimAnchor(node.url);
            const resolvedPath = resolvePath(src, metadata);
            if (src != null && resolvedPath != null) {
                filepaths.add(resolvedPath);
                replaced = replaced.replaceAll(src, resolvedPath);
            }
        }

        function walkEstreeForSrc(estree: EstreeNode) {
            walkEstreeJsxAttributes(estree, {
                src: (attr) => {
                    const src = trimAnchor(extractSingleLiteral(attr.value));
                    const resolvedPath = resolvePath(src, metadata);
                    if (src && resolvedPath) {
                        filepaths.add(resolvedPath);
                        replaced = replaced.replaceAll(src, resolvedPath);
                    }
                    return;
                }
            });
        }

        if (isMdxJsxElement(node)) {
            const srcAttr = node.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "src");
            const src = trimAnchor(extractAttributeValueLiteral(srcAttr?.value));

            if (srcAttr && src) {
                const resolvedPath = resolvePath(src, metadata);
                if (resolvedPath != null) {
                    filepaths.add(resolvedPath);
                    replaced = replaced.replaceAll(src, resolvedPath);
                }
            }

            if (!skipEstree) {
                node.attributes.forEach((attr) => {
                    if (
                        isMdxJsxAttribute(attr) &&
                        typeof attr.value !== "string" &&
                        attr.value != null &&
                        attr.value.data?.estree
                    ) {
                        walkEstreeForSrc(attr.value.data.estree);
                    } else if (isMdxJsxExpressionAttribute(attr) && attr.data?.estree) {
                        walkEstreeForSrc(attr.data.estree);
                    }
                });
            }
        }

        if (!skipEstree && isMdxExpression(node) && node.data?.estree) {
            walkEstreeForSrc(node.data.estree);
        }

        if (replaced !== original) {
            edits.push({ start, end: start + length, replacement: replaced });
        }

        return CONTINUE;
    });

    const replacedContent = applyEdits(content, edits);
    return { filepaths: [...filepaths], markdown: grayMatter.stringify(replacedContent, data) };
}

function resolvePath(
    pathToImage: string | undefined,
    { absolutePathToFernFolder, absolutePathToMarkdownFile }: AbsolutePathMetadata
): AbsoluteFilePath | undefined {
    if (pathToImage == null || isExternalUrl(pathToImage) || isDataUrl(pathToImage)) {
        return undefined;
    }

    const filepath = resolve(
        pathToImage.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile),
        RelativeFilePath.of(pathToImage.replace(/^\//, ""))
    );

    return filepath;
}

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//.test(url);
}

function isDataUrl(url: string): boolean {
    return url.startsWith("data:");
}

export type ReplacedHref =
    | { type: "replace"; slug: string; href: string }
    | { type: "missing-reference"; path: string; href: string };

export function getReplacedHref({
    href,
    metadata,
    markdownFilesToPathName
}: {
    href: string | undefined;
    metadata: AbsolutePathMetadata;
    markdownFilesToPathName: Record<AbsoluteFilePath, string>;
}): ReplacedHref | undefined {
    if (href == null) {
        return;
    }
    if (href.endsWith(".md") || href.endsWith(".mdx")) {
        const absoluteFilePath = resolvePath(href, metadata);
        if (absoluteFilePath != null) {
            const slug = markdownFilesToPathName[absoluteFilePath];
            if (slug != null) {
                const normalizeSlug = slug.startsWith("/") ? slug : "/" + slug;
                return { type: "replace", slug: normalizeSlug, href };
            } else {
                return { type: "missing-reference", path: absoluteFilePath, href };
            }
        }
    }
    return undefined;
}

/**
 * This step should run after the images have been uploaded. It replaces the image paths in the markdown with the fileIDs.
 * In the frontend, the fileIDs are then used to securely fetch the images.
 */
export function replaceImagePathsAndUrls(
    markdown: string,
    fileIdsMap: ReadonlyMap<AbsoluteFilePath, string>,
    markdownFilesToPathName: Record<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata,
    context: TaskContext
): string {
    const { content, data } = grayMatter(markdown, {});

    function mapImage(image: string | undefined) {
        if (image == null || isExternalUrl(image) || isDataUrl(image)) {
            return undefined;
        }

        if (isAbsolute(image)) {
            const absolutePath = AbsoluteFilePath.of(image);
            const fileId = fileIdsMap.get(absolutePath);
            return fileId ? `file:${fileId}` : undefined;
        }

        const resolvedPath = resolvePath(image, metadata);
        if (resolvedPath) {
            const fileId = fileIdsMap.get(resolvedPath);
            return fileId ? `file:${fileId}` : undefined;
        }

        return undefined;
    }

    visitFrontmatterImages(data, ["image", "og:image", "og:logo", "twitter:image"], mapImage);
    replaceFrontmatterImagesforLogo(data, mapImage);

    const contentBytes = Buffer.byteLength(content, "utf8");
    const isLargeFile = contentBytes > LARGE_FILE_BYTES;
    const skipEstree = isLargeFile && LARGE_FILE_SKIP_ESTREE;

    if (skipEstree) {
        context.logger.debug(
            `Large file fast path: skipping dynamic expression analysis for ${metadata.absolutePathToMarkdownFile} (${(contentBytes / 1024 / 1024).toFixed(2)} MB)`
        );
    }

    const tree = parseMarkdownToTree(content);
    const lineStarts = precomputeLineStarts(content);
    const edits: Edit[] = [];

    const nodeTypeFilter = (node: unknown): boolean => {
        const n = node as { type?: string };
        return (
            n.type === "image" ||
            n.type === "link" ||
            n.type === "mdxJsxFlowElement" ||
            n.type === "mdxJsxTextElement" ||
            n.type === "mdxFlowExpression" ||
            n.type === "mdxTextExpression"
        );
    };

    visit(tree, nodeTypeFilter, (node) => {
        if (node.position == null) {
            return;
        }
        const { start, length } = getPositionUsingLineStarts(lineStarts, node.position);
        const original = content.slice(start, start + length);
        let replaced = original;

        function replaceSrc(src: string | undefined) {
            const imageSrc = mapImage(src);
            if (src && imageSrc) {
                replaced = replaced.replace(src, imageSrc);
            }
        }

        function replaceHref(href: string | undefined) {
            const replacedHref = getReplacedHref({ href, markdownFilesToPathName, metadata });
            if (href != null && replacedHref != null && replacedHref.type === "replace") {
                replaced = replaced.replace(href, replacedHref.slug);
            }
        }

        function walkEstreeForSrcAndHref(estree: EstreeNode) {
            walkEstreeJsxAttributes(estree, {
                src: (attr) => replaceSrc(trimAnchor(extractSingleLiteral(attr.value))),
                href: (attr) => replaceHref(trimAnchor(extractSingleLiteral(attr.value)))
            });
        }

        if (node.type === "image") {
            const src = trimAnchor(node.url);
            replaceSrc(trimAnchor(src));
        }

        if (node.type === "link") {
            replaceHref(trimAnchor(node.url));
        }

        if (isMdxJsxElement(node)) {
            const srcAttr = node.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "src");
            replaceSrc(trimAnchor(extractAttributeValueLiteral(srcAttr?.value)));

            const hrefAttr = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "href");
            replaceHref(trimAnchor(extractAttributeValueLiteral(hrefAttr?.value)));

            if (!skipEstree) {
                node.attributes.forEach((attr) => {
                    if (
                        isMdxJsxAttribute(attr) &&
                        typeof attr.value !== "string" &&
                        attr.value != null &&
                        attr.value.data?.estree
                    ) {
                        walkEstreeForSrcAndHref(attr.value.data.estree);
                    } else if (isMdxJsxExpressionAttribute(attr) && attr.data?.estree) {
                        walkEstreeForSrcAndHref(attr.data.estree);
                    }
                });
            }
        }

        if (!skipEstree && isMdxExpression(node) && node.data?.estree) {
            walkEstreeForSrcAndHref(node.data.estree);
        }

        if (replaced !== original) {
            edits.push({ start, end: start + length, replacement: replaced });
        }

        return CONTINUE;
    });

    const replacedContent = applyEdits(content, edits);
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

export function trimAnchor(text: unknown): string | undefined {
    if (typeof text !== "string") {
        return undefined;
    }
    return text.replace(/#.*$/, "");
}

function visitFrontmatterImages(
    data: Record<string, string | DocsV1Write.FileIdOrUrl>,
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
): DocsV1Write.FileIdOrUrl {
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
