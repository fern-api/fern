import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include imports or client instantiation
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

    it("generates the invocation without imports or client instantiation", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.snippet).toBe('client.endpoints.http_methods.test_get(\n    id="id",\n)');
        expect(response?.imports).toBe("");
        expect(response?.errors).toBeUndefined();
    });

    it("exposes the generated client class name so docs can render the client instantiation", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("Acme");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('mailchimp.endpoints.http_methods.test_get(\n    id="id",\n)');
    });

    it("returns the imports the invocation references instead of falling back to the full snippet", () => {
        // This body references stdlib types the call constructs inline (a datetime and a UUID),
        // so the invocation must carry `import datetime` / `import uuid`. The previous
        // invocation-only contract had no way to express this; now the imports are surfaced
        // separately so docs can regenerate both the call and the imports it needs.
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
        expect(response?.snippet).toContain("datetime.datetime.fromisoformat");
        expect(response?.snippet).toContain("uuid.UUID");
        expect(response?.imports).toContain("import datetime");
        expect(response?.imports).toContain("import uuid");
        expect(response?.errors).toBeUndefined();
    });
});
