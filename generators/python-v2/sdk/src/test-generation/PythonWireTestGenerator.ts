import urlJoin from "url-join";

import { dynamic } from "@fern-api/dynamic-ir-sdk/api";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { AbstractPythonGeneratorContext, WriteablePythonFile } from "@fern-api/python-base";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { ExampleEndpointCall, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

export class PythonWireTestGenerator {
    private static readonly DEFAULT_BASE_URL = "http://example.test/";
    private static readonly DEFAULT_RESPONSE_VARIABLE_NAME = "response";

    private context: AbstractPythonGeneratorContext<any>;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(context: AbstractPythonGeneratorContext<any>) {
        this.context = context;

        // Create dynamic snippets generator instance
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: this.convertIrToDynamicIr(context.ir),
            config: this.createGeneratorConfig(context)
        });
    }

    public generateWireTests(): WriteablePythonFile[] {
        const wireTestFiles: WriteablePythonFile[] = [];

        // Generate wire tests for each service
        for (const [serviceId, service] of Object.entries(this.context.ir.services)) {
            const serviceContent = this.generateServiceContent(service);
            if (serviceContent) {
                wireTestFiles.push(serviceContent);
            }
        }

        // Generate empty __init__.py
        wireTestFiles.push(this.generateInitFile());

        return wireTestFiles;
    }

    private generateServiceContent(service: HttpService): WriteablePythonFile | undefined {
        const endpointsWithExamples = service.endpoints.filter((endpoint) => this.hasUsableExamples(endpoint));

        if (endpointsWithExamples.length === 0) {
            return undefined;
        }

        const serviceName = this.getServiceName(service);
        const titleCaseServiceName = serviceName[0]?.toUpperCase() + serviceName.slice(1);
        const className = `Test${titleCaseServiceName}Wire`;

        // Create the test class using AST
        const testClass = python.class_({
            name: className,
            docs: `Wire tests for ${serviceName} endpoints using sync client`
        });

        // Generate test methods for each endpoint with examples
        for (const endpoint of endpointsWithExamples) {
            const examples = this.getEndpointExamples(endpoint);

            examples.forEach((example, i) => {
                const testMethod = this.generateWireTestMethodFromExample(endpoint, service, example, i);
                if (testMethod) {
                    testClass.add(testMethod);
                }
            });
        }

        // Create file and add imports
        const file = python.file({ path: ["tests", "wire"] });

        // Add imports
        file.addStatement(python.codeBlock("import pytest"));
        file.addStatement(python.codeBlock("import httpx"));
        file.addStatement(python.codeBlock("import respx"));
        file.addStatement(python.codeBlock(""));

        // Add test class
        file.addStatement(testClass);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of("tests/wire"),
            filename: this.getServiceTestFileName(service)
        });
    }

    private generateWireTestMethodFromExample(
        endpoint: HttpEndpoint,
        service: HttpService,
        example: ExampleEndpointCall,
        exampleIndex: number
    ): python.Method | undefined {
        const methodName = this.getEndpointMethodName(endpoint);
        const testMethodName = exampleIndex > 0 ? `${methodName}_example_${exampleIndex}` : methodName;

        // generate dynamic snippets
        let snippetContent: string | undefined;
        try {
            const snippetRequest = this.convertExampleToSnippetRequest(example, endpoint);
            const snippetResponse = this.dynamicSnippetsGenerator.generateSync(snippetRequest, {
                captureResponse: true,
                responseVariableName: PythonWireTestGenerator.DEFAULT_RESPONSE_VARIABLE_NAME
            });

            snippetContent = snippetResponse.snippet;
        } catch (snippetError) {
            console.error(`Failed to generate dynamic snippet for ${methodName}:`, snippetError);
            snippetContent = undefined;
        }

        // potentially fallback
        if (!snippetContent) {
            return this.generateFallbackTestMethod(endpoint, example, exampleIndex);
        }

        // create test method structure
        const testMethod = python.method({
            name: `test_${testMethodName}`,
            parameters: [python.parameter({ name: "self", type: undefined })],
            return_: python.Type.none(),
            docstring: `Test ${methodName} endpoint.`,
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "respx.mock" })
                })
            ]
        });

        // add mock construction
        const mockStatements = this.generateMockSetup(endpoint, example, testMethodName);
        mockStatements.forEach((statement) => testMethod.addStatement(statement));

        // add dynamic snippet
        testMethod.addStatement(python.codeBlock(snippetContent));

        // add assertions
        const responseAssertions = this.generateResponseAssertionsFromExample(example);
        if (responseAssertions.trim()) {
            testMethod.addStatement(python.codeBlock(responseAssertions));
        }

        return testMethod;
    }

    private generateMockSetup(
        endpoint: HttpEndpoint,
        example: ExampleEndpointCall,
        testMethodName: string
    ): python.AstNode[] {
        const statements: python.AstNode[] = [];

        // Add expected URL assignment
        const expectedUrl = this.buildExpectedUrl(example, endpoint);
        statements.push(
            python.assign({
                lhs: python.reference({ name: "expected_url" }),
                rhs: python.TypeInstantiation.str(expectedUrl)
            })
        );

        // Add mock response setup using proper AST construction
        const mockResponse = this.extractResponseFromExample(example);
        const statusCode = this.getResponseStatusCode(example, endpoint);

        const httpxResponseCall = python.instantiateClass({
            classReference: python.reference({ name: "Response", modulePath: ["httpx"] }),
            arguments_: [
                python.methodArgument({ value: python.TypeInstantiation.int(statusCode) }),
                python.methodArgument({
                    name: "json",
                    value: python.codeBlock(
                        mockResponse !== undefined ? this.convertToPythonLiteral(mockResponse) : "None"
                    )
                }),
                python.methodArgument({
                    name: "headers",
                    value: python.TypeInstantiation.dict([
                        {
                            key: python.TypeInstantiation.str("content-type"),
                            value: python.TypeInstantiation.str("application/json")
                        }
                    ])
                })
            ],
            multiline: true
        });

        statements.push(
            python.assign({
                lhs: python.reference({ name: "expected_response" }),
                rhs: httpxResponseCall
            })
        );

        // Add respx mock setup using proper AST construction
        const httpMethod = endpoint.method.toLowerCase();
        const respxCall = python.invokeMethod({
            on: python.reference({ name: "respx" }),
            method: httpMethod,
            arguments_: [python.methodArgument({ value: python.reference({ name: "expected_url" }) })]
        });

        // Assign the respx call to an intermediate variable
        statements.push(
            python.assign({
                lhs: python.reference({ name: `${testMethodName}_request` }),
                rhs: respxCall
            })
        );

        const mockSetup = python.invokeMethod({
            on: python.reference({ name: `${testMethodName}_request` }),
            method: "mock",
            arguments_: [
                python.methodArgument({
                    name: "return_value",
                    value: python.reference({ name: "expected_response" })
                })
            ]
        });

        statements.push(
            python.assign({
                lhs: python.reference({ name: `${testMethodName}_mock` }),
                rhs: mockSetup
            })
        );

        return statements;
    }

    private generateInitFile(): WriteablePythonFile {
        const file = python.file({ path: ["tests", "wire"] });
        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of("tests/wire"),
            filename: "__init__"
        });
    }

    private hasUsableExamples(endpoint: HttpEndpoint): boolean {
        const examples = this.getEndpointExamples(endpoint);
        return examples.length > 0;
    }

    private getEndpointExamples(endpoint: HttpEndpoint): ExampleEndpointCall[] {
        const examples: ExampleEndpointCall[] = [];

        // Get user-specified examples
        if (endpoint.userSpecifiedExamples && endpoint.userSpecifiedExamples.length > 0) {
            for (const userExample of endpoint.userSpecifiedExamples) {
                if (userExample.example) {
                    examples.push(userExample.example);
                }
            }
        }

        // Get auto-generated examples if no user examples
        if (examples.length === 0 && endpoint.autogeneratedExamples && endpoint.autogeneratedExamples.length > 0) {
            for (const autoExample of endpoint.autogeneratedExamples) {
                if (autoExample.example) {
                    examples.push(autoExample.example);
                }
            }
        }

        return examples;
    }

    private convertExampleToSnippetRequest(
        example: ExampleEndpointCall,
        endpoint: HttpEndpoint
    ): dynamic.EndpointSnippetRequest {
        const components: string[] = [];

        const head = endpoint.fullPath.head || "";
        if (!head.startsWith("/")) {
            components.push("/");
        }

        if (head.length > 0) {
            components.push(head);
        }

        // add path parts
        for (const part of endpoint.fullPath.parts) {
            components.push(`{${part.pathParameter}}`);
            if (part.tail.length > 0) {
                components.push(part.tail);
            }
        }

        // normalize multiple slashes
        let path = components.join("");
        path = path.replace(/\/+/g, "/"); // Replace multiple slashes with single slash

        // If path is empty, default to "/"
        if (!path || path.trim() === "") {
            path = "/";
        }

        const endpointLocation: dynamic.EndpointLocation = {
            method: endpoint.method,
            path
        };

        // extract path parameters
        const pathParameters: Record<string, unknown> = {};
        [
            ...(example.rootPathParameters || []),
            ...(example.servicePathParameters || []),
            ...(example.endpointPathParameters || [])
        ].forEach((param) => {
            pathParameters[param.name.originalName] = param.value.jsonExample;
        });

        // extract query parameters
        const queryParameters: Record<string, unknown> = {};
        (example.queryParameters || []).forEach((param) => {
            queryParameters[param.name.name.originalName] = param.value.jsonExample;
        });

        // extract headers
        const headers: Record<string, unknown> = {};
        [...(example.serviceHeaders || []), ...(example.endpointHeaders || [])].forEach((header) => {
            headers[header.name.name.originalName] = header.value.jsonExample;
        });

        // extract request body
        let requestBody: unknown = undefined;
        if (example.request && example.request.type === "inlinedRequestBody") {
            const properties: Record<string, unknown> = {};
            example.request.properties.forEach((prop) => {
                properties[prop.name.name.originalName] = prop.value.jsonExample;
            });
            requestBody = properties;
        } else if (example.request && example.request.type === "reference") {
            requestBody = example.request.jsonExample;
        }

        const request: dynamic.EndpointSnippetRequest = {
            endpoint: endpointLocation,
            baseURL: PythonWireTestGenerator.DEFAULT_BASE_URL,
            pathParameters: Object.keys(pathParameters).length > 0 ? pathParameters : undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            requestBody,
            auth: undefined, // TODO: Extract auth from examples if needed
            environment: undefined
        };

        return request;
    }

    private generateFallbackTestMethod(
        endpoint: HttpEndpoint,
        example: ExampleEndpointCall,
        exampleIndex: number
    ): python.Method {
        const methodName = this.getEndpointMethodName(endpoint);
        const testMethodName =
            exampleIndex > 0 ? `${methodName}_example_${exampleIndex}_fallback` : `${methodName}_fallback`;

        const testMethod = python.method({
            name: `test_${testMethodName}`,
            parameters: [python.parameter({ name: "self", type: undefined })],
            return_: python.Type.none(),
            docstring: `Test ${methodName} endpoint`,
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "pytest.mark.skip", modulePath: [] })
                }),
                python.decorator({
                    callable: python.reference({ name: "respx.mock" })
                })
            ]
        });

        testMethod.addStatement(python.codeBlock("# TODO snippet generation failed -- manual implementation needed"));
        testMethod.addStatement(python.codeBlock("pass"));

        return testMethod;
    }

    private buildExpectedUrl(example: ExampleEndpointCall, endpoint: HttpEndpoint): string {
        // use URL from example if available
        if (example.url) {
            return urlJoin(PythonWireTestGenerator.DEFAULT_BASE_URL, example.url);
        }

        // collect path parameters from example
        const pathParameters = new Map<string, string>();
        [
            ...(example.rootPathParameters || []),
            ...(example.servicePathParameters || []),
            ...(example.endpointPathParameters || [])
        ].forEach((param) => {
            let paramValue: string;
            if (typeof param.value.jsonExample === "string") {
                paramValue = param.value.jsonExample;
            } else {
                paramValue = JSON.stringify(param.value.jsonExample);
            }
            pathParameters.set(param.name.originalName, paramValue);
        });

        // Build the path with actual parameter values
        let path = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            // Use actual parameter value instead of placeholder
            const paramValue = pathParameters.get(part.pathParameter) || part.pathParameter;
            path = urlJoin(path, paramValue);
            if (part.tail.length > 0) {
                path = urlJoin(path, part.tail);
            }
        }

        // Properly join base URL with the constructed path
        return urlJoin(PythonWireTestGenerator.DEFAULT_BASE_URL, path);
    }

    private extractResponseFromExample(example: ExampleEndpointCall): any {
        if (example.response && example.response.type === "ok") {
            // For success responses, extract the jsonExample directly from the response body
            if (example.response.value && example.response.value.type === "body") {
                const responseValue = example.response.value.value;
                if (responseValue && typeof responseValue === "object" && "jsonExample" in responseValue) {
                    return responseValue.jsonExample;
                }
                // Fallback to the value itself if it doesn't have jsonExample wrapper
                return responseValue;
            }
        }

        // fallback
        return { message: "success" };
    }

    private convertToPythonLiteral(value: any): string {
        return python.TypeInstantiation.unknown(value).toString();
    }

    private generateResponseAssertionsFromExample(example: ExampleEndpointCall): string {
        const responseVar = PythonWireTestGenerator.DEFAULT_RESPONSE_VARIABLE_NAME;
        const responseData = this.extractResponseFromExample(example);

        if (!responseData || responseData === null) {
            return `assert ${responseVar} is not None`;
        }

        // Handle object responses (most common case)
        if (typeof responseData === "object" && responseData !== null && !Array.isArray(responseData)) {
            const assertions: string[] = [];

            Object.entries(responseData).forEach(([key, value]) => {
                if (typeof value === "string") {
                    assertions.push(`assert ${responseVar}.${key} == "${value}"`);
                } else if (typeof value === "number") {
                    assertions.push(`assert ${responseVar}.${key} == ${value}`);
                } else if (typeof value === "boolean") {
                    assertions.push(`assert ${responseVar}.${key} == ${value ? "True" : "False"}`);
                } else if (value === null) {
                    assertions.push(`assert ${responseVar}.${key} is None`);
                } else if (Array.isArray(value)) {
                    assertions.push(`assert len(${responseVar}.${key}) == ${value.length}`);
                    // Add basic type checking for array elements if not empty
                    if (value.length > 0) {
                        const firstElement = value[0];
                        if (typeof firstElement === "string") {
                            assertions.push(`assert all(isinstance(item, str) for item in ${responseVar}.${key})`);
                        } else if (typeof firstElement === "number") {
                            assertions.push(
                                `assert all(isinstance(item, (int, float)) for item in ${responseVar}.${key})`
                            );
                        }
                    }
                } else {
                    // For nested objects, just check they exist for now
                    assertions.push(`assert ${responseVar}.${key} is not None`);
                }
            });

            if (assertions.length > 0) {
                return assertions.join("\n");
            }
        }
        // Handle array responses
        else if (Array.isArray(responseData)) {
            const assertions: string[] = [];
            assertions.push(`assert len(${responseVar}) == ${responseData.length}`);

            if (responseData.length > 0) {
                const firstElement = responseData[0];
                if (typeof firstElement === "string") {
                    assertions.push(`assert all(isinstance(item, str) for item in ${responseVar})`);
                } else if (typeof firstElement === "number") {
                    assertions.push(`assert all(isinstance(item, (int, float)) for item in ${responseVar})`);
                } else if (typeof firstElement === "object") {
                    assertions.push(`assert all(isinstance(item, dict) for item in ${responseVar})`);
                }
            }

            return assertions.join("\n");
        }
        // Handle primitive responses
        else {
            if (typeof responseData === "string") {
                return `assert ${responseVar} == "${responseData}"`;
            } else if (typeof responseData === "number") {
                return `assert ${responseVar} == ${responseData}`;
            } else if (typeof responseData === "boolean") {
                return `assert ${responseVar} == ${responseData ? "True" : "False"}`;
            } else {
                return `assert ${responseVar} == ${this.convertToPythonLiteral(responseData)}`;
            }
        }

        // Final fallback
        return `assert ${responseVar} is not None`;
    }

    private getServiceSnakeCaseSafeName(service: HttpService): string {
        if (service.name.fernFilepath.file) {
            return this.context.getSnakeCaseSafeName(service.name.fernFilepath.file);
        } else if (service.name.fernFilepath.allParts.length > 0) {
            const lastPart = service.name.fernFilepath.allParts[service.name.fernFilepath.allParts.length - 1];
            if (lastPart !== undefined) {
                return this.context.getSnakeCaseSafeName(lastPart);
            }
        }
        return "service"; // fallback
    }

    private getServiceName(service: HttpService): string {
        return service.displayName || this.getServiceSnakeCaseSafeName(service);
    }

    private getServiceTestFileName(service: HttpService): string {
        return `test_${this.getServiceSnakeCaseSafeName(service)}`;
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.snakeCase.safeName || "endpoint";
    }

    // Helper methods for dynamic snippets generator setup
    private convertIrToDynamicIr(ir: IntermediateRepresentation): dynamic.DynamicIntermediateRepresentation {
        // Check if dynamic IR is available
        if (!ir.dynamic) {
            throw new Error(
                "Dynamic IR is not available - cannot generate wire tests using dynamic snippets. Make sure the IR generation includes dynamic snippets."
            );
        }

        // assume compatibility
        return ir.dynamic as any;
    }

    private createGeneratorConfig(context: AbstractPythonGeneratorContext<any>): any {
        return {
            organization: context.config.organization,
            workspaceName: context.config.workspaceName,
            customConfig: context.customConfig || {}
        };
    }

    private getResponseStatusCode(example: ExampleEndpointCall, endpoint: HttpEndpoint): number {
        switch (endpoint.method) {
            case "POST":
                return 201; // Created
            case "PUT":
            case "PATCH":
            case "GET":
                return 200; // OK
            case "DELETE":
                return 204; // No Content
            default:
                return 200;
        }
    }
}
