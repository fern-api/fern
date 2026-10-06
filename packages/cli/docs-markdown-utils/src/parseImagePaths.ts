import { FdrAPI as CjsFdrSdk, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    AbsoluteFilePath,
    convertToFernHostAbsoluteFilePath,
    dirname,
    RelativeFilePath,
    resolve
} from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import grayMatter from "gray-matter";
import { isAbsolute } from "path";
import { z } from "zod";

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

interface Edit {
    start: number;
    end: number;
    replacement: string;
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

/**
 * Returns the index of the `]` that ends the label opening at `start` and is followed by an inline
 * destination, or null when there is none on the same block. Labels may contain brackets of their
 * own (`![Filter [Top N] menu](path.png)`), so stopping at the first `]` would misread the label
 * and leave the destination unresolved.
 */
function findLabelEnd(content: string, start: number): number | null {
    const limit = findScanLimit(content, start);
    let depth = 0;
    let i = start;

    while (i < limit) {
        if (content[i] === "\\") {
            i += 2;
            continue;
        }
        if (content[i] === "[") {
            depth++;
        } else if (content[i] === "]") {
            depth--;
            if (depth === 0) {
                if (content[i + 1] === "(") {
                    return i;
                }
                // The label's brackets are unbalanced because some were escaped — as mdast
                // serialization produces for `![a [b] c]`. Keep looking for the destination, but
                // give up at the next `[` so a bracket pair without one can't absorb a later
                // image or link.
                return findLabelEndBeforeNextBracket(content, i + 1, limit);
            }
        }
        i++;
    }

    return null;
}

function findLabelEndBeforeNextBracket(content: string, start: number, limit: number): number | null {
    let i = start;

    while (i < limit) {
        if (content[i] === "\\") {
            i += 2;
            continue;
        }
        if (content[i] === "[") {
            return null;
        }
        if (content[i] === "]" && content[i + 1] === "(") {
            return i;
        }
        i++;
    }

    return null;
}

interface MarkdownImageParseResult {
    urlStart: number;
    urlEnd: number;
    nextIndex: number;
    originalUrl: string;
    rawSrc: string;
    src: string;
}

function parseMarkdownImage(content: string, start: number): MarkdownImageParseResult | null {
    const len = content.length;
    const labelEnd = findLabelEnd(content, start + 1);

    if (labelEnd == null || content[labelEnd + 1] !== "(") {
        return null;
    }

    let i = labelEnd + 2;
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
    const rawSrc = trimAnchor(unwrapDelimitedDestination(splitDestinationAndTitle(url)).path);
    if (!rawSrc) {
        return null;
    }

    return { urlStart, urlEnd, nextIndex: i, originalUrl: url, rawSrc, src: unescapeMarkdownUrl(rawSrc) };
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

/**
 * Angle brackets delimit a destination but are not part of the path: `<my file.png>`
 * points at `my file.png`. Callers rewrite the path in place, so the brackets are left
 * in the surrounding text.
 */
function unwrapDelimitedDestination(destination: string): { path: string; wrapped: boolean } {
    if (destination.length >= 2 && destination.startsWith("<") && destination.endsWith(">")) {
        return { path: destination.slice(1, -1), wrapped: true };
    }
    return { path: destination, wrapped: false };
}

interface AbsolutePathMetadata {
    absolutePathToMarkdownFile: AbsoluteFilePath;
    absolutePathToFernFolder: AbsoluteFilePath;
}

interface ReferenceMappers {
    /** Replacement for a local image path, or undefined to leave it unchanged. */
    mapImage: (path: string) => string | undefined;
    /** Replacement for a link to another page, or undefined to leave it unchanged. */
    mapHref: (href: string) => string | undefined;
}

/**
 * Single O(n) character scan for the image paths and page links in MDX content. Both publish steps
 * use it (collecting images to upload, then swapping in file IDs and slugs), so they always agree on
 * which references exist. Each edit replaces exactly one path.
 */
function scanForEdits(content: string, mappers: ReferenceMappers): Edit[] {
    const { mapImage, mapHref } = mappers;
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

        // Commented-out content is never rendered, so its images are not uploaded.
        const commentEnd = findCommentEnd(content, i);
        if (commentEnd != null) {
            i = commentEnd;
            continue;
        }

        if (content[i] === "!" && content[i + 1] === "[") {
            const result = parseMarkdownImage(content, i);
            if (result) {
                const imageSrc = mapImage(result.src);
                if (imageSrc) {
                    edits.push({
                        start: result.urlStart,
                        end: result.urlEnd,
                        replacement: result.originalUrl.replace(result.rawSrc, imageSrc)
                    });
                }
                i = result.nextIndex;
                continue;
            }
        } else if (content[i] === "[" && content[i - 1] !== "!") {
            const labelEnd = findLabelEnd(content, i);
            let j = labelEnd ?? len;
            if (labelEnd != null && content[labelEnd + 1] === "(") {
                j = labelEnd + 2;
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
                edits.push(...scanNestedForEdits(content, i + 1, labelEnd, mappers));
                const urlEnd = j - 1;
                const href = content.slice(urlStart, urlEnd).trim();
                const destination = splitDestinationAndTitle(href);
                const hrefTitle = href.slice(destination.length);
                const { path: hrefPath, wrapped } = unwrapDelimitedDestination(destination);
                const trimmedHref = trimAnchor(hrefPath) ?? hrefPath;
                const hrefAnchor = trimmedHref !== hrefPath ? hrefPath.slice(trimmedHref.length) : "";
                const replacedHref = mapHref(trimmedHref);
                if (replacedHref != null) {
                    const slug = replacedHref + hrefAnchor;
                    edits.push({
                        start: urlStart,
                        end: urlEnd,
                        replacement: (wrapped ? `<${slug}>` : slug) + hrefTitle
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
                    const braceStart = j;
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
                            } else {
                                // `{'abc' + suffix}` starts with a string but is an expression, not a path.
                                const braceEnd = findBalancedBraceEnd(content, braceStart, limit);
                                if (braceEnd === undefined) {
                                    edits.length = editsBeforeTag;
                                    break;
                                }
                                edits.push(...scanNestedForEdits(content, braceStart + 1, braceEnd - 1, mappers));
                                j = braceEnd;
                                continue;
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
                            const replacedHref = mapHref(trimmedHrefValue);
                            if (replacedHref != null) {
                                edits.push({
                                    start: valueStart,
                                    end: valueStart + value.length,
                                    replacement: replacedHref + hrefAnchorSuffix
                                });
                            }
                        }
                    } else if (isCurlyWrapped && attrName === "links" && content[j] === "{") {
                        // `<CodeBlock links={{"Type": "./types.mdx#anchor"}}>` emitted by the library-docs
                        // generators: resolve each `.md`/`.mdx` value like an href.
                        const objectStart = j;
                        const objectEnd = findBalancedBraceEnd(content, objectStart, limit);
                        if (objectEnd === undefined) {
                            edits.length = editsBeforeTag;
                            break;
                        }
                        const replacement = replaceMarkdownLinksInJsonObject(
                            content.slice(objectStart, objectEnd),
                            (href) => {
                                const trimmedHref = trimAnchor(href) ?? href;
                                const anchorSuffix = trimmedHref !== href ? href.slice(trimmedHref.length) : "";
                                const replacedHref = mapHref(trimmedHref);
                                return replacedHref != null ? replacedHref + anchorSuffix : undefined;
                            }
                        );
                        if (replacement !== undefined) {
                            edits.push({ start: objectStart, end: objectEnd, replacement });
                        }
                        j = objectEnd;
                        while (j < limit && (content[j] === " " || content[j] === "\n")) {
                            j++;
                        }
                        if (j < limit && content[j] === "}") {
                            j++; // skip }
                        }
                    } else if (isCurlyWrapped) {
                        // An expression like `icon={<img src="./a.png" />}` is scanned like page content,
                        // so tags nested inside it are rewritten too.
                        const braceEnd = findBalancedBraceEnd(content, braceStart, limit);
                        if (braceEnd === undefined) {
                            edits.length = editsBeforeTag;
                            break;
                        }
                        edits.push(...scanNestedForEdits(content, braceStart + 1, braceEnd - 1, mappers));
                        j = braceEnd;
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
    return edits;
}

/** End index (exclusive) of an MDX expression comment or an HTML `<!-- -->` comment starting at `start`, if any. */
function findCommentEnd(content: string, start: number): number | undefined {
    if (content[start] !== "{" && content[start] !== "<") {
        return undefined;
    }
    for (const [open, close] of [
        ["{/*", "*/}"],
        ["<!--", "-->"]
    ] as const) {
        if (content.startsWith(open, start)) {
            const closeIndex = content.indexOf(close, start + open.length);
            return closeIndex === -1 ? undefined : closeIndex + close.length;
        }
    }
    return undefined;
}

/**
 * Scans `content[start, end)` (a JSX expression or link text) like page content, with edit offsets
 * relative to `content`.
 */
function scanNestedForEdits(content: string, start: number, end: number, mappers: ReferenceMappers): Edit[] {
    return scanForEdits(content.slice(start, end), mappers).map((edit) => ({
        ...edit,
        start: edit.start + start,
        end: edit.end + start
    }));
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
    metadata: AbsolutePathMetadata
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

    const edits = scanForEdits(content, { mapImage, mapHref: () => undefined });

    return {
        filepaths: [...filepaths],
        markdown: requoteLeadingZeroValues(grayMatter.stringify(applyEdits(content, edits), data))
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

    function mapHref(href: string): string | undefined {
        const replacedHref = getReplacedHref({ href, markdownFilesToPathName, metadata });
        return replacedHref?.type === "replace" ? replacedHref.slug : undefined;
    }

    const edits = scanForEdits(content, { mapImage, mapHref });
    const replacedContent = applyEdits(content, edits);

    return requoteLeadingZeroValues(grayMatter.stringify(replacedContent, data));
}

export function trimAnchor(text: unknown): string | undefined {
    if (typeof text !== "string") {
        return undefined;
    }
    return text.replace(/#.*$/, "");
}

/**
 * Index just past the `}` that closes the `{` at `start`, skipping braces inside string
 * literals; undefined when unbalanced before `limit`.
 */
function findBalancedBraceEnd(content: string, start: number, limit: number): number | undefined {
    let depth = 0;
    let j = start;
    while (j < limit) {
        const ch = content[j];
        if (ch === "{") {
            depth++;
        } else if (ch === "}") {
            depth--;
            if (depth === 0) {
                return j + 1;
            }
        } else if (ch === '"' || ch === "'") {
            j++;
            while (j < limit && content[j] !== ch) {
                if (content[j] === "\\") {
                    j++;
                }
                j++;
            }
        }
        j++;
    }
    return undefined;
}

function isStringRecord(value: unknown): value is Record<string, string> {
    return (
        typeof value === "object" &&
        value != null &&
        !Array.isArray(value) &&
        Object.values(value).every((v) => typeof v === "string")
    );
}

/**
 * Re-serialize a JSON object literal of `{ label: href }` with each href mapped through
 * `replaceHref`. Returns undefined when the literal is not such an object or nothing changed.
 */
function replaceMarkdownLinksInJsonObject(
    objectLiteral: string,
    replaceHref: (href: string) => string | undefined
): string | undefined {
    let parsed: unknown;
    try {
        parsed = JSON.parse(objectLiteral);
    } catch {
        return undefined;
    }
    if (!isStringRecord(parsed)) {
        return undefined;
    }
    let changed = false;
    const replaced: Record<string, string> = {};
    for (const [label, href] of Object.entries(parsed)) {
        const next = replaceHref(href);
        if (next !== undefined && next !== href) {
            changed = true;
        }
        replaced[label] = next ?? href;
    }
    return changed ? JSON.stringify(replaced) : undefined;
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
