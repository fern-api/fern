import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";
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
    private snippetGenerator: DynamicSnippetsGenerator;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.wireMockConfigContent = this.getWireMockConfigContent();

        // TODO(tjdbdc): Really need a migration framework for dynamic IR
        this.snippetGenerator = new DynamicSnippetsGenerator({
            ir: this.dynamicIr,
            config: {
                organization: context.config.organization,
                workspaceName: context.config.workspaceName,
                customConfig: context.customConfig
            } as FernGeneratorExec.GeneratorConfig
        });
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
        const endpointTestCases: Array<{
            endpoint: HttpEndpoint;
            example: dynamic.EndpointExample;
            service: HttpService;
            exampleIndex: number;
        }> = [];

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    // Find the service that owns this endpoint
                    const service = Object.values(this.context.ir.services).find((s) =>
                        s.endpoints.some((e) => e.id === endpoint.id)
                    );
                    if (service) {
                        endpointTestCases.push({ endpoint, example: firstExample, service, exampleIndex: 0 });
                    }
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
        testCases: Array<{
            endpoint: HttpEndpoint;
            example: dynamic.EndpointExample;
            service: HttpService;
            exampleIndex: number;
        }>
    ): python.PythonFile {
        const statements: python.AstNode[] = [];

        // Add raw imports that the AST doesn't support (simple "import X" statements)
        statements.push(python.codeBlock("import pytest"));
        statements.push(python.codeBlock("from datetime import datetime, date"));
        statements.push(python.codeBlock("from uuid import UUID"));

        // Add an import registration statement (for "from X import Y" style imports)
        statements.push(this.createImportRegistration());

        // Add test functions for each endpoint
        for (const { endpoint, example, service, exampleIndex } of testCases) {
            const testFunction = this.generateEndpointTestFunction(
                serviceName,
                endpoint,
                example,
                service,
                exampleIndex
            );
            if (testFunction) {
                statements.push(testFunction);
            }
        }

        return python.file({
            path: ["tests", "wire", `test_${serviceName}`],
            statements
        });
    }

    /**
     * Creates a special node that registers imports without rendering anything.
     * This is a workaround for using codeBlock while still getting automatic "from X import Y" imports.
     */
    private createImportRegistration(): python.AstNode {
        // Create an empty code block
        const node = python.codeBlock("");

        // Import get_client and verify_request_count from .conftest (relative import within tests/wire package)
        node.addReference(python.reference({ name: "get_client", modulePath: [".conftest"] }));
        node.addReference(python.reference({ name: "verify_request_count", modulePath: [".conftest"] }));

        return node;
    }

    // =============================================================================
    // TEST FUNCTION GENERATION
    // =============================================================================

    private generateEndpointTestFunction(
        serviceName: string,
        endpoint: HttpEndpoint,
        example: dynamic.EndpointExample,
        service: HttpService,
        exampleIndex: number
    ): python.Method | null {
        try {
            const testName = this.getTestFunctionName(serviceName, endpoint);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);

            // Build deterministic test ID based on fully qualified path
            const testId = this.buildDeterministicTestId(service, endpoint, exampleIndex);

            const statements: python.AstNode[] = [];

            // Use deterministic test ID for concurrency safety
            statements.push(python.codeBlock(`test_id = "${testId}"`));

            // Create client using the get_client helper from conftest.py
            // This ensures all required auth parameters are supplied with fake values
            statements.push(python.codeBlock(`client = get_client(test_id)`));

            // Generate the API call
            const apiCall = this.generateApiCall(endpoint, example);
            statements.push(python.codeBlock(apiCall));

            // Verify request count using test ID for filtering
            statements.push(
                python.codeBlock(
                    `verify_request_count(test_id, "${endpoint.method}", "${basePath}", ${queryParamsCode}, 1)`
                )
            );

            const method = python.method({
                name: testName,
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

    /**
     * Builds a deterministic test ID based on the fully qualified service path.
     * Format: service.sub_service.endpoint_name.example_index
     * This ensures test IDs are unique per test and deterministic across regenerations.
     */
    private buildDeterministicTestId(service: HttpService, endpoint: HttpEndpoint, exampleIndex: number): string {
        const servicePathParts = service.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        const endpointName = endpoint.name.snakeCase.safeName;

        const segments: string[] = [];
        if (servicePathParts.length > 0) {
            segments.push(servicePathParts.join("."));
        }
        segments.push(endpointName);
        segments.push(String(exampleIndex));

        // Example: "endpoints.primitive.get_and_return_string.0"
        return segments.join(".");
    }

    // =============================================================================
    // API CALL GENERATION
    // =============================================================================

    /**
     * Extracts the API call from a snippet generated by DynamicSnippetsGenerator.
     * The snippet contains both client instantiation and the API call, but we only need
     * the call portion since wire tests handle client setup separately.
     *
     * Handles multi-line method calls by tracking parenthesis balance.
     */
    private extractApiCallFromSnippet(snippet: string): string {
        const lines = snippet.trim().split("\n");

        // Find the line that starts with "result = client." or just "client."
        let startIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() || "";
            // Look for lines that contain a client method call (but not client instantiation)
            if ((line.includes("client.") && !line.startsWith("client =")) || line.match(/^\s*result\s*=\s*client\./)) {
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) {
            throw new Error(`Could not find client method call in snippet:\n${snippet}`);
        }

        // Extract the call, handling multi-line calls by tracking parentheses
        const callLines: string[] = [];
        let parenBalance = 0;
        let started = false;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i] || "";
            callLines.push(line);

            // Track parenthesis balance
            for (const char of line) {
                if (char === "(") {
                    parenBalance++;
                    started = true;
                } else if (char === ")") {
                    parenBalance--;
                }
            }

            // If we've found balanced parentheses, we're done
            if (started && parenBalance === 0) {
                break;
            }
        }

        // Join the lines and extract just the call part (after "result = ")
        let fullCall = callLines.join("\n");

        // Remove "result = " or "await " prefix if present
        fullCall = fullCall.replace(/^\s*result\s*=\s*/, "");
        fullCall = fullCall.replace(/^\s*await\s+/, "");

        return fullCall.trim();
    }

    /**
     * Builds the path template for an endpoint in the format expected by the snippet generator.
     * Example: "/users/{userId}/posts/{postId}"
     */
    private buildPathTemplate(endpoint: HttpEndpoint): string {
        let path = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            path += `{${part.pathParameter}}${part.tail}`;
        }
        return path;
    }

    private generateApiCall(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string {
        try {
            // Build the snippet request
            const snippetRequest: FernIr.dynamic.EndpointSnippetRequest = {
                endpoint: {
                    method: endpoint.method,
                    path: this.buildPathTemplate(endpoint)
                },
                baseURL: "http://localhost:8080",
                pathParameters: example.pathParameters,
                queryParameters: example.queryParameters,
                headers: example.headers,
                requestBody: example.requestBody
            };

            // Generate the snippet using DynamicSnippetsGenerator
            const snippetResponse = this.snippetGenerator.generateSync(snippetRequest);

            // Extract just the API call portion (without client instantiation)
            const apiCall = this.extractApiCallFromSnippet(snippetResponse.snippet);

            return apiCall;
        } catch (error) {
            // Fallback: log error and generate a placeholder
            this.context.logger.error(
                `Failed to generate API call for endpoint ${endpoint.name.originalName}: ${error}`
            );
            throw error;
        }
    }

    /**
     * Escapes a string for use in Python code.
     * Handles newlines, tabs, carriage returns, backslashes, and quotes.
     */
    private escapeStringForPython(value: string): string {
        return value
            .replace(/\\/g, "\\\\") // Escape backslashes first
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t") // Escape tabs
            .replace(/"/g, '\\"'); // Escape double quotes
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
                entries.push(`"${this.escapeStringForPython(key)}": "${this.escapeStringForPython(String(value))}"`);
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

    private getClientModulePath(): string[] {
        // The client is imported from the root package module
        // e.g., "from seed import SeedExhaustive" -> modulePath is ["seed"]
        return [this.context.config.organization];
    }

    private getClientClassName(): string {
        // The client class name follows the pattern: OrganizationWorkspace
        // For seed_exhaustive, it would be SeedExhaustive
        const orgName = this.context.config.organization;
        const workspaceName = this.context.config.workspaceName;

        // Convert to PascalCase
        const toPascalCase = (str: string) => {
            return str
                .split(/[-_]/)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join("");
        };

        return toPascalCase(orgName) + toPascalCase(workspaceName);
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
