import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { DynamicSnippetsGenerator } from "@fern-api/ruby-dynamic-snippets";
import {
    dynamic,
    HttpEndpoint,
    HttpService,
    InferredAuthScheme,
    IntermediateRepresentation,
    Literal
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

interface EndpointTestCase {
    snippet: string;
    endpoint: HttpEndpoint;
    service: HttpService;
    exampleIndex: number;
    testId: string;
}

/**
 * Generates WireMock-based integration tests for Ruby SDK.
 *
 * Architecture:
 * - Uses dynamic snippets to generate client code
 * - Generates Ruby test files using Minitest
 * - Creates helper methods for WireMock interaction
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });
        this.wireMockConfigContent = this.getWireMockConfigContent();
    }

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
            this.context.project.addRawFiles(serviceTestFile);
        }

        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): Promise<File> {
        const endpointTestCases = new Map<string, EndpointTestCase>();

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = this.getDynamicEndpointExample(endpoint);
                if (!firstExample) {
                    continue;
                }

                // Find the service for this endpoint
                const service = Object.values(this.context.ir.services).find((s) =>
                    s.endpoints.some((e) => e.id === endpoint.id)
                );
                if (!service) {
                    this.context.logger.warn(`No service found for endpoint ${endpoint.id}`);
                    continue;
                }

                const exampleIndex = 0; // We only use the first example today
                const testId = this.buildDeterministicTestId(service, endpoint, exampleIndex);

                try {
                    const snippet = await this.generateSnippetForExample({
                        example: firstExample,
                        service,
                        endpoint,
                        exampleIndex,
                        testId
                    });
                    endpointTestCases.set(endpoint.id, { snippet, endpoint, service, exampleIndex, testId });
                } catch (error) {
                    this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                    continue;
                }
            }
        }

        const testFileContent = this.buildTestFileContent(serviceName, endpointTestCases);

        return new File(`${serviceName}_test.rb`, RelativeFilePath.of("test/wire"), testFileContent);
    }

    private buildDeterministicTestId(service: HttpService, endpoint: HttpEndpoint, exampleIndex: number): string {
        const servicePathParts = service.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        const endpointName = endpoint.name.snakeCase.safeName;

        const segments: string[] = [];
        if (servicePathParts.length > 0) {
            segments.push(servicePathParts.join("."));
        }
        segments.push(endpointName);
        segments.push(String(exampleIndex));

        return segments.join(".");
    }

    private buildTestFileContent(serviceName: string, endpointTestCases: Map<string, EndpointTestCase>): string {
        const lines: string[] = [];

        // File header
        lines.push("# frozen_string_literal: true");
        lines.push("");
        lines.push('require "test_helper"');
        lines.push('require "net/http"');
        lines.push('require "json"');
        lines.push('require "uri"');
        lines.push(`require "${this.context.getRootFolderName()}"`);
        lines.push("");

        // Test class
        lines.push(`class ${this.toPascalCase(serviceName)}WireTest < Minitest::Test`);
        lines.push('  WIREMOCK_BASE_URL = "http://localhost:8080"');
        lines.push('  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"');
        lines.push("");

        // Setup method to skip wire tests unless RUN_WIRE_TESTS=true
        lines.push("  def setup");
        lines.push("    super");
        lines.push('    unless ENV["RUN_WIRE_TESTS"] == "true"');
        lines.push('      skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."');
        lines.push("    end");
        lines.push("  end");
        lines.push("");

        // Helper methods
        lines.push(...this.generateHelperMethods());
        lines.push("");

        // Test methods
        for (const { snippet, endpoint, testId } of endpointTestCases.values()) {
            const testMethod = this.generateEndpointTestMethod(endpoint, snippet, serviceName, testId);
            if (testMethod) {
                lines.push(...testMethod);
                lines.push("");
            }
        }

        lines.push("end");

        return lines.join("\n");
    }

    private generateHelperMethods(): string[] {
        const lines: string[] = [];

        // verify_request_count method - filters by X-Test-Id header
        lines.push("  def verify_request_count(test_id:, method:, url_path:, query_params: nil, expected:)");
        lines.push('    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")');
        lines.push("    http = Net::HTTP.new(uri.host, uri.port)");
        lines.push('    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })');
        lines.push("");
        lines.push('    request_body = { "method" => method, "urlPath" => url_path }');
        lines.push('    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }');
        lines.push("    if query_params");
        lines.push('      request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } }');
        lines.push("    end");
        lines.push("");
        lines.push("    post_request.body = request_body.to_json");
        lines.push("    response = http.request(post_request)");
        lines.push("    result = JSON.parse(response.body)");
        lines.push('    requests = result["requests"] || []');
        lines.push("");
        lines.push(
            '    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"'
        );
        lines.push("  end");

        return lines;
    }

    private generateEndpointTestMethod(
        endpoint: HttpEndpoint,
        snippet: string,
        serviceName: string,
        testId: string
    ): string[] | null {
        try {
            const testName = this.getTestMethodName(endpoint, serviceName);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);

            const lines: string[] = [];

            lines.push(`  def ${testName}`);
            lines.push(`    test_id = "${testId}"`);
            lines.push("");

            // Process the snippet to use WireMock base URL and inject auth
            const processedSnippet = this.processSnippetForWireMock(snippet, endpoint);
            const snippetLines = processedSnippet.split("\n");
            for (const line of snippetLines) {
                if (line.trim()) {
                    lines.push(`    ${line}`);
                }
            }
            lines.push("");

            // Verify request count using test_id header
            lines.push(`    verify_request_count(`);
            lines.push(`      test_id: test_id,`);
            lines.push(`      method: "${endpoint.method}",`);
            lines.push(`      url_path: "${basePath}",`);
            lines.push(`      query_params: ${queryParamsCode},`);
            lines.push(`      expected: 1`);
            lines.push(`    )`);
            lines.push("  end");

            return lines;
        } catch (error) {
            this.context.logger.warn(`Failed to generate test method for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    private processSnippetForWireMock(snippet: string, _endpoint: HttpEndpoint): string {
        // Replace the base_url in the client constructor with WireMock URL
        // Look for patterns like: base_url: "..." or environment: ...
        let processed = snippet;

        // If there's a base_url argument, replace it
        if (processed.includes("base_url:")) {
            processed = processed.replace(/base_url:\s*["'][^"']*["']/, "base_url: WIREMOCK_BASE_URL");
        } else if (processed.includes("environment:")) {
            // Replace environment with base_url
            processed = processed.replace(/environment:\s*[^,)\n]+/, "base_url: WIREMOCK_BASE_URL");
        } else {
            // Add base_url to the client constructor
            // Find the Client.new( pattern and add base_url
            processed = processed.replace(/(\w+::Client\.new\()/, "$1base_url: WIREMOCK_BASE_URL, ");
        }

        // Inject global auth if available and not already present in the snippet
        // Check if auth is already in the snippet to avoid duplicates
        if (this.context.ir.auth.schemes.length > 0 && !this.snippetHasAuth(processed)) {
            processed = this.injectAuthIntoSnippet(processed);
        }

        // Inject base_url into request_options for the method call
        // This ensures the endpoint uses WireMock URL even if the SDK falls back to a default environment
        processed = this.injectBaseUrlIntoRequestOptions(processed);

        return processed;
    }

    /**
     * Injects base_url: WIREMOCK_BASE_URL into the request_options hash of the method call.
     * This is necessary because the SDK endpoint code may fall back to a default environment
     * if request_options[:base_url] is not provided.
     */
    private injectBaseUrlIntoRequestOptions(snippet: string): string {
        // Check if there's already a request_options in the method call
        if (snippet.includes("request_options:")) {
            // Add base_url to existing request_options hash
            // Pattern: request_options: { ... } -> request_options: { base_url: WIREMOCK_BASE_URL, ... }
            return snippet.replace(/request_options:\s*\{/, "request_options: { base_url: WIREMOCK_BASE_URL, ");
        }

        // No request_options, need to add it to the method call
        // Find the method call pattern: client.some.method(...) or client.some.method
        // Look for the last method call (after client initialization)

        // Pattern for method call with arguments: .method_name(args)
        const methodCallWithArgsPattern = /(\.\w+\()([^)]*)\)(\s*)$/;
        const matchWithArgs = snippet.match(methodCallWithArgsPattern);

        if (matchWithArgs) {
            const [, methodStart, existingArgs, trailingSpace] = matchWithArgs;
            if (existingArgs && existingArgs.trim()) {
                // There are existing arguments, add request_options at the end
                return snippet.replace(
                    methodCallWithArgsPattern,
                    `${methodStart}${existingArgs}, request_options: { base_url: WIREMOCK_BASE_URL })${trailingSpace}`
                );
            } else {
                // Empty parentheses, add request_options
                return snippet.replace(
                    methodCallWithArgsPattern,
                    `${methodStart}request_options: { base_url: WIREMOCK_BASE_URL })${trailingSpace}`
                );
            }
        }

        // Pattern for method call without parentheses: .method_name at end of line
        const methodCallNoParensPattern = /(\.\w+)(\s*)$/;
        const matchNoParens = snippet.match(methodCallNoParensPattern);

        if (matchNoParens) {
            const [, methodName, trailingSpace] = matchNoParens;
            return snippet.replace(
                methodCallNoParensPattern,
                `${methodName}(request_options: { base_url: WIREMOCK_BASE_URL })${trailingSpace}`
            );
        }

        return snippet;
    }

    /**
     * Checks if the snippet already contains auth parameters in the client constructor.
     * Only checks within the Client.new(...) call, not in method calls.
     */
    private snippetHasAuth(snippet: string): boolean {
        const scheme = this.context.ir.auth.schemes[0];
        if (!scheme) {
            return true; // No auth scheme means "auth is satisfied"
        }

        // Extract just the client constructor portion to avoid false positives
        // from auth parameters that appear in method calls
        const clientConstructorMatch = snippet.match(/::Client\.new\([^)]*\)/);
        if (!clientConstructorMatch) {
            return false; // No client constructor found, auth needs to be injected
        }
        const clientConstructor = clientConstructorMatch[0];

        switch (scheme.type) {
            case "bearer":
                // Check for token parameter in client constructor
                return clientConstructor.includes(`${scheme.token.snakeCase.safeName}:`);
            case "header":
                // Check for header auth parameter in client constructor
                return clientConstructor.includes(`${scheme.name.name.snakeCase.safeName}:`);
            case "basic":
                // Check for username parameter in client constructor
                return clientConstructor.includes(`${scheme.username.snakeCase.safeName}:`);
            case "oauth":
                // Check for client_id parameter in client constructor
                return clientConstructor.includes("client_id:");
            case "inferred": {
                // Check if the first inferred auth parameter is present in the client constructor
                // The inferred auth params are extracted from the token endpoint
                const inferredParams = this.getParametersForInferredAuth(scheme);
                if (inferredParams.length === 0) {
                    return true; // No params to inject
                }
                // Check if the first non-literal param is present
                const firstParam = inferredParams.find((p) => p.literal == null);
                return firstParam ? clientConstructor.includes(`${firstParam.snakeName}:`) : true;
            }
            default:
                return true;
        }
    }

    /**
     * Injects auth parameters into the client constructor based on global auth schemes.
     * This is necessary because the dynamic snippets generator only handles auth when
     * endpoint.auth is set, but global auth is defined at the API level.
     */
    private injectAuthIntoSnippet(snippet: string): string {
        const scheme = this.context.ir.auth.schemes[0];
        if (!scheme) {
            return snippet;
        }

        let authArg: string | undefined;

        switch (scheme.type) {
            case "bearer":
                authArg = `${scheme.token.snakeCase.safeName}: "<token>"`;
                break;
            case "header":
                authArg = `${scheme.name.name.snakeCase.safeName}: "test-api-key"`;
                break;
            case "basic":
                authArg = `${scheme.username.snakeCase.safeName}: "test-username", ${scheme.password.snakeCase.safeName}: "test-password"`;
                break;
            case "oauth":
                // OAuth client credentials
                authArg = `client_id: "test-client-id", client_secret: "test-client-secret"`;
                break;
            case "inferred":
                // Build auth args from the inferred auth parameters
                authArg = this.buildInferredAuthArgs(scheme);
                break;
            default:
                return snippet;
        }

        if (authArg) {
            // Insert auth arg into the Client.new(...) call
            // Handle case where there are already args (has comma after opening paren content)
            if (snippet.match(/::Client\.new\([^)]+\)/)) {
                // There are already arguments, add auth at the beginning
                snippet = snippet.replace(/(\w+::Client\.new\()/, `$1${authArg}, `);
            } else {
                // Empty args, just add auth
                snippet = snippet.replace(/(\w+::Client\.new\()(\))/, `$1${authArg}$2`);
            }
        }

        return snippet;
    }

    /**
     * Builds the auth args string for inferred auth schemes.
     * Extracts the required parameters from the token endpoint and creates test values.
     */
    private buildInferredAuthArgs(scheme: InferredAuthScheme): string | undefined {
        const params = this.getParametersForInferredAuth(scheme);
        if (params.length === 0) {
            return undefined;
        }

        return params
            .filter((p) => p.literal == null) // Only include non-literal parameters
            .map((p) => `${p.snakeName}: "test-${p.snakeName.replace(/_/g, "-")}"`)
            .join(", ");
    }

    /**
     * Extracts the required parameters from the inferred auth token endpoint.
     * This mirrors the logic in InferredAuthProviderGenerator.getTokenEndpointRequestProperties.
     */
    private getParametersForInferredAuth(
        scheme: InferredAuthScheme
    ): Array<{ snakeName: string; isOptional: boolean; literal?: Literal }> {
        const parameters: Array<{ snakeName: string; isOptional: boolean; literal?: Literal }> = [];

        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service == null) {
            return [];
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        if (endpoint == null) {
            return [];
        }

        // Add query parameters
        // This matches InferredAuthProviderGenerator behavior
        for (const query of endpoint.queryParameters) {
            const literal = this.maybeLiteral(query.valueType);
            parameters.push({
                snakeName: query.name.name.snakeCase.unsafeName,
                isOptional: this.isOptional(query.valueType),
                literal
            });
        }

        // Get the request body properties (if inlined request body)
        const requestBody = endpoint.requestBody;
        if (requestBody != null && requestBody.type === "inlinedRequestBody") {
            for (const property of requestBody.properties) {
                const literal = this.maybeLiteral(property.valueType);
                parameters.push({
                    snakeName: property.name.name.snakeCase.unsafeName,
                    isOptional: this.isOptional(property.valueType),
                    literal
                });
            }
        }

        // Add headers (service-level and endpoint-level)
        // This matches InferredAuthProviderGenerator behavior
        for (const header of [...service.headers, ...endpoint.headers]) {
            const literal = this.maybeLiteral(header.valueType);
            parameters.push({
                snakeName: header.name.name.snakeCase.unsafeName,
                isOptional: this.isOptional(header.valueType),
                literal
            });
        }

        return parameters;
    }

    private isOptional(typeReference: { type: string }): boolean {
        return typeReference.type === "container" || typeReference.type === "unknown";
    }

    private maybeLiteral(typeReference: {
        type: string;
        container?: { type: string; literal?: Literal };
    }): Literal | undefined {
        if (typeReference.type === "container") {
            const container = typeReference as { type: string; container: { type: string; literal?: Literal } };
            if (container.container?.type === "literal") {
                return container.container.literal;
            }
        }
        return undefined;
    }

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath =
            endpoint.fullPath.head +
            endpoint.fullPath.parts.map((part) => `{${part.pathParameter}}${part.tail}`).join("");

        if (!basePath.startsWith("/")) {
            basePath = `/${basePath}`;
        }

        const mappingKey = this.wiremockMappingKey({
            requestMethod: endpoint.method,
            requestUrlPathTemplate: basePath
        });

        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        if (!wiremockMapping) {
            this.context.logger.warn(
                `No wiremock mapping found for endpoint ${endpoint.id} and mappingKey "${mappingKey}"`
            );
            return basePath;
        }

        // Try to get path parameters from wiremock mapping first
        if (wiremockMapping.request.pathParameters && Object.keys(wiremockMapping.request.pathParameters).length > 0) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        } else {
            // Fallback: Get path parameters from dynamic endpoint example
            const dynamicExample = this.getDynamicEndpointExample(endpoint);
            if (dynamicExample?.pathParameters) {
                Object.entries(dynamicExample.pathParameters).forEach(([paramName, paramValue]) => {
                    if (paramValue != null) {
                        basePath = basePath.replace(`{${paramName}}`, String(paramValue));
                    }
                });
            }
        }

        return basePath;
    }

    /**
     * Builds the query params code for verification.
     * Only includes REQUIRED query params to avoid mismatches with optional params
     * that may not be included in the generated snippet.
     */
    private buildQueryParamsCode(endpoint: HttpEndpoint): string {
        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return "nil";
        }

        // Build a set of required query param wire names
        const requiredQueryParamNames = new Set<string>();
        for (const queryParam of endpoint.queryParameters) {
            // A query param is required if it's not optional (no container wrapper)
            const isOptional =
                queryParam.valueType.type === "container" && queryParam.valueType.container.type === "optional";
            if (!isOptional) {
                requiredQueryParamNames.add(queryParam.name.wireValue);
            }
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            // Only include required params OR params that have values in the example
            // but prioritize required params to avoid verifying optional params
            if (paramValue != null && requiredQueryParamNames.has(paramName)) {
                const key = JSON.stringify(paramName);
                const value = JSON.stringify(String(paramValue));
                queryParamEntries.push(`${key} => ${value}`);
            }
        }

        if (queryParamEntries.length === 0) {
            return "nil";
        }

        return `{ ${queryParamEntries.join(", ")} }`;
    }

    private getTestMethodName(endpoint: HttpEndpoint, serviceName: string): string {
        const endpointName = endpoint.name.snakeCase.safeName;
        return `test_${serviceName}_${endpointName}_with_wiremock`;
    }

    private getDynamicEndpointExample(endpoint: HttpEndpoint): dynamic.EndpointSnippetRequest | null {
        const example = this.dynamicIr.endpoints[endpoint.id];
        if (!example) {
            return null;
        }
        return example.examples?.[0] ?? null;
    }

    private async generateSnippetForExample({
        example,
        endpoint,
        testId
    }: {
        example: dynamic.EndpointSnippetRequest;
        service: HttpService;
        endpoint: HttpEndpoint;
        exampleIndex: number;
        testId: string;
    }): Promise<string> {
        // Inject the X-Test-Id header and test auth values into the example request
        const exampleWithTestId: dynamic.EndpointSnippetRequest = {
            ...example,
            headers: {
                ...(example.headers ?? {}),
                "X-Test-Id": testId
            },
            // Inject test auth values if the endpoint requires auth but example doesn't have them
            auth: example.auth ?? this.getTestAuthValues(endpoint)
        };

        const snippetRequest = convertDynamicEndpointSnippetRequest(exampleWithTestId);
        const response = this.dynamicSnippetsGenerator.generateSync(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    /**
     * Generates test auth values for wire tests based on the endpoint's or global auth configuration.
     * These are placeholder values that work with WireMock stubs.
     */
    private getTestAuthValues(endpoint: HttpEndpoint): dynamic.AuthValues | undefined {
        // First try to get auth from the dynamic endpoint
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (dynamicEndpoint?.auth) {
            return this.createAuthValuesFromDynamicAuth(dynamicEndpoint.auth);
        }

        // Fall back to global auth schemes if endpoint doesn't have specific auth
        if (this.context.ir.auth.schemes.length > 0) {
            return this.createAuthValuesFromGlobalSchemes();
        }

        return undefined;
    }

    private createAuthValuesFromDynamicAuth(auth: dynamic.Auth): dynamic.AuthValues | undefined {
        switch (auth.type) {
            case "bearer":
                return dynamic.AuthValues.bearer({
                    token: "<token>"
                });
            case "basic":
                return dynamic.AuthValues.basic({
                    username: "test-username",
                    password: "test-password"
                });
            case "header":
                return dynamic.AuthValues.header({
                    value: "test-api-key"
                });
            case "oauth":
                return dynamic.AuthValues.oauth({
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret"
                });
            default:
                return undefined;
        }
    }

    private createAuthValuesFromGlobalSchemes(): dynamic.AuthValues | undefined {
        // Use the first auth scheme defined in the IR
        const scheme = this.context.ir.auth.schemes[0];
        if (!scheme) {
            return undefined;
        }

        switch (scheme.type) {
            case "bearer":
                return dynamic.AuthValues.bearer({
                    token: "<token>"
                });
            case "basic":
                return dynamic.AuthValues.basic({
                    username: "test-username",
                    password: "test-password"
                });
            case "header":
                return dynamic.AuthValues.header({
                    value: "test-api-key"
                });
            case "oauth":
                return dynamic.AuthValues.oauth({
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret"
                });
            default:
                return undefined;
        }
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            // Skip root-level services (services without a fernFilepath)
            // The Ruby SDK doesn't generate methods for root-level endpoints on the main client
            if (!service.name?.fernFilepath?.allParts || service.name.fernFilepath.allParts.length === 0) {
                this.context.logger.debug(
                    `Skipping root-level service for wire tests: ${service.name?.fernFilepath?.file?.snakeCase?.safeName ?? "unknown"}`
                );
                continue;
            }

            const serviceName = this.getFormattedServiceName(service);
            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";
    }

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

    private toPascalCase(str: string): string {
        return str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
    }
}
