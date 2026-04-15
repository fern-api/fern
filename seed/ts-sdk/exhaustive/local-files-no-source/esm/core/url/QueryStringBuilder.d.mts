/**
 * Creates a fluent builder for constructing URL query strings.
 *
 * Thin wrapper over `toQueryString()` — collects parameters via chained
 * `.add()` calls and delegates all serialization to `qs.ts` at build time.
 *
 * Usage (generated code):
 *
 *     const qs = core.url.queryBuilder()
 *         .add("limit", limit)
 *         .add("tags", tags, { style: "comma" })   // explode: false
 *         .mergeAdditional(requestOptions?.queryParams)
 *         .build();
 */
export declare function queryBuilder(): QueryStringBuilder;
declare class QueryStringBuilder {
    private params;
    private arrayFormats;
    /**
     * Adds a query parameter.
     *
     * By default arrays use "repeat" format (`key=a&key=b`).
     * Pass `{ style: "comma" }` for OpenAPI `explode: false` parameters
     * to get comma-separated values (`key=a,b,c`).
     *
     * Null / undefined values are silently skipped.
     */
    add(key: string, value: unknown, options?: {
        style?: "comma";
    }): this;
    /**
     * Merges additional query parameters supplied at call-time via
     * `requestOptions.queryParams`. Later values for the same key
     * replace earlier ones (last-write-wins).
     */
    mergeAdditional(additionalParams?: Record<string, unknown>): this;
    /**
     * Returns the assembled query string (without the leading `?`).
     * Returns an empty string when no parameters were added.
     */
    build(): string;
}
export {};
