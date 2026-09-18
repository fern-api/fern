import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, type TaskContext } from "@fern-api/task-context";

/**
 * Parsed `<LibrarySymbol ... />` attributes, after validation.
 */
export interface LibrarySymbolReference {
    library: string;
    name: string;
    heading: number | undefined;
    members: string[] | undefined;
}

/**
 * Renders a library symbol to MDX. Implemented by `@fern-api/library-docs-generator`
 * (see `createLibrarySymbolRenderer`); injected here so this package stays free of
 * language-specific rendering code. Any error thrown is surfaced to the author with
 * the file and line of the offending tag.
 */
export interface RenderedLibrarySymbolMdx {
    mdx: string;
    /** Every anchor id emitted in `mdx` (symbol and members); used to detect collisions on one page. */
    anchorIds: string[];
}

/**
 * `absolutePathToMarkdownFile` is the authored page containing the tag, so the renderer can
 * resolve `library` against the docs.yml that owns that page (e.g. a git-ref-backed version).
 */
export type LibrarySymbolRenderer = (
    reference: LibrarySymbolReference,
    absolutePathToMarkdownFile: AbsoluteFilePath
) => Promise<RenderedLibrarySymbolMdx>;

/**
 * Shared across all pages of a docs build to detect a symbol authored into more than
 * one page (which produces duplicate anchors and duplicate content).
 */
export type LibrarySymbolUsageTracker = Map<string, AbsoluteFilePath>;

export function createLibrarySymbolUsageTracker(): LibrarySymbolUsageTracker {
    return new Map();
}

// Attribute values may contain `>` (e.g. C++ template names), so match up to the closing `/>`
// rather than stopping at the first `>`.
const TAG_REGEX = /([ \t]*)<LibrarySymbol\b([\s\S]*?)\/>/g;
// name="..." | name='...' | name={"..."} | name={'...'} | name={...}
const ATTRIBUTE_REGEX = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|([^}]*))\s*\})/g;
const TAG_NAME = "<LibrarySymbol";
const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set(["library", "name", "heading", "members"]);
type Region = [start: number, end: number];

