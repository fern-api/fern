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
import { buildLinkPath, getShortName } from "../context.js";

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
                // Try to decode the refid to get the fully-qualified name
                const qualifiedName = decodeDoxygenRefid(segment.refid) ?? codeText;

                // BUG 30: If the resolved name matches the current page, render as plain code
                if (currentPagePath && qualifiedName === currentPagePath) {
                    return `\`${codeText}\`${possessiveSuffix}`;
                }

                const linkPath = buildLinkPath(qualifiedName);
                return `[\`${codeText}\`](${linkPath})${possessiveSuffix}`;
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
                    return `[\`${codeText}\`](${linkPath})${possessiveSuffix}`;
                }
            }
            // Fallback: render as inline code
            return `\`${codeText}\`${possessiveSuffix}`;
        }
        case "ref": {
            // ref has text + refid + kindref
            // For compound refs, resolve to a link using the fully-qualified name
            if (segment.kindref === "compound") {
                const qualifiedName = decodeDoxygenRefid(segment.refid) ?? segment.text.trim();
                const linkPath = buildLinkPath(qualifiedName);
                return `[${segment.text.trim()}](${linkPath})`;
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
                    return `[${segment.text.trim()}](${linkPath})`;
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
 * Render an array of inline segments to a single MDX string.
 */
export function renderSegments(segments: CppDocSegment[]): string {
    return segments.map(renderSegment).join("");
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
 * Known Doxygen macros that should be expanded or removed.
 */
const DOXYGEN_MACROS: Record<string, string> = {
    "@rowmajor": "Threads are assumed to be in row-major order.",
    "@granularity": "Performance is sensitive to the degree of data movement across the block.",
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
        exampleTitle: undefined,
        exampleDescription: undefined,
        exampleCode: undefined,
        exampleLanguage: undefined,
        versionAnnotation: undefined,
        otherSections: []
    };

    for (const section of sections) {
        const md = convertRstLinesToMarkdown(section.lines);

        if (!section.title) {
            // This is the overview/intro section
            result.overviewContent = md;
        } else if (/performance/i.test(section.title)) {
            result.performanceContent = md;
        } else if (/example/i.test(section.title) || /a simple example/i.test(section.title)) {
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
    exampleTitle: string | undefined;
    exampleDescription: string | undefined;
    exampleCode: string | undefined;
    exampleLanguage: string | undefined;
    versionAnnotation: string | undefined;
    otherSections: Array<{ title: string; content: string }>;
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

        // Skip @blockcollective{Name} macros
        if (/^@blockcollective\{.*\}/.test(line.trim())) {
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

    // Re-number ordered lists (RST uses #. for auto-numbering)
    return renumberOrderedLists(resultLines.join("\n"));
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

    // Convert :ref:`text <target>` to text (drop the reference)
    result = result.replace(/:ref:`([^<`]+)\s*<[^>]+>`/g, "$1");
    // Convert :ref:`text` to text
    result = result.replace(/:ref:`([^`]+)`/g, "$1");

    // Convert :cpp:enumerator:`cub::NAME` to [`cub::NAME`](/library/api/cub::NAME)
    result = result.replace(/:cpp:enumerator:`([^`]+)`/g, (_, name: string) => {
        return `[\`${name}\`](${buildLinkPath(name)})`;
    });

    // Convert :cpp:class:`name` to [`name`](/library/api/name)
    result = result.replace(/:cpp:class:`([^`]+)`/g, (_, name: string) => {
        return `[\`${name}\`](${buildLinkPath(name)})`;
    });

    // Convert :cpp:func:`name` to [`name`](/library/api/name)
    result = result.replace(/:cpp:func:`([^`]+)`/g, (_, name: string) => {
        return `[\`${name}\`](${buildLinkPath(name)})`;
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

    // @blockcollective{Name} -> empty (skip)
    result = result.replace(/@blockcollective\{[^}]*\}/g, "");

    // @smemwarpreuse and other unknown Doxygen macros at start of line -> remove
    // Only remove if it's a standalone macro (not part of a word or email)
    result = result.replace(/^\s*@\w+\s*$/gm, "");
    // Also handle inline macros that remain after known macro expansion
    result = result.replace(/@smemwarpreuse/g, "");

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
        return `[\`${display}\`](${linkPath})`;
    }

    return `\`${display}\``;
}
