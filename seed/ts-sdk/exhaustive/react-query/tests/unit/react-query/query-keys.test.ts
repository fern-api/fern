/**
 * Unit tests for generated React Query key functions.
 * Verifies query key structure, uniqueness, and requestOptions exclusion.
 */
import { describe, expect, it } from "vitest";

// No-param query key
import { getWithNoRequestBodyQueryKey } from "../../../src/react-query/noReqBody/index.js";
// Single-param query key
import {
    getWithPathQueryKey,
    getWithQueryQueryKey,
    getWithInlinePathQueryKey,
} from "../../../src/react-query/endpoints/params/index.js";
// Multi-param query key
import { getWithPathAndQueryQueryKey } from "../../../src/react-query/endpoints/params/index.js";
// Pagination query key
import { listItemsQueryKey } from "../../../src/react-query/endpoints/pagination/index.js";

describe("Query Key Functions", () => {
    describe("no-param queries", () => {
        it("should return a key with service path segments only", () => {
            const key = getWithNoRequestBodyQueryKey();
            expect(key).toEqual(["SeedExhaustiveClient", "noReqBody", "getWithNoRequestBody"]);
        });

        it("should return a readonly tuple", () => {
            const key = getWithNoRequestBodyQueryKey();
            expect(Array.isArray(key)).toBe(true);
        });

        it("should return the same key on repeated calls (stable)", () => {
            const key1 = getWithNoRequestBodyQueryKey();
            const key2 = getWithNoRequestBodyQueryKey();
            expect(key1).toEqual(key2);
        });
    });

    describe("single-param queries", () => {
        it("should include the request parameter in the key", () => {
            const key = getWithQueryQueryKey({ query: "test-value", number: 42 });
            expect(key).toEqual([
                "SeedExhaustiveClient",
                "endpoints",
                "params",
                "getWithQuery",
                { query: "test-value", number: 42 },
            ]);
        });

        it("should include path param in the key for single path param endpoints", () => {
            const key = getWithPathQueryKey("my-path-param");
            expect(key).toEqual(["SeedExhaustiveClient", "endpoints", "params", "getWithPath", "my-path-param"]);
        });

        it("should include inline path request in the key", () => {
            const request = { param: "inline-value" };
            const key = getWithInlinePathQueryKey(request);
            expect(key).toEqual(["SeedExhaustiveClient", "endpoints", "params", "getWithInlinePath", request]);
        });

        it("should produce different keys for different request params", () => {
            const key1 = getWithQueryQueryKey({ query: "a", number: 1 });
            const key2 = getWithQueryQueryKey({ query: "b", number: 2 });
            expect(key1).not.toEqual(key2);
        });
    });

    describe("multi-param queries", () => {
        it("should include both path param and request in the key", () => {
            const key = getWithPathAndQueryQueryKey("path-value", { query: "query-value", number: 1 });
            expect(key).toEqual([
                "SeedExhaustiveClient",
                "endpoints",
                "params",
                "getWithPathAndQuery",
                "path-value",
                { query: "query-value", number: 1 },
            ]);
        });

        it("should produce different keys for different path params", () => {
            const request = { query: "same", number: 1 };
            const key1 = getWithPathAndQueryQueryKey("path-a", request);
            const key2 = getWithPathAndQueryQueryKey("path-b", request);
            expect(key1).not.toEqual(key2);
        });
    });

    describe("pagination queries", () => {
        it("should include request in the key", () => {
            const key = listItemsQueryKey({ cursor: "abc", limit: 10 });
            expect(key).toEqual([
                "SeedExhaustiveClient",
                "endpoints",
                "pagination",
                "listItems",
                { cursor: "abc", limit: 10 },
            ]);
        });
    });

    describe("key uniqueness across services", () => {
        it("should produce unique keys for different services", () => {
            const noReqBodyKey = getWithNoRequestBodyQueryKey();
            const paramsKey = getWithPathQueryKey("test");

            // Keys should have different service path segments
            expect(noReqBodyKey[1]).toBe("noReqBody");
            expect(paramsKey[1]).toBe("endpoints");

            // Keys should not be equal
            expect(noReqBodyKey).not.toEqual(paramsKey);
        });

        it("should always start with the root client name", () => {
            expect(getWithNoRequestBodyQueryKey()[0]).toBe("SeedExhaustiveClient");
            expect(getWithPathQueryKey("x")[0]).toBe("SeedExhaustiveClient");
            expect(getWithPathAndQueryQueryKey("x", { query: "y", number: 1 })[0]).toBe("SeedExhaustiveClient");
            expect(listItemsQueryKey({})[0]).toBe("SeedExhaustiveClient");
        });
    });

    describe("requestOptions exclusion", () => {
        it("should not include requestOptions in query keys (only request params)", () => {
            // Query key functions don't accept requestOptions at all,
            // which prevents cache pollution by design.
            // Verify that the key function only accepts the request parameter.
            const key = getWithQueryQueryKey({ query: "test", number: 1 });
            // The key should contain exactly: [clientName, ...servicePath, endpointName, request]
            expect(key).toHaveLength(5);
            expect(key[4]).toEqual({ query: "test", number: 1 });
        });
    });
});
