/**
 * Unit tests for generated React Query options factory functions.
 * Verifies that factories return correct structure for useQuery/useMutation consumption.
 */
import { describe, expect, it, vi } from "vitest";

// No-param query options
import { getWithNoRequestBodyOptions } from "../../../src/react-query/noReqBody/index.js";
// Single-param query options
import { getWithQueryOptions, getWithPathOptions } from "../../../src/react-query/endpoints/params/index.js";
// Multi-param query options
import { getWithPathAndQueryOptions } from "../../../src/react-query/endpoints/params/index.js";
// Single-param mutation options
import { getAndReturnEnumMutationOptions } from "../../../src/react-query/endpoints/enum/index.js";
// Multi-param mutation options (tuple)
import { modifyWithPathMutationOptions } from "../../../src/react-query/endpoints/params/index.js";
// No-param mutation options
import { postWithNoRequestBodyMutationOptions } from "../../../src/react-query/noReqBody/index.js";
// Single-param mutation with requestOptions
import { modifyWithInlinePathMutationOptions } from "../../../src/react-query/endpoints/params/index.js";
// Pagination infinite options
import { listItemsInfiniteOptions, listItemsOptions } from "../../../src/react-query/endpoints/pagination/index.js";

// Helper to create a mock client with proxy-based method stubs
function createMockClient(): any {
    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            if (typeof prop === "string") {
                // Return a nested proxy for property access chains (e.g., client.endpoints.params.getWithPath)
                return new Proxy(vi.fn().mockResolvedValue({ mocked: true }), handler);
            }
            return undefined;
        },
        apply(target, _thisArg, args) {
            // When called as a function, return a resolved promise
            return target(...args);
        },
    };
    return new Proxy({}, handler);
}

describe("Query Options Factories", () => {
    describe("structure", () => {
        it("should return an object with queryKey and queryFn for no-param queries", () => {
            const client = createMockClient();
            const options = getWithNoRequestBodyOptions(client);

            expect(options).toHaveProperty("queryKey");
            expect(options).toHaveProperty("queryFn");
            expect(typeof options.queryFn).toBe("function");
            expect(Array.isArray(options.queryKey)).toBe(true);
        });

        it("should return an object with queryKey and queryFn for single-param queries", () => {
            const client = createMockClient();
            const options = getWithQueryOptions(client, { query: "test", number: 1 });

            expect(options).toHaveProperty("queryKey");
            expect(options).toHaveProperty("queryFn");
            expect(typeof options.queryFn).toBe("function");
        });

        it("should return an object with queryKey and queryFn for multi-param queries", () => {
            const client = createMockClient();
            const options = getWithPathAndQueryOptions(client, "path-val", { query: "test", number: 1 });

            expect(options).toHaveProperty("queryKey");
            expect(options).toHaveProperty("queryFn");
            expect(typeof options.queryFn).toBe("function");
        });
    });

    describe("queryKey consistency", () => {
        it("should produce the same queryKey as the standalone key function for no-param", () => {
            const client = createMockClient();
            const options = getWithNoRequestBodyOptions(client);
            expect(options.queryKey).toEqual(["SeedExhaustiveClient", "noReqBody", "getWithNoRequestBody"]);
        });

        it("should produce the same queryKey as the standalone key function for single-param", () => {
            const client = createMockClient();
            const request = { query: "test", number: 42 };
            const options = getWithQueryOptions(client, request);
            expect(options.queryKey).toEqual([
                "SeedExhaustiveClient",
                "endpoints",
                "params",
                "getWithQuery",
                request,
            ]);
        });

        it("should produce the same queryKey as the standalone key function for multi-param", () => {
            const client = createMockClient();
            const options = getWithPathAndQueryOptions(client, "my-path", { query: "q", number: 1 });
            expect(options.queryKey).toEqual([
                "SeedExhaustiveClient",
                "endpoints",
                "params",
                "getWithPathAndQuery",
                "my-path",
                { query: "q", number: 1 },
            ]);
        });
    });

    describe("requestOptions passthrough", () => {
        it("should accept requestOptions for no-param query options without affecting queryKey", () => {
            const client = createMockClient();
            const opts1 = getWithNoRequestBodyOptions(client);
            const opts2 = getWithNoRequestBodyOptions(client, { timeout: 5000 } as any);

            // Query keys should be the same regardless of requestOptions
            expect(opts1.queryKey).toEqual(opts2.queryKey);
        });

        it("should accept requestOptions for single-param query options without affecting queryKey", () => {
            const client = createMockClient();
            const request = { query: "test", number: 1 };
            const opts1 = getWithQueryOptions(client, request);
            const opts2 = getWithQueryOptions(client, request, { timeout: 5000 } as any);

            // Query keys should be the same regardless of requestOptions
            expect(opts1.queryKey).toEqual(opts2.queryKey);
        });

        it("should accept requestOptions for single path param query options without affecting queryKey", () => {
            const client = createMockClient();
            const opts1 = getWithPathOptions(client, "path-val");
            const opts2 = getWithPathOptions(client, "path-val", { timeout: 5000 } as any);

            expect(opts1.queryKey).toEqual(opts2.queryKey);
        });
    });
});

