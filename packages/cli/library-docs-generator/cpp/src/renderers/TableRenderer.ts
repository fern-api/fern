/**
 * Renders tables for C++ class pages:
 * - Typedef tables (2-column or 3-column based on whether any have descriptions)
 * - Member variable tables (3-column: Name, Type, Description)
 * - Inner class member variable tables (same 3-column)
 * - Related concepts table (2-column: Concept, Description)
 * - Enum tables
 */

import type { CppClassIr, CppEnumIr, CppTypedefIr, CppVariableIr } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath } from "../context.js";
import { getVariableBadges, renderBadge } from "./BadgeRenderer.js";
import {
    renderDescriptionBlocks,
    renderSegmentsTrimmed,
    renderTypeInfoDisplay,
    renderTypeInfoForTable
} from "./DescriptionRenderer.js";
import { formatLinksJson } from "./SignatureRenderer.js";
import { escapeMdxText, escapeTableCell, trimTrailingBlankLines } from "./shared.js";

// ---------------------------------------------------------------------------
// Typedef table
// ---------------------------------------------------------------------------

/**
 * Render the typedef table for a class.
 *
 * Uses 3 columns (Name | Definition | Description) if any typedef has a description.
 * Uses 2 columns (Name | Definition) otherwise.
 */
export function renderTypedefTable(typedefs: CppTypedefIr[]): string {
    if (typedefs.length === 0) {
        return "";
    }

    const lines: string[] = [];

    // Check if any typedef has a description
    const hasDescriptions = typedefs.some((td) => {
        if (!td.docstring) {
            return false;
        }
        const summary = renderSegmentsTrimmed(td.docstring.summary);
        return summary && summary.length > 0;
    });

    if (hasDescriptions) {
        // 3-column table
        lines.push("| Name | Definition | Description |");
        lines.push("|---|---|---|");

        for (const td of typedefs) {
            const name = `\`${td.name}\``;
            // Wrap definition in backticks (display text only, no inline links)
            const defDisplay = td.typeInfo ? renderTypeInfoDisplay(td.typeInfo) : "";
            const definition = defDisplay ? escapeTableCell(`\`${defDisplay}\``) : "";
            const description = td.docstring ? escapeTableCell(renderSegmentsTrimmed(td.docstring.summary)) : "";
            // Trim trailing spaces in empty description cells: "| desc |" or "| |"
            const descCell = description ? ` ${description} ` : " ";
            lines.push(`| ${name} | ${definition} |${descCell}|`);
        }
    } else {
        // 2-column table
        lines.push("| Name | Definition |");
        lines.push("|---|---|");

        for (const td of typedefs) {
            const name = `\`${td.name}\``;
            // Wrap definition in backticks (display text only, no inline links)
            const defDisplay = td.typeInfo ? renderTypeInfoDisplay(td.typeInfo) : "";
            const definition = defDisplay ? escapeTableCell(`\`${defDisplay}\``) : "";
            lines.push(`| ${name} | ${definition} |`);
        }
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Member variable table
// ---------------------------------------------------------------------------

/**
 * Render the member variables table for a class.
 *
 * 3-column: Name | Type | Description
 * Name column includes qualifier badges (static, constexpr).
 * Type column links to resolved types when available.
 */
export function renderMemberVariableTable(variables: CppVariableIr[], ownerPath: string): string {
    if (variables.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("| Name | Type | Description |");
    lines.push("|---|---|---|");

    for (const v of variables) {
        // Name with badges
        const badges = getVariableBadges(v);
        const badgeStr = badges.length > 0 ? " " + badges.map((b) => renderBadge(b)).join(" ") : "";
        const name = `\`${v.name}\`${badgeStr}`;

        // Type with link
        const typeStr = v.typeInfo ? escapeTableCell(renderTypeInfoForTable(v.typeInfo, ownerPath)) : "";

        // Description
        const description = v.docstring ? escapeTableCell(renderSegmentsTrimmed(v.docstring.summary)) : "";

        // Trim trailing spaces in empty description cells: "| desc |" or "| |"
        const descCell = description ? ` ${description} ` : " ";
        lines.push(`| ${name} | ${typeStr} |${descCell}|`);
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Inner class rendering
// ---------------------------------------------------------------------------

/**
 * Render an inner class section.
 *
 * Pattern:
 * ### ClassName
 *
 * <CodeBlock links={...}>
 * ```cpp
 * struct Outer::InnerClassName
 * ```
 * </CodeBlock>
 *
 * [description]
 *
 * [member variable table if any]
 *
 * [Inherits from: ...]
 */
export function renderInnerClass(innerClass: CppClassIr, ownerPath: string): string {
    const lines: string[] = [];

    lines.push(`### ${escapeMdxText(innerClass.name)}`);
    lines.push("");

    // Signature CodeBlock
    const kindKeyword = innerClass.kind === "class" ? "class" : "struct";
    const sig = `${kindKeyword} ${innerClass.path}`;

    // Build links: link back to the owner class
    const ownerShort = ownerPath.split("::").pop() ?? ownerPath;
    const links: Record<string, string> = {};
    const ownerLinkPath = buildLinkPath(ownerPath);
    if (ownerLinkPath) {
        links[ownerShort] = ownerLinkPath;
    }

    const linksStr = Object.keys(links).length > 0 ? ` links={${formatLinksJson(links)}}` : "";

    lines.push(`<CodeBlock${linksStr}>`);
    lines.push("```cpp showLineNumbers={false}");
    lines.push(sig);
    lines.push("```");
    lines.push("</CodeBlock>");
    lines.push("");

    // Description
    if (innerClass.docstring) {
        const summary = renderSegmentsTrimmed(innerClass.docstring.summary);
        if (summary) {
            lines.push(summary);
            lines.push("");
        }

        // Additional description blocks (Issue 11 fix)
        if (innerClass.docstring.description.length > 0) {
            const desc = renderDescriptionBlocks(innerClass.docstring.description);
            if (desc) {
                lines.push(desc);
                lines.push("");
            }
        }
    }

    // Member variable table (inner class members)
    if (innerClass.memberVariables.length > 0) {
        const table = renderMemberVariableTable(innerClass.memberVariables, innerClass.path);
        if (table) {
            lines.push(table);
            lines.push("");
        }
    }

    // Inherits from
    if (innerClass.baseClasses.length > 0) {
        const baseLinks = innerClass.baseClasses.map((bc) => {
            const access = bc.access !== "public" ? ` (${bc.access})` : " (public)";
            if (bc.typeInfo?.resolvedPath) {
                const baseLinkPath = buildLinkPath(bc.typeInfo.resolvedPath);
                if (baseLinkPath) {
                    return `[\`${bc.name}\`](${baseLinkPath})${access}`;
                }
            }
            return `\`${bc.name}\`${access}`;
        });
        lines.push(`**Inherits from:** ${baseLinks.join(", ")}`);
    }

    // Trim trailing blank lines
    trimTrailingBlankLines(lines);

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Related concepts table (for concept pages)
// ---------------------------------------------------------------------------

/**
 * Render the related concepts table for a concept page.
 * The seeAlso field from the concept's docstring drives this table.
 *
 * 2-column: Concept | Description
 * Each row: [`concept_name`](link) | description text
 */
export function renderRelatedConceptsTable(
    seeAlso: import("../../../src/types/CppLibraryDocsIr.js").CppDocSegment[][]
): string {
    if (seeAlso.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("| Concept | Description |");
    lines.push("|---|---|");

    for (const entry of seeAlso) {
        // Each seeAlso entry is an array of segments.
        // Typically structured as: link/ref segment + " " + description text
        // or just a link with description
        const text = renderSegmentsTrimmed(entry);
        if (!text) {
            continue;
        }

        // Try to split into concept link and description
        // Pattern: [link text](url) Description text
        // Or: `code` Description text
        const linkMatch = text.match(/^(\[.*?\]\(.*?\))\s+(.*)/);
        if (linkMatch && linkMatch[1] != null && linkMatch[2] != null) {
            const concept = escapeTableCell(linkMatch[1]);
            const desc = escapeTableCell(linkMatch[2]);
            lines.push(`| ${concept} | ${desc} |`);
        } else {
            // Just put the whole thing in the first column
            lines.push(`| ${escapeTableCell(text)} | |`);
        }
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Enum rendering
// ---------------------------------------------------------------------------

/**
 * Render an enum section.
 */
export function renderEnum(enumIr: CppEnumIr): string {
    if (enumIr.values.length === 0) {
        return "";
    }

    const lines: string[] = [];

    // Header
    lines.push(`### ${escapeMdxText(enumIr.name)}`);
    lines.push("");

    // Description
    if (enumIr.docstring) {
        const summary = renderSegmentsTrimmed(enumIr.docstring.summary);
        if (summary) {
            lines.push(summary);
            lines.push("");
        }
    }

    // Values table
    lines.push("| Name | Value | Description |");
    lines.push("|---|---|---|");

    for (const val of enumIr.values) {
        const name = `\`${val.name}\``;
        const value = val.initializer ? escapeTableCell(`\`${val.initializer}\``) : "";
        const desc = val.docstring ? escapeTableCell(renderSegmentsTrimmed(val.docstring.summary)) : "";
        // Trim trailing spaces in empty cells
        const valueCell = value ? ` ${value} ` : " ";
        const descCell = desc ? ` ${desc} ` : " ";
        lines.push(`| ${name} |${valueCell}|${descCell}|`);
    }

    return lines.join("\n");
}
