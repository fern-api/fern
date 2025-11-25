import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
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

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
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

            const serviceTestFile = this.generateServiceTestFile(serviceName, endpointsWithExamples);
            if (serviceTestFile) {
                this.context.project.addRawFiles({
                    filename: serviceTestFile.filename,
                    directory: serviceTestFile.directory,
                    contents: serviceTestFile.contents
                });
            }
        }

        // Generate docker-compose.test.yml, wiremock-mappings.json, and WireMockTestCase.php
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[]
    ): { filename: string; directory: RelativeFilePath; contents: string } | null {
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
            return null;
        }

        this.context.logger.info(
            `Generating test file for service ${serviceName} with ${endpointTestCases.length} test cases`
        );

        const testClassName = this.getTestClassName(serviceName);
        const phpContent = this.buildTestFileContent(testClassName, endpointTestCases);

        return {
            filename: `${testClassName}.php`,
            directory: RelativeFilePath.of("tests/Wire"),
            contents: phpContent
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

    private buildTestFileContent(
        testClassName: string,
        testCases: Array<{
            endpoint: HttpEndpoint;
            example: dynamic.EndpointExample;
            service: HttpService;
            exampleIndex: number;
        }>
    ): string {
        const namespace = this.context.getTestsNamespace();
        const rootNamespace = this.context.getRootNamespace();
        const clientClassName = this.context.getClientName();

        const imports = new Set<string>();
        imports.add(`use ${rootNamespace}\\${clientClassName};`);

        const testMethods: string[] = [];

        for (const { endpoint, example, service, exampleIndex } of testCases) {
            const testMethod = this.generateEndpointTestMethod(endpoint, example, service, exampleIndex, imports);
            if (testMethod) {
                testMethods.push(testMethod);
            }
        }

        const sortedImports = Array.from(imports).sort();

        return `<?php

namespace ${namespace}\\Wire;

${sortedImports.join("\n")}

class ${testClassName} extends WireMockTestCase
{
${testMethods.join("\n\n")}
}
`;
    }

    private generateEndpointTestMethod(
        endpoint: HttpEndpoint,
        example: dynamic.EndpointExample,
        service: HttpService,
        exampleIndex: number,
        imports: Set<string>
    ): string | null {
        try {
            const testName = this.getTestMethodName(endpoint);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);
            const testId = this.buildDeterministicTestId(service, endpoint, exampleIndex);

            // Generate the API call
            const apiCall = this.generateApiCall(endpoint, example, service, imports);

            return `    public function ${testName}(): void
    {
        $testId = "${testId}";
        $client = new ${this.context.getClientName()}(
            options: [
                'baseUrl' => 'http://localhost:8080',
                'headers' => ['X-Test-Id' => $testId],
            ]
        );

        ${apiCall}

        $this->verifyRequestCount(
            $testId,
            "${endpoint.method}",
            "${basePath}",
            ${queryParamsCode},
            1
        );
    }`;
        } catch (error) {
            this.context.logger.warn(`Failed to generate test method for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    private getTestMethodName(endpoint: HttpEndpoint): string {
        // Convert endpoint name to camelCase test method name
        const endpointName = endpoint.name.camelCase.safeName;
        return `test${endpointName.charAt(0).toUpperCase()}${endpointName.slice(1)}`;
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

    private generateApiCall(
        endpoint: HttpEndpoint,
        example: dynamic.EndpointExample,
        service: HttpService,
        imports: Set<string>
    ): string {
        // Build the client accessor path (e.g., "$client->endpoints->container")
        const servicePath = service.name.fernFilepath.allParts.map((part) => part.camelCase.unsafeName);
        let clientAccessor = "$client";
        for (const part of servicePath) {
            clientAccessor += `->${part}`;
        }

        const methodName = endpoint.name.camelCase.safeName;

        // Build arguments
        const args: string[] = [];

        // Add path parameters
        const pathParams = this.buildPathParameters(endpoint, example);
        args.push(...pathParams);

        // Add request body parameters
        const bodyParams = this.buildRequestBodyParameters(endpoint, example, imports);
        if (bodyParams) {
            args.push(...bodyParams);
        }

        // Add query parameters
        const queryParams = this.buildQueryParametersForCall(endpoint, example);
        args.push(...queryParams);

        // Add headers
        const headerParams = this.buildHeaderParameters(endpoint, example);
        args.push(...headerParams);

        const argsStr = args.length > 0 ? args.join(",\n            ") : "";

        return `$response = ${clientAccessor}->${methodName}(${argsStr ? "\n            " + argsStr + "\n        " : ""});`;
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

    private buildQueryParametersForCall(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string[] {
        const queryParams: string[] = [];

        if (example.queryParameters) {
            for (const [key, value] of Object.entries(example.queryParameters)) {
                if (value != null) {
                    const queryParameterDeclaration = endpoint.queryParameters.find(
                        (queryParameter) => queryParameter.name.wireValue === key
                    );
                    if (queryParameterDeclaration != null) {
                        const paramName = queryParameterDeclaration.name.name.camelCase.safeName;
                        queryParams.push(`${paramName}: ${this.formatValue(value)}`);
                    } else {
                        queryParams.push(`${key}: ${this.formatValue(value)}`);
                    }
                }
            }
        }

        return queryParams;
    }

    private buildHeaderParameters(endpoint: HttpEndpoint, example: dynamic.EndpointExample): string[] {
        const headers: string[] = [];

        if (example.headers) {
            const headerMap = new Map<string, string>();
            for (const header of endpoint.headers) {
                const wireKey = header.name.wireValue;
                const phpName = header.name.name.camelCase.safeName;
                headerMap.set(wireKey, phpName);
            }

            for (const [wireKey, value] of Object.entries(example.headers)) {
                if (value != null) {
                    const paramName = headerMap.get(wireKey) ?? wireKey;
                    headers.push(`${paramName}: ${this.formatValue(value)}`);
                }
            }
        }

        return headers;
    }

    private buildRequestBodyParameters(
        endpoint: HttpEndpoint,
        example: dynamic.EndpointExample,
        imports: Set<string>
    ): string[] | null {
        if (!endpoint.requestBody || !example.requestBody) {
            return null;
        }

        return endpoint.requestBody._visit<string[] | null>({
            inlinedRequestBody: (inlinedBody) => {
                if (
                    example.requestBody != null &&
                    typeof example.requestBody === "object" &&
                    !Array.isArray(example.requestBody)
                ) {
                    const params: string[] = [];

                    const propertyMap = new Map<string, string>();
                    for (const prop of inlinedBody.properties) {
                        const wireKey = prop.name.wireValue;
                        const phpName = prop.name.name.camelCase.safeName;
                        propertyMap.set(wireKey, phpName);
                    }

                    for (const [wireKey, value] of Object.entries(example.requestBody)) {
                        const paramName = propertyMap.get(wireKey) ?? wireKey;
                        params.push(`${paramName}: ${this.jsonToPhp(value)}`);
                    }
                    return params;
                }
                return null;
            },
            reference: (value) => {
                const objectTypeDecl = this.getObjectTypeIfFlattened(value.requestBodyType);

                if (objectTypeDecl != null) {
                    if (
                        example.requestBody != null &&
                        typeof example.requestBody === "object" &&
                        !Array.isArray(example.requestBody)
                    ) {
                        const params: string[] = [];

                        const propertyMap = new Map<string, string>();
                        for (const prop of objectTypeDecl.properties) {
                            const wireKey = prop.name.wireValue;
                            const phpName = prop.name.name.camelCase.safeName;
                            propertyMap.set(wireKey, phpName);
                        }

                        for (const [wireKey, value] of Object.entries(example.requestBody)) {
                            const paramName = propertyMap.get(wireKey) ?? wireKey;
                            params.push(`${paramName}: ${this.jsonToPhp(value)}`);
                        }
                        return params;
                    }
                } else {
                    if (example.requestBody != null) {
                        return [`request: ${this.jsonToPhp(example.requestBody)}`];
                    }
                }
                return null;
            },
            fileUpload: () => null,
            bytes: () => null,
            _other: () => {
                this.context.logger.warn(`Unknown request body type for endpoint ${endpoint.name.originalName}`);
                return null;
            }
        });
    }

    private getObjectTypeIfFlattened(typeRef: TypeReference): { properties: ObjectProperty[] } | null {
        return typeRef._visit<{ properties: ObjectProperty[] } | null>({
            named: (namedType) => {
                const typeDecl = this.context.ir.types[namedType.typeId];
                if (!typeDecl) {
                    return null;
                }
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

    private escapeStringForPhp(value: string): string {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/'/g, "\\'");
    }

    private formatValue(value: unknown): string {
        if (typeof value === "string") {
            return `'${this.escapeStringForPhp(value)}'`;
        }
        if (typeof value === "number") {
            return String(value);
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        if (value === null) {
            return "null";
        }
        return this.jsonToPhp(value);
    }

    private jsonToPhp(value: unknown): string {
        if (value === null) {
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
            if (value != null) {
                entries.push(`'${this.escapeStringForPhp(key)}' => '${this.escapeStringForPhp(String(value))}'`);
            }
        }

        if (entries.length === 0) {
            return "null";
        }

        return `[${entries.join(", ")}]`;
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

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }

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
