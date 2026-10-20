/**
 * Normalizes the `--api` CLI input into a canonical form for downstream filtering.
 *
 * - `undefined` → `undefined` (no filter; fall through to default workspace selection)
 * - single string → one-element array (preserves historical single-`--api` callers)
 * - empty array → `undefined` (treated the same as no `--api`; matches yargs when the
 *   flag isn't passed and keeps call sites that forward `argv.api` from working)
 * - array of strings → de-duplicated, order-preserving array
 */
export function normalizeCommandLineApiWorkspace(input: string | string[] | undefined): string[] | undefined {
    if (input == null) {
        return undefined;
    }
    if (!Array.isArray(input)) {
        return [input];
    }
    if (input.length === 0) {
        return undefined;
    }
    // `new Set(...)` preserves insertion order, so the first occurrence of each name wins.
    return Array.from(new Set(input));
}
