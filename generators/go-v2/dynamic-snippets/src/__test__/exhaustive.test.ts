import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { AuthValues } from "@fern-fern/ir-sdk/api/resources/dynamic";
import { TestCase } from "./utils/TestCase";

describe("exhaustive", () => {
    const testCases: TestCase[] = [
        {
            description: "POST /container/list-of-primitives (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/container/list-of-primitives"
                },
                auth: AuthValues.bearer({
                    token: "<YOUR_API_KEY>"
                }),
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
                auth: AuthValues.bearer({
                    token: "<YOUR_API_KEY>"
                }),
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
        irFilepath: join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, RelativeFilePath.of("exhaustive.json")),
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
            irFilepath: join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, RelativeFilePath.of("exhaustive.json")),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/container/list-of-objects"
            },
            auth: AuthValues.bearer({
                token: "<YOUR_API_KEY>"
            }),
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
