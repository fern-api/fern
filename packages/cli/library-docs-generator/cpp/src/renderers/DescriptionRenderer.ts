/**
 * Renders C++ docstring description trees (segments and blocks) to MDX.
 *
 * Handles all CppDocSegment inline types and CppDocBlock block types.
 */

import type {
    CppDocBlock,
    CppDocSegment,
    CppTypeInfo,
    CppTypeInfoPartsItem,
    CppTypeRef
} from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, getShortName, lookupMemberPath } from "../context.js";
import { escapeMdxText, protectSafeTags, restoreSafeTags } from "./shared.js";

// ---------------------------------------------------------------------------
// Module-level context for current page path
// ---------------------------------------------------------------------------

/**
 * The qualified path of the class/concept currently being rendered.
 * Used by renderSegment to detect self-referential codeRef links and
 * render them as plain code instead of links.
 *
 * Set via setCurrentPagePath() before rendering a page, cleared after.
 */
let currentPagePath: string | undefined = undefined;

/**
 * Set the current page's qualified path for self-reference detection.
 */
export function setCurrentPagePath(path: string | undefined): void {
    currentPagePath = path;
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

/**
 * Escape angle brackets for bare (non-backtick-wrapped) link text.
 */
function escapeAngleBrackets(text: string): string {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Check if a type info parts item is a CppTypeRef (has refid).
 */
export function isTypeRef(item: CppTypeInfoPartsItem): item is CppTypeRef {
    return typeof item !== "string" && "refid" in item;
}

// ---------------------------------------------------------------------------
// Doxygen refid decoding
// ---------------------------------------------------------------------------

/**
 * Decode a Doxygen refid to a fully-qualified C++ name.
 *
 * Doxygen refid encoding:
 * - Prefixes: "class", "struct", "namespace", "group__" etc.
 * - `_1_1` encodes `::`
 * - `__` (double underscore) encodes `_` (single underscore)
 * - `_01` - `_09`, `_0a` - `_0z` encode special characters
 * - Member suffix: `1a...` (hex hash after the class part)
 *
 * Returns the decoded qualified name or undefined if the refid can't be decoded.
 */
export function decodeDoxygenRefid(refid: string): string | undefined {
    if (!refid) {
        return undefined;
    }

    let working = refid;

    // Strip compound type prefix
    for (const prefix of ["class", "struct", "namespace", "concept", "union"]) {
        if (working.startsWith(prefix)) {
            working = working.substring(prefix.length);
            break;
        }
    }

    // Strip group prefix (e.g., "group__memory__management_1ga...")
    if (working.startsWith("group__")) {
        return undefined; // Can't reliably decode group refids to qualified names
    }

    // Strip member hash suffix (after `_1` followed by hex chars at the end for member refids)
    // Member refids look like: classfoo_1_1bar_1a7cc4729c5432d016b6b81c25bfe9cf42
    // We want to strip the member part: _1a7cc... (starts with _1 followed by a single hex char)
    // But NOT strip _1_1 which encodes ::
    // Pattern: _1[0-9a-f]{32,} at the end is a member hash
    working = working.replace(/_1[0-9a-f]{32,}$/, "");

    // Now decode: _1_1 -> ::, then __ -> _
    // Important: process _1_1 BEFORE __
    let decoded = working.replace(/_1_1/g, "::");

    // Decode double underscore to single underscore
    decoded = decoded.replace(/__/g, "_");

    // Decode _0X hex-encoded characters (rare)
    decoded = decoded.replace(/_0([0-9a-f])/g, (_, hex: string) => {
        return String.fromCharCode(parseInt(hex, 16));
    });

    // Validate: should look like a C++ qualified name
    if (!decoded || decoded.includes("_1")) {
        // Still has unresolved encoding -- fallback
        return undefined;
    }

    return decoded;
}

// ---------------------------------------------------------------------------
// Compound ref resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a compound reference to a fully-qualified C++ name.
 *
 * Tries (in order):
 * 1. Registered class member path by full text (e.g., "cub::BlockReduce")
 * 2. Registered class member path by short name (e.g., "BlockReduce")
 * 3. Decoded Doxygen refid
 * 4. Fallback to raw text
 */
export function resolveCompoundRef(text: string, refid: string): string {
    return lookupMemberPath(text) ?? lookupMemberPath(getShortName(text)) ?? decodeDoxygenRefid(refid) ?? text;
}

// ---------------------------------------------------------------------------
// Inline segment rendering
// ---------------------------------------------------------------------------

/**
 * Render a single inline doc segment to MDX text.
 */
function renderSegment(segment: CppDocSegment): string {
    switch (segment.type) {
        case "text":
            return segment.text;
        case "code":
            return `\`${segment.code}\``;
        case "codeRef": {
            // Split trailing possessive suffix ('s or ') outside backticks.
            // e.g., "pointer's" -> code="pointer", suffix="'s"
            let codeText = segment.code;
            let possessiveSuffix = "";
            const possessiveMatch = codeText.match(/^(.+?)('s?)\s*$/);
            if (possessiveMatch && possessiveMatch[1] != null && possessiveMatch[2] != null) {
                codeText = possessiveMatch[1];
                possessiveSuffix = possessiveMatch[2];
            }

            // codeRef has code + refid + kindref
            // For compound refs, resolve to a link using the fully-qualified name
            if (segment.kindref === "compound") {
                // Resolve the compound ref using the full resolution chain
                const qualifiedName = resolveCompoundRef(codeText, segment.refid);

                // If the resolved name matches the current page, render as plain code
                if (currentPagePath && qualifiedName === currentPagePath) {
                    return `\`${codeText}\`${possessiveSuffix}`;
                }

                const linkPath = buildLinkPath(qualifiedName);
                if (linkPath) {
                    return `[\`${codeText}\`](${linkPath})${possessiveSuffix}`;
                }
                return `\`${codeText}\`${possessiveSuffix}`;
            }
            // For member refs, try to decode the refid to get a qualified name.
            // Some member refs point to concepts, classes, or methods that have API pages.
            // When the refid decodes to a namespace (not a full member path), append the
            // member's code text to form the full qualified name.
            if (segment.kindref === "member" && segment.refid) {
                const decodedPath = decodeDoxygenRefid(segment.refid);
                if (decodedPath) {
                    let qualifiedName = decodedPath;
                    const shortName = codeText.split("::").pop() ?? codeText;
                    // If decoded path doesn't already end with the short name, append it
                    if (!decodedPath.endsWith("::" + shortName) && !decodedPath.endsWith(shortName)) {
                        qualifiedName = decodedPath + "::" + shortName;
                    }
                    const linkPath = buildLinkPath(qualifiedName);
                    if (linkPath) {
                        return `[\`${codeText}\`](${linkPath})${possessiveSuffix}`;
                    }
                }
            }
            // Fallback: render as inline code
            return `\`${codeText}\`${possessiveSuffix}`;
        }
        case "ref": {
            // ref has text + refid + kindref
            // For compound refs, resolve to a link using the fully-qualified name
            if (segment.kindref === "compound") {
                const text = segment.text.trim();
                // Resolve the compound ref using the full resolution chain
                const qualifiedName = resolveCompoundRef(text, segment.refid);

                // Self-link detection: if the resolved name matches the current page,
                // render as plain backtick code instead of a link
                if (currentPagePath && qualifiedName === currentPagePath) {
                    return `\`${text}\``;
                }

                const linkPath = buildLinkPath(qualifiedName);
                if (linkPath) {
                    return `[${escapeAngleBrackets(text)}](${linkPath})`;
                }
                return `\`${text}\``;
            }
            // For member refs, also try to resolve as a link
            if (segment.kindref === "member" && segment.refid) {
                const decodedPath = decodeDoxygenRefid(segment.refid);
                if (decodedPath) {
                    let qualifiedName = decodedPath;
                    const shortName = segment.text.trim().split("::").pop() ?? segment.text.trim();
                    if (!decodedPath.endsWith("::" + shortName) && !decodedPath.endsWith(shortName)) {
                        qualifiedName = decodedPath + "::" + shortName;
                    }
                    const linkPath = buildLinkPath(qualifiedName);
                    if (linkPath) {
                        return `[${escapeAngleBrackets(segment.text.trim())}](${linkPath})`;
                    }
                }
            }
            // For unresolvable member refs, render as plain text
            return segment.text;
        }
        case "bold":
            return `**${segment.text}**`;
        case "emphasis":
            return `*${segment.text}*`;
        case "link":
            return `[${segment.text}](${segment.url})`;
        case "subscript":
            return `<sub>${segment.text}</sub>`;
        case "superscript":
            return `<sup>${segment.text}</sup>`;
        default:
            return "";
    }
}

/**
 * Sanitize raw HTML anchor tags in rendered text to valid MDX.
 *
 * The IR sometimes contains text segments with raw HTML `<a href="...">text</a>`
 * from Doxygen source. MDX treats `<a` as JSX, which fails if the HTML is
 * malformed (missing quotes, broken across segments, etc.).
 *
 * This function:
 * 1. Converts well-formed `<a href="url">text</a>` to `[text](url)` markdown links
 * 2. Converts broken `<a>` tags where the href was split across segments
 * 3. Converts Doxygen `\p word` and `\c word` to inline code
 */
function sanitizeHtmlAnchorsForMdx(text: string): string {
    let result = text;

    // Convert well-formed <a href="url">text</a> to [text](url)
    // Handle both properly-quoted and improperly-quoted href attributes
    result = result.replace(
        /<a\s+href\s*=\s*"([^">]*?)(?:"|(?=>))>([\s\S]*?)<\/a>/gi,
        (_match, url: string, linkText: string) => {
            const cleanText = linkText.replace(/\s+/g, " ").trim();
            return `[${cleanText}](${url.trim()})`;
        }
    );

    // Handle broken <a> tags where the href contains a markdown link from a
    // split segment, e.g.: <a\n  href="[text](url)">LinkText
    // Extract the URL from the markdown link and use it with the display text.
    result = result.replace(
        /<a[\s\S]*?href\s*=\s*"\[[\s\S]*?\]\(([\s\S]*?)\)">([\s\S]*?)(?:<\/a>|$)/gi,
        (_match, url: string, linkText: string) => {
            const cleanText = linkText.replace(/\s+/g, " ").trim();
            const cleanUrl = url.trim();
            if (cleanUrl && cleanText) {
                return `[${cleanText}](${cleanUrl})`;
            }
            return cleanText;
        }
    );

    // Remove any remaining broken <a ...> opening tags that weren't matched above.
    // Match <a followed by attributes up to the next > on the same or subsequent lines.
    // These would cause MDX JSX parsing errors.
    result = result.replace(/<a\s[^>]*>/gi, "");

    // Remove orphaned </a> closing tags
    result = result.replace(/<\/a>/gi, "");

    // Convert Doxygen \p and \c commands to inline code
    result = result.replace(/\\p\s+(\S+)/g, "`$1`");
    result = result.replace(/\\c\s+(\S+)/g, "`$1`");

    return result;
}

/**
 * Escape remaining MDX-special characters in rendered segment text.
 *
 * After HTML anchor sanitization, any remaining bare `<`, `>`, `{`, `}`
 * outside of backtick code spans need to be escaped as HTML entities
 * to prevent the MDX parser from interpreting them as JSX.
 *
 * This function splits the text on backtick boundaries and only escapes
 * content outside backtick spans. It preserves valid HTML tags like
 * `<sub>`, `<sup>`, `<br>`, and their closing counterparts.
 */
function escapeRemainingMdxSpecials(text: string): string {
    // Split on backtick-delimited spans (inline code).
    // Handle both double-backtick (``...``) and single-backtick (`...`) code spans.
    // We need to preserve content inside backticks as-is.
    const parts = text.split(/(``[^`]*``|`[^`]*`)/);
    return parts
        .map((part, i) => {
            // Odd-indexed parts are backtick-wrapped (code spans) -- leave as-is
            if (i % 2 === 1) {
                return part;
            }
            // Even-indexed parts are outside backticks -- escape MDX specials.
            // Preserve known safe HTML tags (sub, sup, br, em, strong, code, etc.)
            // by temporarily replacing them, escaping everything else, then restoring.
            const protected_ = protectSafeTags(part);

            // Escape remaining angle brackets and curly braces
            const escaped = protected_.text
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\{/g, "&#123;")
                .replace(/\}/g, "&#125;");

            return restoreSafeTags(escaped, protected_.tags);
        })
        .join("");
}

/**
 * Escape MDX-special characters in multi-line content while preserving
 * fenced code blocks (```...```) and inline backtick spans.
 *
 * Used for verbatim block output and other multi-line rendered content
 * that may contain code blocks alongside prose text with `<`, `>`, `{`, `}`.
 */
function escapeMultilineMdxSpecials(text: string): string {
    const lines = text.split("\n");
    const result: string[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
        if (/^```/.test(line)) {
            inCodeBlock = !inCodeBlock;
            result.push(line);
            continue;
        }
        if (inCodeBlock) {
            result.push(line);
            continue;
        }
        // Outside code blocks, escape MDX specials using the inline escaper
        result.push(escapeRemainingMdxSpecials(line));
    }

    return result.join("\n");
}

/**
 * Render an array of inline segments to a single MDX string.
 */
function renderSegments(segments: CppDocSegment[]): string {
    const raw = segments.map(renderSegment).join("");
    // Sanitize any raw HTML anchor tags that may have leaked through from the IR
    const sanitized = sanitizeHtmlAnchorsForMdx(raw);
    // Escape any remaining MDX-special characters (< > { }) outside code spans
    return escapeRemainingMdxSpecials(sanitized);
}

/**
 * Render segments and trim trailing whitespace/periods for clean output.
 */
export function renderSegmentsTrimmed(segments: CppDocSegment[]): string {
    return renderSegments(segments).trim();
}

function renderSegmentPlainText(segment: CppDocSegment): string {
    switch (segment.type) {
        case "text":
            return segment.text;
        case "code":
        case "codeRef":
            return segment.code;
        case "ref":
            return segment.text;
        case "bold":
        case "emphasis":
            return segment.text;
        case "link":
            return segment.text;
        case "subscript":
        case "superscript":
            return segment.text;
        default:
            return "";
    }
}

export function renderSegmentsPlainText(segments: CppDocSegment[]): string {
    return segments.map(renderSegmentPlainText).join("").trim();
}

// ---------------------------------------------------------------------------
// See also rendering (shared by class pages and method pages)
// ---------------------------------------------------------------------------

/**
 * Render a "See also" section from an array of segment arrays.
 * Returns the rendered MDX lines (including trailing blank line) or empty string
 * if there are no valid see-also entries.
 *
 * Output format (multi-line, comma-separated except for last entry):
 *   **See also:**
 *   entry1,
 *   entry2
 */
export function renderSeeAlso(seeAlsoItems: CppDocSegment[][]): string {
    const parts: string[] = [];
    for (const sa of seeAlsoItems) {
        const text = renderSegmentsTrimmed(sa);
        if (text) {
            parts.push(text);
        }
    }
    if (parts.length === 0) {
        return "";
    }
    const lines: string[] = [];
    lines.push("**See also:**");
    for (let i = 0; i < parts.length; i++) {
        const trailing = i < parts.length - 1 ? "," : "";
        lines.push(`${parts[i]}${trailing}`);
    }
    lines.push("");
    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

/**
 * Options for block rendering.
 */
interface RenderBlockOptions {
    /** When set, titledSection titles render as markdown headings at this level (e.g., 2 → "## Title"). */
    titledSectionHeadingLevel?: number;
}

/**
 * Render a single doc block to MDX lines.
 */
function renderBlock(block: CppDocBlock, options?: RenderBlockOptions): string {
    switch (block.type) {
        case "paragraph": {
            const text = renderSegments(block.segments).trim();
            if (!text || text === "\n") {
                return "";
            }
            return text;
        }
        case "codeBlock": {
            const lang = block.language || "cpp";
            return [`\`\`\`${lang} showLineNumbers={false}`, block.code, "```"].join("\n");
        }
        case "verbatim": {
            // Verbatim blocks: pass through raw content with MDX escaping.
            // RST verbatim processing has been removed -- RST content is now
            // pre-processed into structured IR fields by the parser.
            return escapeMultilineMdxSpecials(block.content);
        }
        case "list": {
            return renderList(block.ordered, block.items, options);
        }
        case "image": {
            if (block.caption) {
                return `![${block.caption}](${block.path})`;
            }
            return `![](${block.path})`;
        }
        case "titledSection": {
            const lines: string[] = [];
            if (block.title) {
                if (options?.titledSectionHeadingLevel) {
                    const hashes = "#".repeat(options.titledSectionHeadingLevel);
                    lines.push(`${hashes} ${escapeMdxText(block.title)}`);
                } else {
                    lines.push(`**${escapeMdxText(block.title)}**`);
                }
                lines.push("");
            }
            for (const subBlock of block.blocks) {
                const rendered = renderBlock(subBlock, options);
                if (rendered) {
                    lines.push(rendered);
                }
            }
            return lines.join("\n");
        }
        default:
            return "";
    }
}

/**
 * Render a list (ordered or unordered) to MDX.
 */
function renderList(ordered: boolean, items: CppDocBlock[][], options?: RenderBlockOptions): string {
    const lines: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const itemBlocks = items[i];
        if (!itemBlocks || itemBlocks.length === 0) {
            continue;
        }
        const prefix = ordered ? `${i + 1}.` : "-";
        const firstItem = itemBlocks[0];
        if (firstItem == null) {
            continue;
        }
        const firstBlock = renderBlock(firstItem, options);
        lines.push(`${prefix} ${firstBlock}`);

        // Remaining blocks in the item get indented
        for (let j = 1; j < itemBlocks.length; j++) {
            const nextItem = itemBlocks[j];
            if (nextItem == null) {
                continue;
            }
            const rendered = renderBlock(nextItem, options);
            if (rendered) {
                const indented = rendered
                    .split("\n")
                    .map((line) => `   ${line}`)
                    .join("\n");
                lines.push(indented);
            }
        }
    }
    return lines.join("\n");
}

/**
 * Render the description blocks of a docstring to MDX paragraphs.
 * Filters out empty/whitespace-only paragraphs.
 *
 * @param options.titledSectionHeadingLevel - When set, titledSection titles render
 *   as markdown headings at this level (e.g., 2 → "## Title") instead of bold text.
 */
export function renderDescriptionBlocks(blocks: CppDocBlock[], options?: RenderBlockOptions): string {
    const parts: string[] = [];
    for (const block of blocks) {
        const rendered = renderBlock(block, options);
        if (rendered && rendered.trim()) {
            parts.push(rendered);
        }
    }
    return parts.join("\n\n");
}

export function renderDescriptionBlocksDeduped(
    blocks: CppDocBlock[],
    summary: CppDocSegment[],
    options?: RenderBlockOptions
): string {
    if (blocks.length === 0 || summary.length === 0) {
        return renderDescriptionBlocks(blocks, options);
    }
    const firstBlock = blocks[0];
    if (firstBlock == null) {
        return renderDescriptionBlocks(blocks, options);
    }
    if (firstBlock.type === "paragraph") {
        const blockText = renderSegments(firstBlock.segments).trim();
        const summaryText = renderSegments(summary).trim();
        if (blockText === summaryText) {
            return renderDescriptionBlocks(blocks.slice(1), options);
        }
    }
    return renderDescriptionBlocks(blocks, options);
}

// ---------------------------------------------------------------------------
// Type info rendering (for tables and links props)
// ---------------------------------------------------------------------------

/**
 * Render CppTypeInfo parts to a display string.
 * Uses display field if available, otherwise concatenates parts.
 */
export function renderTypeInfoDisplay(typeInfo: CppTypeInfo | undefined): string {
    if (!typeInfo) {
        return "";
    }
    if (typeInfo.display) {
        return typeInfo.display;
    }
    return typeInfo.parts.map((p) => (typeof p === "string" ? p : p.text)).join("");
}

/**
 * Render CppTypeInfo parts for a table cell, with links where available.
 * Returns MDX string with links for type refs that have resolved paths.
 */
export function renderTypeInfoForTable(typeInfo: CppTypeInfo | undefined, ownerPath: string): string {
    if (!typeInfo) {
        return "";
    }
    const display = renderTypeInfoDisplay(typeInfo);
    if (!display) {
        return "";
    }

    // If the type has a resolved path, create a link
    if (typeInfo.resolvedPath) {
        const linkPath = buildLinkPath(typeInfo.resolvedPath);
        if (linkPath) {
            return `[\`${display}\`](${linkPath})`;
        }
    }

    return `\`${display}\``;
}
