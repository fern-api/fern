import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidExampleEndpointCallRule } from "../valid-example-endpoint-call";

describe("valid-example-endpoint-call", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            // headers.yml
            {
                message: 'Example is missing required header "serviceHeader"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                ],
                relativeFilepath: "headers.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required header "endpointHeader"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                ],
                relativeFilepath: "headers.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required header "serviceHeader"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                ],
                relativeFilepath: "headers.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required header "endpointHeader"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                ],
                relativeFilepath: "headers.yml",
                severity: "error",
            },
            {
                message: 'Unexpected header "extraHeader"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples",
                    },
                ],
                relativeFilepath: "headers.yml",
                severity: "error",
            },

            // path-parameters.yml
            {
                message: 'Example is missing required path parameter "servicePathParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                ],
                relativeFilepath: "path-parameters.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required path parameter "endpointPathParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                ],
                relativeFilepath: "path-parameters.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required path parameter "servicePathParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                ],
                relativeFilepath: "path-parameters.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required path parameter "endpointPathParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                ],
                relativeFilepath: "path-parameters.yml",
                severity: "error",
            },
            {
                message: 'Unexpected path parameter "extraParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples",
                    },
                ],
                relativeFilepath: "path-parameters.yml",
                severity: "error",
            },

            // query-parameters.yml
            {
                message: 'Example is missing required query parameter "queryParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                ],
                relativeFilepath: "query-parameters.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required query parameter "queryParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples",
                    },
                ],
                relativeFilepath: "query-parameters.yml",
                severity: "error",
            },
            {
                message: 'Unexpected query parameter "extraParam"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples",
                    },
                ],
                relativeFilepath: "query-parameters.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
