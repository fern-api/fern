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
export type LibrarySymbolRenderer = (reference: LibrarySymbolReference) => Promise<string>;

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
// Regions where a tag is documentation, not a live component: fenced code, inline code, MDX comments.
const INERT_REGION_REGEX =
    /(^|\n)[ \t]*(`{3,}|~{3,})[\s\S]*?(?:\n[ \t]*\2[ \t]*(?=\n|$)|$)|`[^`\n]*`|\{\/\*[\s\S]*?\*\/\}/g;

function findInertRegions(markdown: string): Array<[start: number, end: number]> {
    const regions: Array<[number, number]> = [];
    INERT_REGION_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = INERT_REGION_REGEX.exec(markdown)) != null) {
        regions.push([match.index, match.index + match[0].length]);
    }
    return regions;
}

function isInert(regions: Array<[start: number, end: number]>, index: number): boolean {
    return regions.some(([start, end]) => index >= start && index < end);
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
    const memberList =
        members != null
            ? members
                  .split(",")
                  .map((m) => m.trim())
                  .filter((m) => m !== "")
            : undefined;
    if (memberList != null && memberList.length === 0) {
        throw new Error("Attribute 'members' must list at least one member name");
    }
    return { library, name, heading: headingLevel, members: memberList };
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
    const chunks: string[] = [];
    let cursor = 0;
    TAG_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TAG_REGEX.exec(markdown)) != null) {
        if (isInert(inertRegions, match.index)) {
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

        let rendered: string;
        try {
            rendered = await renderSymbol(reference);
        } catch (e) {
            throw new CliError({
                message: `${location} <LibrarySymbol library="${reference.library}" name="${reference.name}" />: ${errorMessage(e)}`,
                code: CliError.Code.ConfigError
            });
        }

        const replacement = rendered
            .split("\n")
            .map((l) => (l === "" ? l : indent + l))
            .join("\n");
        chunks.push(markdown.slice(cursor, match.index), replacement);
        cursor = match.index + matchString.length;
    }
    chunks.push(markdown.slice(cursor));

    return chunks.join("");
}
