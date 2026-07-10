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
    return content.includes(`## [${version}]`);
}
