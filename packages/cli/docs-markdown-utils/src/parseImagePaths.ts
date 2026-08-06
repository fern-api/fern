import { FdrAPI as CjsFdrSdk, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    AbsoluteFilePath,
    convertToFernHostAbsoluteFilePath,
    dirname,
    RelativeFilePath,
    resolve
} from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import type { Node as EstreeNode } from "estree";
import grayMatter from "gray-matter";
import { isAbsolute } from "path";
import { CONTINUE, visit } from "unist-util-visit";
import { z } from "zod";
import { extractAttributeValueLiteral, extractSingleLiteral } from "./extract-literals.js";
import { isMdxExpression, isMdxJsxAttribute, isMdxJsxElement, isMdxJsxExpressionAttribute } from "./is-mdx-element.js";
import { parseMarkdownToTree } from "./parseMarkdownToTree.js";
import { walkEstreeJsxAttributes } from "./walk-estree-jsx-attributes.js";

/**
 * Re-quotes unquoted YAML values that have leading zeros after gray-matter's
 * stringify pass. js-yaml's dump correctly quotes values that are valid octal
 * (all digits 0-7, e.g. 001015) but leaves values with non-octal digits (8, 9)
 * unquoted (e.g. 001999). A downstream YAML 1.2 parser then interprets bare
 * 001999 as the integer 1999, losing the leading zeros.
 *
 * Only applies to the YAML frontmatter block (between --- delimiters), not the
 * markdown body, to avoid corrupting body content like code fences.
 */
function requoteLeadingZeroValues(doc: string): string {
    const openIdx = doc.indexOf("---\n");
    if (openIdx !== 0) {
        return doc;
    }
    const closeIdx = doc.indexOf("\n---\n", 4);
    if (closeIdx === -1) {
        return doc;
    }
    const frontmatter = doc.slice(0, closeIdx);
    const rest = doc.slice(closeIdx);
    const fixed = frontmatter.replace(/^(\s*[\w][\w-]*:\s+)(0\d+)\s*$/gm, '$1"$2"');
    return fixed + rest;
}

function getLargeFileBytes(): number {
    return parseInt(process.env.FERN_DOCS_LARGE_FILE_BYTES ?? "5000000", 10);
}

interface Edit {
    start: number;
    end: number;
    replacement: string;
}

interface ImageOccurrence {
    start: number;
    end: number;
    value: string;
    type: "markdown-image" | "markdown-link" | "jsx-src" | "jsx-href";
}

const JSX_TAG_NAME_START_REGEX = /[A-Za-z]/;

/**
 * A `<` only opens a tag when a tag name (or `/`) follows it and it isn't escaped. Comparisons in
 * prose such as `a < b`, `<=`, or `\<` are literal text: scanning them as tags makes the scan run
 * to the next `>` anywhere in the page, silently skipping every image and link in between.
 */
function isJsxTagStart(content: string, index: number): boolean {
    if (content[index] !== "<" || content[index - 1] === "\\") {
        return false;
    }
    const nameStart = content[index + 1] === "/" ? content[index + 2] : content[index + 1];
    return nameStart != null && JSX_TAG_NAME_START_REGEX.test(nameStart);
}

