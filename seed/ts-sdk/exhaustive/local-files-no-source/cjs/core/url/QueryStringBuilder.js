"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryBuilder = queryBuilder;
const qs_js_1 = require("./qs.js");
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
function queryBuilder() {
    return new QueryStringBuilder();
}
class QueryStringBuilder {
    constructor() {
        this.params = {};
        this.arrayFormats = {};
    }
    /**
     * Adds a query parameter.
     *
     * By default arrays use "repeat" format (`key=a&key=b`).
     * Pass `{ style: "comma" }` for OpenAPI `explode: false` parameters
     * to get comma-separated values (`key=a,b,c`).
     *
     * Null / undefined values are silently skipped.
     */
    add(key, value, options) {
        if (value === undefined || value === null) {
            return this;
        }
        this.params[key] = value;
        if ((options === null || options === void 0 ? void 0 : options.style) === "comma") {
            this.arrayFormats[key] = "comma";
        }
        return this;
    }
    /**
     * Merges additional query parameters supplied at call-time via
     * `requestOptions.queryParams`. Later values for the same key
     * replace earlier ones (last-write-wins).
     */
    mergeAdditional(additionalParams) {
        if (additionalParams != null) {
            Object.assign(this.params, additionalParams);
        }
        return this;
    }
    /**
     * Returns the assembled query string (without the leading `?`).
     * Returns an empty string when no parameters were added.
     */
    build() {
        return (0, qs_js_1.toQueryString)(this.params, {
            arrayFormat: "repeat",
            arrayFormats: this.arrayFormats,
        });
    }
}
