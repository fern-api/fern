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
            method: "PUT" as const,
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

        expect(response?.snippet).toBe('client.endpoints.httpMethods.testPut("id")');
        expect(response?.imports).toBe("");
        expect(response?.errors).toBeUndefined();
    });

    it("exposes the generated client class name so docs can render the client instantiation", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("AcmeClient");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('mailchimp.endpoints.httpMethods.testPut("id")');
    });

    it("returns the imports the invocation references instead of falling back to the full snippet", () => {
        const brandedGenerator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "alias.json")),
            config: buildGeneratorConfig({ customConfig: { useBrandedStringAliases: true } })
        });

        const response = brandedGenerator.generateInvocationSync({
            endpoint: {
                method: "GET" as const,
                path: "/{typeId}"
            },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: {
                typeId: "type-abc123"
            },
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });

        // The branded-alias case used to return undefined; now it returns the call plus the
        // import the call needs (the SDK namespace import), so docs can regenerate both.
        expect(response).not.toBeUndefined();
        expect(response?.snippet).toBe('client.get(Acme.TypeID("type-abc123"))');
        expect(response?.imports).toContain("import");
        expect(response?.imports).toContain("Acme");
    });
});
