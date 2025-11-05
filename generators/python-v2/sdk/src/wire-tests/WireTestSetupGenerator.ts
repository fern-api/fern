import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireTestSetup, WireTestSetupConfig } from "@fern-api/mock-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Generates setup files for wire testing, specifically docker-compose configuration
 * to spin up WireMock for testing against.
 */
export class WireTestSetupGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: IntermediateRepresentation;
    private readonly config: WireTestSetupConfig;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        this.ir = ir;
        this.config = {
            wiremockPort: WireTestSetup.getDefaultWiremockPort()
        };
    }

    /**
     * Generates docker-compose.test.yml file to spin up WireMock as a docker container
     * and wiremock-mappings.json file with API stubs
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generatePytestConfigFile();
    }

    public static getWiremockConfigContent(ir: IntermediateRepresentation) {
        return WireTestSetup.generateWiremockConfigContent(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigFileContent = WireTestSetup.generateWiremockMappingsFileContent(this.ir);
        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            wireMockConfigFileContent
        );
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = WireTestSetup.generateDockerComposeContent(this.config);
        const dockerComposeFile = new File(
            "docker-compose.test.yml",
            RelativeFilePath.of("./wiremock"),
            dockerComposeContent
        );

        this.context.project.addRawFiles(dockerComposeFile);
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock container");
    }

    /**
     * Generates a pytest configuration file for wire tests
     */
    private generatePytestConfigFile(): void {
        const pytestConfigContent = this.buildPytestConfigContent();
        const pytestConfigFile = new File("pytest.ini", RelativeFilePath.of("./"), pytestConfigContent);

        this.context.project.addRawFiles(pytestConfigFile);
        this.context.logger.debug("Generated pytest.ini for wire test configuration");
    }

    /**
     * Builds the content for the pytest.ini file
     */
    private buildPytestConfigContent(): string {
        return `[tool:pytest]
testpaths = tests
python_files = test_*_wire.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
markers =
    wire: marks tests as wire tests (integration tests with WireMock)
`;
    }
}
