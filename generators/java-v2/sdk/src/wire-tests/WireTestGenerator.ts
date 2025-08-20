import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { HttpEndpoint, dynamic } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertIr } from "../utils/convertIr";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";

export class WireTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator | undefined;

    constructor(private readonly context: SdkGeneratorContext) {}

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
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertedIr,
            config: this.context.config
        });

        await this.generateTestFiles(dynamicIr);

        this.context.logger.info("Wire test generation complete");
    }

    private async generateTestFiles(dynamicIr: dynamic.DynamicIntermediateRepresentation): Promise<void> {
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

            const testClass = await this.generateTestClass(serviceName, endpointsWithExamples, dynamicIr);
            const testFileName = `${this.toClassName(serviceName)}WireTest.java`;
            const testFilePath = this.getTestFilePath();

            const file = new File(testFileName, RelativeFilePath.of(testFilePath), testClass);

            this.context.project.addJavaFiles(file);
        }
    }

    private async generateTestClass(
        serviceName: string,
        endpoints: HttpEndpoint[],
        dynamicIr: dynamic.DynamicIntermediateRepresentation
    ): Promise<string> {
        const className = `${this.toClassName(serviceName)}WireTest`;
        const clientClassName = this.context.getRootClientClassName();

        const endpointSnippets = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    const snippet = await this.generateSnippetForExample(firstExample);
                    endpointSnippets.set(endpoint.id, snippet);
                }
            }
        }

        const testClass = java.codeblock((writer) => {
            writer.writeLine("import static org.junit.jupiter.api.Assertions.*;");
            writer.newLine();
            writer.writeLine("import com.fasterxml.jackson.databind.ObjectMapper;");
            writer.writeLine("import okhttp3.mockwebserver.MockResponse;");
            writer.writeLine("import okhttp3.mockwebserver.MockWebServer;");
            writer.writeLine("import okhttp3.mockwebserver.RecordedRequest;");
            writer.writeLine("import org.junit.jupiter.api.AfterEach;");
            writer.writeLine("import org.junit.jupiter.api.BeforeEach;");
            writer.writeLine("import org.junit.jupiter.api.Test;");
            writer.newLine();

            writer.writeLine(`public class ${className} {`);
            writer.indent();

            writer.writeLine("private MockWebServer server;");
            writer.writeLine(`private ${clientClassName} client;`);
            writer.writeLine("private ObjectMapper objectMapper = new ObjectMapper();");
            writer.newLine();

            writer.writeLine("@BeforeEach");
            writer.writeLine("public void setup() throws Exception {");
            writer.indent();
            writer.writeLine("server = new MockWebServer();");
            writer.writeLine("server.start();");
            writer.writeLine(`client = ${clientClassName}.builder()`);
            writer.indent();
            writer.writeLine('.url(server.url("/").toString())');

            if (this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0) {
                writer.writeLine('.token("test-token")');
            }

            writer.writeLine(".build();");
            writer.dedent();
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();

            writer.writeLine("@AfterEach");
            writer.writeLine("public void teardown() throws Exception {");
            writer.indent();
            writer.writeLine("server.shutdown();");
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();

            for (const endpoint of endpoints) {
                const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
                if (!dynamicEndpoint?.examples || dynamicEndpoint.examples.length === 0) {
                    continue;
                }

                const testMethodName = `test${this.toMethodName(endpoint.name.pascalCase.safeName)}`;
                writer.writeLine("@Test");
                writer.writeLine(`public void ${testMethodName}() throws Exception {`);
                writer.indent();

                const snippet = endpointSnippets.get(endpoint.id);
                if (snippet) {
                    const methodCall = this.extractMethodCall(snippet);

                    writer.writeLine("server.enqueue(new MockResponse()");
                    writer.indent();
                    writer.writeLine(".setResponseCode(200)");
                    writer.writeLine('.setBody("{}"));');
                    writer.dedent();
                    writer.newLine();

                    writer.writeLine(`${methodCall};`);
                    writer.newLine();

                    writer.writeLine("RecordedRequest request = server.takeRequest();");
                    writer.writeLine("assertNotNull(request);");
                    writer.writeLine(`assertEquals("${endpoint.method}", request.getMethod());`);
                }

                writer.dedent();
                writer.writeLine("}");
                writer.newLine();
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

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        if (!this.dynamicSnippetsGenerator) {
            return "// Snippet generation failed";
        }

        try {
            const snippetRequest = convertDynamicEndpointSnippetRequest(example);
            const response = await this.dynamicSnippetsGenerator.generate(snippetRequest, { style: Style.Concise });
            return response.snippet || "// No snippet generated";
        } catch (error) {
            this.context.logger.debug(`Failed to generate snippet: ${error}`);
            return "// Snippet generation failed";
        }
    }

    private extractMethodCall(fullSnippet: string): string {
        const lines = fullSnippet.split("\n");

        let clientCallStartIndex = -1;
        let indentLevel = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line && line.includes("client.") && !line.includes("SeedExamplesClient client")) {
                clientCallStartIndex = i;
                indentLevel = line.length - line.trimStart().length;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            return "// TODO: Add client call";
        }

        const methodCallLines: string[] = [];
        let openParens = 0;
        let closeParens = 0;
        let inCall = false;

        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (!line) {
                continue;
            }

            const trimmedLine = line.trim();

            if (!inCall && trimmedLine === "") {
                continue;
            }

            if (!inCall && line.includes("client.")) {
                inCall = true;
            }

            if (inCall) {
                methodCallLines.push(line);

                for (const char of line) {
                    if (char === "(") {
                        openParens++;
                    }
                    if (char === ")") {
                        closeParens++;
                    }
                }

                if (openParens > 0 && openParens === closeParens && line.includes(";")) {
                    break;
                }
            }
        }

        if (methodCallLines.length > 0) {
            const fullCall = methodCallLines
                .map((line) => line.substring(Math.min(indentLevel, line.length)))
                .join("\n")
                .trim();

            this.context.logger.debug(`Extracted method call: ${fullCall}`);
            return fullCall;
        }

        return "// TODO: Add client call";
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
