import type { CppFileIr } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath } from "../context.js";
import {
    renderDescriptionBlocksDeduped,
    renderSegmentsPlainText,
    renderSegmentsTrimmed
} from "./DescriptionRenderer.js";
import { renderBareCodeBlock } from "./SignatureRenderer.js";
import { renderFrontmatter, trimTrailingBlankLines } from "./shared.js";

const SECTIONS: {
    key: keyof Pick<CppFileIr, "classes" | "functions" | "enums" | "typedefs" | "variables" | "macros">;
    heading: string;
}[] = [
    { key: "classes", heading: "Classes and structs" },
    { key: "functions", heading: "Functions" },
    { key: "enums", heading: "Enumerations" },
    { key: "typedefs", heading: "Type definitions" },
    { key: "variables", heading: "Variables" },
    { key: "macros", heading: "Macros" }
];

/** Render `headers/<file>.mdx`: what one source header declares, linked to the symbol pages. */
export function renderHeaderPage(file: CppFileIr): string {
    const lines: string[] = [];
    const docstring = file.docstring;
    const summaryText = docstring ? renderSegmentsPlainText(docstring.summary) : "";
    lines.push(...renderFrontmatter(file.path, summaryText || `Symbols declared in ${file.path}.`));
    lines.push("", renderBareCodeBlock(`#include <${file.path}>`, "cpp"));
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
    for (const section of SECTIONS) {
        const paths = [...new Set(file[section.key])].sort((a, b) => a.localeCompare(b));
        if (paths.length === 0) {
            continue;
        }
        lines.push("", `## ${section.heading}`, "");
        for (const path of paths) {
            const displayName = path.startsWith("@") ? "(anonymous enum)" : path;
            const linkPath = path.startsWith("@") ? undefined : buildLinkPath(path);
            lines.push(linkPath ? `- [\`${displayName}\`](${linkPath})` : `- \`${displayName}\``);
        }
    }
    if (file.includes.length > 0) {
        lines.push("", "## Includes", "");
        for (const include of file.includes) {
            lines.push(`- \`${include}\``);
        }
    }
    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}

export function renderHeadersIndexPage(
    entries: { displayName: string; linkPath: string }[],
    libraryTitle: string
): string {
    const lines: string[] = [];
    const library = libraryTitle.trim();
    lines.push(
        ...renderFrontmatter(
            library ? `${library} — Headers` : "Headers",
            library ? `Source headers in ${library}.` : "Source headers in this library."
        )
    );
    lines.push("");
    for (const entry of entries) {
        lines.push(`- [\`${entry.displayName}\`](${entry.linkPath})`);
    }
    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}
