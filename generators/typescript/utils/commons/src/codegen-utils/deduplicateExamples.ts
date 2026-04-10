/**
 * Deduplicates example strings by keeping only the first occurrence of each unique string.
 * This prevents identical @example JSDoc blocks from appearing multiple times in generated code.
 */
export function deduplicateExamples(examples: string[]): string[] {
    const unique: string[] = [];
    for (const example of examples) {
        if (!unique.includes(example)) {
            unique.push(example);
        }
    }
    return unique;
}
