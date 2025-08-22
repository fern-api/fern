import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

export class WireTestGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    private createTestClassBoilerplate(
        className: string,
        clientClassName: string,
        hasAuth: boolean
    ): (writer: Writer) => void {
        return (writer) => {
            // Add imports
            writer.addImport("org.junit.jupiter.api.Assertions");
            writer.addImport("com.fasterxml.jackson.databind.ObjectMapper");
            writer.addImport("okhttp3.mockwebserver.MockResponse");
            writer.addImport("okhttp3.mockwebserver.MockWebServer");
            writer.addImport("okhttp3.mockwebserver.RecordedRequest");
            writer.addImport("org.junit.jupiter.api.AfterEach");
            writer.addImport("org.junit.jupiter.api.BeforeEach");
            writer.addImport("org.junit.jupiter.api.Test");

            writer.writeLine(`public class ${className} {`);
            writer.indent();

            // Fields
            writer.writeLine("private MockWebServer server;");
            writer.writeLine(`private ${clientClassName} client;`);
            writer.writeLine("private ObjectMapper objectMapper = new ObjectMapper();");

            // Setup method
            writer.writeLine("@BeforeEach");
            writer.writeLine("public void setup() throws Exception {");
            writer.indent();
            writer.writeLine("server = new MockWebServer();");
            writer.writeLine("server.start();");
            writer.writeLine(`client = ${clientClassName}.builder()`);
            writer.indent();
            writer.writeLine('.url(server.url("/").toString())');
            if (hasAuth) {
                writer.writeLine('.token("test-token")');
            }
            writer.writeLine(".build();");
            writer.dedent();
            writer.dedent();
            writer.writeLine("}");

            // Teardown method
            writer.writeLine("@AfterEach");
            writer.writeLine("public void teardown() throws Exception {");
            writer.indent();
            writer.writeLine("server.shutdown();");
            writer.dedent();
            writer.writeLine("}");
        };
    }

    private createTestMethod(endpoint: HttpEndpoint, snippet: string): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.extractMethodCall(snippet);

            writer.writeLine("@Test");
            writer.writeLine(`public void ${testMethodName}() throws Exception {`);
            writer.indent();

            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(".setResponseCode(200)");
            writer.writeLine('.setBody("{}"));');
            writer.dedent();

            writer.writeLine(`${methodCall};`);

            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            writer.dedent();
            writer.writeLine("}");
        };
    }

    public async generate(): Promise<void> {
        if (!this.context.customConfig["enable-wire-tests"]) {
            this.context.logger.debug("Wire tests are not enabled (enable-wire-tests flag is false)");
            return;
        }

        this.context.logger.info("Starting wire test generation...");

        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            this.context.logger.warn("Cannot generate wire tests without dynamic IR");
            return;
        }

        const convertedIr = convertIr(dynamicIr);
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertedIr,
            config: this.context.config
        });

        await this.generateTestFiles(dynamicIr, dynamicSnippetsGenerator);

        this.context.logger.info("Wire test generation complete");
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
                `Generating wire test for service: ${serviceName} with ${endpointsWithExamples.length} endpoints`
            );

            const testClass = await this.generateTestClass(
                serviceName,
                endpointsWithExamples,
                dynamicIr,
                dynamicSnippetsGenerator
            );
            const testFileName = `${this.toClassName(serviceName)}WireTest.java`;
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
        const className = `${this.toClassName(serviceName)}WireTest`;
        const clientClassName = this.context.getRootClientClassName();

        const endpointSnippets = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample, dynamicSnippetsGenerator);
                        endpointSnippets.set(endpoint.id, snippet);
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        // Skip this endpoint if snippet generation fails
                        continue;
                    }
                }
            }
        }

        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;

        const testClass = java.codeblock((writer) => {
            // Write test class boilerplate (imports, fields, setup/teardown)
            this.createTestClassBoilerplate(className, clientClassName, hasAuth)(writer);

            // Add test methods for each endpoint that has a successfully generated snippet
            for (const endpoint of endpoints) {
                const snippet = endpointSnippets.get(endpoint.id);
                if (snippet) {
                    this.createTestMethod(endpoint, snippet)(writer);
                }
            }

            writer.dedent();
            writer.writeLine("}");
        });

        return testClass.toString({
            packageName: this.context.getRootPackageName(),
            customConfig: this.context.customConfig ?? {},
            formatter: undefined
        });
    }

    private async generateSnippetForExample(
        example: dynamic.EndpointExample,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await dynamicSnippetsGenerator.generate(snippetRequest, { style: Style.Concise });
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private extractMethodCall(fullSnippet: string): string {
        const lines = fullSnippet.split("\n");

        // Find the line where client is instantiated and where the client call starts
        let clientInstantiationIndex = -1;
        let clientCallStartIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) {
                continue;
            }

            // Look for client instantiation (contains "client =" or specific client class name)
            if (line.includes("client =") || line.includes("Client client =")) {
                clientInstantiationIndex = i;
            }

            // Look for client method call (after instantiation)
            if (clientInstantiationIndex !== -1 && i > clientInstantiationIndex && line.includes("client.")) {
                clientCallStartIndex = i;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            this.context.logger.debug("Could not find client method call in snippet");
            return "// TODO: Add client call";
        }

        // Extract the complete method call
        const methodCallLines: string[] = [];
        let braceDepth = 0;
        let parenDepth = 0;
        let foundSemicolon = false;

        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (!line && methodCallLines.length === 0) {
                continue;
            }

            if (line !== undefined) {
                methodCallLines.push(line);

                // Track brace and parenthesis depth
                for (const char of line) {
                    if (char === "{") {
                        braceDepth++;
                    } else if (char === "}") {
                        braceDepth--;
                    } else if (char === "(") {
                        parenDepth++;
                    } else if (char === ")") {
                        parenDepth--;
                    }
                }

                // Check for statement termination
                if (line.includes(";") && braceDepth === 0 && parenDepth === 0) {
                    foundSemicolon = true;
                    break;
                }
            }
        }

        if (!foundSemicolon || methodCallLines.length === 0) {
            this.context.logger.debug("Could not extract complete method call");
            return "// TODO: Add client call";
        }

        // Clean up the extracted lines - remove common indentation
        const nonEmptyLines = methodCallLines.filter((line) => line && line.trim().length > 0);
        if (nonEmptyLines.length === 0) {
            return "// TODO: Add client call";
        }

        const minIndent = Math.min(
            ...nonEmptyLines.map((line) => {
                if (!line) {
                    return 0;
                }
                const match = line.match(/^(\s*)/);
                return match?.[1]?.length ?? 0;
            })
        );

        const cleanedLines = methodCallLines.map((line) =>
            line && line.length > minIndent ? line.substring(minIndent) : line || ""
        );

        const result = cleanedLines.join("\n").trim();
        this.context.logger.debug(`Extracted method call: ${result}`);
        return result;
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

    private toClassName(serviceName: string): string {
        return serviceName.replace(/[^a-zA-Z0-9]/g, "");
    }

    private toMethodName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    private getTestFilePath(): string {
        const packagePath = this.context.getRootPackageName().replace(/\./g, "/");
        return `src/test/java/${packagePath}`;
    }
}
