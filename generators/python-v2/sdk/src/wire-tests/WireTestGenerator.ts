import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

/**
 * Generates WireMock-based integration tests for Python SDK.
 *
 * This is a skeleton implementation that sets up the infrastructure for wire tests
 * but does not implement the actual Python test code generation.
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.wireMockConfigContent = this.getWireMockConfigContent();
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, endpointsWithExamples);
            if (serviceTestFile) {
                this.context.project.addSourceFiles(serviceTestFile);
            }
        }

        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    // =============================================================================
    // FILE GENERATION
    // =============================================================================

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[]
    ): Promise<WriteablePythonFile | null> {
        const endpointTestCases: Array<{ endpoint: HttpEndpoint; example: dynamic.EndpointExample }> = [];

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    endpointTestCases.push({ endpoint, example: firstExample });
                }
            }
        }

        if (endpointTestCases.length === 0) {
            return null;
        }

        this.context.logger.info(
            `Generating test file for service ${serviceName} with ${endpointTestCases.length} test cases`
        );

        const pythonFile = this.buildTestFile(serviceName, endpointTestCases);

        return new WriteablePythonFile({
            filename: `test_${serviceName}`,
            directory: RelativeFilePath.of("tests/wire"),
            contents: pythonFile
        });
    }

    // =============================================================================
    // FILE BUILDING
    // =============================================================================

    private buildTestFile(
        serviceName: string,
        testCases: Array<{ endpoint: HttpEndpoint; example: dynamic.EndpointExample }>
    ): python.PythonFile {
        const statements: python.AstNode[] = [];

        // Add setup fixture
        statements.push(this.generateSetupFixture());

        // Add helper functions
        statements.push(this.generateResetWiremockFunction());
        statements.push(this.generateVerifyRequestCountFunction());

        // Add test functions for each endpoint
        for (const { endpoint, example } of testCases) {
            const testFunction = this.generateEndpointTestFunction(serviceName, endpoint, example);
            if (testFunction) {
                statements.push(testFunction);
            }
        }

        return python.file({
            path: ["tests", "wire", `test_${serviceName}`],
            statements
        });
    }

    // =============================================================================
    // HELPER FUNCTION GENERATION
    // =============================================================================

    private generateSetupFixture(): python.Method {
        const method = python.method({
            name: "setup_client",
            decorators: [
                python.decorator({
                    callable: python.codeBlock("pytest.fixture(autouse=True)")
                })
            ],
            return_: python.Type.none(),
            docstring: "Reset WireMock before each test"
        });

        method.addStatement(python.codeBlock(`reset_wiremock_requests()`));
        return method;
    }

    private generateResetWiremockFunction(): python.Method {
        const statements = [
            python.codeBlock(`wiremock_admin_url = "http://localhost:8080/__admin"`),
            python.codeBlock(`response = requests.delete(f"{wiremock_admin_url}/requests")`),
            python.codeBlock(`assert response.status_code == 200, "Failed to reset WireMock requests"`)
        ];

        const method = python.method({
            name: "reset_wiremock_requests",
            return_: python.Type.none(),
            docstring: "Resets all WireMock request journal"
        });

        statements.forEach((stmt) => method.addStatement(stmt));
        return method;
    }

    private generateVerifyRequestCountFunction(): python.Method {
        const params = [
            python.parameter({
                name: "method",
                type: python.Type.str()
            }),
            python.parameter({
                name: "url_path",
                type: python.Type.str()
            }),
            python.parameter({
                name: "query_params",
                type: python.Type.optional(python.Type.dict(python.Type.str(), python.Type.str()))
            }),
            python.parameter({
                name: "expected",
                type: python.Type.int()
            })
        ];

        const statements = [
            python.codeBlock(`wiremock_admin_url = "http://localhost:8080/__admin"`),
            python.codeBlock(`request_body = {"method": method, "urlPath": url_path}`),
            python.codeBlock(`if query_params:
        query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
        request_body["queryParameters"] = query_parameters`),
            python.codeBlock(
                `response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)`
            ),
            python.codeBlock(`assert response.status_code == 200, "Failed to query WireMock requests"`),
            python.codeBlock(`result = response.json()`),
            python.codeBlock(`requests_found = len(result.get("requests", []))`),
            python.codeBlock(`assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"`)
        ];

        const method = python.method({
            name: "verify_request_count",
            parameters: params,
            return_: python.Type.none(),
            docstring: "Verifies the number of requests made to WireMock"
        });

        statements.forEach((stmt) => method.addStatement(stmt));
        return method;
    }

    // =============================================================================
    // TEST FUNCTION GENERATION
    // =============================================================================

    private generateEndpointTestFunction(
        serviceName: string,
        endpoint: HttpEndpoint,
        example: dynamic.EndpointExample
    ): python.Method | null {
        try {
            const testName = this.getTestFunctionName(serviceName, endpoint);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);

            const statements: python.AstNode[] = [];

            // Create client
            statements.push(
                python.codeBlock(`client = ${this.context.config.organization}_${this.context.config.workspaceName}(base_url="http://localhost:8080")`)
            );

            // Generate the API call
            const apiCall = this.generateApiCall(endpoint, example);
            statements.push(python.codeBlock(apiCall));

            // Verify request count
            statements.push(
                python.codeBlock(`verify_request_count("${endpoint.method}", "${basePath}", ${queryParamsCode}, 1)`)
            );

            const method = python.method({
                name: testName,
                decorators: [
                    python.decorator({
                        callable: python.codeBlock("pytest.mark.asyncio")
                    })
                ],
                return_: python.Type.none(),
                docstring: `Test ${endpoint.name.originalName} endpoint with WireMock`
            });

            statements.forEach((stmt) => method.addStatement(stmt));
            return method;
        } catch (error) {
            this.context.logger.warn(`Failed to generate test function for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    // =============================================================================
    // API CALL GENERATION
    // =============================================================================

    private generateApiCall(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string {
        const methodName = endpoint.name.snakeCase.safeName;

        // Build path parameters
        const pathParams = this.buildPathParameters(endpoint, example);

        // Build query parameters
        const queryParams = this.buildQueryParameters(endpoint, example);

        // Build request body
        const requestBody = this.buildRequestBody(endpoint, example);

        // Construct the call
        let call = `client.${methodName}(`;

        const args: string[] = [];

        // Add path parameters as positional arguments
        pathParams.forEach((value) => {
            args.push(value);
        });

        // Add query parameters
        queryParams.forEach(([key, value]) => {
            args.push(`${key}=${value}`);
        });

        // Add request body
        if (requestBody) {
            args.push(requestBody);
        }

        call += args.join(", ");
        call += ")";

        return `result = ${call}`;
    }

    private buildPathParameters(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string[] {
        const pathParams: string[] = [];

        if (example.pathParameters) {
            for (const part of endpoint.fullPath.parts) {
                const paramValue = example.pathParameters[part.pathParameter];
                if (paramValue != null) {
                    pathParams.push(this.formatValue(paramValue));
                }
            }
        }

        return pathParams;
    }

    private buildQueryParameters(endpoint: HttpEndpoint, example: dynamic.EndpointExample): Array<[string, string]> {
        const queryParams: Array<[string, string]> = [];

        if (example.queryParameters) {
            for (const [key, value] of Object.entries(example.queryParameters)) {
                if (value != null) {
                    queryParams.push([key, this.formatValue(value)]);
                }
            }
        }

        return queryParams;
    }

    private buildRequestBody(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string | null {
        if (!endpoint.requestBody || !example.requestBody) {
            return null;
        }

        // For now, generate a simple dict representation
        // This could be enhanced to handle complex nested structures
        if (typeof example.requestBody === "object") {
            return `request=${JSON.stringify(example.requestBody)}`;
        }

        return null;
    }

    private formatValue(value: unknown): string {
        if (typeof value === "string") {
            return `"${value}"`;
        }
        if (typeof value === "number" || typeof value === "boolean") {
            return String(value);
        }
        if (value === null) {
            return "None";
        }
        return JSON.stringify(value);
    }

    // =============================================================================
    // PATH AND QUERY PARAMETER HELPERS
    // =============================================================================

    private buildQueryParamsCode(endpoint: HttpEndpoint): string {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (!dynamicEndpoint?.examples?.[0]?.queryParameters) {
            return "None";
        }

        const queryParams = dynamicEndpoint.examples[0].queryParameters;
        const entries: string[] = [];

        for (const [key, value] of Object.entries(queryParams)) {
            if (value != null) {
                entries.push(`"${key}": "${String(value)}"`);
            }
        }

        if (entries.length === 0) {
            return "None";
        }

        return `{${entries.join(", ")}}`;
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    private getTestFunctionName(serviceName: string, endpoint: HttpEndpoint): string {
        const endpointName = endpoint.name.snakeCase.safeName;
        return `test_${serviceName}_${endpointName}`;
    }

    // =============================================================================
    // =============================================================================

    private wiremockMappingKey({
        requestMethod,
        requestUrlPathTemplate
    }: {
        requestMethod: string;
        requestUrlPathTemplate: string;
    }): string {
        return `${requestMethod} - ${requestUrlPathTemplate}`;
    }

    private getWireMockConfigContent(): Record<string, WireMockMapping> {
        const out: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(this.context.ir);
        for (const mapping of wiremockStubMapping.mappings) {
            const key = this.wiremockMappingKey({
                requestMethod: mapping.request.method,
                requestUrlPathTemplate: mapping.request.urlPathTemplate
            });
            out[key] = mapping;
        }
        return out;
    }

    // =============================================================================
    // =============================================================================

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }

        // Substitute path parameters with actual values from WireMock mapping
        const mappingKey = this.wiremockMappingKey({
            requestMethod: endpoint.method,
            requestUrlPathTemplate: basePath
        });

        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        if (wiremockMapping && wiremockMapping.request.pathParameters) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        }

        return basePath;
    }

    // =============================================================================
    // =============================================================================

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            const endpoints = service.endpoints;

            if (endpoints.length > 0) {
                endpointsByService.set(serviceName, endpoints);
            }
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name.fernFilepath.allParts.map((part) => part.camelCase.unsafeName).join("_");
    }
}
