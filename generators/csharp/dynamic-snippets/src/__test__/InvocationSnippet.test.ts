import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include client instantiation or the
// surrounding `Examples` class/method scaffold. The `using ...;` block the call references is
// surfaced separately in the `imports` field. A plain C# invocation references no usings, so
// `imports` is empty for a bare call and only populated when the invocation constructs imported
// types inline.
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

    it("generates the invocation without client instantiation or class scaffold", () => {
        const response = generator.generateInvocationSync(request);

        // The generated invocation is multiline (matching the full snippet's `invokeMethod`
        // rendering), so the path argument sits on its own line.
        expect(response?.snippet).toBe('await client.Endpoints.HTTPMethods.TestGetAsync(\n    "id"\n)');
        // The invocation is a bare expression: no `var client = new ...Client(...)` construction,
        // no `Examples` class/method wrapper, no `using ...;` block, and no trailing `;`.
        expect(response?.snippet).not.toContain("var client");
        expect(response?.snippet).not.toContain("new ");
        expect(response?.snippet).not.toContain("class Examples");
        expect(response?.snippet).not.toContain("using ");
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

    it("exposes the client using so docs can render the client instantiation with the right namespace", () => {
        const response = generator.generateInvocationSync(request);

        // Distinct from `imports` (the usings the bare call references): `clientImport` is the
        // `using ...;` that brings the root client class into scope, so a docs template can render
        // `new AcmeClient(...)` alongside the invocation.
        expect(response?.clientImport).toBe("using Acme;\n");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('await mailchimp.Endpoints.HTTPMethods.TestGetAsync(\n    "id"\n)');
    });

    it("surfaces the using block the invocation references instead of falling back to the full snippet", () => {
        // This body references types the call constructs inline (a DateTime and a Guid), so the
        // invocation must carry the corresponding `using System;` directive. The previous
        // invocation-only contract had no way to express this; now the usings are surfaced
        // separately so docs can regenerate both the call and the usings it needs.
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
        expect(response?.snippet).toContain("DateTime");
        expect(response?.imports).toContain("using System;");
        expect(response?.errors).toBeUndefined();
    });
});
