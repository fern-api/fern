export interface ChangelogEntry {
    version?: string;
    changelogEntry?: Array<{
        summary?: string;
        type?: string;
    }>;
    [key: string]: unknown;
}

/**
 * Validates that angle brackets in changelog entries are properly escaped with backticks.
 * This prevents breaking the docs publishing workflow.
 *
 * Returns an array of error messages for any violations found.
 */
export function validateAngleBracketEscaping(entry: ChangelogEntry): string[] {
    const errors: string[] = [];

    if (entry.changelogEntry && Array.isArray(entry.changelogEntry)) {
        for (const changelogItem of entry.changelogEntry) {
            if (changelogItem.summary && typeof changelogItem.summary === "string") {
                const unescapedBrackets = findUnescapedAngleBrackets(changelogItem.summary);

                if (unescapedBrackets.length > 0) {
                    const version = entry.version || "unknown";
                    errors.push(
                        `Version ${version}: Found unescaped angle brackets in changelog summary. ` +
                            `Patterns like ${unescapedBrackets.map((p) => `"${p}"`).join(", ")} should be wrapped in backticks. ` +
                            `Example: \`${unescapedBrackets[0]}\``
                    );
                }
            }
        }
    }

    return errors;
}

export function findUnescapedAngleBrackets(text: string): string[] {
    const patterns: string[] = [];

    let textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, "");

    const textWithoutBackticks = textWithoutCodeBlocks.replace(/`[^`]*`/g, "");

    // Find angle bracket patterns like <T>, <User>, <string, object>, <br>, etc.
    const anglePattern = /<[^>]+>/g;
    const matches = textWithoutBackticks.match(anglePattern);

    if (matches) {
        // Deduplicate patterns while preserving order
        const uniquePatterns = [...new Set(matches)];
        patterns.push(...uniquePatterns);
    }

    return patterns;
}
