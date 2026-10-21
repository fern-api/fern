import { GeneratorError, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr as DynamicFernIr } from "@fern-api/dynamic-ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { convertIr } from "../utils/convertIr.js";
import { WireTestExampleCase, WireTestExampleSelector, WireTestExpectedError } from "./WireTestExampleSelector.js";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator.js";

/**
 * Local interface for wire test examples.
 * Contains only the fields needed for wire test generation, avoiding coupling to FernIr.dynamic.EndpointExample.
 */
interface WireTestExample {
    name?: string;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    headers: Record<string, unknown>;
    requestBody?: unknown;
}

interface WireTestCase {
    endpoint: FernIr.HttpEndpoint;
    service: FernIr.HttpService;
    example: WireTestExample;
    testCase: WireTestExampleCase;
}

/**
 * Generates WireMock-based integration tests for Python SDK.
 *
 * This is a skeleton implementation that sets up the infrastructure for wire tests
 * but does not implement the actual Python test code generation.
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
    private readonly exampleSelector: WireTestExampleSelector;
    private wireMockConfigContent: Record<string, WireMockMapping>;
    private wireMockMappingsByTestId: Record<string, WireMockMapping>;
    private snippetGenerator: DynamicSnippetsGenerator;
    constructor(context: SdkGeneratorContext, ir: FernIr.IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw GeneratorError.internalError("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.exampleSelector = new WireTestExampleSelector(context);
        const { defaultMappings, mappingsByTestId } = this.getWireMockConfigContent();
        this.wireMockConfigContent = defaultMappings;
        this.wireMockMappingsByTestId = mappingsByTestId;

        // TODO(tjdbdc): Really need a migration framework for FernIr.dynamic IR
        this.snippetGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(this.dynamicIr),
            config: {
                organization: context.config.organization,
                workspaceName: context.config.workspaceName,
                // Pass the raw customConfig (not the parsed SdkCustomConfigSchema) so that
                // fields consumed by the dynamic snippets generator (e.g. pydantic_config)
                // are preserved. SdkCustomConfigSchema.parse() strips unknown keys.
                customConfig: context.config.customConfig
            } as FernGeneratorExec.GeneratorConfig
        });
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        this.context.logger.debug(
            `Wire tests: ${endpointsByService.size} services, ${Object.keys(this.dynamicIr.endpoints).length} dynamic endpoints`
        );

        let totalEndpointsWithExamples = 0;

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            // Filter to endpoints that have static IR examples
            // We MUST use static IR examples to match WireMock mappings (which are generated from static IR)
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const service = this.getServiceForEndpoint(endpoint);
                return service != null && this.exampleSelector.getExamples(service, endpoint).length > 0;
            });

            totalEndpointsWithExamples += endpointsWithExamples.length;

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, endpointsWithExamples);
            if (serviceTestFile) {
                this.context.project.addSourceFiles(serviceTestFile);
            }
        }

        this.context.logger.debug(`Wire tests: ${totalEndpointsWithExamples} endpoints with static IR examples`);

        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir, this.exampleSelector).generate();
    }

    /**
     * Converts a static IR example to a wire test example format.
     */
    private convertStaticExampleToWireTest(
        endpoint: FernIr.HttpEndpoint,
        staticExample: FernIr.ExampleEndpointCall
    ): WireTestExample {
        // Extract path parameters
        const pathParameters: Record<string, unknown> = {};
        for (const param of [
            ...(staticExample.rootPathParameters ?? []),
            ...(staticExample.servicePathParameters ?? []),
            ...(staticExample.endpointPathParameters ?? [])
        ]) {
            pathParameters[getOriginalName(param.name)] = param.value.jsonExample;
        }

        // Extract query parameters
        const queryParameters: Record<string, unknown> = {};
        for (const param of staticExample.queryParameters ?? []) {
            queryParameters[getWireValue(param.name)] = param.value.jsonExample;
        }

        // Extract headers
        const headers: Record<string, unknown> = {};
        for (const header of [...(staticExample.serviceHeaders ?? []), ...(staticExample.endpointHeaders ?? [])]) {
            headers[getWireValue(header.name)] = header.value.jsonExample;
        }

        // Extract request body
        let requestBody: unknown = undefined;
        if (staticExample.request) {
            if ("jsonExample" in staticExample.request && staticExample.request.jsonExample !== undefined) {
                requestBody = staticExample.request.jsonExample;
            }
        }

        return {
            name: staticExample.name != null ? getOriginalName(staticExample.name) : undefined,
            pathParameters,
            queryParameters,
            headers,
            requestBody
        };
    }

    // =============================================================================
    // FILE GENERATION
    // =============================================================================

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: FernIr.HttpEndpoint[]
    ): Promise<WriteablePythonFile | null> {
        const endpointTestCases: WireTestCase[] = [];

        for (const endpoint of endpoints) {
            const service = this.getServiceForEndpoint(endpoint);
            if (!service) {
                continue;
            }

            // Skip bytes request body endpoints — the IR example system has no
            // ExampleRequestBody variant for bytes, so we can't produce a proper example.
            if (endpoint.requestBody?.type === "bytes") {
                continue;
            }

            // Each selected static IR example gets its own test and its own X-Test-Id WireMock stub.
            for (const testCase of this.exampleSelector.getExamples(service, endpoint)) {
                endpointTestCases.push({
                    endpoint,
                    service,
                    example: this.convertStaticExampleToWireTest(endpoint, testCase.example),
                    testCase
                });
            }
        }

        if (endpointTestCases.length === 0) {
            return null;
        }

        this.context.logger.info(
            `Generating test file for service ${serviceName} with ${endpointTestCases.length} test cases`
        );

        const pythonFile = this.buildTestFile(serviceName, endpointTestCases);
        if (pythonFile === null) {
            return null;
        }

        return new WriteablePythonFile({
            filename: `test_${serviceName}`,
            directory: RelativeFilePath.of("tests/wire"),
            contents: pythonFile
        });
    }

    // =============================================================================
    // FILE BUILDING
    // =============================================================================

    private buildTestFile(serviceName: string, testCases: WireTestCase[]): python.PythonFile | null {
        const statements: python.AstNode[] = [];

        // Add raw imports for pytest (not supported by AST)
        statements.push(python.codeBlock("import pytest"));

        // Add an import registration statement (for "from X import Y" style imports)
        statements.push(this.createImportRegistration());

        // Add test functions for each endpoint
        let testFunctionCount = 0;
        const usedTestNames = new Set<string>();
        for (const { endpoint, example, service, testCase } of testCases) {
            const testName = this.getUniqueTestFunctionName(serviceName, endpoint, testCase, usedTestNames);
            const testFunction = this.generateEndpointTestFunction(endpoint, example, service, testCase, testName);
            if (testFunction) {
                statements.push(testFunction);
                testFunctionCount++;
            }
        }

        if (testFunctionCount === 0) {
            return null;
        }

        const pathSegments = `tests/wire/test_${serviceName}`.split("/");
        return python.file({
            path: pathSegments,
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

        // Only wire up the per-endpoint auth-header assertion helper in endpoint-security
        // mode, where each endpoint routes a distinct scheme. Registering it otherwise would
        // create an unused import in every non-endpoint-security wire-test file.
        if (this.isEndpointSecurity()) {
            node.addReference(python.reference({ name: "verify_auth_headers", modulePath: [".conftest"] }));
        }

        // Import ApiError and jsonable_encoder from the SDK's core module for error response tests
        const modulePath = this.context.getModulePath();
        node.addReference(python.reference({ name: "ApiError", modulePath: [modulePath, "core"] }));
        node.addReference(
            python.reference({ name: "jsonable_encoder", modulePath: [modulePath, "core", "jsonable_encoder"] })
        );

        return node;
    }

    // =============================================================================
    // TEST FUNCTION GENERATION
    // =============================================================================

    private generateEndpointTestFunction(
        endpoint: FernIr.HttpEndpoint,
        example: WireTestExample,
        service: FernIr.HttpService,
        testCase: WireTestExampleCase,
        testName: string
    ): python.Method | null {
        try {
            const testId = testCase.testId;
            const expectedError = testCase.expectedError;
            const basePath = this.buildBasePath(endpoint, testId);
            const queryParamsCode = this.buildQueryParamsCode(endpoint, example);

            const statements: python.AstNode[] = [];

            // Use deterministic test ID for concurrency safety
            statements.push(python.codeBlock(`test_id = "${testId}"`));

            // Create client using the get_client helper from conftest.py
            // This ensures all required auth parameters are supplied with fake values
            statements.push(python.codeBlock(`client = get_client(test_id)`));

            // Exclusions use definition-level identifiers in the form "<service_path>.<endpoint_name>"
            // or "<service_path>.*" to exclude an entire service.
            const servicePathParts = service.name.fernFilepath.allParts.map((part) =>
                this.context.caseConverter.snakeSafe(part)
            );
            const servicePath = servicePathParts.join(".");
            const selector =
                servicePath.length > 0
                    ? `${servicePath}.${this.context.caseConverter.snakeSafe(endpoint.name)}`
                    : this.context.caseConverter.snakeSafe(endpoint.name);
            const excluded = this.context.customConfig.wire_tests?.exclusions ?? [];
            if (
                excluded.includes(selector) ||
                excluded.some((pattern) => pattern.endsWith(".*") && selector.startsWith(pattern.slice(0, -2) + "."))
            ) {
                return null;
            }

            // Generate the API call AST directly
            const apiCallAst = this.generateApiCallAst(endpoint, example);

            // For error responses, expect the typed error the client raises for the status code
            if (expectedError != null) {
                statements.push(this.buildErrorAssertionBlock(endpoint, apiCallAst, expectedError));
            } else {
                // For streaming endpoints, wrap the call in a for loop to consume the iterator
                // This is necessary because streaming methods return lazy generators that don't
                // execute the HTTP request until iterated
                if (this.isStreamingEndpoint(endpoint)) {
                    const block = python.codeBlock(`for _ in ${apiCallAst.toString()}:`);
                    // Preserve import references from the AST that are lost during toString()
                    for (const ref of apiCallAst.getReferences()) {
                        block.addReference(ref);
                    }
                    statements.push(block);
                    statements.push(python.codeBlock("    pass"));
                } else {
                    statements.push(apiCallAst);
                }
            }

            // Verify request count using test ID for filtering
            // When testing the auth token endpoint itself, expect 2 requests:
            // 1. The automatic token fetch request (from OAuth/inferred auth)
            // 2. The actual API call being tested
            // For all other endpoints, expect 1 request (the auth token fetch goes to a different endpoint)
            //
            // In endpoint-security mode every endpoint routes its own scheme, so a token
            // fetch (POST to the token endpoint) only happens while testing the endpoints
            // that route OAuth/inferred — filtered out here because it targets a different
            // path/test-id. The token endpoint is unauthenticated and, when tested directly,
            // makes exactly one request, so the doubling heuristic must not apply.
            //
            // When OAuth is configured (including alongside bearer via `auth: any`), the
            // test client is constructed with client credentials — never a token — so the
            // OAuth token provider is installed and prefetches from the token endpoint.
            //
            // The inferred-auth prefetch does not happen when a bearer scheme is configured
            // alongside it: the test client is constructed with a token, so the generated
            // client takes the token branch and never installs the inferred token provider.
            const hasBearerScheme = this.context.ir.auth.schemes.some((scheme) => scheme.type === "bearer");
            const expectedRequestCount =
                !this.isEndpointSecurity() &&
                ((!hasBearerScheme && this.isInferredAuthTokenEndpoint(endpoint)) ||
                    this.isOAuthTokenEndpoint(endpoint))
                    ? 2
                    : 1;
            statements.push(
                python.codeBlock(
                    `verify_request_count(test_id, "${endpoint.method}", "${basePath}", ${queryParamsCode}, ${expectedRequestCount})`
                )
            );

            // In endpoint-security mode, assert on the wire that ONLY the scheme(s)
            // declared for this endpoint sent a header, and no other scheme leaked.
            const authAssertion = this.buildEndpointAuthHeaderAssertion(endpoint, basePath);
            if (authAssertion != null) {
                statements.push(python.codeBlock(authAssertion));
            }

            const method = python.method({
                name: testName,
                return_: python.Type.none(),
                docstring: this.getTestDocstring(endpoint, testCase)
            });

            statements.forEach((stmt) => method.addStatement(stmt));
            return method;
        } catch (error) {
            this.context.logger.warn(`Failed to generate test function for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    // =============================================================================
    // ENDPOINT-SECURITY AUTH HEADER ASSERTIONS
    // =============================================================================

    /**
     * True when the API uses per-endpoint auth routing (ENDPOINT_SECURITY). In this
     * mode each endpoint sends only the header(s) for its own declared security
     * requirement, so wire tests assert per-endpoint rather than a single global header.
     */
    private isEndpointSecurity(): boolean {
        return this.context.ir.auth?.requirement === FernIr.AuthSchemesRequirement.EndpointSecurity;
    }

    /**
     * Builds the `verify_auth_headers(...)` assertion call for an endpoint under
     * endpoint-security routing, or `undefined` when no assertion should be emitted
     * (not in endpoint-security mode, or the routed requirement can't be determined).
     *
     * The assertion proves on the wire that:
     *  - the header(s) for this endpoint's routed requirement ARE present, and
     *  - every other scheme's header is ABSENT (no auth leaks across endpoints).
     */
    private buildEndpointAuthHeaderAssertion(endpoint: FernIr.HttpEndpoint, basePath: string): string | undefined {
        if (!this.isEndpointSecurity()) {
            return undefined;
        }

        const schemes = this.context.ir.auth?.schemes ?? [];
        const schemesByKey = new Map<string, FernIr.AuthScheme>();
        for (const scheme of schemes) {
            schemesByKey.set(scheme.key, scheme);
        }

        // Every header name any configured scheme could send. These are the candidates
        // for "must be absent" when an endpoint does not route through that scheme.
        const allHeaderNames = new Set<string>();
        for (const scheme of schemes) {
            const expectation = this.getSchemeHeaderExpectation(scheme);
            if (expectation != null) {
                allHeaderNames.add(expectation.name);
            }
        }

        const requirements = endpoint.security ?? [];

        if (requirements.length === 0) {
            // No security requirements. For a genuinely unauthenticated endpoint, assert
            // that NO auth header is sent. If the endpoint is auth'd but somehow lacks a
            // resolved requirement, skip rather than assert something we can't determine.
            if (endpoint.auth) {
                return undefined;
            }
            return this.renderVerifyAuthHeadersCall(endpoint.method, basePath, {}, [...allHeaderNames]);
        }

        // Mirror the SDK's RoutingAuthProvider: pick the FIRST requirement whose schemes
        // are all known. get_client supplies credentials for every scheme, so the first
        // requirement is always the one that routes.
        const chosen = requirements.find((requirement) =>
            Object.keys(requirement).every((schemeKey) => schemesByKey.has(schemeKey))
        );
        if (chosen == null) {
            return undefined;
        }

        // Group the chosen requirement's schemes by the header name they emit. When a
        // single scheme owns a header we can assert its exact value shape (e.g. "Basic .+"
        // vs "Bearer .+"); when several schemes (AND) collide on one header (e.g. bearer +
        // oauth + basic all use Authorization) the final value is order-dependent, so we
        // only assert the header's presence.
        const patternsByHeader = new Map<string, string[]>();
        for (const schemeKey of Object.keys(chosen)) {
            const scheme = schemesByKey.get(schemeKey);
            if (scheme == null) {
                continue;
            }
            const expectation = this.getSchemeHeaderExpectation(scheme);
            if (expectation == null) {
                continue;
            }
            const existing = patternsByHeader.get(expectation.name) ?? [];
            existing.push(expectation.valuePattern);
            patternsByHeader.set(expectation.name, existing);
        }

        const present: Record<string, string> = {};
        for (const [headerName, patterns] of patternsByHeader.entries()) {
            present[headerName] = patterns.length === 1 && patterns[0] != null ? patterns[0] : ".+";
        }
        const absent = [...allHeaderNames].filter((headerName) => !(headerName in present));

        return this.renderVerifyAuthHeadersCall(endpoint.method, basePath, present, absent);
    }

    private renderVerifyAuthHeadersCall(
        method: string,
        basePath: string,
        present: Record<string, string>,
        absent: string[]
    ): string {
        const presentLiteral =
            "{" +
            Object.entries(present)
                .map(([headerName, pattern]) => `"${headerName}": r"${pattern}"`)
                .join(", ") +
            "}";
        const absentLiteral = "[" + absent.map((headerName) => `"${headerName}"`).join(", ") + "]";
        return `verify_auth_headers(test_id, "${method}", "${basePath}", ${presentLiteral}, ${absentLiteral})`;
    }

    /**
     * The header name and value-regex a scheme produces when it is the routed scheme
     * for an endpoint. Returns `undefined` for schemes that emit no request header.
     */
    private getSchemeHeaderExpectation(scheme: FernIr.AuthScheme): { name: string; valuePattern: string } | undefined {
        switch (scheme.type) {
            case "bearer":
                return { name: "Authorization", valuePattern: "Bearer .+" };
            case "basic":
                return { name: "Authorization", valuePattern: "Basic .+" };
            case "header": {
                const name = getWireValue(scheme.name);
                return {
                    name,
                    valuePattern: scheme.prefix != null ? `${this.escapeRegex(scheme.prefix)} .+` : ".+"
                };
            }
            case "oauth": {
                const configuration = scheme.configuration;
                const headerName = configuration.tokenHeader ?? "Authorization";
                const prefix = configuration.tokenPrefix ?? "Bearer";
                return { name: headerName, valuePattern: `${this.escapeRegex(prefix.trim())} .+` };
            }
            case "inferred": {
                const authenticatedHeader = scheme.tokenEndpoint.authenticatedRequestHeaders[0];
                const name = authenticatedHeader?.headerName ?? "Authorization";
                const prefix = authenticatedHeader?.valuePrefix ?? (name === "Authorization" ? "Bearer" : undefined);
                return {
                    name,
                    valuePattern:
                        prefix != null && prefix.trim().length > 0 ? `${this.escapeRegex(prefix.trim())} .+` : ".+"
                };
            }
            default:
                assertNever(scheme);
        }
    }

    /**
     * Escapes regex metacharacters so a literal prefix (e.g. an auth prefix) can be
     * embedded in a Python regex pattern passed to re.fullmatch.
     */
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Checks if the IR has any inferred auth schemes.
     * When inferred auth is present, the client will make an additional request to get a token.
     */
    private hasInferredAuth(): boolean {
        if (!this.context.ir.auth?.schemes) {
            return false;
        }
        return this.context.ir.auth.schemes.some((scheme) => scheme.type === "inferred");
    }

    /**
     * Checks if an endpoint is the inferred auth token endpoint.
     * When testing the auth token endpoint with inferred auth, expect 2 requests:
     * 1. The automatic token fetch request
     * 2. The actual API call being tested
     */
    private isInferredAuthTokenEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        if (!this.context.ir.auth?.schemes) {
            return false;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "inferred") {
                const tokenEndpointId = scheme.tokenEndpoint.endpoint.endpointId;
                if (endpoint.id === tokenEndpointId) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if an endpoint is the OAuth token endpoint.
     * When testing the token endpoint with OAuth client credentials, expect 2 requests:
     * 1. The automatic token fetch request (from the OAuth token provider)
     * 2. The actual API call being tested
     */
    private isOAuthTokenEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        if (!this.context.ir.auth?.schemes) {
            return false;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth" && scheme.configuration?.type === "clientCredentials") {
                const tokenEndpointId = scheme.configuration.tokenEndpoint.endpointReference.endpointId;
                if (endpoint.id === tokenEndpointId) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if an endpoint returns a streaming response.
     * Streaming endpoints return Iterator[bytes] or AsyncIterator[bytes] which are lazy generators.
     * This includes:
     * - streaming: SSE or other streaming responses
     * - streamParameter: Responses controlled by a stream parameter
     * - fileDownload: File download responses that return an iterator of bytes
     */
    private isStreamingEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        const responseBody = endpoint.response?.body;
        if (!responseBody) {
            return false;
        }
        return (
            responseBody.type === "streaming" ||
            responseBody.type === "streamParameter" ||
            responseBody.type === "fileDownload"
        );
    }

    // =============================================================================
    // API CALL GENERATION
    // =============================================================================

    /**
     * Builds the path template for an endpoint in the format expected by the snippet generator.
     * Example: "/users/{userId}/posts/{postId}"
     */
    private buildPathTemplate(endpoint: FernIr.HttpEndpoint): string {
        let path = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            path += `{${part.pathParameter}}${part.tail}`;
        }
        // Ensure the path starts with a leading slash to match FernIr.dynamic IR format
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path;
    }

    private generateApiCallAst(endpoint: FernIr.HttpEndpoint, example: WireTestExample): python.AstNode {
        try {
            // Build the snippet request
            const snippetRequest: DynamicFernIr.dynamic.EndpointSnippetRequest = {
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

            // If this is a multipart/file-upload endpoint, static examples often omit file content.
            // However, generated Python client methods can require these file parameters. To keep
            // wire tests runnable and generic, synthesize placeholder file values for any required
            // file fields that are missing from the example request body.
            this.addPlaceholderFileUploadFields({ endpoint, snippetRequest });

            // Generate just the method call AST using DynamicSnippetsGenerator
            // Pass endpointId to avoid path collision issues when multiple
            // namespaces have endpoints with the same HTTP method and path pattern
            return this.snippetGenerator.generateMethodCallSnippetAst({
                request: snippetRequest,
                options: { endpointId: endpoint.id }
            });
        } catch (error) {
            // Fallback: log error and generate a placeholder
            this.context.logger.error(
                `Failed to generate API call for endpoint ${getOriginalName(endpoint.name)}: ${error}`
            );
            throw error;
        }
    }

    private addPlaceholderFileUploadFields({
        endpoint,
        snippetRequest
    }: {
        endpoint: FernIr.HttpEndpoint;
        snippetRequest: DynamicFernIr.dynamic.EndpointSnippetRequest;
    }): void {
        const requestBody = endpoint.requestBody;
        if (requestBody?.type !== "fileUpload" || !Array.isArray(requestBody.properties)) {
            return;
        }
        const record =
            typeof snippetRequest.requestBody === "object" && snippetRequest.requestBody != null
                ? (snippetRequest.requestBody as Record<string, unknown>)
                : {};
        for (const property of requestBody.properties) {
            if (property.type !== "file") {
                continue;
            }
            const fileValue = property.value;
            const key = fileValue.key;
            const wireValue = getWireValue(key);
            if (wireValue == null || fileValue.isOptional || record[wireValue] != null) {
                continue;
            }
            const placeholder = `example_${wireValue}`;
            record[wireValue] = fileValue.type === "fileArray" ? [placeholder] : placeholder;
        }
        snippetRequest.requestBody = record;
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

    /**
     * Checks if a query parameter is typed as datetime (DATE_TIME) in the IR.
     * Handles optional/nullable wrappers by unwrapping to the inner type.
     * String-typed parameters that happen to contain datetime-looking values return false.
     */
    private isDatetimeTypedQueryParam(endpoint: FernIr.HttpEndpoint, wireKey: string): boolean {
        const queryParam = endpoint.queryParameters.find((qp) => getWireValue(qp.name) === wireKey);
        if (!queryParam) {
            return false;
        }
        return this.isDatetimeTypeReference(queryParam.valueType);
    }

    /**
     * Recursively checks if a TypeReference resolves to a datetime primitive.
     * Unwraps optional/nullable containers to check the inner type.
     */
    private isDatetimeTypeReference(typeRef: FernIr.TypeReference): boolean {
        if (typeRef.type === "primitive") {
            return typeRef.primitive.v1 === "DATE_TIME";
        }
        if (typeRef.type === "container") {
            if (typeRef.container.type === "optional") {
                return this.isDatetimeTypeReference(typeRef.container.optional);
            }
            if (typeRef.container.type === "nullable") {
                return this.isDatetimeTypeReference(typeRef.container.nullable);
            }
        }
        return false;
    }

    /**
     * Normalizes a query parameter value for datetime_milliseconds config.
     * When datetime_milliseconds is true AND the parameter is datetime-typed, adds ".000" to
     * datetime values that lack fractional seconds so the test verification matches the SDK's
     * millisecond-precision output from serialize_datetime.
     * String-typed parameters are never normalized because the SDK passes them through as-is.
     */
    private normalizeDatetimeQueryParamValue(value: string, isDatetimeTyped: boolean): string {
        if (this.context.customConfig.datetime_milliseconds && isDatetimeTyped) {
            // Use replace with a capture group to insert ".000" before the timezone suffix.
            // The regex matches the seconds portion followed by the timezone (Z or +/-offset).
            return value.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(Z|[+-]\d{2}:\d{2})$/, "$1.000$2");
        }
        return value;
    }

    private buildQueryParamsCode(endpoint: FernIr.HttpEndpoint, example: WireTestExample): string {
        const queryParams = example.queryParameters;
        const entries: string[] = [];

        for (const [key, value] of Object.entries(queryParams)) {
            if (value != null) {
                if (Array.isArray(value) && value.length > 1) {
                    // Multi-value: emit as Python list
                    const items = value.map((v: unknown) => `"${this.escapeStringForPython(String(v))}"`);
                    entries.push(`"${this.escapeStringForPython(key)}": [${items.join(", ")}]`);
                } else {
                    const isDatetimeTyped = this.isDatetimeTypedQueryParam(endpoint, key);
                    const normalized = this.normalizeDatetimeQueryParamValue(String(value), isDatetimeTyped);
                    entries.push(`"${this.escapeStringForPython(key)}": "${this.escapeStringForPython(normalized)}"`);
                }
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

    private getTestFunctionName(serviceName: string, endpoint: FernIr.HttpEndpoint): string {
        const endpointName = this.context.caseConverter.snakeSafe(endpoint.name);
        return `test_${serviceName}_${endpointName}`;
    }

    /**
     * The first example keeps the endpoint's test name; additional examples are suffixed with the
     * example name, `throws_<error>` for unnamed error examples, or their index.
     */
    private getUniqueTestFunctionName(
        serviceName: string,
        endpoint: FernIr.HttpEndpoint,
        testCase: WireTestExampleCase,
        usedTestNames: Set<string>
    ): string {
        const baseName = this.getTestFunctionName(serviceName, endpoint);
        let name = baseName;
        if (testCase.index > 0) {
            const exampleName = testCase.example.name != null ? this.toSnakeIdentifier(testCase.example.name) : "";
            if (exampleName.length > 0) {
                name = `${baseName}_${exampleName}`;
            } else if (testCase.expectedError != null) {
                name = `${baseName}_throws_${this.toSnakeIdentifier(testCase.expectedError.errorName)}`;
            } else {
                name = `${baseName}_${testCase.index}`;
            }
        }
        let uniqueName = name;
        for (let suffix = 2; usedTestNames.has(uniqueName); suffix++) {
            uniqueName = `${name}_${suffix}`;
        }
        usedTestNames.add(uniqueName);
        return uniqueName;
    }

    private toSnakeIdentifier(name: FernIr.NameOrString): string {
        return this.context.caseConverter
            .snakeSafe(name)
            .replace(/[^A-Za-z0-9_]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
    }

    private getTestDocstring(endpoint: FernIr.HttpEndpoint, testCase: WireTestExampleCase): string {
        const endpointName = getOriginalName(endpoint.name);
        if (testCase.expectedError != null) {
            return `Test ${endpointName} endpoint error response (${testCase.expectedError.errorName}) with WireMock`;
        }
        if (testCase.index > 0 && testCase.example.name != null) {
            return `Test ${endpointName} endpoint (${getOriginalName(testCase.example.name)} example) with WireMock`;
        }
        return `Test ${endpointName} endpoint with WireMock`;
    }

    /**
     * Builds `with pytest.raises(<Error>) as exc_info:` around the call, followed by status code and
     * body assertions.
     */
    private buildErrorAssertionBlock(
        endpoint: FernIr.HttpEndpoint,
        apiCallAst: python.AstNode,
        expectedError: WireTestExpectedError
    ): python.AstNode {
        const errorClassName = expectedError.errorClass?.alias ?? expectedError.errorClass?.name ?? "ApiError";
        const call = apiCallAst.toString();
        const lines = [`with pytest.raises(${errorClassName}) as exc_info:`];
        if (this.isStreamingEndpoint(endpoint)) {
            lines.push(`    for _ in ${call}:`, "        pass");
        } else {
            lines.push(`    ${call}`);
        }
        lines.push(`assert exc_info.value.status_code == ${expectedError.statusCode}`);
        if (expectedError.body !== undefined) {
            lines.push(`assert jsonable_encoder(exc_info.value.body) == ${this.toPythonLiteral(expectedError.body)}`);
        }
        const block = python.codeBlock(lines.join("\n"));
        // Preserve import references from the AST that are lost during toString()
        for (const ref of apiCallAst.getReferences()) {
            block.addReference(ref);
        }
        if (expectedError.errorClass != null) {
            block.addReference(expectedError.errorClass);
        }
        return block;
    }

    private toPythonLiteral(value: unknown): string {
        if (value === null || value === undefined) {
            return "None";
        }
        if (typeof value === "boolean") {
            return value ? "True" : "False";
        }
        if (typeof value === "number") {
            return Number.isFinite(value) ? String(value) : `float("${value}")`;
        }
        if (typeof value === "string") {
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
            return `[${value.map((item) => this.toPythonLiteral(item)).join(", ")}]`;
        }
        if (typeof value === "object") {
            const entries = Object.entries(value as Record<string, unknown>).map(
                ([key, item]) => `${JSON.stringify(key)}: ${this.toPythonLiteral(item)}`
            );
            return `{${entries.join(", ")}}`;
        }
        return JSON.stringify(String(value));
    }

    private getClientModulePath(): string[] {
        // The client is imported from the root package module
        // e.g., "from seed import SeedExhaustive" -> modulePath is ["seed"]
        return [this.context.getModulePath()];
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

    private getWireMockConfigContent(): {
        defaultMappings: Record<string, WireMockMapping>;
        mappingsByTestId: Record<string, WireMockMapping>;
    } {
        const defaultMappings: Record<string, WireMockMapping> = {};
        const mappingsByTestId: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(
            this.context.ir,
            this.exampleSelector
        );
        for (const mapping of wiremockStubMapping.mappings) {
            const testId = mapping.request.headers?.["X-Test-Id"]?.equalTo;
            if (testId != null) {
                if (mappingsByTestId[testId] != null) {
                    this.context.logger.warn(
                        `Duplicate WireMock mapping for wire test ID "${testId}"; keeping the first mapping`
                    );
                    continue;
                }
                mappingsByTestId[testId] = mapping;
                continue;
            }
            const key = this.wiremockMappingKey({
                requestMethod: mapping.request.method,
                requestUrlPathTemplate: mapping.request.urlPathTemplate
            });
            defaultMappings[key] = mapping;
        }
        return { defaultMappings, mappingsByTestId };
    }

    // =============================================================================
    // =============================================================================

    private buildBasePath(endpoint: FernIr.HttpEndpoint, testId: string): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }

        // Strip URL fragment - fragments are never sent to the server in HTTP requests
        // e.g., "/oauth2/token#refresh" -> "/oauth2/token"
        const fragmentIndex = basePath.indexOf("#");
        if (fragmentIndex !== -1) {
            basePath = basePath.substring(0, fragmentIndex);
        }

        // Substitute path parameters with actual values from WireMock mapping
        // Use the path WITHOUT fragment to look up the mapping, since mock-utils strips fragments
        const mappingKey = this.wiremockMappingKey({
            requestMethod: endpoint.method,
            requestUrlPathTemplate: basePath
        });

        const wiremockMapping = this.wireMockMappingsByTestId[testId] ?? this.wireMockConfigContent[mappingKey];
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

    private getServiceForEndpoint(endpoint: FernIr.HttpEndpoint): FernIr.HttpService | undefined {
        return Object.values(this.context.ir.services).find((service) =>
            service.endpoints.some((serviceEndpoint) => serviceEndpoint.id === endpoint.id)
        );
    }

    private groupEndpointsByService(): Map<string, FernIr.HttpEndpoint[]> {
        const endpointsByService = new Map<string, FernIr.HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            const endpoints = service.endpoints;

            if (endpoints.length > 0) {
                endpointsByService.set(serviceName, endpoints);
            }
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: FernIr.HttpService): string {
        return service.name.fernFilepath.allParts.map((part) => this.context.caseConverter.camelUnsafe(part)).join("_");
    }
}
