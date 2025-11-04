import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { DynamicSnippetsGenerator } from "@fern-api/ruby-dynamic-snippets";
import { dynamic, ExampleEndpointCall, FernFilepath, HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        const dynamicIr = this.context.ir.dynamic;
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
        let out: Record<string, WireMockMapping> = {};
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

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();
        const filePathsByServiceName = this.getFilePathsByServiceName();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(
                serviceName,
                endpointsWithExamples,
                filePathsByServiceName.get(serviceName) ?? {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                }
            );

            this.context.project.addRawFiles(serviceTestFile);
        }
        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[],
        filePath: FernFilepath
    ): Promise<File> {
        const endpointTestCases = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = this.getDynamicEndpointExample(endpoint);
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample);
                        endpointTestCases.set(endpoint.id, snippet);
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        // Skip this endpoint if snippet generation fails
                        continue;
                    }
                }
            }
        }

        const testFileContent = this.generateTestFileContent(serviceName, endpoints, endpointTestCases);

        const testDirectory = this.getTestDirectory(filePath);
        const testFileName = `${serviceName}_test.rb`;

        return new File(testFileName, RelativeFilePath.of(testDirectory), testFileContent);
    }

    private generateTestFileContent(
        serviceName: string,
        endpoints: HttpEndpoint[],
        endpointTestCases: Map<string, string>
    ): string {
        const lines: string[] = [];

        lines.push("# frozen_string_literal: true");
        lines.push("");

        lines.push('require "test_helper"');
        lines.push('require "net/http"');
        lines.push('require "json"');
        lines.push("");

        const className = this.getTestClassName(serviceName);
        lines.push(`class ${className} < Minitest::Test`);

        lines.push("  def reset_wiremock_requests");
        lines.push('    wiremock_admin_url = "http://localhost:8080/__admin"');
        lines.push('    uri = URI("#{wiremock_admin_url}/requests/reset")');
        lines.push("    Net::HTTP.post(uri, nil, { 'Content-Type' => 'application/json' })");
        lines.push("  end");
        lines.push("");

        lines.push("  def verify_request_count(method, url_path, query_params, expected)");
        lines.push('    wiremock_admin_url = "http://localhost:8080/__admin"');
        lines.push('    uri = URI("#{wiremock_admin_url}/requests/find")');
        lines.push("");
        lines.push("    request_body = {");
        lines.push('      "method" => method,');
        lines.push('      "urlPath" => url_path');
        lines.push("    }");
        lines.push("");
        lines.push("    if query_params && !query_params.empty?");
        lines.push('      request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } }');
        lines.push("    end");
        lines.push("");
        lines.push(
            "    response = Net::HTTP.post(uri, request_body.to_json, { 'Content-Type' => 'application/json' })"
        );
        lines.push("    result = JSON.parse(response.body)");
        lines.push('    assert_equal expected, result["requests"].length');
        lines.push("  end");
        lines.push("");

        for (const endpoint of endpoints) {
            const snippet = endpointTestCases.get(endpoint.id);
            if (!snippet) {
                this.context.logger.warn(`No snippet found for endpoint ${endpoint.id}`);
                continue;
            }

            const testMethod = this.generateEndpointTestMethod(endpoint, snippet);
            lines.push(testMethod);
            lines.push("");
        }

        lines.push("end");

        return lines.join("\n");
    }

    private generateEndpointTestMethod(endpoint: HttpEndpoint, snippet: string): string {
        const lines: string[] = [];
        const testMethodName = this.getTestMethodName(endpoint);

        lines.push(`  def ${testMethodName}`);
        lines.push("    reset_wiremock_requests");
        lines.push('    wiremock_base_url = "http://localhost:8080"');
        lines.push("");

        const clientSetup = this.parseClientSetup(snippet);
        if (clientSetup) {
            lines.push(`    ${clientSetup}`);
            lines.push("");
        }

        const methodCall = this.parseMethodCall(snippet);
        if (methodCall) {
            lines.push(`    ${methodCall}`);
            lines.push("");
        }

        const basePath = this.buildBasePath(endpoint);
        const queryParams = this.buildQueryParamsHash(endpoint);

        lines.push(`    verify_request_count("${endpoint.method}", "${basePath}", ${queryParams}, 1)`);
        lines.push("  end");

        return lines.join("\n");
    }

    private parseClientSetup(snippet: string): string | null {
        const lines = snippet.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.includes("Client.new") || trimmedLine.includes("::Client.new")) {
                let clientSetupLines = [lines[i]];
                let parenCount = (lines[i]?.match(/\(/g) || []).length - (lines[i]?.match(/\)/g) || []).length;

                for (let j = i + 1; j < lines.length && parenCount > 0; j++) {
                    clientSetupLines.push(lines[j] ?? "");
                    parenCount += (lines[j]?.match(/\(/g) || []).length - (lines[j]?.match(/\)/g) || []).length;
                }

                let clientSetup = clientSetupLines.join("\n");
                clientSetup = clientSetup.replace(/base_url:\s*"[^"]*"/, "base_url: wiremock_base_url");
                clientSetup = clientSetup.replace(/base_url:\s*'[^']*'/, "base_url: wiremock_base_url");

                return clientSetup.trim();
            }
        }

        return null;
    }

    private parseMethodCall(snippet: string): string | null {
        const lines = snippet.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("client.") && !trimmedLine.includes("Client.new")) {
                let methodCallLines = [lines[i]];
                let parenCount = (lines[i]?.match(/\(/g) || []).length - (lines[i]?.match(/\)/g) || []).length;

                for (let j = i + 1; j < lines.length && parenCount > 0; j++) {
                    methodCallLines.push(lines[j] ?? "");
                    parenCount += (lines[j]?.match(/\(/g) || []).length - (lines[j]?.match(/\)/g) || []).length;
                }

                return methodCallLines.join("\n").trim();
            }
        }

        return null;
    }

    private getTestClassName(serviceName: string): string {
        const parts = serviceName.split("_");
        const pascalCase = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
        return `${pascalCase}WireMockTest`;
    }

    private getTestMethodName(endpoint: HttpEndpoint): string {
        const endpointName = endpoint.name.camelCase.safeName;
        const snakeCase = endpointName.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `test_${snakeCase}_with_wiremock`;
    }

    private getTestDirectory(filePath: FernFilepath): string {
        const parts = filePath.allParts.map((part) => part.snakeCase.safeName);
        if (parts.length > 0) {
            return `test/${parts.join("/")}`;
        }
        return "test";
    }

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
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
            throw new Error(
                `No wiremock mapping found for endpoint ${endpoint.id} and mappingKey "${mappingKey}". Keys available look like "${Object.keys(this.wireMockConfigContent).slice(0, 15).join('", "')}"`
            );
        }

        Object.entries(wiremockMapping.request.pathParameters || {}).forEach(([paramName, paramValue]) => {
            basePath = basePath.replace(`{${paramName}}`, paramValue.equalTo);
        });

        return basePath;
    }

    private buildQueryParamsHash(endpoint: HttpEndpoint): string {
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

    private getDynamicEndpointExample(endpoint: HttpEndpoint): dynamic.EndpointExample | null {
        const example = this.dynamicIr.endpoints[endpoint.id];
        if (!example) {
            return null;
        }

        return example.examples?.[0] ?? null;
    }

    private getEndpointExample(endpoint: HttpEndpoint): ExampleEndpointCall | null {
        const firstUserSpecifiedExample = endpoint.userSpecifiedExamples?.[0]?.example;
        const firstAutogeneratedExample = endpoint.autogeneratedExamples?.[0]?.example;
        const firstExample = firstUserSpecifiedExample ?? firstAutogeneratedExample;

        if (!firstExample) {
            return null;
        }

        return firstExample;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private getFilePathsByServiceName(): Map<string, FernFilepath> {
        const filePathsByServiceName = new Map<string, FernFilepath>();
        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            filePathsByServiceName.set(serviceName, service.name?.fernFilepath);
        }
        return filePathsByServiceName;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";
    }
}
