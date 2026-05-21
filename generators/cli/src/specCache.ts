import { readFile } from "fs/promises";

/**
 * In-memory cache of parsed OpenAPI spec JSON, keyed by spec path. Both
 * `deriveBinaryName` (needs `info.title`) and `detectAuthBindings`
 * (needs `components.securitySchemes`) read every mounted spec. Without
 * this cache, the per-spec file is opened and JSON-parsed once per
 * consumer — wasteful on disk + parse cost.
 *
 * Scope: lives for one `runPipeline` invocation (the caller constructs
 * a fresh cache each generation). Not thread-safe; generators are
 * single-process.
 */
export class SpecCache {
    private readonly entries = new Map<string, ParsedSpec | null>();

    /**
     * Returns the parsed JSON for `specPath`, or `null` if the file is
     * missing / unreadable / not valid JSON. Result is memoized — a
     * second call for the same path is a Map lookup.
     */
    async read(specPath: string): Promise<ParsedSpec | null> {
        if (this.entries.has(specPath)) {
            return this.entries.get(specPath) ?? null;
        }
        let parsed: ParsedSpec | null;
        try {
            const content = await readFile(specPath, "utf-8");
            parsed = JSON.parse(content) as ParsedSpec;
        } catch {
            parsed = null;
        }
        this.entries.set(specPath, parsed);
        return parsed;
    }
}

/**
 * Loose shape of an OpenAPI document — we only touch the two slices
 * downstream consumers care about (`info.title` and
 * `components.securitySchemes`). Unknown keys pass through unchanged
 * so future readers can pull more fields without re-parsing.
 */
export interface ParsedSpec {
    info?: { title?: unknown };
    components?: {
        securitySchemes?: Record<string, { type?: string; scheme?: string; in?: string; name?: string }>;
    };
    [key: string]: unknown;
}
