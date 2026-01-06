import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { ruby } from "@fern-api/ruby-ast";
import { DynamicSnippetsGenerator } from "@fern-api/ruby-dynamic-snippets";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation, Literal } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

interface EndpointTestCase {
    snippetAst: ruby.AstNode;
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
                    const snippetAst = await this.generateSnippetAstForExample({
                        example: firstExample,
                        endpoint,
                        testId
                    });
                    endpointTestCases.set(endpoint.id, { snippetAst, endpoint, service, exampleIndex, testId });
                } catch (error) {
                    this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                    continue;
                }
            }
        }

        const testFileContent = await this.buildTestFileContent(serviceName, endpointTestCases);

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

    private async buildTestFileContent(
        serviceName: string,
        endpointTestCases: Map<string, EndpointTestCase>
    ): Promise<string> {
        const lines: string[] = [];

        // File header
        lines.push("# frozen_string_literal: true");
        lines.push("");
        lines.push('require_relative "wiremock_test_case"');
        lines.push("");

        // Test class inherits from WireMockTestCase which provides helper methods
        lines.push(`class ${this.toPascalCase(serviceName)}WireTest < WireMockTestCase`);
        lines.push("");

        // Setup method that creates the client once (base class handles skip logic)
        lines.push(...this.generateSetupMethod());
        lines.push("");

        // Test methods
        for (const { snippetAst, endpoint, testId } of endpointTestCases.values()) {
            const testMethod = await this.generateEndpointTestMethod(endpoint, snippetAst, serviceName, testId);
            if (testMethod) {
                lines.push(...testMethod);
                lines.push("");
            }
        }

        lines.push("end");

        return lines.join("\n");
    }

    /**
     * Generates the setup method that creates the client once with auth and base_url.
     * This follows the PHP/Python pattern of client reuse for better performance.
     * The base class (WireMockTestCase) handles the skip logic for wire tests.
     */
    private generateSetupMethod(): string[] {
        const lines: string[] = [];

        lines.push("  def setup");
        lines.push("    super");
        lines.push("");

        // Build auth parameters for the client constructor
        const authParams = this.buildAuthParamsForSetup();
        const clientClassName = `${this.context.getRootModuleName()}::Client`;

        // Generate client instantiation with auth and base_url
        if (authParams.length > 0) {
            lines.push(`    @client = ${clientClassName}.new(`);
            for (const param of authParams) {
                lines.push(`      ${param},`);
            }
            lines.push("      base_url: WIREMOCK_BASE_URL");
            lines.push("    )");
        } else {
            lines.push(`    @client = ${clientClassName}.new(base_url: WIREMOCK_BASE_URL)`);
        }

        lines.push("  end");

        return lines;
    }

    /**
     * Builds auth parameters for the setup method based on global auth schemes.
     */
    private buildAuthParamsForSetup(): string[] {
        const authParams: string[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    authParams.push(`${scheme.token.snakeCase.safeName}: "<token>"`);
                    break;
                case "header":
                    authParams.push(`${scheme.name.name.snakeCase.safeName}: "test-api-key"`);
                    break;
                case "basic":
                    authParams.push(`${scheme.username.snakeCase.safeName}: "test-username"`);
                    authParams.push(`${scheme.password.snakeCase.safeName}: "test-password"`);
                    break;
                case "oauth":
                    authParams.push('client_id: "test-client-id"');
                    authParams.push('client_secret: "test-client-secret"');
                    break;
                case "inferred": {
                    // Handle inferred auth by extracting parameters from the token endpoint
                    const inferredAuth = this.context.getInferredAuth();
                    if (inferredAuth != null) {
                        const inferredParams = this.buildInferredAuthParamsForSetup(inferredAuth);
                        authParams.push(...inferredParams);
                    }
                    break;
                }
            }
        }

        return authParams;
    }

    /**
     * Builds inferred auth parameters for the setup method.
     */
    private buildInferredAuthParamsForSetup(scheme: ReturnType<SdkGeneratorContext["getInferredAuth"]>): string[] {
        if (scheme == null) {
            return [];
        }

        const params: string[] = [];
        const tokenEndpointRef = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointRef.serviceId];
        if (service == null) {
            return [];
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointRef.endpointId);
        if (endpoint == null) {
            return [];
        }

        // Extract parameters from request body properties
        const requestBody = endpoint.requestBody;
        if (requestBody != null && requestBody.type === "inlinedRequestBody") {
            for (const property of requestBody.properties) {
                const literal = this.maybeLiteral(property.valueType);
                if (literal == null) {
                    const paramName = property.name.name.snakeCase.safeName;
                    params.push(`${paramName}: "test-${paramName.replace(/_/g, "-")}"`);
                }
            }
        }

        // Extract parameters from endpoint headers
        for (const header of endpoint.headers) {
            const literal = this.maybeLiteral(header.valueType);
            if (literal == null) {
                const paramName = header.name.name.snakeCase.safeName;
                params.push(`${paramName}: "test-${paramName.replace(/_/g, "-")}"`);
            }
        }

        return params;
    }

    /**
     * Checks if a type reference is a literal type and returns the literal value if so.
     */
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

    private async generateEndpointTestMethod(
        endpoint: HttpEndpoint,
        snippetAst: ruby.AstNode,
        serviceName: string,
        testId: string
    ): Promise<string[] | null> {
        try {
            const testName = this.getTestMethodName(endpoint, serviceName);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);

            const lines: string[] = [];

            lines.push(`  def ${testName}`);
            lines.push(`    test_id = "${testId}"`);
            lines.push("");

            // Convert the snippet AST to string
            const snippetCode = await (snippetAst as ruby.AstNode).toStringAsync({
                customConfig: this.context.customConfig ?? {}
            });

            // Check if endpoint uses lazy pagination (cursor or offset)
            // These return iterators that don't make HTTP requests until iterated
            const isLazyPagination = endpoint.pagination?.type === "cursor" || endpoint.pagination?.type === "offset";

            if (isLazyPagination) {
                // For lazy paginated endpoints, we need to trigger the first HTTP request
                // by calling .pages.next_page on the returned iterator
                lines.push(`    result = begin`);
                const snippetLines = snippetCode.split("\n");
                for (const line of snippetLines) {
                    if (line.trim()) {
                        lines.push(`      ${line}`);
                    }
                }
                lines.push(`    end`);
                lines.push(`    result.pages.next_page`);
            } else {
                const snippetLines = snippetCode.split("\n");
                for (const line of snippetLines) {
                    if (line.trim()) {
                        lines.push(`    ${line}`);
                    }
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

    /**
     * Generates a snippet AST for an example using skipClientInstantiation.
     * This is the new approach that passes base_url and auth through the snippet request
     * instead of post-processing the generated snippet string with regex.
     */
    private async generateSnippetAstForExample({
        example,
        endpoint,
        testId
    }: {
        example: dynamic.EndpointSnippetRequest;
        endpoint: HttpEndpoint;
        testId: string;
    }): Promise<ruby.AstNode> {
        // Inject the X-Test-Id header into the example request
        // Auth is handled in the setup method, so we don't need to inject it here
        const exampleWithTestId: dynamic.EndpointSnippetRequest = {
            ...example,
            headers: {
                ...(example.headers ?? {}),
                "X-Test-Id": testId
            }
        };

        const snippetRequest = convertDynamicEndpointSnippetRequest(exampleWithTestId);
        const snippetAst = await this.dynamicSnippetsGenerator.generateSnippetAst(snippetRequest, {
            skipClientInstantiation: true
        });
        return snippetAst as ruby.AstNode;
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