describe("Mutation Options Factories", () => {
    describe("single-param mutation", () => {
        it("should return an object with mutationFn", () => {
            const client = createMockClient();
            const options = getAndReturnEnumMutationOptions(client);

            expect(options).toHaveProperty("mutationFn");
            expect(typeof options.mutationFn).toBe("function");
        });

        it("should accept requestOptions", () => {
            const client = createMockClient();
            const options = getAndReturnEnumMutationOptions(client, { timeout: 5000 } as any);

            expect(options).toHaveProperty("mutationFn");
            expect(typeof options.mutationFn).toBe("function");
        });
    });

    describe("multi-param mutation (tuple)", () => {
        it("should return an object with mutationFn that accepts a tuple", () => {
            const client = createMockClient();
            const options = modifyWithPathMutationOptions(client);

            expect(options).toHaveProperty("mutationFn");
            expect(typeof options.mutationFn).toBe("function");
        });
    });

    describe("no-param mutation", () => {
        it("should return an object with mutationFn that takes no arguments", () => {
            const client = createMockClient();
            const options = postWithNoRequestBodyMutationOptions(client);

            expect(options).toHaveProperty("mutationFn");
            expect(typeof options.mutationFn).toBe("function");
        });

        it("should accept requestOptions", () => {
            const client = createMockClient();
            const options = postWithNoRequestBodyMutationOptions(client, { timeout: 3000 } as any);

            expect(options).toHaveProperty("mutationFn");
        });
    });

    describe("single-param mutation with requestOptions", () => {
        it("should return mutationFn with requestOptions bound", () => {
            const client = createMockClient();
            const options = modifyWithInlinePathMutationOptions(client, { timeout: 5000 } as any);

            expect(options).toHaveProperty("mutationFn");
            expect(typeof options.mutationFn).toBe("function");
        });
    });
});

describe("Infinite Query Options Factories", () => {
    describe("structure", () => {
        it("should return queryKey, queryFn, initialPageParam, and getNextPageParam", () => {
            const client = createMockClient();
            const options = listItemsInfiniteOptions(client, { cursor: undefined, limit: 10 });

            expect(options).toHaveProperty("queryKey");
            expect(options).toHaveProperty("queryFn");
            expect(options).toHaveProperty("initialPageParam");
            expect(options).toHaveProperty("getNextPageParam");
            expect(typeof options.queryFn).toBe("function");
            expect(typeof options.getNextPageParam).toBe("function");
        });

        it("should have undefined as initialPageParam", () => {
            const client = createMockClient();
            const options = listItemsInfiniteOptions(client, {});

            expect(options.initialPageParam).toBeUndefined();
        });
    });

    describe("getNextPageParam", () => {
        it("should extract cursor from lastPage.response.next", () => {
            const client = createMockClient();
            const options = listItemsInfiniteOptions(client, {});

            const nextCursor = options.getNextPageParam(
                { data: [{ id: "1" }], response: { next: "cursor-abc" } } as any,
                [],
                undefined,
            );
            expect(nextCursor).toBe("cursor-abc");
        });

        it("should return undefined when there is no next page", () => {
            const client = createMockClient();
            const options = listItemsInfiniteOptions(client, {});

            const nextCursor = options.getNextPageParam(
                { data: [{ id: "1" }], response: { next: undefined } } as any,
                [],
                undefined,
            );
            expect(nextCursor).toBeUndefined();
        });

        it("should return undefined when response is missing", () => {
            const client = createMockClient();
            const options = listItemsInfiniteOptions(client, {});

            const nextCursor = options.getNextPageParam({ data: [] } as any, [], undefined);
            expect(nextCursor).toBeUndefined();
        });
    });

    describe("regular query options for paginated endpoint", () => {
        it("should also have regular query options available", () => {
            const client = createMockClient();
            const options = listItemsOptions(client, { cursor: "abc", limit: 10 });

            expect(options).toHaveProperty("queryKey");
            expect(options).toHaveProperty("queryFn");
            expect(typeof options.queryFn).toBe("function");
        });

        it("should share the same queryKey function as infinite options", () => {
            const client = createMockClient();
            const request = { cursor: "abc", limit: 10 };
            const regularOptions = listItemsOptions(client, request);
            const infiniteOptions = listItemsInfiniteOptions(client, request);

            expect(regularOptions.queryKey).toEqual(infiniteOptions.queryKey);
        });
    });
});
