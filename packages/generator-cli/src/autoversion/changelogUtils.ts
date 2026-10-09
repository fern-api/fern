/**
 * Utilities for maintaining an SDK repo's `changelog.md`. Entries are markdown
 * blocks headed by `## [<version>] - <date>` with the most recent entry at the
 * top, under an optional `# Changelog` title line.
 */

/**
 * Prepends a changelog block for `version` to `existingContent`, preserving all
 * existing entries. When `entry` is empty (e.g. an explicitly pinned version with
 * no generated description), the block consists of just the version header.
 */
export function prependChangelogBlock({
    existingContent,
    version,
    entry,
    date = new Date().toISOString().slice(0, 10)
}: {
    existingContent: string;
    version: string | undefined;
    entry: string;
    date?: string;
}): string {
    const header = version != null ? `## [${version}] - ${date}\n` : `## ${date}\n`;
    const trimmedEntry = entry.trim();
    const newBlock = trimmedEntry.length > 0 ? `${header}${trimmedEntry}\n\n` : `${header}\n`;

    if (existingContent.trim().length === 0) {
        return `# Changelog\n\n${newBlock}`;
    }
    if (existingContent.startsWith("# Changelog")) {
        const newlineIdx = existingContent.indexOf("\n");
        const headerLine = newlineIdx >= 0 ? existingContent.slice(0, newlineIdx) : existingContent;
        const remainder = (newlineIdx >= 0 ? existingContent.slice(newlineIdx + 1) : "").replace(/^\s*\n/, "");
        return `${headerLine}\n\n${newBlock}${remainder}`;
    }
    return `${newBlock}${existingContent}`;
}

/**
 * Returns true when `content` already has an entry header for `version`,
 * so callers can avoid prepending a duplicate block on regeneration.
 */
export function changelogContainsVersion(content: string, version: string): boolean {
    const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^## \\[${escaped}\\]`, "m").test(content);
}

const KEEP_A_CHANGELOG_SECTION_ORDER = ["breaking changes", "added", "changed", "fixed"];
const SEE_FULL_CHANGELOG_LINE = /^[-*]\s+see full changelog/i;
const SECTION_HEADER_LINE = /^#{2,4}\s+(.+?)\s*$/;

/**
 * Deterministically merges per-chunk changelog entries into a single set of `###` sections.
 * Bullets under the same header (case-insensitive) are combined and exact duplicates dropped.
 * Keep a Changelog sections come first in Breaking Changes / Added / Changed / Fixed order;
 * any other headers follow in first-seen order. Text before the first header stays on top.
 */
export function mergeChangelogSections(entries: string[]): string {
    const preamble: string[] = [];
    const sections = new Map<string, { title: string; lines: string[]; truncated: boolean }>();

    for (const entry of entries) {
        let current: { title: string; lines: string[]; truncated: boolean } | undefined;
        for (const rawLine of entry.trim().split("\n")) {
            const line = rawLine.trimEnd();
            const header = SECTION_HEADER_LINE.exec(line);
            if (header?.[1] != null) {
                const key = header[1].toLowerCase();
                current = sections.get(key);
                if (current == null) {
                    current = { title: header[1], lines: [], truncated: false };
                    sections.set(key, current);
                }
                continue;
            }
            if (line.trim().length === 0) {
                continue;
            }
            if (current == null) {
                if (!preamble.includes(line)) {
                    preamble.push(line);
                }
                continue;
            }
            if (SEE_FULL_CHANGELOG_LINE.test(line.trim())) {
                current.truncated = true;
                continue;
            }
            if (!current.lines.includes(line)) {
                current.lines.push(line);
            }
        }
    }

    const orderedKeys = [
        ...KEEP_A_CHANGELOG_SECTION_ORDER.filter((key) => sections.has(key)),
        ...[...sections.keys()].filter((key) => !KEEP_A_CHANGELOG_SECTION_ORDER.includes(key))
    ];
    const blocks: string[] = [];
    if (preamble.length > 0) {
        blocks.push(preamble.join("\n"));
    }
    for (const key of orderedKeys) {
        const section = sections.get(key);
        if (section == null) {
            continue;
        }
        const lines = section.truncated ? [...section.lines, "- See full changelog for all changes"] : section.lines;
        if (lines.length > 0) {
            blocks.push(`### ${section.title}\n${lines.join("\n")}`);
        }
    }
    return blocks.join("\n\n");
}
