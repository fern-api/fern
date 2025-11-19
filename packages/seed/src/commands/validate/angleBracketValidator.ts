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

                const doubleBacktickErrors = findDoubleBackticks(changelogItem.summary);

                if (doubleBacktickErrors.length > 0) {
                    const version = entry.version || "unknown";
                    errors.push(
                        `Version ${version}: Found double backticks in changelog summary. ` +
                            `This breaks the docs parsing. Found: ${doubleBacktickErrors.map((p) => `"${p}"`).join(", ")}. ` +
                            `Make sure to close backticks properly (use single backticks, not double).`
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

    const anglePattern = /<[^>]+>/g;
    const matches = textWithoutBackticks.match(anglePattern);

    if (matches) {
        const uniquePatterns = [...new Set(matches)];
        patterns.push(...uniquePatterns);
    }

    return patterns;
}

/**
 * Finds instances of double backticks (`` or more consecutive backticks) in text.
 * Double backticks can break MDX parsing in the docs.
 *
 * Returns an array of problematic patterns found.
 */
export function findDoubleBackticks(text: string): string[] {
    const patterns: string[] = [];

    const doubleBacktickPattern = /``+/g;
    const matches = text.match(doubleBacktickPattern);

    if (matches) {
        const uniquePatterns = [...new Set(matches)];
        patterns.push(...uniquePatterns);
    }

    return patterns;
}