const BLANK_LINE_REGEX = /\n[ \t]*\r?\n/;
const CODE_FENCE_REGEX = /^[ \t]*(`{3,}|~{3,})/;

/**
 * Neither tags nor code spans span a blank line, so scans for them are bounded there. Without a
 * bound, an unterminated construct consumes the remainder of the page.
 */
function findScanLimit(content: string, start: number): number {
    const blankLine = BLANK_LINE_REGEX.exec(content.slice(start));
    return blankLine == null ? content.length : start + blankLine.index;
}

/**
 * Skips a fenced code block that opens at `start` (which must be a line start), returning the index
 * just past its closing fence. Returns null when no fence opens there or the fence is never closed,
 * so an unterminated fence cannot swallow the rest of the page.
 */
function findCodeFenceEnd(content: string, start: number): number | null {
    const lineEnd = content.indexOf("\n", start);
    const line = content.slice(start, lineEnd === -1 ? content.length : lineEnd);
    const fence = CODE_FENCE_REGEX.exec(line)?.[1];
    if (fence == null || lineEnd === -1) {
        return null;
    }

    const closingFenceRegex = new RegExp(`^[ \\t]*${fence[0] === "\`" ? "`" : "~"}{${fence.length},}[ \\t\\r]*$`);
    let i = lineEnd + 1;
    while (i <= content.length) {
        const nextLineEnd = content.indexOf("\n", i);
        const end = nextLineEnd === -1 ? content.length : nextLineEnd;
        if (closingFenceRegex.test(content.slice(i, end))) {
            return end;
        }
        if (nextLineEnd === -1) {
            return null;
        }
        i = nextLineEnd + 1;
    }
    return null;
}

/**
 * Skips an inline code span opening at `start`, returning the index just past its closing backtick
 * run. A code span closes only on a run of the same length and cannot contain a blank line; when
 * there is no such closing run the backticks are literal text and null is returned, so a stray
 * backtick cannot make the rest of the page look like code.
 */
function findInlineCodeEnd(content: string, start: number): number | null {
    const limit = findScanLimit(content, start);
    let runLength = 0;
    while (content[start + runLength] === "`") {
        runLength++;
    }

    let i = start + runLength;
    while (i < limit) {
        if (content[i] !== "`") {
            i++;
            continue;
        }
        let closingRunLength = 0;
        while (content[i + closingRunLength] === "`") {
            closingRunLength++;
        }
        if (closingRunLength === runLength) {
            return i + closingRunLength;
        }
        i += closingRunLength;
    }

    return null;
}

function streamingScanForImages(
    content: string,
    metadata: AbsolutePathMetadata
): { filepaths: Set<AbsoluteFilePath>; edits: Edit[] } {
    const filepaths = new Set<AbsoluteFilePath>();
    const edits: Edit[] = [];
    let i = 0;
    const len = content.length;

    while (i < len) {
        if (i === 0 || content[i - 1] === "\n") {
            const fenceEnd = findCodeFenceEnd(content, i);
            if (fenceEnd != null) {
                i = fenceEnd;
                continue;
            }
        }

        if (content[i] === "`" && content[i - 1] !== "\\") {
            const inlineCodeEnd = findInlineCodeEnd(content, i);
            if (inlineCodeEnd != null) {
                i = inlineCodeEnd;
                continue;
            }
            i++;
            continue;
        }

        if (content[i] === "!" && content[i + 1] === "[") {
            const result = parseMarkdownImage(content, i, metadata);
            if (result) {
                filepaths.add(result.filepath);
                edits.push(result.edit);
                i = result.nextIndex;
                continue;
            }
        } else if (content[i] === "[" && content[i - 1] !== "!") {
            const result = parseMarkdownLink(content, i, metadata);
            if (result) {
                i = result.nextIndex;
                continue;
            }
        } else if (content[i] === "<") {
            const result = parseJsxTag(content, i, metadata, filepaths, edits);
            if (result) {
                i = result.nextIndex;
                continue;
            }
        }

        i++;
    }

    return { filepaths, edits };
}

interface MarkdownImageParseResult {
    filepath: AbsoluteFilePath;
    edit: Edit;
    nextIndex: number;
    originalUrl: string;
    rawSrc: string;
    src: string;
}

function parseMarkdownImage(
    content: string,
    start: number,
    metadata: AbsolutePathMetadata
): MarkdownImageParseResult | null {
    let i = start + 2;
    const len = content.length;

    while (i < len && content[i] !== "]") {
        if (content[i] === "\\") {
            i += 2;
        } else {
            i++;
        }
    }

    if (i >= len || content[i] !== "]" || content[i + 1] !== "(") {
        return null;
    }

    i += 2;
    const urlStart = i;
    let parenDepth = 1;

    while (i < len && parenDepth > 0) {
        if (content[i] === "\\") {
            i += 2;
        } else if (content[i] === "(") {
            parenDepth++;
            i++;
        } else if (content[i] === ")") {
            parenDepth--;
            i++;
        } else {
            i++;
        }
    }

    if (parenDepth !== 0) {
        return null;
    }

    const urlEnd = i - 1;
    const url = content.slice(urlStart, urlEnd).trim();
    const rawSrc = trimAnchor(splitDestinationAndTitle(url));
    const src = rawSrc != null ? unescapeMarkdownUrl(rawSrc) : undefined;
    const resolvedPath = resolvePath(src, metadata);

    if (rawSrc && src && resolvedPath) {
        const replacement = url.replace(rawSrc, resolvedPath);
        return {
            filepath: resolvedPath,
            edit: { start: urlStart, end: urlEnd, replacement },
            nextIndex: i,
            originalUrl: url,
            rawSrc,
            src
        };
    }

    return null;
}

