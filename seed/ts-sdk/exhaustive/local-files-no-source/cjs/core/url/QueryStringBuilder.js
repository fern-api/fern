"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryStringBuilder = void 0;
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
class QueryStringBuilder {
    constructor() {
        this.parts = [];
    }
    /**
     * Adds a query parameter using the "repeat" format for arrays.
     * Each array element produces a separate `key=value` pair.
     * Null / undefined values (and undefined array items) are skipped.
     */
    add(key, value) {
        if (value === undefined || value === null) {
            return this;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                if (item === undefined || item === null) {
                    continue;
                }
                if (typeof item === "object" && !Array.isArray(item)) {
                    this.addNestedObject(key, item);
                }
                else {
                    this.parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
            }
            return this;
        }
        if (typeof value === "object") {
            this.addNestedObject(key, value);
            return this;
        }
        this.parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        return this;
    }
    /**
     * Adds a query parameter using the "comma" format for arrays
     * (OpenAPI `explode: false`, `style: form`).
     * Array elements are joined with literal commas: `key=a,b,c`.
     * Commas *within* individual values are percent-encoded (`%2C`),
     * keeping the output unambiguous.
     */
    addComma(key, value) {
        if (value === undefined || value === null) {
            return this;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return this;
            }
            const encodedValues = value.map((item) => item === undefined || item === null ? "" : encodeURIComponent(String(item)));
            this.parts.push(`${encodeURIComponent(key)}=${encodedValues.join(",")}`);
            return this;
        }
        // Scalar — same as add()
        this.parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        return this;
    }
    /**
     * Merges additional query parameters supplied at call-time via
     * `requestOptions.queryParams`. Later values for the same key
     * replace earlier ones (last-write-wins), matching the C# builder
     * semantics.
     */
    mergeAdditional(additionalParams) {
        if (additionalParams == null) {
            return this;
        }
        for (const [key, value] of Object.entries(additionalParams)) {
            if (value === undefined) {
                continue;
            }
            // Remove any existing entries for this key
            const prefix = `${encodeURIComponent(key)}=`;
            this.parts = this.parts.filter((part) => !part.startsWith(prefix));
            // Re-add with the new value (uses "repeat" format for arrays)
            this.add(key, value);
        }
        return this;
    }
    /**
     * Returns the assembled query string (without the leading `?`).
     * Returns an empty string when no parameters were added.
     */
    build() {
        return this.parts.join("&");
    }
    /* ------------------------------------------------------------------ */
    /*  Private helpers                                                     */
    /* ------------------------------------------------------------------ */
    addNestedObject(prefix, obj) {
        for (const [key, value] of Object.entries(obj)) {
            const nestedKey = `${prefix}[${key}]`;
            if (value === undefined) {
                continue;
            }
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (item !== undefined && item !== null) {
                        this.parts.push(`${encodeURIComponent(nestedKey)}=${encodeURIComponent(String(item))}`);
                    }
                }
            }
            else if (typeof value === "object" && value !== null) {
                this.addNestedObject(nestedKey, value);
            }
            else {
                this.parts.push(`${encodeURIComponent(nestedKey)}=${encodeURIComponent(String(value))}`);
            }
        }
    }
}
exports.QueryStringBuilder = QueryStringBuilder;
