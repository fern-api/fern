import { SeedTsCustomHeaderAuthRedactionClient } from "../../../src/Client";

function createCapturingClient(headers?: Record<string, string>) {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const fetchFn = vi.fn(
        async () =>
            new Response(JSON.stringify({ request_id: "request-1" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
    );
    const client = new SeedTsCustomHeaderAuthRedactionClient({
        environment: "https://api.example.com",
        secret: "CLIENT_SECRET_VALUE",
        clientId: "CLIENT_ID_VALUE",
        version: "2020-09-14",
        maxRetries: 0,
        fetch: fetchFn,
        headers,
        logging: { level: "debug", silent: false, logger },
    });
    return { client, logger, fetchFn };
}

function getLoggedRequestHeaders(logger: { debug: ReturnType<typeof vi.fn> }): Record<string, string> {
    const call = logger.debug.mock.calls.find(([message]) => message === "Making HTTP request");
    expect(call).toBeDefined();
    return call?.[1].headers;
}

function serializedLogs(logger: { debug: ReturnType<typeof vi.fn> }): string {
    return JSON.stringify(logger.debug.mock.calls);
}

describe("debug logging redaction for API-configured credential headers", () => {
    it("redacts the custom auth header and the credential global header", async () => {
        const { client, logger, fetchFn } = createCapturingClient();

        await client.accounts.get({ access_token: "access-sandbox-1" });

        const sentHeaders = new Headers(fetchFn.mock.calls[0]?.[1]?.headers);
        expect(sentHeaders.get("PARTNER-SECRET")).toBe("CLIENT_SECRET_VALUE");
        expect(sentHeaders.get("PARTNER-CLIENT-ID")).toBe("CLIENT_ID_VALUE");

        const loggedHeaders = getLoggedRequestHeaders(logger);
        expect(loggedHeaders["partner-secret"]).toBe("[REDACTED]");
        expect(loggedHeaders["partner-client-id"]).toBe("[REDACTED]");
        expect(serializedLogs(logger)).not.toContain("CLIENT_SECRET_VALUE");
        expect(serializedLogs(logger)).not.toContain("CLIENT_ID_VALUE");
    });

    it("redacts request-level overrides of the custom auth header regardless of casing", async () => {
        const { client, logger } = createCapturingClient();

        await client.accounts.get(
            { access_token: "access-sandbox-1" },
            { headers: { "partner-secret": "OVERRIDE_SECRET_VALUE", "Partner-Client-Id": "OVERRIDE_ID_VALUE" } },
        );

        const loggedHeaders = getLoggedRequestHeaders(logger);
        expect(loggedHeaders["partner-secret"]).toBe("[REDACTED]");
        expect(loggedHeaders["partner-client-id"]).toBe("[REDACTED]");
        expect(serializedLogs(logger)).not.toContain("OVERRIDE_SECRET_VALUE");
        expect(serializedLogs(logger)).not.toContain("OVERRIDE_ID_VALUE");
    });

    it("still redacts Authorization", async () => {
        const { client, logger } = createCapturingClient({ Authorization: "Bearer BEARER_SECRET_VALUE" });

        await client.accounts.get({ access_token: "access-sandbox-1" });

        expect(getLoggedRequestHeaders(logger).authorization).toBe("[REDACTED]");
        expect(serializedLogs(logger)).not.toContain("BEARER_SECRET_VALUE");
    });

    it("does not redact ordinary request metadata", async () => {
        const { client, logger } = createCapturingClient();

        await client.accounts.get({ access_token: "access-sandbox-1" });

        const loggedHeaders = getLoggedRequestHeaders(logger);
        expect(loggedHeaders["content-type"]).toBe("application/json");
        expect(loggedHeaders["user-agent"]).toBe("@fern/ts-custom-header-auth-redaction/0.0.1");
        expect(loggedHeaders["partner-version"]).toBe("2020-09-14");
        expect(loggedHeaders["x-fern-language"]).toBe("JavaScript");
        expect(loggedHeaders["x-fern-sdk-name"]).toBe("@fern/ts-custom-header-auth-redaction");
        expect(loggedHeaders["x-fern-sdk-version"]).toBe("0.0.1");
    });
});
