import { assertNever } from "@fern-api/core-utils";
import { FernNavigation } from "@fern-api/fdr-sdk";

export interface EndpointIndexRow {
    title: string;
    slug: FernNavigation.V1.Slug;
    method: string;
    path: string;
    description: string | undefined;
    availability: FernNavigation.V1.NavigationV1Availability | undefined;
}

export interface EndpointIndexGroup {
    title: string;
    slug: FernNavigation.V1.Slug;
    rows: EndpointIndexRow[];
    subgroups: EndpointIndexGroup[];
}

const MAX_DESCRIPTION_LENGTH = 200;
const MAX_HEADING_LEVEL = 6;

export function countEndpointIndexRows(group: EndpointIndexGroup): number {
    return group.subgroups.reduce((count, subgroup) => count + countEndpointIndexRows(subgroup), group.rows.length);
}

/**
 * Renders the body of the "All Endpoints" page: endpoints at the root of the API reference first,
 * followed by one heading per section.
 */
export function renderAllEndpointsMarkdown(root: EndpointIndexGroup): string {
    const blocks: string[] = [];
    if (root.rows.length > 0) {
        blocks.push(renderEndpointTable(root.rows));
    }
    for (const subgroup of root.subgroups) {
        blocks.push(...renderGroup(subgroup, 2));
    }
    return blocks.join("\n\n");
}

/**
 * Renders the "Endpoints" list appended to (or used as) a section's summary page.
 */
export function renderSectionEndpointsMarkdown(group: EndpointIndexGroup): string {
    const blocks: string[] = ["## Endpoints"];
    if (group.rows.length > 0) {
        blocks.push(renderEndpointTable(group.rows));
    }
    for (const subgroup of group.subgroups) {
        blocks.push(...renderGroup(subgroup, 3));
    }
    return blocks.join("\n\n");
}

function renderGroup(group: EndpointIndexGroup, headingLevel: number): string[] {
    if (countEndpointIndexRows(group) === 0) {
        return [];
    }
    const blocks: string[] = [
        `${"#".repeat(Math.min(headingLevel, MAX_HEADING_LEVEL))} [${escapeMarkdownText(group.title)}](${toHref(group.slug)})`
    ];
    if (group.rows.length > 0) {
        blocks.push(renderEndpointTable(group.rows));
    }
    for (const subgroup of group.subgroups) {
        blocks.push(...renderGroup(subgroup, headingLevel + 1));
    }
    return blocks;
}

function renderEndpointTable(rows: EndpointIndexRow[]): string {
    const lines = ["| Endpoint | Method | Path | Description |", "| --- | --- | --- | --- |"];
    for (const row of rows) {
        const label = getAvailabilityLabel(row.availability);
        const title = `[${escapeMarkdownText(row.title)}](${toHref(row.slug)})${label != null ? ` *(${label})*` : ""}`;
        const description = row.description != null ? getFirstSentence(row.description) : "";
        lines.push(`| ${title} | ${toCodeSpan(row.method)} | ${toCodeSpan(row.path)} | ${description} |`);
    }
    return lines.join("\n");
}

function toHref(slug: FernNavigation.V1.Slug): string {
    return `/${slug}`.replace(
        /[\s()<>[\]`|]/g,
        (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`
    );
}

/** Wraps text in a code span whose fence is longer than any backtick run inside it, with `|` escaped for GFM tables. */
function toCodeSpan(text: string): string {
    const longestBacktickRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
    const fence = "`".repeat(longestBacktickRun + 1);
    const padding = longestBacktickRun > 0 ? " " : "";
    return `${fence}${padding}${text.replace(/\|/g, "\\|")}${padding}${fence}`;
}

export function getAvailabilityLabel(
    availability: FernNavigation.V1.NavigationV1Availability | undefined
): string | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case "stable":
        case "generally-available":
            return undefined;
        case "alpha":
            return "Alpha";
        case "beta":
            return "Beta";
        case "preview":
            return "Preview";
        case "pre-release":
            return "Pre-release";
        case "in-development":
            return "In development";
        case "deprecated":
            return "Deprecated";
        case "legacy":
            return "Legacy";
        default:
            assertNever(availability);
    }
}

/**
 * Returns the first sentence of the first paragraph of a markdown description, flattened to a
 * single line and escaped so it can sit inside a markdown table cell.
 */
export function getFirstSentence(description: string): string {
    const paragraph =
        description
            .split(/\n\s*\n/)
            .map((block) => block.trim())
            .find((block) => block.length > 0 && !block.startsWith("```") && !block.startsWith("#")) ?? "";
    const flattened = paragraph
        .replace(/<[^>]*>/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
    const sentence = /^(.*?[.!?])(?=\s+[A-Z0-9"'(`[]|\s*$)/.exec(flattened)?.[1] ?? flattened;
    return escapeMarkdownText(truncate(sentence, MAX_DESCRIPTION_LENGTH));
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Escapes text for a markdown table cell or link label, so it can't break the table, the link, or
 * MDX parsing. Inline code spans are kept literal, apart from `|`, which GFM tables require to be
 * escaped even inside code.
 */
function escapeMarkdownText(text: string): string {
    return text
        .split(/(`[^`]*`)/)
        .map((segment, index) => {
            if (index % 2 === 1) {
                return segment.replace(/\|/g, "\\|");
            }
            return segment
                .replace(/([|[\]{}])/g, "\\$1")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        })
        .join("");
}
