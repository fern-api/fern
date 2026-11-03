/**
 * The string with surrounding whitespace removed, or undefined when it is missing or blank. For values read
 * from config, where an empty or whitespace-only string means the same as not setting it.
 */
export function nonEmpty(value: string | null | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed == null || trimmed === "" ? undefined : trimmed;
}
