import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include client instantiation, the `<?php`
// prefix, or the `namespace ...;` header. The `use ...;` block the call references is surfaced
// separately in the `imports` field. A plain PHP invocation references no imports, so `imports`
// is empty for a bare call and only populated when the invocation constructs types from another
// namespace inline (e.g. an inlined request class).
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

    it("generates the invocation without client instantiation, php prefix, or namespace header", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.snippet).toBe("$client->endpoints->httpMethods->testGet(\n    'id',\n)");
        // The invocation is a bare expression: no `$client = new ...Client(...)` construction, no
        // `<?php` prefix, no `namespace ...;` / `use ...;` block, and no trailing `;`.
        expect(response?.snippet).not.toContain("= new ");
        expect(response?.snippet).not.toContain("<?php");
        expect(response?.snippet).not.toContain("namespace ");
        expect(response?.snippet).not.toContain("use ");
        expect(response?.snippet.endsWith(";")).toBe(false);
        expect(response?.errors).toBeUndefined();
    });

    it("returns no imports for a bare call that references none", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.imports).toBe("");
    });

    it("exposes the generated client class name so docs can render the client instantiation", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("AcmeClient");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "$mailchimp" });

        expect(response?.snippet).toBe("$mailchimp->endpoints->httpMethods->testGet(\n    'id',\n)");
    });

    it("surfaces the use block the invocation references instead of falling back to the full snippet", () => {
        // This body constructs an inlined request class that lives in another namespace, so the
        // invocation must carry the corresponding `use ...;` statement. The previous
        // invocation-only contract had no way to express this; now the imports are surfaced
        // separately so docs can regenerate both the call and the `use` statements it needs.
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
        // The call constructs the inlined request class inline, so its `use` is surfaced.
        expect(response?.snippet).toContain("new ObjectWithOptionalField(");
        expect(response?.imports).toContain("use Acme\\Types\\Object\\Types\\ObjectWithOptionalField;");
        // The datetime body value constructs a `DateTime`, whose `use` is surfaced too.
        expect(response?.imports).toContain("use DateTime;");
        expect(response?.errors).toBeUndefined();
    });
});
