/**
 * Renders C++ docstring description trees (segments and blocks) to MDX.
 *
 * Handles all CppDocSegment inline types and CppDocBlock block types.
 */

import type {
    CppDocBlock,
    CppDocSegment,
    CppDocstringIr,
    CppTypeInfo,
    CppTypeInfoPartsItem,
    CppTypeRef
} from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, getShortName, lookupMemberPath } from "../context.js";

// ---------------------------------------------------------------------------
// BUG 30: Module-level context for current page path
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
 * Escape angle brackets in markdown link text so MDX doesn't parse them as JSX.
 *
 * Even inside backtick-wrapped link text like [`pointer<T>`], MDX may interpret
 * `<T>` as a JSX tag. Replace `<` with `&lt;` and `>` with `&gt;` to prevent this.
 */
export function escapeLinkTextForMdx(text: string): string {
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
    return lookupMemberPath(text)
        ?? lookupMemberPath(getShortName(text))
        ?? decodeDoxygenRefid(refid)
        ?? text;
}

// ---------------------------------------------------------------------------
// Inline segment rendering
// ---------------------------------------------------------------------------

/**
 * Render a single inline doc segment to MDX text.
 */
export function renderSegment(segment: CppDocSegment): string {
    switch (segment.type) {
        case "text":
            return segment.text;
        case "code":
            return `\`${segment.code}\``;
        case "codeRef": {
            // BUG 23: Split trailing possessive suffix ('s or ') outside backticks.
            // e.g., "pointer's" -> code="pointer", suffix="'s"
            let codeText = segment.code;
            let possessiveSuffix = "";
            const possessiveMatch = codeText.match(/^(.+?)('s?)\s*$/);
            if (possessiveMatch) {
                codeText = possessiveMatch[1]!;
                possessiveSuffix = possessiveMatch[2]!;
            }

            // codeRef has code + refid + kindref
            // For compound refs, resolve to a link using the fully-qualified name
            if (segment.kindref === "compound") {
                // Resolve the compound ref using the full resolution chain
                const qualifiedName = resolveCompoundRef(codeText, segment.refid);

                // BUG 30: If the resolved name matches the current page, render as plain code
                if (currentPagePath && qualifiedName === currentPagePath) {
                    return `\`${codeText}\`${possessiveSuffix}`;
                }

                const linkPath = buildLinkPath(qualifiedName);
                return `[\`${escapeLinkTextForMdx(codeText)}\`](${linkPath})${possessiveSuffix}`;
            }
            // BUG 20 fix: For member refs, try to decode the refid to get a qualified name.
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
                    return `[\`${escapeLinkTextForMdx(codeText)}\`](${linkPath})${possessiveSuffix}`;
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
                return `[${escapeLinkTextForMdx(text)}](${linkPath})`;
            }
            // BUG 20 fix: For member refs, also try to resolve as a link
            if (segment.kindref === "member" && segment.refid) {
                const decodedPath = decodeDoxygenRefid(segment.refid);
                if (decodedPath) {
                    let qualifiedName = decodedPath;
                    const shortName = segment.text.trim().split("::").pop() ?? segment.text.trim();
                    if (!decodedPath.endsWith("::" + shortName) && !decodedPath.endsWith(shortName)) {
                        qualifiedName = decodedPath + "::" + shortName;
                    }
                    const linkPath = buildLinkPath(qualifiedName);
                    return `[${escapeLinkTextForMdx(segment.text.trim())}](${linkPath})`;
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
 * Render an array of inline segments to a single MDX string.
 */
export function renderSegments(segments: CppDocSegment[]): string {
    const raw = segments.map(renderSegment).join("");
    // Sanitize any raw HTML anchor tags that may have leaked through from the IR
    return sanitizeHtmlAnchorsForMdx(raw);
}

/**
 * Render segments and trim trailing whitespace/periods for clean output.
 */
export function renderSegmentsTrimmed(segments: CppDocSegment[]): string {
    return renderSegments(segments).trim();
}

// ---------------------------------------------------------------------------
// RST-to-Markdown conversion for verbatim blocks
// ---------------------------------------------------------------------------

/**
 * Shared expansion text for @smemreuse and @smemwarpreuse Doxygen macros.
 */
const SMEM_REUSE_TEXT =
    "The block-wide aggregate of `temp_storage` is undefined after calling this method and should not be used. To preserve the aggregate, use a separate `TempStorage` for each method call.";

/**
 * Known Doxygen macros that should be expanded or removed.
 */
const DOXYGEN_MACROS: Record<string, string> = {
    "@rowmajor": "Assumes threads are in row-major order.",
    "@granularity": "Performance is sensitive to the degree of data movement across the block.",
    "@smemreuse": SMEM_REUSE_TEXT,
    "@smemwarpreuse": SMEM_REUSE_TEXT,
    "@blocksize": "`BLOCK_THREADS` is a multiple of the architecture's warp size",
    "@identityzero": "Uses the identity element (zero) as the initial value.",
    "@blocked": "Data is in a blocked arrangement across threads.",
};

/**
 * Convert a verbatim RST block to Markdown.
 *
 * Handles:
 * - Strip `//!` comment prefixes
 * - Strip `embed:rst:leading-asterisk` header
 * - Convert :ref: directives to text
 * - Convert :cpp:enumerator:, :cpp:class:, :cpp:func: to code links
 * - Convert `.. code-block::` to markdown code blocks
 * - Convert `.. versionadded::` to version annotation
 * - Handle `++++++` section dividers (RST section headers)
 * - Handle RST numbered lists (#.) and bullet lists
 * - Handle RST inline markup: ``code``, *emphasis*, `link <url>`_
 * - Expand Doxygen macros (@rowmajor, @granularity, @blockcollective{})
 */
export function convertVerbatimRst(content: string): ParsedVerbatim {
    // Strip the embed:rst:leading-asterisk header
    let text = content.replace(/^embed:rst:leading-asterisk\s*\n?/, "");

    // Strip comment prefixes from each line
    // Handles both //! style (Doxygen C++ comments) and * style (leading-asterisk format)
    const lines = text.split("\n").map(line => {
        // Try //! prefix first
        if (line.startsWith("//!")) {
            return line.replace(/^\/\/!\s?/, "");
        }
        // Then try * prefix (leading-asterisk format)
        if (/^\*\s?/.test(line)) {
            return line.replace(/^\*\s?/, "");
        }
        return line;
    });

    // Parse into sections based on ++++++ dividers
    const sections: VerbatimSection[] = [];
    let currentTitle: string | undefined = undefined;
    let currentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        // Detect section dividers: line of ++++++
        if (/^\+{3,}\s*$/.test(line)) {
            // The previous non-empty line is the section title
            // Flush the current section (minus the title line)
            if (currentLines.length > 0) {
                // Remove the last non-empty line as it's the title for the next section
                let titleLine: string | undefined = undefined;
                while (currentLines.length > 0 && !currentLines[currentLines.length - 1]!.trim()) {
                    currentLines.pop();
                }
                if (currentLines.length > 0) {
                    titleLine = currentLines.pop()!;
                }

                // Save the section before this title
                if (currentLines.length > 0 || currentTitle !== undefined) {
                    sections.push({
                        title: currentTitle,
                        lines: currentLines
                    });
                }

                currentTitle = titleLine?.trim();
                currentLines = [];
            }
            continue;
        }

        currentLines.push(line);
    }

    // Flush remaining
    if (currentLines.length > 0 || currentTitle !== undefined) {
        sections.push({
            title: currentTitle,
            lines: currentLines
        });
    }

    // Convert each section's lines from RST to Markdown
    const result: ParsedVerbatim = {
        overviewContent: "",
        performanceContent: undefined,
        exampleDescription: undefined,
        exampleCode: undefined,
        exampleLanguage: undefined
    };

    for (const section of sections) {
        const md = convertRstLinesToMarkdown(section.lines);

        if (!section.title) {
            // This is the overview/intro section
            result.overviewContent = md;
        } else if (/performance/i.test(section.title)) {
            result.performanceContent = md;
        } else if (/example/i.test(section.title) || /snippet/i.test(section.title)) {
            // Parse example section: description text + code block
            parseExampleSection(section.lines, result);
        } else {
            // Other titled sections (e.g., "Re-using dynamically allocating shared memory")
            // Skip these as they are typically not rendered in golden pages
        }
    }

    return result;
}

interface VerbatimSection {
    title: string | undefined;
    lines: string[];
}

/**
 * Result of parsing a verbatim RST block.
 */
export interface ParsedVerbatim {
    overviewContent: string;
    performanceContent: string | undefined;
    exampleDescription: string | undefined;
    exampleCode: string | undefined;
    exampleLanguage: string | undefined;
}

/**
 * Parse an example section from RST lines.
 * Extracts the description text and code-block.
 */
function parseExampleSection(lines: string[], result: ParsedVerbatim): void {
    let inCodeBlock = false;
    let codeLanguage = "cpp";
    const codeLines: string[] = [];
    const descLines: string[] = [];
    let codeBlockIndent = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        if (inCodeBlock) {
            // Code block continues until we encounter a line with less indentation
            // or end of content
            if (line.trim() === "" || line.length === 0) {
                codeLines.push("");
                continue;
            }
            const indent = line.search(/\S/);
            if (indent >= codeBlockIndent) {
                codeLines.push(line.substring(codeBlockIndent));
            } else {
                // End of code block
                inCodeBlock = false;
                // Don't add this line to desc, it's usually empty
            }
            continue;
        }

        // Detect .. code-block:: directive
        const codeBlockMatch = line.match(/^\s*\.\.\s+code-block::\s*(\S+)?/);
        if (codeBlockMatch) {
            codeLanguage = codeBlockMatch[1] === "c++" ? "cpp" : (codeBlockMatch[1] ?? "cpp");
            inCodeBlock = true;
            // The code content starts after the blank line following the directive
            // Skip blank lines to find the indented code
            let j = i + 1;
            while (j < lines.length && lines[j]!.trim() === "") {
                j++;
            }
            if (j < lines.length) {
                codeBlockIndent = lines[j]!.search(/\S/);
                if (codeBlockIndent < 0) {
                    codeBlockIndent = 3;
                }
            }
            i = j - 1; // Will be incremented by the loop
            continue;
        }

        // Skip @blockcollective{Name} and @warpcollective{Name} macros
        if (/^@(?:blockcollective|warpcollective)\{.*\}/.test(line.trim())) {
            continue;
        }

        // Regular description line
        descLines.push(line);
    }

    // Remove trailing blank lines from code
    while (codeLines.length > 0 && codeLines[codeLines.length - 1]!.trim() === "") {
        codeLines.pop();
    }

    const descMd = convertRstLinesToMarkdown(descLines);
    if (descMd.trim()) {
        result.exampleDescription = descMd.trim();
    }
    if (codeLines.length > 0) {
        result.exampleCode = codeLines.join("\n");
        result.exampleLanguage = codeLanguage;
    }
}

/**
 * BUG 19: Join multiline RST inline directives.
 *
 * RST allows inline directives like `:ref:` to span multiple lines when
 * continuation lines are indented. This function joins those continuations
 * back into single lines so per-line regex matching can handle them.
 *
 * Example:
 *   `:ref:\`memory resource\n   <target>\`` -> `:ref:\`memory resource <target>\``
 */
function joinMultilineRstDirectives(lines: string[]): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
        let line = lines[i]!;

        // Check if the line has an unclosed backtick from a :ref: or similar directive
        // Pattern: :something:`text without closing backtick
        if (/:(?:ref|doc|term|any|sub|sup|cpp:[\w]+):`[^`]*$/.test(line)) {
            // Join continuation lines until we find the closing backtick
            while (i + 1 < lines.length) {
                const nextLine = lines[i + 1]!;
                const trimmedNext = nextLine.trim();
                if (!trimmedNext) {
                    break;
                }
                line = line + " " + trimmedNext;
                i++;
                if (trimmedNext.includes("`")) {
                    break;
                }
            }
        }

        result.push(line);
        i++;
    }

    return result;
}

/**
 * Convert an array of RST-formatted lines to Markdown.
 */
function convertRstLinesToMarkdown(lines: string[]): string {
    // BUG 19: Pre-process lines to join multiline :ref: directives
    // RST allows :ref:`text\n   <target>` across lines. Join continuation lines
    // (lines that are indented and follow a line with an open backtick from :ref:)
    const joinedLines = joinMultilineRstDirectives(lines);

    const resultLines: string[] = [];
    let i = 0;

    while (i < joinedLines.length) {
        const line = joinedLines[i]!;

        // BUG 19: Skip RST label directives (.. _label-name:)
        if (/^\s*\.\.\s+_[^:]+:\s*$/.test(line)) {
            i++;
            continue;
        }

        // BUG 19: Skip RST section underlines (lines of -, =, ~, ^, +, #)
        if (/^[-=~^+#]{3,}\s*$/.test(line)) {
            // Also remove the title line that preceded this underline (if it was already added)
            if (resultLines.length > 0 && resultLines[resultLines.length - 1]!.trim() !== "") {
                resultLines.pop();
            }
            i++;
            continue;
        }

        // BUG 19: Handle .. image:: directives
        const imageMatch = line.match(/^\s*\.\.\s+image::\s*(.+)/);
        if (imageMatch) {
            const imagePath = imageMatch[1]!.trim();
            // Skip any options (indented lines following the directive)
            i++;
            while (i < joinedLines.length && (joinedLines[i]!.trim() === "" || /^\s{3,}/.test(joinedLines[i]!))) {
                i++;
            }
            // Convert to markdown image (or strip if path is relative/inaccessible)
            resultLines.push(`![](${imagePath})`);
            continue;
        }

        // Skip .. code-block:: directives (these are handled separately in examples)
        if (/^\s*\.\.\s+code-block::/.test(line)) {
            // Skip the directive and its content (indented block)
            i++;
            while (i < joinedLines.length && (joinedLines[i]!.trim() === "" || /^\s{3,}/.test(joinedLines[i]!))) {
                i++;
            }
            continue;
        }

        // Handle .. versionadded:: directive
        const versionMatch = line.match(/^\s*\.\.\s+versionadded::\s*(.+)/);
        if (versionMatch) {
            // Collect continuation lines (indented)
            const version = versionMatch[1]!.trim();
            let detail = "";
            i++;
            while (i < joinedLines.length && (joinedLines[i]!.trim() === "" || /^\s{3,}/.test(joinedLines[i]!))) {
                const trimmed = joinedLines[i]!.trim();
                if (trimmed) {
                    detail += (detail ? " " : "") + trimmed;
                }
                i++;
            }
            const annotation = detail
                ? `*Added in v${version}. ${detail}*`
                : `*Added in v${version}.*`;
            resultLines.push(annotation);
            continue;
        }

        // Convert RST inline markup
        let converted = convertRstInlineMarkup(line);

        // Expand Doxygen macros
        converted = expandDoxygenMacros(converted);

        // Convert RST numbered list items (#.) to markdown (1. 2. etc.)
        converted = converted.replace(/^(\s*)#\.\s/, (_, indent: string) => `${indent}1. `);

        resultLines.push(converted);
        i++;
    }

    // Clean up: remove leading/trailing blank lines
    while (resultLines.length > 0 && resultLines[0]!.trim() === "") {
        resultLines.shift();
    }
    while (resultLines.length > 0 && resultLines[resultLines.length - 1]!.trim() === "") {
        resultLines.pop();
    }

    // Join prose continuation lines into single paragraphs.
    // In RST, consecutive non-blank lines that are not structural elements
    // (not lists, not code blocks, not directives) form a single paragraph.
    const joinedProse: string[] = [];
    let inCodeBlock = false;
    for (let j = 0; j < resultLines.length; j++) {
        const l = resultLines[j]!;

        // Track code block boundaries
        if (l.startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            joinedProse.push(l);
            continue;
        }

        // Inside code blocks, preserve lines as-is
        if (inCodeBlock) {
            joinedProse.push(l);
            continue;
        }

        // Blank lines always preserved (paragraph boundary)
        if (l.trim() === "") {
            joinedProse.push(l);
            continue;
        }

        // Structural lines are not joinable: list items, headings, HTML/MDX tags, version annotations, code fences
        const isStructural = isStructuralLine(l);
        if (isStructural) {
            joinedProse.push(l);
            continue;
        }

        // Check if the previous line is a joinable prose line (non-blank, non-structural)
        if (joinedProse.length > 0) {
            const prev = joinedProse[joinedProse.length - 1]!;
            const prevIsBlank = prev.trim() === "";
            const prevIsStructural = isStructuralLine(prev);

            if (!prevIsBlank && !prevIsStructural) {
                // Join with previous line (prose continuation)
                joinedProse[joinedProse.length - 1] = prev + " " + l.trim();
                continue;
            }
        }

        joinedProse.push(l);
    }

    // Collapse double spaces in non-code prose lines
    let inCodeBlock2 = false;
    for (let j = 0; j < joinedProse.length; j++) {
        const l = joinedProse[j]!;
        if (l.startsWith("```")) {
            inCodeBlock2 = !inCodeBlock2;
            continue;
        }
        if (inCodeBlock2) {
            continue;
        }
        // Collapse multiple spaces to single (but preserve leading indentation)
        const leadingMatch = l.match(/^(\s*)/);
        const leading = leadingMatch ? leadingMatch[1]! : "";
        const rest = l.substring(leading.length);
        joinedProse[j] = leading + rest.replace(/  +/g, " ");
    }

    // Re-number ordered lists (RST uses #. for auto-numbering)
    return renumberOrderedLists(joinedProse.join("\n"));
}

const STRUCTURAL_LINE_RE = /^(\s*[-*]\s|\s*\d+\.\s|#{1,6}\s|<|>|\*Added in|\*Deprecated|```)/;
function isStructuralLine(line: string): boolean {
    return STRUCTURAL_LINE_RE.test(line);
}

/**
 * Convert RST inline markup to Markdown equivalents.
 */
function convertRstInlineMarkup(line: string): string {
    let result = line;

    // BUG 6: Convert RST subscript :sub:`text` to HTML <sub>text</sub>
    // Also handle the escaped space before :sub: (RST uses `\ ` to separate from preceding text)
    result = result.replace(/\\ :sub:`([^`]+)`/g, "<sub>$1</sub>");
    result = result.replace(/:sub:`([^`]+)`/g, "<sub>$1</sub>");

    // BUG 6: Convert RST superscript :sup:`text` to HTML <sup>text</sup>
    result = result.replace(/\\ :sup:`([^`]+)`/g, "<sup>$1</sup>");
    result = result.replace(/:sup:`([^`]+)`/g, "<sup>$1</sup>");

    // Convert :ref:`text <target>` to text (drop the reference, trim trailing spaces)
    result = result.replace(/:ref:`([^<`]+)\s*<[^>]+>`/g, (_, text: string) => text.trimEnd());
    // Convert :ref:`text` to text
    result = result.replace(/:ref:`([^`]+)`/g, "$1");

    // Convert :cpp:enumerator:`cub::NAME` to [`cub::NAME`](/library/api/cub::NAME)
    result = result.replace(/:cpp:enumerator:`([^`]+)`/g, (_, name: string) => {
        return `[\`${escapeLinkTextForMdx(name)}\`](${buildLinkPath(name)})`;
    });

    // Convert :cpp:class:`name` to [`name`](/library/api/name)
    result = result.replace(/:cpp:class:`([^`]+)`/g, (_, name: string) => {
        return `[\`${escapeLinkTextForMdx(name)}\`](${buildLinkPath(name)})`;
    });

    // Convert :cpp:func:`name` to [`name`](/library/api/name)
    result = result.replace(/:cpp:func:`([^`]+)`/g, (_, name: string) => {
        return `[\`${escapeLinkTextForMdx(name)}\`](${buildLinkPath(name)})`;
    });

    // Convert RST inline code ``code`` to markdown `code`
    result = result.replace(/``([^`]+)``/g, "`$1`");

    // Convert RST links `text <url>`_ to markdown [text](url)
    result = result.replace(/`([^<]+?)\s*<([^>]+)>`_/g, "[$1]($2)");

    return result;
}

/**
 * Expand Doxygen macros to their text equivalents.
 */
function expandDoxygenMacros(line: string): string {
    let result = line;

    // Expand known macros (can appear inline, e.g., "- @granularity")
    for (const [macro, expansion] of Object.entries(DOXYGEN_MACROS)) {
        if (result.includes(macro)) {
            result = result.replace(macro, expansion);
        }
    }

    // @blockcollective{Name} -> empty (strip, just a Doxygen grouping directive)
    result = result.replace(/@blockcollective\{[^}]*\}/g, "");

    // @warpcollective{Name} -> empty (strip, just a Doxygen grouping directive)
    result = result.replace(/@warpcollective\{[^}]*\}/g, "");

    // Remove any remaining unknown Doxygen macros that are standalone on a line
    // Only remove if it's a standalone macro (not part of a word or email)
    result = result.replace(/^\s*@\w+\s*$/gm, "");

    return result;
}

/**
 * Re-number ordered list items that use `1.` (from RST `#.` conversion).
 */
function renumberOrderedLists(text: string): string {
    const lines = text.split("\n");
    let counter = 0;
    let inOrderedList = false;
    let listIndent = -1;

    for (let i = 0; i < lines.length; i++) {
        const match = lines[i]!.match(/^(\s*)1\.\s/);
        if (match) {
            const indent = match[1]!.length;
            if (!inOrderedList || indent !== listIndent) {
                counter = 0;
                inOrderedList = true;
                listIndent = indent;
            }
            counter++;
            lines[i] = lines[i]!.replace(/^(\s*)1\./, `$1${counter}.`);
        } else if (inOrderedList && lines[i]!.trim() !== "" && !/^\s{2,}/.test(lines[i]!)) {
            // End of list
            inOrderedList = false;
            listIndent = -1;
        }
    }

    return lines.join("\n");
}

/**
 * Extract a version annotation from a verbatim RST block.
 * Looks for `.. versionadded::` directives.
 * Returns the formatted annotation string or undefined.
 *
 * IMPORTANT: Only extracts the versionadded directive and its indented continuation
 * text. Does NOT consume subsequent content (bullets, warnings, code examples, macros).
 * The continuation is identified by RST indentation rules: lines indented relative
 * to the directive are continuation; a non-indented non-empty line ends the directive.
 */
export function extractVersionAnnotation(blocks: CppDocBlock[]): string | undefined {
    for (const block of blocks) {
        if (block.type !== "verbatim") {
            continue;
        }
        const content = block.content;
        // Split into lines and strip comment prefixes
        const rawLines = content.split("\n");
        let foundVersion: string | undefined = undefined;
        const continuationLines: string[] = [];
        let collecting = false;

        for (const rawLine of rawLines) {
            // Strip //! or * prefix
            const stripped = rawLine.replace(/^\/\/!\s?/, "").replace(/^\*\s?/, "");

            if (!collecting) {
                // Look for .. versionadded:: directive
                const vMatch = stripped.match(/^\s*\.\.\s+versionadded::\s*(\S+)/);
                if (vMatch) {
                    foundVersion = vMatch[1]!.trim();
                    collecting = true;
                    // Check if there's continuation text on the same line after the version
                    const afterDirective = stripped.substring(stripped.indexOf(vMatch[0]) + vMatch[0].length).trim();
                    if (afterDirective) {
                        continuationLines.push(afterDirective);
                    }
                }
            } else {
                // Collecting continuation lines: must be indented (3+ spaces) or empty
                const trimmed = stripped.trim();
                if (trimmed === "") {
                    // Empty line -- may be followed by more continuation or may end directive
                    continue;
                }
                // Check if indented (RST continuation is typically indented 3+ spaces)
                if (/^\s{3,}/.test(stripped)) {
                    continuationLines.push(trimmed);
                } else {
                    // Non-indented non-empty line -- end of versionadded directive
                    break;
                }
            }
        }

        if (foundVersion) {
            const detail = continuationLines.join(" ").trim();
            if (detail) {
                return `*Added in v${foundVersion}. ${detail}*`;
            }
            // BUG 26 fix: A bare versionadded directive without continuation text
            // (e.g., just ".. versionadded:: 2.2.0" with no detail like
            // "First appears in CUDA Toolkit 12.3.") is typically a class-level
            // library version marker inherited by all methods, not a method-specific
            // annotation. The golden pages omit these bare annotations.
            // Only emit version annotations that have meaningful continuation text.
            return undefined;
        }
    }
    return undefined;
}

// ---------------------------------------------------------------------------
// Method-level verbatim RST structured extraction
// ---------------------------------------------------------------------------

/**
 * Result of parsing a method-level verbatim RST block into structured MDX components.
 */
export interface ParsedMethodVerbatim {
    /** Summary text (first paragraph(s) before versionadded or bullet list) */
    descriptionText: string;
    /** Warning items (e.g., "The return value is undefined...") */
    warningItems: string[];
    /** Note items (e.g., expanded macros like @rowmajor, @smemreuse) */
    noteItems: string[];
    /** Example description text (e.g., "The code snippet below illustrates...") */
    exampleDescription: string | undefined;
    /** Example code block content */
    exampleCode: string | undefined;
    /** Example code block language */
    exampleLanguage: string | undefined;
}

/**
 * Check if a bullet item text (after macro expansion) is an "explicit warning" item.
 * Warning items describe undefined return values or output.
 */
function isExplicitWarningBulletItem(text: string): boolean {
    return /return value is undefined/i.test(text) ||
           /output is undefined/i.test(text) ||
           /should not be relied upon/i.test(text);
}

/**
 * Check if a bullet item text (after macro expansion) is the smemreuse/smemwarpreuse
 * expansion about temp_storage being undefined.
 * This content is classified as Warning when no other explicit warning exists,
 * otherwise it goes into Note.
 */
function isSmemReuseContent(text: string): boolean {
    return /`temp_storage`\s+is undefined/i.test(text) ||
           /temp_storage.*is undefined after calling/i.test(text);
}

/**
 * Parse a method-level verbatim RST block into structured components
 * for rendering as MDX with Warning/Note callouts and Example sections.
 *
 * This handles the CUB pattern where method docstrings store all content
 * (summary, warnings, notes, examples) inside a single verbatim RST block
 * with empty structured fields (notes: [], warnings: [], examples: []).
 *
 * Note: convertVerbatimRst() already expands Doxygen macros via
 * convertRstLinesToMarkdown -> expandDoxygenMacros. So the overviewContent
 * we receive has macros already expanded into their full text.
 * We classify bullet items by their content (not macro names).
 */
export function parseMethodVerbatimRst(content: string): ParsedMethodVerbatim {
    const parsed = convertVerbatimRst(content);

    const result: ParsedMethodVerbatim = {
        descriptionText: "",
        warningItems: [],
        noteItems: [],
        exampleDescription: parsed.exampleDescription ? reflowParagraphs(parsed.exampleDescription) : undefined,
        exampleCode: parsed.exampleCode,
        exampleLanguage: parsed.exampleLanguage
    };

    // Parse the overview content to separate summary from bullet list items.
    // The overviewContent already has macros expanded and RST converted to MD.
    const overviewText = parsed.overviewContent;

    // Split into lines and classify
    const lines = overviewText.split("\n");
    const summaryLines: string[] = [];
    const bulletItems: string[] = [];
    let inBulletList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        // Detect bullet list items (- prefix)
        if (/^\s*- /.test(line)) {
            inBulletList = true;
            // Extract the text after "- "
            const itemText = line.replace(/^\s*- /, "").trim();
            bulletItems.push(itemText);
            continue;
        }

        // Continuation lines of bullet items (indented under a bullet)
        if (inBulletList && /^\s{2,}/.test(line) && line.trim() !== "") {
            // Append to last bullet item
            if (bulletItems.length > 0) {
                bulletItems[bulletItems.length - 1] += " " + line.trim();
            }
            continue;
        }

        // If we were in a bullet list and hit a non-indented non-bullet line, end the list
        if (inBulletList && line.trim() !== "") {
            inBulletList = false;
        }

        // Skip version annotations (they're extracted separately by extractVersionAnnotation)
        if (/^\*Added in v[\d.]+\..*?\*$/.test(line)) {
            continue;
        }

        // Empty lines
        if (line.trim() === "") {
            if (!inBulletList) {
                summaryLines.push(line);
            }
            continue;
        }

        if (!inBulletList) {
            summaryLines.push(line);
        }
    }

    // Reflow paragraphs and then extract any standalone smemreuse paragraphs
    // from the summary text. Standalone macros like @smemwarpreuse expand to
    // a full paragraph that should be a Warning/Note, not description text.
    const reflowed = reflowParagraphs(summaryLines.join("\n")).trim();
    const paragraphs = reflowed.split(/\n\n+/);
    const descParagraphs: string[] = [];
    const standaloneMacroItems: string[] = [];

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) {
            continue;
        }
        if (isSmemReuseContent(trimmed)) {
            standaloneMacroItems.push(trimmed);
        } else {
            descParagraphs.push(trimmed);
        }
    }

    result.descriptionText = descParagraphs.join("\n\n");

    // Combine bullet items and standalone macro paragraphs for classification
    const allItems: string[] = [
        ...bulletItems.filter(item => item.trim().length > 0),
        ...standaloneMacroItems
    ];

    // Determine if there are any "explicit warning" items (e.g., "return value is undefined")
    const hasExplicitWarning = allItems.some(
        b => !isSmemReuseContent(b) && isExplicitWarningBulletItem(b)
    );

    // Classify items into warnings and notes:
    // - Explicit warning items (return value undefined etc.) -> always Warning
    // - smemreuse content (temp_storage undefined): Warning if no other explicit warning, Note otherwise
    // - Everything else -> Note
    for (const itemText of allItems) {
        if (isSmemReuseContent(itemText)) {
            if (hasExplicitWarning) {
                result.noteItems.push(itemText);
            } else {
                result.warningItems.push(itemText);
            }
        } else if (isExplicitWarningBulletItem(itemText)) {
            result.warningItems.push(itemText);
        } else {
            result.noteItems.push(itemText);
        }
    }

    return result;
}

