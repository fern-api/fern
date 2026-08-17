/**
 * Renders pages for Doxygen groups (the "Modules" of Doxygen's own HTML output).
 *
 * Groups are authored in the source comments with `@defgroup` / `@ingroup` /
 * `@addtogroup` and describe how the library's author organizes the API. They
 * are rendered as index pages that link to the per-symbol pages produced from
 * the namespace tree, so a symbol's documentation lives in exactly one place.
 *
 * Two page types are produced:
 * 1. Group page — the group's docs plus links to its members and subgroups
 * 2. Groups index — a bulleted list of the top-level groups
 */

import type { CppFunctionIr, CppGroupIr } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, stripTemplateArgs } from "../context.js";
import {
    renderDescriptionBlocksDeduped,
    renderSegmentsPlainText,
    renderSegmentsTrimmed
} from "./DescriptionRenderer.js";
import { renderFrontmatter, trimTrailingBlankLines } from "./shared.js";

export interface GroupMemberEntry {
    displayName: string;
    linkPath: string | undefined;
}

export interface GroupSection {
    heading: string;
    entries: GroupMemberEntry[];
}

export interface GroupListEntry {
    displayName: string;
    linkPath: string;
}

/**
 * Whether a member can be listed on a group page.
 *
 * Doxygen emits anonymous members (an unnamed `enum`, for example) with an
 * empty path; they have no page and nothing to display.
 */
function isNamedMember(member: { path: string }): boolean {
    return member.path.trim().length > 0;
}

function collectEntries<T extends { path: string }>(items: T[]): GroupMemberEntry[] {
    return items
        .filter(isNamedMember)
        .map((item) => ({ displayName: item.path, linkPath: buildLinkPath(item.path) }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function collectFunctionEntries(functions: CppFunctionIr[]): GroupMemberEntry[] {
    // Deduplicate by path — overloads share one page
    const seen = new Set<string>();
    const entries: GroupMemberEntry[] = [];
    for (const func of functions) {
        if (!isNamedMember(func)) {
            continue;
        }
        const stripped = stripTemplateArgs(func.path);
        if (seen.has(stripped)) {
            continue;
        }
        seen.add(stripped);
        entries.push({ displayName: func.path, linkPath: buildLinkPath(stripped) });
    }
    return entries.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Collect a group's inlined members into rendered sections, skipping empty ones.
 *
 * Must be called with the group's page as the current page (see
 * `setCurrentPageSlugPath`) so that member links resolve to relative paths.
 */
export function collectGroupSections(group: CppGroupIr): GroupSection[] {
    const classes = group.classes ?? [];
    const sections: GroupSection[] = [
        { heading: "Classes", entries: collectEntries(classes.filter((cls) => cls.kind !== "struct")) },
        { heading: "Structs", entries: collectEntries(classes.filter((cls) => cls.kind === "struct")) },
        { heading: "Functions", entries: collectFunctionEntries(group.functions ?? []) },
        { heading: "Enumerations", entries: collectEntries(group.enums ?? []) },
        { heading: "Type Definitions", entries: collectEntries(group.typedefs ?? []) },
        { heading: "Variables", entries: collectEntries(group.variables ?? []) }
    ];
    return sections.filter((section) => section.entries.length > 0);
}

/**
 * Whether a group (or any of its subgroups) has anything to render.
 *
 * A group tree that references one of its ancestors would otherwise recurse
 * forever, so already-visited groups are treated as having no content.
 */
export function groupHasContent(group: CppGroupIr, visited: Set<string> = new Set()): boolean {
    if (visited.has(group.id)) {
        return false;
    }
    visited.add(group.id);
    const hasMembers = [group.classes, group.functions, group.enums, group.typedefs, group.variables].some(
        (members) => members != null && members.some(isNamedMember)
    );
    return hasMembers || group.subgroups.some((subgroup) => groupHasContent(subgroup, visited));
}

function renderEntries(entries: GroupMemberEntry[], lines: string[]): void {
    for (const entry of entries) {
        if (entry.linkPath) {
            lines.push(`- [\`${entry.displayName}\`](${entry.linkPath})`);
        } else {
            lines.push(`- \`${entry.displayName}\``);
        }
    }
}

/**
 * Render a single group page.
 *
 * @param group - The group to render
 * @param sections - Pre-computed non-empty member sections
 * @param subgroupEntries - Pre-computed links to nested groups
 */
export function renderGroupPage(
    group: CppGroupIr,
    sections: GroupSection[],
    subgroupEntries: GroupListEntry[]
): string {
    const lines: string[] = [];
    const docstring = group.docstring;

    const title = group.title || group.name;
    const summaryText = docstring ? renderSegmentsPlainText(docstring.summary) : "";
    const description = summaryText.length > 0 ? summaryText : `Members of the ${title} group.`;
    lines.push(...renderFrontmatter(title, description));

    if (docstring?.summary && docstring.summary.length > 0) {
        const summary = renderSegmentsTrimmed(docstring.summary);
        if (summary) {
            lines.push("", summary);
        }
    }

    if (docstring?.description && docstring.description.length > 0) {
        const desc = renderDescriptionBlocksDeduped(docstring.description, docstring.summary);
        if (desc) {
            lines.push("", desc);
        }
    }

    for (const section of sections) {
        lines.push("", `## ${section.heading}`, "");
        renderEntries(section.entries, lines);
    }

    if (subgroupEntries.length > 0) {
        lines.push("", "## Subgroups", "");
        for (const entry of subgroupEntries) {
            lines.push(`- [${entry.displayName}](${entry.linkPath})`);
        }
    }

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}

/**
 * Render the groups/index.mdx page listing the top-level groups.
 */
export function renderGroupsIndexPage(entries: GroupListEntry[], libraryTitle: string): string {
    const lines: string[] = [];

    const library = libraryTitle.trim();
    const title = library.length > 0 ? `${library} — Groups` : "Groups";
    const description =
        library.length > 0 ? `Documentation groups in ${library}.` : "Documentation groups in this library.";
    lines.push(...renderFrontmatter(title, description));
    lines.push("");

    for (const entry of entries) {
        lines.push(`- [${entry.displayName}](${entry.linkPath})`);
    }

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}
