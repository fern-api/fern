import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { DynamicSnippetsGenerator } from "@fern-api/ruby-dynamic-snippets";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

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
        const endpointTestCases = new Map<string, { snippet: string; endpoint: HttpEndpoint }>();

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = this.getDynamicEndpointExample(endpoint);
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample);
                        endpointTestCases.set(endpoint.id, { snippet, endpoint });
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        continue;
                    }
                }
            }
        }

        const testFileContent = this.buildTestFileContent(serviceName, endpointTestCases);

        return new File(`${serviceName}_test.rb`, RelativeFilePath.of("test/wire"), testFileContent);
    }

    private buildTestFileContent(
        serviceName: string,
        endpointTestCases: Map<string, { snippet: string; endpoint: HttpEndpoint }>
    ): string {
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
        lines.push(
            '      skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."'
        );
        lines.push("    end");
        lines.push("  end");
        lines.push("");

        // Helper methods
        lines.push(...this.generateHelperMethods());
        lines.push("");

        // Test methods
        for (const { snippet, endpoint } of endpointTestCases.values()) {
            const testMethod = this.generateEndpointTestMethod(endpoint, snippet, serviceName);
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

        // reset_wiremock_requests method
        lines.push("  def reset_wiremock_requests");
        lines.push('    uri = URI("#{WIREMOCK_ADMIN_URL}/requests")');
        lines.push("    http = Net::HTTP.new(uri.host, uri.port)");
        lines.push('    request = Net::HTTP::Delete.new(uri.path, { "Content-Type" => "application/json" })');
        lines.push("    http.request(request)");
        lines.push("  end");
        lines.push("");

        // verify_request_count method
        lines.push("  def verify_request_count(method:, url_path:, query_params: nil, expected:)");
        lines.push('    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")');
        lines.push("    http = Net::HTTP.new(uri.host, uri.port)");
        lines.push('    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })');
        lines.push("");
        lines.push('    request_body = { "method" => method, "urlPath" => url_path }');
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

    private generateEndpointTestMethod(endpoint: HttpEndpoint, snippet: string, serviceName: string): string[] | null {
        try {
            const testName = this.getTestMethodName(endpoint, serviceName);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);

            const lines: string[] = [];

            lines.push(`  def ${testName}`);
            lines.push("    reset_wiremock_requests");
            lines.push("");

            // Process the snippet to use WireMock base URL
            const processedSnippet = this.processSnippetForWireMock(snippet);
            const snippetLines = processedSnippet.split("\n");
            for (const line of snippetLines) {
                if (line.trim()) {
                    lines.push(`    ${line}`);
                }
            }
            lines.push("");

            // Verify request count
            lines.push(`    verify_request_count(`);
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

    private processSnippetForWireMock(snippet: string): string {
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

        return processed;
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

    private buildQueryParamsCode(endpoint: HttpEndpoint): string {
        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return "nil";
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
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

    private async generateSnippetForExample(example: dynamic.EndpointSnippetRequest): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = this.dynamicSnippetsGenerator.generateSync(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
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
