import { WireMockMapping } from "@fern-api/mock-utils";
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

    private async generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): Promise<null> {
        let endpointCount = 0;
        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                endpointCount++;
            }
        }

        this.context.logger.info(
            `Would generate test file for service ${serviceName} with ${endpointCount} test cases`
        );

        return null;
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

    private getDynamicEndpointExample(endpoint: HttpEndpoint): dynamic.EndpointExample | undefined {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (!dynamicEndpoint?.examples || dynamicEndpoint.examples.length === 0) {
            return undefined;
        }
        return dynamicEndpoint.examples[0];
    }

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }
        return basePath;
    }

    private buildQueryParamsMap(endpoint: HttpEndpoint): string {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (!dynamicEndpoint?.examples || dynamicEndpoint.examples.length === 0) {
            return "None";
        }

        const firstExample = dynamicEndpoint.examples[0];
        if (!firstExample) {
            return "None";
        }

        return "None";
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