const FENCE_REGEX = /^[ \t]*(`{3,}|~{3,})/;
const CODE_SPAN_REGEX = /(`+)(?!`)[\s\S]*?[^`]\1(?!`)/g;
const MDX_COMMENT_REGEX = /\{\/\*[\s\S]*?\*\/\}/g;

/**
 * Regions where a tag is documentation rather than a live component: fenced code blocks
 * (closed by a fence of the same character at least as long as the opener, or EOF),
 * inline code spans of any backtick length, and MDX block comments.
 */
function findInertRegions(markdown: string): Region[] {
    const regions: Region[] = [];

    let offset = 0;
    let openFence: { marker: string; start: number } | undefined;
    for (const line of markdown.split("\n")) {
        const fence = FENCE_REGEX.exec(line)?.[1];
        if (openFence == null) {
            if (fence != null) {
                openFence = { marker: fence, start: offset };
            }
        } else if (
            fence != null &&
            fence[0] === openFence.marker[0] &&
            fence.length >= openFence.marker.length &&
            line.trim() === fence
        ) {
            regions.push([openFence.start, offset + line.length]);
            openFence = undefined;
        }
        offset += line.length + 1;
    }
    if (openFence != null) {
        regions.push([openFence.start, markdown.length]);
    }

    for (const regex of [CODE_SPAN_REGEX, MDX_COMMENT_REGEX]) {
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(markdown)) != null) {
            if (!isInert(regions, match.index)) {
                regions.push([match.index, match.index + match[0].length]);
            }
        }
    }
    return regions;
}

function isInert(regions: Region[], index: number): boolean {
    return inertRegionEnd(regions, index) != null;
}

function inertRegionEnd(regions: Region[], index: number): number | undefined {
    return regions.find(([start, end]) => index >= start && index < end)?.[1];
}

function extractAttributes(attributesString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    ATTRIBUTE_REGEX.lastIndex = 0;
    let lastEnd = 0;
    let match: RegExpExecArray | null;
    while ((match = ATTRIBUTE_REGEX.exec(attributesString)) != null) {
        const skipped = attributesString.slice(lastEnd, match.index).trim();
        if (skipped !== "") {
            throw new Error(`Could not parse attributes near '${skipped}'`);
        }
        lastEnd = match.index + match[0].length;
        const attrName = match[1];
        const attrValue = match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6];
        if (attrName != null && attrValue != null) {
            if (!ALLOWED_ATTRIBUTES.has(attrName)) {
                throw new Error(
                    `Unknown attribute '${attrName}'. Supported attributes: ${[...ALLOWED_ATTRIBUTES].join(", ")}`
                );
            }
            if (attrName in attributes) {
                throw new Error(`Duplicate attribute '${attrName}'`);
            }
            attributes[attrName] = attrValue.trim();
        }
    }
    const trailing = attributesString.slice(lastEnd).trim();
    if (trailing !== "") {
        throw new Error(`Could not parse attributes near '${trailing}'`);
    }
    return attributes;
}

function getLineNumber(source: string, index: number): number {
    return source.slice(0, index).split("\n").length;
}

function parseReference(attributes: Record<string, string>): LibrarySymbolReference {
    const { library, name, heading, members } = attributes;
    if (library == null || library === "") {
        throw new Error("Missing required attribute 'library'");
    }
    if (name == null || name === "") {
        throw new Error("Missing required attribute 'name'");
    }
    let headingLevel: number | undefined;
    if (heading != null) {
        headingLevel = Number(heading);
        if (!Number.isInteger(headingLevel) || headingLevel < 1 || headingLevel > 6) {
            throw new Error(`Attribute 'heading' must be an integer between 1 and 6, got '${heading}'`);
        }
    }
    const memberList = members != null ? parseMemberList(members) : undefined;
    if (memberList != null && memberList.length === 0) {
        throw new Error("Attribute 'members' must list at least one member name");
    }
    return { library, name, heading: headingLevel, members: memberList };
}

// Accepts `members="a, b"` and the JSX array form `members={["a", "b"]}`.
function parseMemberList(raw: string): string[] {
    const inner = raw.trim().replace(/^\[([\s\S]*)\]$/, "$1");
    return inner
        .split(",")
        .map((m) => m.trim().replace(/^(["'])(.*)\1$/, "$2").trim())
        .filter((m) => m !== "");
}

function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

/**
 * Replace every `<LibrarySymbol library="..." name="..." [heading={n}] [members="a,b"] />`
 * in `markdown` with the rendered MDX for that symbol.
 *
 * Runs at docs build time (same stage as `<Markdown src>`), reading from the IR persisted
 * by `fern docs md generate`. Unknown libraries/symbols fail the build with a `file:line`
 * pointer to the tag; a symbol included from more than one page logs a warning.
 */
export async function replaceLibrarySymbols({
    markdown,
    absolutePathToMarkdownFile,
    context,
    renderSymbol,
    usageTracker
}: {
    markdown: string;
    absolutePathToMarkdownFile: AbsoluteFilePath;
    context: TaskContext;
    renderSymbol: LibrarySymbolRenderer;
    usageTracker?: LibrarySymbolUsageTracker;
}): Promise<string> {
    if (!markdown.includes(TAG_NAME)) {
        return markdown;
    }

    const inertRegions = findInertRegions(markdown);
    const anchorsOnPage = new Map<string, { tag: string; line: number }>();
    const chunks: string[] = [];
    let cursor = 0;
    TAG_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TAG_REGEX.exec(markdown)) != null) {
        const inertEnd = inertRegionEnd(inertRegions, match.index);
        if (inertEnd != null) {
            // An unclosed opener inside code/comments must not swallow the next live tag's `/>`.
            TAG_REGEX.lastIndex = inertEnd;
            continue;
        }
        const matchString = match[0];
        const indent = match[1] ?? "";
        const attributesString = match[2] ?? "";
        const line = getLineNumber(markdown, match.index);
        const location = `[${absolutePathToMarkdownFile}:${line}]`;

        let reference: LibrarySymbolReference;
        try {
            reference = parseReference(extractAttributes(attributesString));
        } catch (e) {
            throw new CliError({
                message: `${location} Invalid <LibrarySymbol />: ${errorMessage(e)}`,
                code: CliError.Code.ConfigError
            });
        }

        if (usageTracker != null) {
            const usageKey = `${reference.library}:${reference.name}`;
            const previousFile = usageTracker.get(usageKey);
            if (previousFile != null) {
                const where =
                    previousFile === absolutePathToMarkdownFile ? "earlier in this page" : `in ${previousFile}`;
                context.logger.warn(
                    `${location} Symbol '${reference.name}' from library '${reference.library}' is also included ${where}. ` +
                        "Including a symbol more than once duplicates its anchor and content."
                );
            } else {
                usageTracker.set(usageKey, absolutePathToMarkdownFile);
            }
        }

        let rendered: RenderedLibrarySymbolMdx;
        try {
            rendered = await renderSymbol(reference, absolutePathToMarkdownFile);
        } catch (e) {
            throw new CliError({
                message: `${location} <LibrarySymbol library="${reference.library}" name="${reference.name}" />: ${errorMessage(e)}`,
                code: CliError.Code.ConfigError
            });
        }

        const tag = `<LibrarySymbol library="${reference.library}" name="${reference.name}" />`;
        for (const anchorId of rendered.anchorIds) {
            const previous = anchorsOnPage.get(anchorId);
            if (previous != null) {
                const hint =
                    previous.tag === tag
                        ? "Include each symbol at most once per page."
                        : "Narrow the class with 'members', or move one of the symbols to a different page so fragment links stay unambiguous.";
                throw new CliError({
                    message:
                        `${location} ${tag} emits anchor '#${anchorId}', which is already used by ` +
                        `${previous.tag} (line ${previous.line}) on this page. ${hint}`,
                    code: CliError.Code.ConfigError
                });
            }
            anchorsOnPage.set(anchorId, { tag, line });
        }

        const replacement = rendered.mdx
            .split("\n")
            .map((l) => (l === "" ? l : indent + l))
            .join("\n");
        chunks.push(markdown.slice(cursor, match.index), replacement);
        cursor = match.index + matchString.length;
    }
    chunks.push(markdown.slice(cursor));

    return chunks.join("");
}