/**
 * Returns the leading destination of a markdown link/image, dropping the optional
 * title that may follow it: `path/img.png "My title"` -> `path/img.png`. The result
 * is always a prefix of `url`, so callers can recover the title by slicing.
 */
function splitDestinationAndTitle(url: string): string {
    if (url.startsWith("<")) {
        let i = 1;
        while (i < url.length && url[i] !== ">") {
            i += url[i] === "\\" ? 2 : 1;
        }
        // an unterminated `<` is not a delimited destination, so fall back to
        // splitting on whitespace below
        if (i < url.length) {
            return url.slice(0, i + 1);
        }
    }

    let i = 0;
    while (i < url.length && !/\s/.test(url[i] as string)) {
        i += url[i] === "\\" ? 2 : 1;
    }

    const title = url.slice(i).trim();
    if (title.length === 0) {
        return url.slice(0, i);
    }

    const isTitle =
        title.length >= 2 &&
        ((title.startsWith('"') && title.endsWith('"')) ||
            (title.startsWith("'") && title.endsWith("'")) ||
            (title.startsWith("(") && title.endsWith(")")));

    return isTitle ? url.slice(0, i) : url;
}

function parseMarkdownLink(
    content: string,
    start: number,
    metadata: AbsolutePathMetadata
): { nextIndex: number } | null {
    let i = start + 1;
    const len = content.length;

    while (i < len && content[i] !== "]") {
        if (content[i] === "\\") {
            i += 2;
        } else {
            i++;
        }
    }

    if (i >= len || content[i] !== "]" || content[i + 1] !== "(") {
        return null;
    }

    i += 2;
    let parenDepth = 1;

    while (i < len && parenDepth > 0) {
        if (content[i] === "\\") {
            i += 2;
        } else if (content[i] === "(") {
            parenDepth++;
            i++;
        } else if (content[i] === ")") {
            parenDepth--;
            i++;
        } else {
            i++;
        }
    }

    return { nextIndex: i };
}

