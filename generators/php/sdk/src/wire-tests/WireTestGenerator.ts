import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { php } from "@fern-api/php-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/php-dynamic-snippets";
import {
    dynamic,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

/**
 * Generates WireMock-based integration tests for PHP SDK.
 *
 * This generator creates PHPUnit test files that:
 * 1. Start a WireMock container via docker-compose
 * 2. Make API calls against the mock server
 * 3. Verify the correct requests were made
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private wireMockConfigContent: Record<string, WireMockMapping>;
    private readonly dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor({ context, ir }: { context: SdkGeneratorContext; ir: IntermediateRepresentation }) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.wireMockConfigContent = this.getWireMockConfigContent();
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });
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
            if (serviceTestFile) {
                this.context.project.addRawFiles(
                    new File(serviceTestFile.filename, serviceTestFile.directory, serviceTestFile.contents)
                );
            }
        }

        // Generate docker-compose.test.yml, wiremock-mappings.json, and WireMockTestCase.php
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[]
    ): Promise<{ filename: string; directory: RelativeFilePath; contents: string } | undefined> {
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
            return undefined;
        }

        this.context.logger.info(
            `Generating test file for service ${serviceName} with ${endpointTestCases.length} test cases`
        );

        const testClassName = this.getTestClassName(serviceName);
        const phpContent = await this.buildTestFileContent(testClassName, endpointTestCases);

        return {
            filename: `${testClassName}.php`,
            directory: RelativeFilePath.of("tests/Wire"),
            contents: phpContent.toString({
                namespace: this.context.getTestsNamespace(),
                rootNamespace: this.context.getRootNamespace(),
                customConfig: this.context.customConfig
            })
        };

    }

    private getTestClassName(serviceName: string): string {
        // Convert service name to PascalCase and append WireTest
        const pascalCase = serviceName
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
        return `${pascalCase}WireTest`;
    }

    private async buildTestFileContent(
        testClassName: string,
        testCases: Array<{
            endpoint: HttpEndpoint;
            example: dynamic.EndpointExample;
            service: HttpService;
            exampleIndex: number;
        }>
    ): Promise<php.Class> {
        const class_ = php.class_({
            name: testClassName,
            namespace: this.context.getTestsNamespace(),
            parentClassReference: php.classReference({ namespace: "PHPUnit\\Framework", name: "TestCase" }),
        });

        for (const { endpoint, example, service, exampleIndex } of testCases) {
            const testMethod = await this.generateEndpointTestMethod({
                endpoint,
                example,
                service,
                exampleIndex,
            });
            if (testMethod) {
                class_.addMethod(testMethod);
            }
        }
        return class_;
    }

    private async generateEndpointTestMethod({
        endpoint,
        example,
        service,
        exampleIndex,
    }: {
        endpoint: HttpEndpoint;
        example: dynamic.EndpointExample;
        service: HttpService;
        exampleIndex: number;
    }): Promise<php.Method | undefined> {
        try {
            const testName = this.getTestMethodName(endpoint);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);
            const testId = this.buildDeterministicTestId(
                service,
                endpoint,
                exampleIndex
            );

            // Generate the API call using dynamic snippets generator
            const snippetRequest = convertDynamicEndpointSnippetRequest({
                ...example,
                baseUrl: "http://localhost:8080"
            });
            const snippetAst = await this.dynamicSnippetsGenerator.generateSnippetAst(snippetRequest);

            return php.method({
                name: testName,
                access: "public",
                parameters: [],
                body: php.codeblock((writer) => {
                    // $testId = '...';
                    writer.writeStatement(`$testId = '${testId}'`);

                    // $client = new Client(...);
                    writer.writeStatement(
                        `$client = new ${this.context.getRootClientClassName()}(
    options: [
        'baseUrl' => 'http://localhost:8080',
        'headers' => ['X-Test-Id' => $testId],
    ]
)`
                    );

                    // API call from dynamic snippet AST
                    writer.writeNode(snippetAst as php.AstNode);

                    // $this->verifyRequestCount(...);
                    writer.writeStatement(`$this->verifyRequestCount(
    $testId,
    "${endpoint.method}",
    "${basePath}",
    ${queryParamsCode},
    1
)`);
                })
            });
        } catch (error) {
            this.context.logger.warn(`Failed to generate test method for endpoint ${endpoint.id}: ${error}`);
            return undefined;
        }
    }

    private getTestMethodName(endpoint: HttpEndpoint): string {
        // Convert endpoint name to camelCase test method name
        const endpointName = endpoint.name.camelCase.safeName;
        return `test${endpointName.charAt(0).toUpperCase()}${endpointName.slice(1)}`;
    }

    private buildDeterministicTestId(
        service: HttpService,
        endpoint: HttpEndpoint,
        exampleIndex: number
    ): string {
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

    private escapeStringForPhp(value: string): string {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/'/g, "\\'");
    }

    private jsonToPhp(value: unknown): string {
        if (value === null || value === undefined) {
            return "null";
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        if (typeof value === "string") {
            return `'${this.escapeStringForPhp(value)}'`;
        }
        if (typeof value === "number") {
            return String(value);
        }
        if (Array.isArray(value)) {
            const items = value.map((item) => this.jsonToPhp(item));
            return `[${items.join(", ")}]`;
        }
        if (typeof value === "object") {
            const entries = Object.entries(value).map(
                ([key, val]) => `'${this.escapeStringForPhp(key)}' => ${this.jsonToPhp(val)}`
            );
            return `[${entries.join(", ")}]`;
        }
        return JSON.stringify(value);
    }

    private buildQueryParamsCode(endpoint: HttpEndpoint): string {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (!dynamicEndpoint?.examples?.[0]?.queryParameters) {
            return "null";
        }

        const queryParams = dynamicEndpoint.examples[0].queryParameters;
        const entries: string[] = [];

        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== null && value !== undefined) {
                entries.push(
                    `'${this.escapeStringForPhp(key)}' => '${this.escapeStringForPhp(String(value))}'`
                );
            }
        }

        if (entries.length === 0) {
            return "null";
        }

        return `[${entries.join(", ")}]`;
    }

    private wiremockMappingKey(
        requestMethod: string,
        requestUrlPathTemplate: string
    ): string {
        return `${requestMethod} - ${requestUrlPathTemplate}`;
    }

    private getWireMockConfigContent(): Record<string, WireMockMapping> {
        const out: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(this.context.ir);
        for (const mapping of wiremockStubMapping.mappings) {
            const key = this.wiremockMappingKey(
                mapping.request.method,
                mapping.request.urlPathTemplate
            );
            out[key] = mapping;
        }
        return out;
    }

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }

        const mappingKey = this.wiremockMappingKey(
            endpoint.method,
            basePath
        );

        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        if (wiremockMapping && wiremockMapping.request.pathParameters) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        }

        return basePath;
    }

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
