// @vitest-environment happy-dom
/**
 * Unit tests for the generated React Context/Provider pattern.
 * Verifies ClientProvider provides the client and useClient() resolves it correctly.
 */
import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ClientProvider, useClient } from "../../../src/react-query/context.js";

// Helper to create a mock client
function createMockClient(): any {
    return {
        noReqBody: { getWithNoRequestBody: vi.fn() },
        endpoints: { params: { getWithPath: vi.fn() } },
    };
}

describe("Context/Provider", () => {
    describe("useClient", () => {
        it("should throw when used outside ClientProvider", () => {
            expect(() => {
                renderHook(() => useClient());
            }).toThrow("useClient must be used within a <ClientProvider>");
        });

        it("should throw with a helpful error message mentioning ClientProvider", () => {
            expect(() => {
                renderHook(() => useClient());
            }).toThrow(/Wrap your component tree with <ClientProvider client=\{\.\.\.}>/);
        });

        it("should return the client when used inside ClientProvider", () => {
            const client = createMockClient();

            const wrapper = ({ children }: { children: ReactNode }) =>
                createElement(ClientProvider, { client }, children);

            const { result } = renderHook(() => useClient(), { wrapper });
            expect(result.current).toBe(client);
        });

        it("should return the same client instance on re-renders", () => {
            const client = createMockClient();

            const wrapper = ({ children }: { children: ReactNode }) =>
                createElement(ClientProvider, { client }, children);

            const { result, rerender } = renderHook(() => useClient(), { wrapper });
            const firstResult = result.current;

            rerender();
            expect(result.current).toBe(firstResult);
        });
    });

    describe("ClientProvider", () => {
        it("should make client available to nested hooks", () => {
            const client = createMockClient();

            // Nest two levels deep to verify context propagation
            const InnerWrapper = ({ children }: { children: ReactNode }) =>
                createElement("div", null, children);

            const wrapper = ({ children }: { children: ReactNode }) =>
                createElement(
                    ClientProvider,
                    { client },
                    createElement(InnerWrapper, null, children),
                );

            const { result } = renderHook(() => useClient(), { wrapper });
            expect(result.current).toBe(client);
        });

        it("should allow overriding with a nested ClientProvider", () => {
            const outerClient = createMockClient();
            const innerClient = createMockClient();

            const wrapper = ({ children }: { children: ReactNode }) =>
                createElement(
                    ClientProvider,
                    { client: outerClient },
                    createElement(ClientProvider, { client: innerClient }, children),
                );

            const { result } = renderHook(() => useClient(), { wrapper });
            // Should get the inner client (closest provider)
            expect(result.current).toBe(innerClient);
            expect(result.current).not.toBe(outerClient);
        });
    });
});
