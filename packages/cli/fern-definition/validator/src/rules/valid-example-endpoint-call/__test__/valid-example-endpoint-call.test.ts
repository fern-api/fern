import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidExampleEndpointCallRule } from "../valid-example-endpoint-call";

describe("valid-example-endpoint-call", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            // headers.yml
            {
                message: 'Example is missing required header "serviceHeader"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "headers"
                ],
                relativeFilepath: RelativeFilePath.of("headers.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required header "endpointHeader"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "headers"
                ],
                relativeFilepath: RelativeFilePath.of("headers.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required header "serviceHeader"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "headers"
                ],
                relativeFilepath: RelativeFilePath.of("headers.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required header "endpointHeader"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "headers"
                ],
                relativeFilepath: RelativeFilePath.of("headers.yml"),
                severity: "error"
            },
            {
                message: 'Unexpected header "extraHeader"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples"
                    },
                    "headers"
                ],
                relativeFilepath: RelativeFilePath.of("headers.yml"),
                severity: "error"
            },

            // path-parameters.yml
            {
                message: 'Example is missing required path parameter "servicePathParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "path-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("path-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required path parameter "endpointPathParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "path-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("path-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required path parameter "servicePathParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "path-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("path-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required path parameter "endpointPathParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "path-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("path-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Unexpected path parameter "extraParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples"
                    },
                    "path-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("path-parameters.yml"),
                severity: "error"
            },

            // query-parameters.yml
            {
                message: 'Example is missing required query parameter "queryParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "query-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("query-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required query parameter "queryParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples"
                    },
                    "query-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("query-parameters.yml"),
                severity: "error"
            },
            {
                message: 'Unexpected query parameter "extraParam"',
                nodePath: [
                    "service",
                    "endpoints",
                    "get",
                    {
                        arrayIndex: 3,
                        key: "examples"
                    },
                    "query-parameters"
                ],
                relativeFilepath: RelativeFilePath.of("query-parameters.yml"),
                severity: "error"
            },

            // request.yml
            {
                message: "Unexpected request in example.",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: "Expected example to be a string. Example is: undefined",
                nodePath: [
                    "service",
                    "endpoints",
                    "c",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: "Expected example to be a string. Example is: 123",
                nodePath: [
                    "service",
                    "endpoints",
                    "c",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: "Expected example to be an object. Example is: 123",
                nodePath: [
                    "service",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required property "request.bar"',
                nodePath: [
                    "service",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: 'Example is missing required property "request.foo"',
                nodePath: [
                    "service",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },
            {
                message: 'Unexpected property "extraProperty"',
                nodePath: [
                    "service",
                    "endpoints",
                    "d",
                    {
                        arrayIndex: 2,
                        key: "examples"
                    },
                    "request"
                ],
                relativeFilepath: RelativeFilePath.of("request.yml"),
                severity: "error"
            },

            // response.yml
            {
                message: "Expected example to be a boolean. Example is: undefined",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message: 'Expected example to be a boolean. Example is: "hello"',
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 1,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message: "Expected example to be a string. Example is: undefined",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 3,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message: "Expected example to be a string. Example is: true",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 4,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message: "Unexpected response in example. ErrorWithNoBody does not have a body.",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 7,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message:
                    'NotFoundError is not specified as an allowed error for this endpoint. Add NotFoundError to the endpoint\'s "errors" list.',
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 8,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message:
                    'NotFoundError is not specified as an allowed error for this endpoint. Add NotFoundError to the endpoint\'s "errors" list.',
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 9,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message: "Unexpected response in example. NotFoundError does not have a body.",
                nodePath: [
                    "service",
                    "endpoints",
                    "a",
                    {
                        arrayIndex: 9,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            },
            {
                message:
                    "Unexpected response in example. If you're adding an example of an error response, set the \"error\" property to the error's name",
                nodePath: [
                    "service",
                    "endpoints",
                    "b",
                    {
                        arrayIndex: 0,
                        key: "examples"
                    },
                    "response"
                ],
                relativeFilepath: RelativeFilePath.of("response.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });

    it("optional-example-property", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("optional-example-property")
            )
        });

        const expectedViolations: ValidationViolation[] = [];
        expect(violations).toEqual(expectedViolations);
    });

    it("server-sent-events", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("server-sent-events")
            )
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    });

    it("endpoint-level-base-path", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("endpoint-level-base-path")
            )
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    });

    it("endpoint-recursive-types", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("endpoint-recursive-types")
            )
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    });

    it("extra-properties", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleEndpointCallRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("extra-properties")
            )
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    });
});
