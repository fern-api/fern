import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include client instantiation or the
// surrounding package/class/method scaffold. The imports the call references are surfaced
// separately in the `imports` field. Unlike Go (whose SDK methods take a leading
// context.Context), a plain Java invocation references no imports, so `imports` is empty for a
// bare call and only populated when the invocation constructs imported types inline.
describe("invocation-only snippets", () => {
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json")),
        config: buildGeneratorConfig({})
    });

    const request = {
        endpoint: {
            method: "GET" as const,
            path: "/http-methods/{id}"
        },
        baseURL: undefined,
        environment: undefined,
        auth: {
            type: "bearer" as const,
            token: "<YOUR_API_KEY>"
        },
        pathParameters: {
            id: "id"
        },
        queryParameters: undefined,
        headers: undefined,
        requestBody: undefined
    };

    it("generates the invocation without client instantiation or package scaffold", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.snippet).toBe('client.endpoints().httpMethods().testGet("id")');
        // The invocation is a bare expression: no `Client client = Client.builder()...`
        // construction, no `package`/class/method wrapper, no import block, and no trailing `;`.
        expect(response?.snippet).not.toContain(".builder()");
        expect(response?.snippet).not.toContain("package ");
        expect(response?.snippet).not.toContain("import ");
        expect(response?.snippet.endsWith(";")).toBe(false);
        expect(response?.errors).toBeUndefined();
    });

    it("returns no imports for a bare call that references none", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.imports).toBe("");
    });

    it("exposes the generated client class name so docs can render the client instantiation", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("AcmeAcmeClient");
    });

    it("exposes the client import so docs can render the client construction without authoring it", () => {
        const response = generator.generateInvocationSync(request);

        // The client import is distinct from `imports` (which only carries imports the bare call
        // references). It imports the generated client class itself so docs can render `new
        // AcmeAcmeClient(...)` alongside the invocation.
        expect(response?.clientImport).toContain("import ");
        expect(response?.clientImport).toContain(`${response?.clientName};`);
        expect(response?.clientImport?.trim().endsWith(";")).toBe(true);
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('mailchimp.endpoints().httpMethods().testGet("id")');
    });

    it("surfaces the imports the invocation references instead of falling back to the full snippet", () => {
        // This body references SDK/stdlib types the call constructs inline (a UUID via
        // UUID.fromString, a datetime via OffsetDateTime.parse, and an Optional wrapper), so the
        // invocation must carry the corresponding imports. The previous invocation-only contract
        // had no way to express this; now the imports are surfaced separately so docs can
        // regenerate both the call and the imports it needs.
        const response = generator.generateInvocationSync({
            endpoint: {
                method: "POST" as const,
                path: "/object/get-and-return-with-optional-field"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer" as const,
                token: "<YOUR_API_KEY>"
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { 1: "map" },
                bigint: "1000000"
            }
        });

        expect(response).not.toBeUndefined();
        expect(response?.snippet).toContain("UUID.fromString");
        expect(response?.snippet).toContain("OffsetDateTime.parse");
        expect(response?.imports).toContain("import java.util.UUID;");
        expect(response?.imports).toContain("import java.time.OffsetDateTime;");
        expect(response?.imports).toContain("import java.util.Optional;");
        expect(response?.errors).toBeUndefined();
    });
});