/**
 * Reflow multi-line paragraphs into single lines.
 * A paragraph is a group of consecutive non-empty lines separated by blank lines.
 * Within a paragraph, lines are joined with a single space.
 */
function reflowParagraphs(text: string): string {
    return text.split(/\n\n+/).map(para => para.replace(/\n/g, " ").trim()).filter(Boolean).join("\n\n");
}

/**
 * Check if the description blocks for a method contain a verbatim RST block.
 * Returns the verbatim block's content string if found, or undefined.
 */
export function findVerbatimRstBlock(blocks: CppDocBlock[]): string | undefined {
    for (const block of blocks) {
        if (block.type === "verbatim" && (block.format === "rst" || block.content.startsWith("embed:rst"))) {
            return block.content;
        }
    }
    return undefined;
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
 * Render a single doc block to MDX lines.
 */
export function renderBlock(block: CppDocBlock): string {
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
            return [
                `\`\`\`${lang} showLineNumbers={false}`,
                block.code,
                "```"
            ].join("\n");
        }
        case "verbatim": {
            // Convert RST verbatim blocks to Markdown
            if (block.format === "rst" || block.content.startsWith("embed:rst")) {
                const parsed = convertVerbatimRst(block.content);
                // Strip version annotations from overview -- they're extracted separately
                let content = parsed.overviewContent;
                content = content.replace(/^\*Added in v[\d.]+\..*?\*$/gm, "").trim();
                return content;
            }
            return block.content;
        }
        case "list": {
            return renderList(block.ordered, block.items);
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
                lines.push(`**${block.title}**`);
                lines.push("");
            }
            for (const subBlock of block.blocks) {
                const rendered = renderBlock(subBlock);
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
function renderList(ordered: boolean, items: CppDocBlock[][]): string {
    const lines: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const itemBlocks = items[i];
        if (!itemBlocks || itemBlocks.length === 0) {
            continue;
        }
        const prefix = ordered ? `${i + 1}.` : "-";
        const firstBlock = renderBlock(itemBlocks[0]!);
        lines.push(`${prefix} ${firstBlock}`);

        // Remaining blocks in the item get indented
        for (let j = 1; j < itemBlocks.length; j++) {
            const rendered = renderBlock(itemBlocks[j]!);
            if (rendered) {
                const indented = rendered.split("\n").map(line => `   ${line}`).join("\n");
                lines.push(indented);
            }
        }
    }
    return lines.join("\n");
}

/**
 * Render the description blocks of a docstring to MDX paragraphs.
 * Filters out empty/whitespace-only paragraphs.
 */
export function renderDescriptionBlocks(blocks: CppDocBlock[]): string {
    const parts: string[] = [];
    for (const block of blocks) {
        const rendered = renderBlock(block);
        if (rendered && rendered.trim()) {
            parts.push(rendered);
        }
    }
    return parts.join("\n\n");
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
    return typeInfo.parts.map(p => typeof p === "string" ? p : p.text).join("");
}

/**
 * Render CppTypeInfo parts for a table cell, with links where available.
 * Returns MDX string with links for type refs that have resolved paths.
 */
export function renderTypeInfoForTable(
    typeInfo: CppTypeInfo | undefined,
    ownerPath: string
): string {
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
        return `[\`${escapeLinkTextForMdx(display)}\`](${linkPath})`;
    }

    return `\`${display}\``;
}