function parseJsxTag(
    content: string,
    start: number,
    metadata: AbsolutePathMetadata,
    filepaths: Set<AbsoluteFilePath>,
    edits: Edit[]
): { nextIndex: number } | null {
    if (!isJsxTagStart(content, start)) {
        return null;
    }

    let i = start + 1;
    const limit = findScanLimit(content, start);
    // Buffered so a `<` that turns out not to be a tag leaves no edits behind.
    const tagFilepaths: AbsoluteFilePath[] = [];
    const tagEdits: Edit[] = [];

    while (i < limit && content[i] !== ">" && content[i] !== " " && content[i] !== "\n") {
        i++;
    }

    while (i < limit && content[i] !== ">") {
        while (i < limit && (content[i] === " " || content[i] === "\n")) {
            i++;
        }

        const attrStart = i;
        while (i < limit && content[i] !== "=" && content[i] !== ">" && content[i] !== " " && content[i] !== "\n") {
            i++;
        }

        const attrName = content.slice(attrStart, i).trim();

        if (content[i] === "=") {
            i++;
            while (i < limit && (content[i] === " " || content[i] === "\n")) {
                i++;
            }

            if (content[i] === '"' || content[i] === "'") {
                const quote = content[i];
                i++;
                const valueStart = i;
                while (i < limit && content[i] !== quote) {
                    if (content[i] === "\\") {
                        i += 2;
                    } else {
                        i++;
                    }
                }
                const value = content.slice(valueStart, i);
                i++;

                if (attrName === "src" || (attrName === "icon" && isLocalIconReference(value))) {
                    const src = trimAnchor(value);
                    const resolvedPath = resolvePath(src, metadata);
                    if (src && resolvedPath) {
                        tagFilepaths.push(resolvedPath);
                        tagEdits.push({ start: valueStart, end: valueStart + value.length, replacement: resolvedPath });
                    }
                }
            } else if (content[i] === "{") {
                i++;
                let braceDepth = 1;
                const exprStart = i;
                while (i < limit && braceDepth > 0) {
                    if (content[i] === "{") {
                        braceDepth++;
                    } else if (content[i] === "}") {
                        braceDepth--;
                    }
                    i++;
                }
                const expr = content.slice(exprStart, i - 1).trim();

                if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
                    const value = expr.slice(1, -1);
                    if (attrName === "src" || (attrName === "icon" && isLocalIconReference(value))) {
                        const src = trimAnchor(value);
                        const resolvedPath = resolvePath(src, metadata);
                        if (src && resolvedPath) {
                            tagFilepaths.push(resolvedPath);
                            tagEdits.push({
                                start: exprStart + 1,
                                end: exprStart + 1 + value.length,
                                replacement: resolvedPath
                            });
                        }
                    }
                } else if (expr.startsWith("`") && expr.endsWith("`") && !expr.includes("${")) {
                    const value = expr.slice(1, -1);
                    if (attrName === "src" || (attrName === "icon" && isLocalIconReference(value))) {
                        const src = trimAnchor(value);
                        const resolvedPath = resolvePath(src, metadata);
                        if (src && resolvedPath) {
                            tagFilepaths.push(resolvedPath);
                            tagEdits.push({
                                start: exprStart + 1,
                                end: exprStart + 1 + value.length,
                                replacement: resolvedPath
                            });
                        }
                    }
                }
            }
        }
    }

    if (i >= limit || content[i] !== ">") {
        return null;
    }
    i++;

    for (const filepath of tagFilepaths) {
        filepaths.add(filepath);
    }
    edits.push(...tagEdits);

    return { nextIndex: i };
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

    // Fast path: skip expensive parsing if content has no image-related patterns
    const hasImageIndicators = content.includes("![") || content.includes("src=") || content.includes("icon=");
    if (!hasImageIndicators) {
        return {
            filepaths: [...filepaths],
            markdown: requoteLeadingZeroValues(grayMatter.stringify(content, data))
        };
    }

    const contentBytes = Buffer.byteLength(content, "utf8");
    const isLargeFile = contentBytes > getLargeFileBytes();

    let replacedContent: string;

    if (isLargeFile) {
        if (context) {
            context.logger.debug(
                `Using streaming parser for large file: ${metadata.absolutePathToMarkdownFile} (${(contentBytes / 1024 / 1024).toFixed(2)} MB)`
            );
        }

        const streamingStart = performance.now();
        const { filepaths: streamingFilepaths, edits } = streamingScanForImages(content, metadata);
        const streamingTime = performance.now() - streamingStart;

        for (const filepath of streamingFilepaths) {
            filepaths.add(filepath);
        }

        replacedContent = applyEdits(content, edits);

        if (context) {
            context.logger.debug(
                `Streaming parse completed in ${streamingTime.toFixed(0)}ms: ${streamingFilepaths.size} images found, ${edits.length} edits applied`
            );
        }
    } else {
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
                    },
                    icon: (attr) => {
                        const icon = trimAnchor(extractSingleLiteral(attr.value));
                        if (isLocalIconReference(icon)) {
                            const resolvedPath = resolvePath(icon, metadata);
                            if (icon && resolvedPath) {
                                filepaths.add(resolvedPath);
                                replaced = replaced.replaceAll(icon, resolvedPath);
                            }
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

                const iconAttr = node.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "icon");
                const icon = trimAnchor(extractAttributeValueLiteral(iconAttr?.value));

                if (iconAttr && icon && isLocalIconReference(icon)) {
                    const resolvedPath = resolvePath(icon, metadata);
                    if (resolvedPath != null) {
                        filepaths.add(resolvedPath);
                        replaced = replaced.replaceAll(icon, resolvedPath);
                    }
                }

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

            if (isMdxExpression(node) && node.data?.estree) {
                walkEstreeForSrc(node.data.estree);
            }

            if (replaced !== original) {
                edits.push({ start, end: start + length, replacement: replaced });
            }

            return CONTINUE;
        });

        replacedContent = applyEdits(content, edits);
    }

    return {
        filepaths: [...filepaths],
        markdown: requoteLeadingZeroValues(grayMatter.stringify(replacedContent, data))
    };
}

