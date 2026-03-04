// @vitest-environment happy-dom
/**
 * Unit tests for generated React Query hooks.
 * Verifies hooks integrate correctly with TanStack Query and the ClientProvider context.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ClientProvider } from "../../../src/react-query/context.js";

// Query hooks
import { useGetWithNoRequestBody } from "../../../src/react-query/noReqBody/index.js";
import { useGetWithPath, useGetWithQuery } from "../../../src/react-query/endpoints/params/index.js";
import { useGetWithPathAndQuery } from "../../../src/react-query/endpoints/params/index.js";

// Suspense query hooks
import { useSuspenseGetWithNoRequestBody } from "../../../src/react-query/noReqBody/index.js";

// Mutation hooks
import { usePostWithNoRequestBodyMutation } from "../../../src/react-query/noReqBody/index.js";
import { useGetAndReturnEnumMutation } from "../../../src/react-query/endpoints/enum/index.js";
import { useModifyWithPathMutation } from "../../../src/react-query/endpoints/params/index.js";

// Helper to create a mock client
function createMockClient(overrides: Record<string, any> = {}): any {
    return {
        noReqBody: {
            getWithNoRequestBody: vi.fn().mockResolvedValue("no-body-result"),
            postWithNoRequestBody: vi.fn().mockResolvedValue("post-result"),
            ...overrides.noReqBody,
        },
        endpoints: {
            params: {
                getWithPath: vi.fn().mockResolvedValue("path-result"),
                getWithQuery: vi.fn().mockResolvedValue("query-result"),
                getWithPathAndQuery: vi.fn().mockResolvedValue("path-and-query-result"),
                modifyWithPath: vi.fn().mockResolvedValue("modify-result"),
                ...overrides.params,
            },
            enum: {
                getAndReturnEnum: vi.fn().mockResolvedValue("enum-result"),
                ...overrides.enum,
            },
            pagination: {
                listItems: vi.fn().mockResolvedValue({ data: [], response: {} }),
            },
            ...overrides.endpoints,
        },
        ...overrides,
    };
}

// Helper to create wrapper with QueryClient and ClientProvider
function createWrapper(client: any) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(
            QueryClientProvider,
            { client: queryClient },
            createElement(ClientProvider, { client }, children),
        );
    };
}

describe("Query Hooks", () => {
    describe("useGetWithNoRequestBody (no-param query)", () => {
        it("should fetch data using the client from context", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(() => useGetWithNoRequestBody(), { wrapper });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toBe("no-body-result");
            expect(client.noReqBody.getWithNoRequestBody).toHaveBeenCalled();
        });

        it("should pass requestOptions to the client method", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);
            const requestOptions = { timeout: 5000 };

            renderHook(() => useGetWithNoRequestBody(requestOptions as any), { wrapper });

            await waitFor(() => expect(client.noReqBody.getWithNoRequestBody).toHaveBeenCalledWith(requestOptions));
        });

        it("should accept TanStack Query option overrides", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(
                () => useGetWithNoRequestBody(undefined, { enabled: false }),
                { wrapper },
            );

            // Should not fetch when enabled is false
            expect(result.current.isFetching).toBe(false);
            expect(client.noReqBody.getWithNoRequestBody).not.toHaveBeenCalled();
        });
    });

    describe("useGetWithPath (single path-param query)", () => {
        it("should pass the path param to the client method", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(() => useGetWithPath("my-param"), { wrapper });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.endpoints.params.getWithPath).toHaveBeenCalledWith("my-param", undefined);
        });
    });

    describe("useGetWithQuery (single-param query)", () => {
        it("should pass request object to the client method", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);
            const request = { query: "test-value", number: 42 };

            const { result } = renderHook(() => useGetWithQuery(request), { wrapper });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.endpoints.params.getWithQuery).toHaveBeenCalledWith(request, undefined);
        });
    });

    describe("useGetWithPathAndQuery (multi-param query)", () => {
        it("should pass path param and request to the client method", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(
                () => useGetWithPathAndQuery("path-val", { query: "q", number: 1 }),
                { wrapper },
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.endpoints.params.getWithPathAndQuery).toHaveBeenCalledWith(
                "path-val",
                { query: "q", number: 1 },
                undefined,
            );
        });
    });
});

describe("Mutation Hooks", () => {
    describe("usePostWithNoRequestBodyMutation (no-param mutation)", () => {
        it("should call the client method on mutate()", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(() => usePostWithNoRequestBodyMutation(), { wrapper });

            result.current.mutate();
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.noReqBody.postWithNoRequestBody).toHaveBeenCalled();
        });
    });

    describe("useGetAndReturnEnumMutation (single-param mutation)", () => {
        it("should pass the variable directly (not as tuple)", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(() => useGetAndReturnEnumMutation(), { wrapper });

            result.current.mutate("VALUE" as any);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.endpoints.enum.getAndReturnEnum).toHaveBeenCalledWith("VALUE", undefined);
        });
    });

    describe("useModifyWithPathMutation (multi-param mutation)", () => {
        it("should pass tuple args to the client method", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);

            const { result } = renderHook(() => useModifyWithPathMutation(), { wrapper });

            result.current.mutate(["path-param", "body-value"] as any);
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(client.endpoints.params.modifyWithPath).toHaveBeenCalledWith("path-param", "body-value");
        });
    });

    describe("mutation option overrides", () => {
        it("should accept onSuccess callback", async () => {
            const client = createMockClient();
            const wrapper = createWrapper(client);
            const onSuccess = vi.fn();

            const { result } = renderHook(
                () => usePostWithNoRequestBodyMutation(undefined, { onSuccess }),
                { wrapper },
            );

            result.current.mutate();
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(onSuccess).toHaveBeenCalled();
        });
    });
});
