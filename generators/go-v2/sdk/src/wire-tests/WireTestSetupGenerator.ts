import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertToWireMock } from "@fern-api/packages";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

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
     * Generates docker-compose.test.yml file to spin up WireMock
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = convertToWireMock(this.ir)
        const wireMockConfigFile = new File("wiremock.config.json", RelativeFilePath.of("."), wireMockConfigContent);
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock.config.json for WireMock");
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = this.buildDockerComposeContent();
        const dockerComposeFile = new File("docker-compose.test.yml", RelativeFilePath.of("./wiremock"), dockerComposeContent);

        this.context.project.addRawFiles(dockerComposeFile);
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock");
    }

    /**
     * Builds the content for the docker-compose.test.yml file
     */
    private buildDockerComposeContent(): string {
        return `version: '3.8'

services:
  wiremock:
    image: wiremock/wiremock:3.9.1
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock:/home/wiremock
    command: ["--global-response-templating", "--verbose"]
`;
    }
}