function resolvePath(
    pathToImage: string | undefined,
    { absolutePathToFernFolder, absolutePathToMarkdownFile }: AbsolutePathMetadata
): AbsoluteFilePath | undefined {
    if (pathToImage == null || isExternalUrl(pathToImage) || isDataUrl(pathToImage)) {
        return undefined;
    }

    // Reject double-slash paths that aren't valid external URLs (e.g., //cdn.example.com/image.png)
    if (pathToImage.startsWith("//")) {
        throw new Error(
            `Invalid image path "${pathToImage}". ` +
                `Paths starting with "//" are reserved for external URLs (e.g., //cdn.example.com/image.png). ` +
                `For local files, use "/${pathToImage.slice(2)}" or a relative path instead.`
        );
    }

    const filepath = resolve(
        pathToImage.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile),
        RelativeFilePath.of(pathToImage.replace(/^\//, ""))
    );

    // Strip Windows drive letter (e.g., C:/) to produce platform-agnostic paths
    // that work consistently in markdown content and URL maps
    return convertToFernHostAbsoluteFilePath(filepath);
}

function isExternalUrl(url: string): boolean {
    // Match URLs that start with http:// or https://
    if (/^https?:\/\//.test(url)) {
        return true;
    }
    // Match protocol-relative URLs that have a valid host (e.g., //cdn.example.com/image.png)
    // A valid host must contain at least one dot (e.g., example.com) or be localhost
    // This prevents treating paths like //assets/images/logo.png as external URLs
    if (url.startsWith("//")) {
        const afterSlashes = url.slice(2);
        const hostPart = afterSlashes.split("/")[0] ?? "";
        // Check if it looks like a valid host (contains a dot or is localhost)
        if (hostPart.includes(".") || hostPart.startsWith("localhost")) {
            return true;
        }
    }
    return false;
}

export function isValidRelativeSlug(slug: string): boolean {
    return !isExternalUrl(slug);
}

function isWindowsAbsolutePath(path: string): boolean {
    // Match Windows drive letter paths like C:\, D:\, c:/, etc.
    return /^[a-zA-Z]:[\\/]/.test(path);
}

function isDataUrl(url: string): boolean {
    return url.startsWith("data:");
}

function isLocalIconReference(icon: string | undefined): boolean {
    if (icon == null || icon === "" || isExternalUrl(icon) || isDataUrl(icon)) {
        return false;
    }

    if (icon.includes("/")) {
        return true;
    }

    const lowerIcon = icon.toLowerCase();
    const imageExtensions = [".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".avif"];
    return imageExtensions.some((ext) => lowerIcon.endsWith(ext));
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

        if (isAbsolute(image) || isWindowsAbsolutePath(image)) {
            // Normalize to strip Windows drive letters (e.g., C:/) for consistent lookup
            const absolutePath = convertToFernHostAbsoluteFilePath(AbsoluteFilePath.of(image));
            const fileId = fileIdsMap.get(absolutePath);
            if (fileId) {
                return `file:${fileId}`;
            }

            // Fallback: try resolving as a root-relative path
            if (!isWindowsAbsolutePath(image)) {
                const resolvedFromRoot = resolvePath(image, metadata);
                if (resolvedFromRoot) {
                    const fallbackFileId = fileIdsMap.get(resolvedFromRoot);
                    if (fallbackFileId) {
                        return `file:${fallbackFileId}`;
                    }
                }
            }
            return undefined;
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

    // Use streaming scanner for all pages (O(n) character scan instead of full MDX parse).
    // Falls back to AST parse only for pages with complex JSX expressions like src={getUrl(...)}.
    const edits: Edit[] = [];
    let hasUnhandledExpressions = false;
    let i = 0;
    const len = content.length;

    while (i < len) {
        if (i === 0 || content[i - 1] === "\n") {
            const fenceEnd = findCodeFenceEnd(content, i);
            if (fenceEnd != null) {
                i = fenceEnd;
                continue;
            }
        }

        if (content[i] === "`" && content[i - 1] !== "\\") {
            const inlineCodeEnd = findInlineCodeEnd(content, i);
            if (inlineCodeEnd != null) {
                i = inlineCodeEnd;
                continue;
            }
            i++;
            continue;
        }

        if (content[i] === "!" && content[i + 1] === "[") {
            const result = parseMarkdownImage(content, i, metadata);
            if (result) {
                const imageSrc = mapImage(result.src);
                if (imageSrc) {
                    edits.push({
                        start: result.edit.start,
                        end: result.edit.end,
                        replacement: result.originalUrl.replace(result.rawSrc, imageSrc)
                    });
                }
                i = result.nextIndex;
                continue;
            }
        } else if (content[i] === "[" && content[i - 1] !== "!") {
            let j = i + 1;
            while (j < len && content[j] !== "]") {
                if (content[j] === "\\") {
                    j += 2;
                } else {
                    j++;
                }
            }
            if (j < len && content[j] === "]" && content[j + 1] === "(") {
                j += 2;
                const urlStart = j;
                let parenDepth = 1;
                while (j < len && parenDepth > 0) {
                    if (content[j] === "\\") {
                        j += 2;
                    } else if (content[j] === "(") {
                        parenDepth++;
                        j++;
                    } else if (content[j] === ")") {
                        parenDepth--;
                        j++;
                    } else {
                        j++;
                    }
                }
                if (parenDepth !== 0) {
                    i++;
                    continue;
                }
                const urlEnd = j - 1;
                const href = content.slice(urlStart, urlEnd).trim();
                const destination = splitDestinationAndTitle(href);
                const hrefTitle = href.slice(destination.length);
                const trimmedHref = trimAnchor(destination) ?? destination;
                const hrefAnchor = trimmedHref !== destination ? destination.slice(trimmedHref.length) : "";
                const replacedHref = getReplacedHref({
                    href: trimmedHref,
                    markdownFilesToPathName,
                    metadata
                });
                if (replacedHref && replacedHref.type === "replace") {
                    edits.push({
                        start: urlStart,
                        end: urlEnd,
                        replacement: replacedHref.slug + hrefAnchor + hrefTitle
                    });
                }
                i = j;
                continue;
            }
        } else if (isJsxTagStart(content, i)) {
            const limit = findScanLimit(content, i);
            // Edits collected while scanning are discarded unless the tag is properly terminated.
            const editsBeforeTag = edits.length;
            let j = i + 1;
            while (j < limit && content[j] !== ">" && content[j] !== " " && content[j] !== "\n") {
                j++;
            }
            while (j < limit && content[j] !== ">") {
                while (j < limit && (content[j] === " " || content[j] === "\n")) {
                    j++;
                }
                const attrStart = j;
                while (
                    j < limit &&
                    content[j] !== "=" &&
                    content[j] !== ">" &&
                    content[j] !== " " &&
                    content[j] !== "\n"
                ) {
                    j++;
                }
                const attrName = content.slice(attrStart, j).trim();
                // Detect JSX spread attributes like {...{src: "path"}}
                if (attrName.startsWith("{")) {
                    hasUnhandledExpressions = true;
                    // Skip past the closing }
                    let braceDepth = 0;
                    j = attrStart;
                    while (j < limit) {
                        if (content[j] === "{") {
                            braceDepth++;
                        } else if (content[j] === "}") {
                            braceDepth--;
                            if (braceDepth === 0) {
                                j++;
                                break;
                            }
                        } else if (content[j] === '"' || content[j] === "'") {
                            const q = content[j];
                            j++;
                            while (j < limit && content[j] !== q) {
                                if (content[j] === "\\") {
                                    j++;
                                }
                                j++;
                            }
                        }
                        j++;
                    }
                    continue;
                }
                if (content[j] === "=") {
                    j++;
                    while (j < limit && (content[j] === " " || content[j] === "\n")) {
                        j++;
                    }
                    // Handle plain quotes: attr="value" or attr='value'
                    // Also handle JSX expression: attr={'value'} or attr={"value"}
                    const isCurlyWrapped = content[j] === "{";
                    if (isCurlyWrapped) {
                        j++; // skip {
                        while (j < limit && (content[j] === " " || content[j] === "\n")) {
                            j++;
                        }
                    }
                    if (content[j] === '"' || content[j] === "'") {
                        const quote = content[j];
                        j++;
                        const valueStart = j;
                        while (j < limit && content[j] !== quote) {
                            if (content[j] === "\\") {
                                j += 2;
                            } else {
                                j++;
                            }
                        }
                        const value = content.slice(valueStart, j);
                        j++; // skip closing quote
                        if (isCurlyWrapped) {
                            while (j < limit && (content[j] === " " || content[j] === "\n")) {
                                j++;
                            }
                            if (j < limit && content[j] === "}") {
                                j++; // skip }
                            }
                        }
                        if (attrName === "src" || (attrName === "icon" && isLocalIconReference(value))) {
                            const trimmedValue = trimAnchor(value);
                            const anchor =
                                trimmedValue && value !== trimmedValue ? value.slice(trimmedValue.length) : "";
                            const imageSrc = mapImage(trimmedValue ?? value);
                            if (imageSrc) {
                                edits.push({
                                    start: valueStart,
                                    end: valueStart + value.length,
                                    replacement: imageSrc + anchor
                                });
                            }
                        } else if (attrName === "href") {
                            const trimmedHrefValue = trimAnchor(value) ?? value;
                            const hrefAnchorSuffix =
                                trimmedHrefValue !== value ? value.slice(trimmedHrefValue.length) : "";
                            const replacedHref = getReplacedHref({
                                href: trimmedHrefValue,
                                markdownFilesToPathName,
                                metadata
                            });
                            if (replacedHref && replacedHref.type === "replace") {
                                edits.push({
                                    start: valueStart,
                                    end: valueStart + value.length,
                                    replacement: replacedHref.slug + hrefAnchorSuffix
                                });
                            }
                        }
                    } else if (isCurlyWrapped && (attrName === "src" || attrName === "icon" || attrName === "href")) {
                        // Complex JSX expression (e.g. src={getUrl(...)}, spread attrs)
                        // that the streaming scanner can't resolve — flag for AST fallback
                        hasUnhandledExpressions = true;
                        // Skip past the closing }
                        let braceDepth = 1;
                        while (j < limit && braceDepth > 0) {
                            if (content[j] === "{") {
                                braceDepth++;
                            } else if (content[j] === "}") {
                                braceDepth--;
                            } else if (content[j] === '"' || content[j] === "'") {
                                const q = content[j];
                                j++;
                                while (j < limit && content[j] !== q) {
                                    if (content[j] === "\\") {
                                        j++;
                                    }
                                    j++;
                                }
                            }
                            j++;
                        }
                    }
                }
            }
            if (j >= limit || content[j] !== ">") {
                edits.length = editsBeforeTag;
                i++;
                continue;
            }
            j++;
            i = j;
            continue;
        }
        i++;
    }

    // If the streaming scanner encountered complex JSX expressions it couldn't resolve,
    // fall back to AST parse to handle them (e.g. src={getUrl(...)}, spread attributes).
    // This path is rarely hit (~0% of pages) so it doesn't affect overall performance.
    if (hasUnhandledExpressions) {
        const tree = parseMarkdownToTree(content);
        const lineStarts = precomputeLineStarts(content);

        const nodeTypeFilter = (node: unknown): boolean => {
            const n = node as { type?: string };
            return (
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
                    icon: (attr) => {
                        const icon = trimAnchor(extractSingleLiteral(attr.value));
                        if (isLocalIconReference(icon)) {
                            replaceSrc(icon);
                        }
                    },
                    href: (attr) => replaceHref(trimAnchor(extractSingleLiteral(attr.value)))
                });
            }

            if (isMdxJsxElement(node)) {
                node.attributes.forEach((attr) => {
                    if (
                        isMdxJsxAttribute(attr) &&
                        typeof attr.value !== "string" &&
                        attr.value != null &&
                        attr.value.data?.estree
                    ) {
                        // Skip simple string literals — already handled by the streaming scanner.
                        // Only process complex expressions (functions, identifiers, concatenation).
                        if (extractSingleLiteral(attr.value.data.estree) != null) {
                            return;
                        }
                        walkEstreeForSrcAndHref(attr.value.data.estree);
                    } else if (isMdxJsxExpressionAttribute(attr) && attr.data?.estree) {
                        walkEstreeForSrcAndHref(attr.data.estree);
                    }
                });
            }

            if (isMdxExpression(node) && node.data?.estree) {
                walkEstreeForSrcAndHref(node.data.estree);
            }

            if (replaced !== original) {
                edits.push({ start, end: start + length, replacement: replaced });
            }

            return CONTINUE;
        });
    }

    const replacedContent = applyEdits(content, edits);

    return requoteLeadingZeroValues(grayMatter.stringify(replacedContent, data));
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

function unescapeMarkdownUrl(text: string): string {
    return text.replace(/\\([()])/g, "$1");
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
