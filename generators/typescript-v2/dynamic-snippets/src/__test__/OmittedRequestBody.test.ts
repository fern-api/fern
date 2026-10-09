import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// an example that omits `request` reaches the snippet generator as an undefined request body,
// which must not produce syntactically invalid code
describe("omitted request body", () => {
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json")),
        config: buildGeneratorConfig({})
    });

    it("omits the argument entirely when the body is the only argument", async () => {
        const response = await generator.generate({
            endpoint: {
                method: "PUT",
                path: "/http-methods/{id}"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            pathParameters: {
                id: "id"
            },
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });

        expect(response.snippet).toContain('client.endpoints.httpMethods.testPut("id")');
        expect(response.snippet).not.toContain(", )");
    });

    it("omits the body from the request wrapper", async () => {
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/params/body-and-query"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            pathParameters: undefined,
            queryParameters: {
                _fields: "fields"
            },
            headers: undefined,
            requestBody: undefined
        });

        expect(response.snippet).not.toContain(", )");
        expect(response.snippet).not.toContain(", }");
        // the property is dropped rather than passed explicitly as undefined
        expect(response.snippet).not.toContain("undefined");
        expect(response.snippet).toContain('fields: "fields"');
    });
});
