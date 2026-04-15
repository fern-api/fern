/**
 * A fluent builder for constructing URL query strings.
 *
 * The generator emits chained `.add()` / `.addComma()` calls so that
 * each parameter's serialization format is decided at code-gen time
 * rather than at runtime via a config map.
 *
 * Usage (generated code):
 *
 *     const qs = new QueryStringBuilder()
 *         .add("limit", limit)
 *         .addComma("tags", tags)          // explode: false
 *         .mergeAdditional(requestOptions?.queryParams)
 *         .build();
 */
export declare class QueryStringBuilder {
    private parts;
    /**
     * Adds a query parameter using the "repeat" format for arrays.
     * Each array element produces a separate `key=value` pair.
     * Null / undefined values (and undefined array items) are skipped.
     */
    add(key: string, value: unknown): this;
    /**
     * Adds a query parameter using the "comma" format for arrays
     * (OpenAPI `explode: false`, `style: form`).
     * Array elements are joined with literal commas: `key=a,b,c`.
     * Commas *within* individual values are percent-encoded (`%2C`),
     * keeping the output unambiguous.
     */
    addComma(key: string, value: unknown): this;
    /**
     * Merges additional query parameters supplied at call-time via
     * `requestOptions.queryParams`. Later values for the same key
     * replace earlier ones (last-write-wins), matching the C# builder
     * semantics.
     */
    mergeAdditional(additionalParams?: Record<string, unknown>): this;
    /**
     * Returns the assembled query string (without the leading `?`).
     * Returns an empty string when no parameters were added.
     */
    build(): string;
    private addNestedObject;
}
