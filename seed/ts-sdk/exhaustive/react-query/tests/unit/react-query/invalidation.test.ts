/**
 * Unit tests for generated cache invalidation helpers.
 * Verifies invalidation functions correctly interact with QueryClient.
 */
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

// No-param invalidation (no invalidateAll since it would be identical)
import { invalidateGetWithNoRequestBody } from "../../../src/react-query/noReqBody/index.js";
// Single-param invalidation (has both invalidate and invalidateAll)
import {
    invalidateGetWithPath,
    invalidateAllGetWithPath,
} from "../../../src/react-query/endpoints/params/index.js";
// Multi-param invalidation
import {
    invalidateGetWithPathAndQuery,
    invalidateAllGetWithPathAndQuery,
} from "../../../src/react-query/endpoints/params/index.js";
// Pagination invalidation
import {
    invalidateListItems,
    invalidateAllListItems,
} from "../../../src/react-query/endpoints/pagination/index.js";

describe("Cache Invalidation Helpers", () => {
    describe("no-param endpoint invalidation", () => {
        it("should call queryClient.invalidateQueries with the correct key", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateGetWithNoRequestBody(queryClient);

            expect(spy).toHaveBeenCalledWith({
                queryKey: ["SeedExhaustiveClient", "noReqBody", "getWithNoRequestBody"],
            });
        });
    });

    describe("single-param endpoint invalidation", () => {
        it("should invalidate specific cached entry by param", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateGetWithPath(queryClient, "my-path-param");

            expect(spy).toHaveBeenCalledWith({
                queryKey: ["SeedExhaustiveClient", "endpoints", "params", "getWithPath", "my-path-param"],
            });
        });

        it("should invalidate all cached entries with invalidateAll", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateAllGetWithPath(queryClient);

            expect(spy).toHaveBeenCalledWith({
                queryKey: ["SeedExhaustiveClient", "endpoints", "params", "getWithPath"],
            });
        });

        it("invalidateAll key should be a prefix of the specific key", async () => {
            const queryClient = new QueryClient();
            const specificSpy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateGetWithPath(queryClient, "test");
            const specificKey = specificSpy.mock.calls[0]![0].queryKey as string[];

            specificSpy.mockClear();
            await invalidateAllGetWithPath(queryClient);
            const allKey = specificSpy.mock.calls[0]![0].queryKey as string[];

            // The "all" key should be a prefix of the specific key
            expect(specificKey.slice(0, allKey.length)).toEqual(allKey);
            // The specific key should have more segments
            expect(specificKey.length).toBeGreaterThan(allKey.length);
        });
    });

    describe("multi-param endpoint invalidation", () => {
        it("should invalidate specific cached entry by all params", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateGetWithPathAndQuery(queryClient, "path-val", { query: "q", number: 1 });

            expect(spy).toHaveBeenCalledWith({
                queryKey: [
                    "SeedExhaustiveClient",
                    "endpoints",
                    "params",
                    "getWithPathAndQuery",
                    "path-val",
                    { query: "q", number: 1 },
                ],
            });
        });

        it("should invalidate all cached entries for multi-param endpoint", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateAllGetWithPathAndQuery(queryClient);

            expect(spy).toHaveBeenCalledWith({
                queryKey: ["SeedExhaustiveClient", "endpoints", "params", "getWithPathAndQuery"],
            });
        });
    });

    describe("pagination endpoint invalidation", () => {
        it("should invalidate specific paginated query by request", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateListItems(queryClient, { cursor: "abc", limit: 10 });

            expect(spy).toHaveBeenCalledWith({
                queryKey: [
                    "SeedExhaustiveClient",
                    "endpoints",
                    "pagination",
                    "listItems",
                    { cursor: "abc", limit: 10 },
                ],
            });
        });

        it("should invalidate all paginated queries", async () => {
            const queryClient = new QueryClient();
            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

            await invalidateAllListItems(queryClient);

            expect(spy).toHaveBeenCalledWith({
                queryKey: ["SeedExhaustiveClient", "endpoints", "pagination", "listItems"],
            });
        });
    });
});
