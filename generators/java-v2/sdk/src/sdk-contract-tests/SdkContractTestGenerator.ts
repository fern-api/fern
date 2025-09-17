import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { TestClassBuilder } from "./builders/TestClassBuilder";
import { TestMethodBuilder } from "./builders/TestMethodBuilder";
import { SnippetExtractor } from "./extractors/SnippetExtractor";
import { WireTestDataExtractor, WireTestExample } from "./extractors/TestDataExtractor";

/**
 * Generates contract tests that validate SDK adherence to API specifications.
 */
export class SdkContractTestGenerator {
    private readonly testClassBuilder: TestClassBuilder;
    private readonly testMethodBuilder: TestMethodBuilder;
    private readonly snippetExtractor: SnippetExtractor;

    constructor(private readonly context: SdkGeneratorContext) {
        this.testClassBuilder = new TestClassBuilder(context);
        this.testMethodBuilder = new TestMethodBuilder(context);
        this.snippetExtractor = new SnippetExtractor(context);
    }

    /**
     * Main entry point for generating contract tests.
     */
    public async generate(): Promise<void> {
        if (!this.context.customConfig["enable-wire-tests"]) {
            this.context.logger.debug("Contract tests are not enabled (enable-wire-tests flag is false)");
            return;
        }

        this.context.logger.info("Starting contract test generation...");

        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            this.context.logger.warn("Cannot generate contract tests without dynamic IR");
            return;
        }

        const convertedIr = convertIr(dynamicIr);
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertedIr,
            config: this.context.config
        });

        await this.generateTestFiles(dynamicIr, dynamicSnippetsGenerator);

        this.context.logger.info("Contract test generation complete");
    }

    private async generateTestFiles(
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            this.context.logger.debug(
                `Generating contract test for service: ${serviceName} with ${endpointsWithExamples.length} endpoints`
            );

            const testClass = await this.generateTestClass(
                serviceName,
                endpointsWithExamples,
                dynamicIr,
                dynamicSnippetsGenerator
            );
            const testFileName = `${this.toJavaClassName(serviceName)}ContractTest.java`;
            const testFilePath = this.getTestFilePath();

            const file = new File(testFileName, RelativeFilePath.of(testFilePath), testClass);

            this.context.project.addJavaFiles(file);
        }
    }

    private async generateTestClass(
        serviceName: string,
        endpoints: HttpEndpoint[],
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<string> {
        const className = `${this.toJavaClassName(serviceName)}ContractTest`;
        const clientClassName = this.context.getRootClientClassName();

        const testDataExtractor = new WireTestDataExtractor(this.context);

        const endpointTests = new Map<string, { snippet: string; testExample: WireTestExample }>();

        for (const endpoint of endpoints) {
            const testExamples = testDataExtractor.getTestExamples(endpoint);
            if (testExamples.length === 0) {
                continue;
            }

            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstDynamicExample = dynamicEndpoint.examples[0];
                if (firstDynamicExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(
                            firstDynamicExample,
                            dynamicSnippetsGenerator
                        );
                        const firstTestExample = testExamples[0];
                        if (firstTestExample) {
                            endpointTests.set(endpoint.id, {
                                snippet,
                                testExample: firstTestExample
                            });
                        }
                    } catch (error) {
                        this.context.logger.debug(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                    }
                }
            }
        }

        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;

        const testClass = java.codeblock((writer) => {
            this.testClassBuilder.createTestClassBoilerplate(className, clientClassName, hasAuth)(writer);

            for (const endpoint of endpoints) {
                const testData = endpointTests.get(endpoint.id);
                if (testData) {
                    this.testMethodBuilder.createTestMethod(endpoint, testData.snippet, testData.testExample)(writer);
                }
            }

            writer.dedent();
            writer.writeLine("}");
        });

        return testClass.toString({
            packageName: this.context.getRootPackageName(),
            customConfig: this.context.customConfig ?? {}
        });
    }

    private async generateSnippetForExample(
        example: dynamic.EndpointExample,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await dynamicSnippetsGenerator.generate(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName =
                service.name?.fernFilepath?.allParts?.map((part) => part.pascalCase.safeName).join("") || "Service";

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    /**
     * Converts a service name to a valid Java class name by removing non-alphanumeric characters.
     */
    private toJavaClassName(serviceName: string): string {
        return serviceName.replace(/[^a-zA-Z0-9]/g, "");
    }

    private getTestFilePath(): string {
        const packagePath = this.context.getRootPackageName().replace(/\./g, "/");
        return `src/test/java/${packagePath}`;
    }
}
