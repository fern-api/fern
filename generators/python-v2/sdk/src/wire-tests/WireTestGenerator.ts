import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import {
    dynamic,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    ObjectProperty,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

/**
 * Reserved method names that are allowed to use their unsafe (original) names.
 * This matches the Python generator's ALLOWED_RESERVED_METHOD_NAMES.
 */
const ALLOWED_RESERVED_METHOD_NAMES = ["list", "set"];

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

        // Manually add references for "from X import Y" style imports
        // Note: simple "import X" statements are added as raw code blocks separately
        const clientModulePath = this.getClientModulePath();
        const clientName = this.getClientClassName();
        node.addReference(python.reference({ name: clientName, modulePath: clientModulePath }));

        // Import verify_request_count from conftest (pytest makes conftest importable)
        node.addReference(python.reference({ name: "verify_request_count", modulePath: ["conftest"] }));

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
            const clientName = this.getClientClassName();

            // Build deterministic test ID based on fully qualified path
            const testId = this.buildDeterministicTestId(service, endpoint, exampleIndex);

            const statements: python.AstNode[] = [];

            // Use deterministic test ID for concurrency safety
            statements.push(python.codeBlock(`test_id = "${testId}"`));

            // Create client with test ID header for request tracking
            statements.push(
                python.codeBlock(
                    `client = ${clientName}(base_url="http://localhost:8080", headers={"X-Test-Id": test_id})`
                )
            );

            // Generate the API call
            const apiCall = this.generateApiCall(endpoint, example, service);
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

    private generateApiCall(endpoint: HttpEndpoint, example: dynamic.EndpointExample, service: HttpService): string {
        const methodName = this.getEndpointName(endpoint);

        // Build path parameters
        const pathParams = this.buildPathParameters(endpoint, example);

        // Build query parameters
        const queryParams = this.buildQueryParameters(endpoint, example);

        // Build headers
        const headers = this.buildHeaders(endpoint, example);

        // Build request body
        const requestBody = this.buildRequestBody(endpoint, example);

        // Build the client accessor path (e.g., "client.endpoints.container")
        const servicePath = service.name.fernFilepath.allParts.map((part) => part.snakeCase.unsafeName).join(".");
        const clientAccessor = servicePath ? `client.${servicePath}` : "client";

        // Construct the call
        let call = `${clientAccessor}.${methodName}(`;

        const args: string[] = [];

        // Add path parameters as positional arguments
        pathParams.forEach((value) => {
            args.push(value);
        });

        // Add headers
        headers.forEach(([key, value]) => {
            args.push(`${key}=${value}`);
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
                    const queryParameterDeclaration = endpoint.queryParameters.find(
                        (queryParameter) => queryParameter.name.wireValue === key
                    );
                    if (queryParameterDeclaration != null) {
                        // Use the safe name to avoid collisions with reserved keywords
                        queryParams.push([
                            queryParameterDeclaration.name.name.snakeCase.safeName,
                            this.formatValue(value)
                        ]);
                    } else {
                        queryParams.push([key, this.formatValue(value)]);
                    }
                }
            }
        }

        return queryParams;
    }

    private buildHeaders(endpoint: HttpEndpoint, example: dynamic.EndpointExample): Array<[string, string]> {
        const headers: Array<[string, string]> = [];

        if (example.headers) {
            // Map wire header names to SDK parameter names
            const headerMap = new Map<string, string>();
            for (const header of endpoint.headers) {
                const wireKey = header.name.wireValue;
                // Convert wire header name to Python parameter name (lowercase with underscores)
                const pythonName = wireKey.toLowerCase().replace(/-/g, "_");
                headerMap.set(wireKey, pythonName);
            }

            for (const [wireKey, value] of Object.entries(example.headers)) {
                if (value != null) {
                    const paramName = headerMap.get(wireKey) ?? wireKey.toLowerCase().replace(/-/g, "_");
                    headers.push([paramName, this.formatValue(value)]);
                }
            }
        }

        return headers;
    }

    private buildRequestBody(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string | null {
        if (!endpoint.requestBody || !example.requestBody) {
            return null;
        }

        // Use the discriminated union visitor pattern to handle different request body types
        return endpoint.requestBody._visit<string | null>({
            inlinedRequestBody: (inlinedBody) => {
                // For inlined request bodies, generate individual keyword arguments
                // Example: string="value", integer=1, bool_=True
                if (
                    example.requestBody != null &&
                    typeof example.requestBody === "object" &&
                    !Array.isArray(example.requestBody)
                ) {
                    const params: string[] = [];

                    // Map wire names to property definitions to get correct SDK parameter names
                    const propertyMap = new Map<string, string>();
                    for (const prop of inlinedBody.properties) {
                        const wireKey = prop.name.wireValue;
                        const pythonName = prop.name.name.snakeCase.safeName;
                        propertyMap.set(wireKey, pythonName);
                    }

                    // Generate parameters using the correct SDK names
                    for (const [wireKey, value] of Object.entries(example.requestBody)) {
                        const paramName = propertyMap.get(wireKey) ?? wireKey;
                        params.push(`${paramName}=${this.jsonToPython(value)}`);
                    }
                    return params.join(", ");
                }
                return null;
            },
            reference: (value) => {
                // For referenced request bodies, check if the type is an object (which gets flattened)
                // or a primitive/enum (which stays as a single 'request' parameter)
                const objectTypeDecl = this.getObjectTypeIfFlattened(value.requestBodyType);

                if (objectTypeDecl != null) {
                    // Object types get flattened into individual parameters
                    if (
                        example.requestBody != null &&
                        typeof example.requestBody === "object" &&
                        !Array.isArray(example.requestBody)
                    ) {
                        const params: string[] = [];

                        // Map wire names to property definitions to get correct SDK parameter names
                        const propertyMap = new Map<string, string>();
                        for (const prop of objectTypeDecl.properties) {
                            const wireKey = prop.name.wireValue;
                            const pythonName = prop.name.name.snakeCase.safeName;
                            propertyMap.set(wireKey, pythonName);
                        }

                        // Generate parameters using the correct SDK names
                        for (const [wireKey, value] of Object.entries(example.requestBody)) {
                            const paramName = propertyMap.get(wireKey) ?? wireKey;
                            params.push(`${paramName}=${this.jsonToPython(value)}`);
                        }
                        return params.join(", ");
                    }
                } else {
                    // Primitives and enums stay as a single 'request' parameter
                    if (example.requestBody != null) {
                        return `request=${this.jsonToPython(example.requestBody)}`;
                    }
                }
                return null;
            },
            fileUpload: () => {
                // File uploads are not supported in wire tests yet
                return null;
            },
            bytes: () => {
                // Bytes requests are not supported in wire tests yet
                return null;
            },
            _other: () => {
                this.context.logger.warn(`Unknown request body type for endpoint ${endpoint.name.originalName}`);
                return null;
            }
        });
    }

    private getObjectTypeIfFlattened(typeRef: TypeReference): { properties: ObjectProperty[] } | null {
        // Check if the TypeReference points to an object type declaration
        // If it does, return the object type so we can access its properties
        return typeRef._visit<{ properties: ObjectProperty[] } | null>({
            named: (namedType) => {
                // Look up the type declaration in the IR
                const typeDecl = this.context.ir.types[namedType.typeId];
                if (!typeDecl) {
                    return null;
                }
                // Check if the type shape is an object
                if (typeDecl.shape.type === "object") {
                    return typeDecl.shape;
                }
                return null;
            },
            primitive: () => null,
            container: () => null,
            unknown: () => null,
            _other: () => null
        });
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

    private formatValue(value: unknown): string {
        if (typeof value === "string") {
            return `"${this.escapeStringForPython(value)}"`;
        }
        if (typeof value === "number") {
            return String(value);
        }
        if (typeof value === "boolean") {
            // Python uses True/False (capitalized), not true/false
            return value ? "True" : "False";
        }
        if (value === null) {
            return "None";
        }
        // For complex objects, convert to Python representation
        return this.jsonToPython(value);
    }

    /**
     * Converts JSON representation to Python code representation.
     * Handles objects, arrays, and nested structures.
     */
    private jsonToPython(value: unknown): string {
        if (value === null) {
            return "None";
        }
        if (typeof value === "boolean") {
            return value ? "True" : "False";
        }
        if (typeof value === "string") {
            return `"${this.escapeStringForPython(value)}"`;
        }
        if (typeof value === "number") {
            return String(value);
        }
        if (Array.isArray(value)) {
            const items = value.map((item) => this.jsonToPython(item));
            return `[${items.join(",")}]`;
        }
        if (typeof value === "object") {
            const entries = Object.entries(value).map(
                ([key, val]) => `"${this.escapeStringForPython(key)}":${this.jsonToPython(val)}`
            );
            return `{${entries.join(",")}}`;
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

    /**
     * Gets the endpoint method name, matching the Python generator's get_endpoint_name logic.
     * If the endpoint's original name (lowercased) is in ALLOWED_RESERVED_METHOD_NAMES,
     * use the unsafe name; otherwise use the safe name.
     */
    private getEndpointName(endpoint: HttpEndpoint): string {
        if (ALLOWED_RESERVED_METHOD_NAMES.includes(endpoint.name.originalName.toLowerCase())) {
            return endpoint.name.snakeCase.unsafeName;
        }
        return endpoint.name.snakeCase.safeName;
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
