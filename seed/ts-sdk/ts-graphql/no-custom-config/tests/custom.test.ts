/**
 * Runtime behavior tests for the generated GraphQL SDK.
 *
 * These mock a real GraphQL API at the transport layer (by injecting a custom
 * `fetch`) and assert that the SDK (a) sends a correct GraphQL-over-HTTP request
 * — POST /graphql with a `{ query, variables }` body and auth headers — and
 * (b) correctly parses the `{ data, errors }` response envelope, including the
 * `throwOnError` -> GraphqlError path.
 *
 * This file is fernignore-protected, so regeneration will not overwrite it.
 */
import { SeedApiClient } from "../src/index.js";

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

describe("ts-graphql generated SDK — runtime behavior against a mock GraphQL API", () => {
    it("query.viewer() POSTs a GraphQL query to /graphql with auth and parses the {data} envelope", async () => {
        const calls: Array<{ url: string; init: RequestInit }> = [];
        const fetchMock = vi.fn(async (url: unknown, init: unknown) => {
            calls.push({ url: String(url), init: init as RequestInit });
            return jsonResponse({
                data: {
                    viewer: {
                        id: "u_1",
                        name: "Ada Lovelace",
                        email: "ada@example.com",
                        role: "ADMIN",
                        createdAt: "2020-01-01T00:00:00Z",
                        legacyUsername: "ada",
                    },
                },
            });
        });

        const client = new SeedApiClient({
            environment: "https://api.example.test",
            auth: async () => ({ headers: { Authorization: "Bearer test-token" } }),
            fetch: fetchMock as unknown as typeof fetch,
        });

        const res = await client.query.viewer();

        // --- request wire format ---
        expect(calls).toHaveLength(1);
        expect(calls[0]!.url).toBe("https://api.example.test/graphql");
        expect(calls[0]!.init.method).toBe("POST");
        const headers = new Headers(calls[0]!.init.headers as HeadersInit);
        expect(headers.get("authorization")).toBe("Bearer test-token");
        const sent = JSON.parse(String(calls[0]!.init.body));
        expect(sent.query).toContain("viewer");
        expect(sent.query).toContain("name");
        expect(sent.query).toContain("email");

        // --- response parsing ---
        expect(res.data?.name).toBe("Ada Lovelace");
        expect(res.data?.role).toBe("ADMIN");
        expect(res.errors).toBeUndefined();
    });

    it("query.user({ id }) sends the id as a GraphQL variable", async () => {
        let sent: { query: string; variables: Record<string, unknown> } | undefined;
        const fetchMock = vi.fn(async (_url: unknown, init: unknown) => {
            sent = JSON.parse(String((init as RequestInit).body));
            return jsonResponse({
                data: {
                    user: {
                        id: "u_42",
                        name: "Grace Hopper",
                        email: "grace@example.com",
                        role: "USER",
                        createdAt: "2021-01-01T00:00:00Z",
                        legacyUsername: "grace",
                    },
                },
            });
        });
        const client = new SeedApiClient({
            environment: "https://api.example.test",
            auth: false,
            fetch: fetchMock as unknown as typeof fetch,
        });

        const res = await client.query.user({ id: "u_42" });

        expect(sent?.variables).toMatchObject({ id: "u_42" });
        expect(sent?.query).toContain("user");
        expect(res.data?.name).toBe("Grace Hopper");
    });

    it("surfaces GraphQL operation errors on the {data, errors} envelope by default", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ data: null, errors: [{ message: "user not found" }] }));
        const client = new SeedApiClient({
            environment: "https://api.example.test",
            auth: false,
            fetch: fetchMock as unknown as typeof fetch,
        });

        const res = await client.query.user({ id: "missing" });

        expect(res.errors?.[0]?.message).toBe("user not found");
    });

    it("throws GraphqlError when throwOnError is set and the response contains errors", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ data: null, errors: [{ message: "unauthorized" }] }));
        const client = new SeedApiClient({
            environment: "https://api.example.test",
            auth: false,
            fetch: fetchMock as unknown as typeof fetch,
        });

        await expect(client.query.user({ id: "x" }, undefined, { throwOnError: true })).rejects.toMatchObject({
            errors: [{ message: "unauthorized" }],
        });
    });
});
