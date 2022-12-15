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
                    "headers",
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
                    "headers",
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
                    "headers",
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
                    "headers",
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
                    "headers",
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
                    "path-parameters",
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
                    "path-parameters",
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
                    "path-parameters",
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
                    "path-parameters",
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
                    "path-parameters",
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
                    "query-parameters",
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
                    "query-parameters",
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
                    "query-parameters",
                ],
                relativeFilepath: "query-parameters.yml",
                severity: "error",
            },

            // request.yml
            {
                message: "Unexpected request in example.",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: "Expected example to be a string. Example is: undefined",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "c",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: "Expected example to be a string. Example is: 123",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "c",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: "Expected example to be an object. Example is: 123",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required property "bar"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: 'Example is missing required property "foo". <Inlined Request> -> (extends) WithFoo -> foo',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },
            {
                message: 'Unexpected property "extraProperty"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 2,
                        key: "examples",
                    },
                    "request",
                ],
                relativeFilepath: "request.yml",
                severity: "error",
            },

            // response.yml
            {
                message: "Expected example to be a boolean. Example is: undefined",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message: 'Expected example to be a boolean. Example is: "hello"',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 1,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message: "Expected example to be a string. Example is: undefined",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 3,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message: "Expected example to be a string. Example is: true",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 4,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message: "Unexpected response in example. ErrorWithNoBody does not have a body.",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 7,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message:
                    'NotFoundError is not specified as an allowed error for this endpoint. Add NotFoundError to the endpoint\'s "errors" list.',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 8,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message:
                    'NotFoundError is not specified as an allowed error for this endpoint. Add NotFoundError to the endpoint\'s "errors" list.',
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 9,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message: "Unexpected response in example. NotFoundError does not have a body.",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 9,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
            {
                message:
                    "Unexpected response in example. If you're adding an example of an error response, set the \"error\" property to the error's name",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "b",
                    {
                        arrayIndex: 0,
                        key: "examples",
                    },
                    "response",
                ],
                relativeFilepath: "response.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
