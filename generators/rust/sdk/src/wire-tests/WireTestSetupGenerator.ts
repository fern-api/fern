import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMock, WireMockMapping, WireMockStubMapping } from "@fern-api/mock-utils";
import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Generates setup files for wire testing, specifically docker-compose configuration
 * to spin up WireMock for testing against.
 */
export class WireTestSetupGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: IntermediateRepresentation;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        this.ir = ir;
    }

    /**
     * Generates docker-compose.test.yml file to spin up WireMock as a docker container
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
    }

    public static getWiremockConfigContent(ir: IntermediateRepresentation) {
        return new WireMock().convertToWireMock(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        // Post-process mappings to fix unit type responses
        this.fixUnitTypeResponses(wireMockConfigContent);

        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            JSON.stringify(wireMockConfigContent)
        );
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
    }

    /**
     * Fix unit type responses in WireMock mappings.
     * Rust's unit type () should serialize as null, not empty string.
     */
    private fixUnitTypeResponses(wireMockConfig: WireMockStubMapping): void {
        // Build a map of endpoint IDs to their response types
        const endpointResponseTypes = new Map<string, boolean>();

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                const isUnitType = this.isUnitTypeResponse(endpoint);
                endpointResponseTypes.set(endpoint.id, isUnitType);
            }
        }

        // Fix the response bodies for unit type endpoints
        for (const mapping of wireMockConfig.mappings || []) {
            // Extract endpoint ID from mapping name or match by URL
            const endpointId = this.findEndpointIdForMapping(mapping);
            if (endpointId && endpointResponseTypes.get(endpointId)) {
                // Replace empty string with null for unit types
                if (mapping.response.body === '""') {
                    mapping.response.body = "null";
                }
            }
        }
    }

    /**
     * Check if an endpoint returns a unit type ()
     */
    private isUnitTypeResponse(endpoint: HttpEndpoint): boolean {
        // If there's no response field at all, it's not a unit type endpoint
        if (!endpoint.response) {
            return false;
        }

        // Access the response type - need to cast because the exact structure isn't in the public API
        const responseType = (endpoint.response as { type?: unknown }).type;

        // No response type means it returns unit/void
        if (!responseType) {
            return true;
        }

        // Check if response type is explicitly void
        const responseTypeObj = responseType as { _type?: string; value?: unknown };
        if (responseTypeObj._type === "void") {
            return true;
        }

        // If it's a JSON response with no value, it's a unit type
        if (responseTypeObj._type === "json" && !responseTypeObj.value) {
            return true;
        }

        return false;
    }

    /**
     * Find the endpoint ID that corresponds to a WireMock mapping
     */
    private findEndpointIdForMapping(mapping: WireMockMapping): string | undefined {
        const urlPath = mapping.request.urlPathTemplate;
        const method = mapping.request.method;

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                const endpointPath = this.buildEndpointPath(endpoint);
                if (endpointPath === urlPath && endpoint.method === method) {
                    return endpoint.id;
                }
            }
        }

        return undefined;
    }

    /**
     * Build the URL path for an endpoint to match against WireMock mappings
     */
    private buildEndpointPath(endpoint: HttpEndpoint): string {
        let path = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            path += `{${part.pathParameter}}${part.tail}`;
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path;
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = this.buildDockerComposeContent();
        const dockerComposeFile = new File(
            "docker-compose.test.yml",
            RelativeFilePath.of("./wiremock"),
            dockerComposeContent
        );

        this.context.project.addRawFiles(dockerComposeFile);
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock container");
    }

    /**
     * Builds the content for the docker-compose.test.yml file
     */
    private buildDockerComposeContent(): string {
        return `services:
  wiremock:
    image: wiremock/wiremock:3.9.1
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock-mappings.json:/home/wiremock/mappings/wiremock-mappings.json
    command: ["--global-response-templating", "--verbose"]
`;
    }
}
