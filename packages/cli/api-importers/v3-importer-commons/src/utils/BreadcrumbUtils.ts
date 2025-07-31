/**
 * Utility functions for processing breadcrumbs into human-friendly names
 */

/**
 * Removes duplicate or similar words from breadcrumbs to avoid redundancy
 * @param breadcrumbs Array of breadcrumb strings
 * @returns Array with similar words removed
 */
export function removeSimilarWords(breadcrumbs: string[]): string[] {
    if (breadcrumbs.length <= 1) {
        return breadcrumbs;
    }

    const result: string[] = [];
    const seenWords = new Set<string>();

    for (const breadcrumb of breadcrumbs) {
        // Normalize the word for comparison (lowercase, remove common suffixes)
        const normalized = normalizeWordForComparison(breadcrumb);

        // Check if we've seen this word or a similar one
        if (!isSimilarToExisting(normalized, seenWords)) {
            result.push(breadcrumb);
            seenWords.add(normalized);
        }
    }

    return result;
}

/**
 * Normalizes a word for similarity comparison
 * @param word The word to normalize
 * @returns Normalized word for comparison
 */
function normalizeWordForComparison(word: string): string {
    return word
        .toLowerCase()
        .replace(/(s|es|ies)$/, "") // Remove common plural endings
        .replace(/(ing|ed|er|est)$/, "") // Remove common verb/adjective endings
        .replace(/[^a-z0-9]/g, ""); // Remove non-alphanumeric characters
}

/**
 * Checks if a normalized word is similar to any existing words
 * @param normalizedWord The normalized word to check
 * @param existingWords Set of existing normalized words
 * @returns True if the word is similar to an existing word
 */
function isSimilarToExisting(normalizedWord: string, existingWords: Set<string>): boolean {
    // Check for exact matches
    if (existingWords.has(normalizedWord)) {
        return true;
    }

    // Check for common variations
    const variations = [
        normalizedWord + "s", // plural
        normalizedWord + "es", // plural
        normalizedWord + "ing", // gerund
        normalizedWord + "ed", // past tense
        normalizedWord + "er", // comparative
        normalizedWord + "est" // superlative
    ];

    for (const variation of variations) {
        if (existingWords.has(variation)) {
            return true;
        }
    }

    // Check if this word is a variation of an existing word
    for (const existing of existingWords) {
        const existingVariations = [
            existing + "s",
            existing + "es",
            existing + "ing",
            existing + "ed",
            existing + "er",
            existing + "est"
        ];

        if (existingVariations.includes(normalizedWord)) {
            return true;
        }
    }

    return false;
}
