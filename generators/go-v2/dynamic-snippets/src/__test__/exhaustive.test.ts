import { AbsoluteFilePath } from "@fern-api/path-utils";

import { TestCase } from "./utils/TestCase";
import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";

describe("exhaustive", () => {
    const testCases: TestCase[] = [
        {
            description: "POST /container/list-of-primitives (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/container/list-of-primitives"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: ["one", "two", "three"]
            }
        },
        {
            description: "POST /container/list-of-objects (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/container/list-of-objects"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: [
                    {
                        string: "one"
                    },
                    {
                        string: "two"
                    },
                    {
                        string: "three"
                    }
                ]
            }
        }
    ];
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/exhaustive.json`),
        config: buildGeneratorConfig()
    });
    test.each(testCases)("$description", async ({ giveRequest }) => {
        const response = await generator.generate(giveRequest);
        expect(response.snippet).toMatchSnapshot();
    });
});

describe("exhaustive (errors)", () => {
    it("invalid request body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/exhaustive.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/container/list-of-objects"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: [
                {
                    string: true
                },
                {
                    invalid: "two"
                },
                {
                    string: 42
                }
            ]
        });
        expect(response.errors).toMatchSnapshot();
    });
});
