import { Writer } from "@fern-api/java-ast/src/ast";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Builder for generating JUnit test class boilerplate including setup, teardown, and MockWebServer configuration.
 */
export class TestClassBuilder {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Creates the test class boilerplate including imports, fields, setup and teardown methods.
     * @param className The name of the test class (e.g., "AuthContractTest")
     * @param clientClassName The name of the SDK client class (e.g., "SeedApiClient")
     * @param hasAuth Whether the API has authentication configured
     * @returns A writer function that generates the test class structure
     */
    public createTestClassBoilerplate(
        className: string,
        clientClassName: string,
        hasAuth: boolean
    ): (writer: Writer) => void {
        return (writer) => {
            // Add imports
            writer.addImport("org.junit.jupiter.api.Assertions");
            writer.addImport("com.fasterxml.jackson.databind.ObjectMapper");
            writer.addImport("com.fasterxml.jackson.databind.JsonNode");
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

            // Delegate environment and auth configuration to the main generator
            // This will be refactored to use EnvironmentConfig and AuthExtractor modules
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
}