/**
 * A simple string-keyed cache for pre-serialized JSON responses.
 * Avoids redundant JSON.stringify calls when the underlying data hasn't changed.
 *
 * Used by the docs preview server to cache the serialized /load-with-url response
 * per locale. The cache is invalidated when the docs definition changes (file edit → reload).
 */
export class ResponseCache {
    private cache = new Map<string, string>();

    /**
     * Returns a cached JSON string for the given locale, or serializes and caches
     * the result of `buildResponse()` on first access.
     */
    getOrSerialize(locale: string | undefined, buildResponse: () => unknown): string {
        const cacheKey = locale ?? "";
        const cached = this.cache.get(cacheKey);
        if (cached != null) {
            this._lastHit = true;
            return cached;
        }
        this._lastHit = false;
        const json = JSON.stringify(buildResponse());
        this.cache.set(cacheKey, json);
        return json;
    }

    private _lastHit = false;

    /**
     * Whether the last `getOrSerialize` call was a cache hit.
     */
    get lastHit(): boolean {
        return this._lastHit;
    }

    /**
     * Clear all cached entries. Call after the docs definition changes.
     */
    invalidate(): void {
        this.cache.clear();
    }

    /**
     * Number of cached entries (for testing).
     */
    get size(): number {
        return this.cache.size;
    }
}
