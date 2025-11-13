import { Writer } from "@fern-api/java-ast/src/ast";
import { AuthScheme, EnvironmentsConfig } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

interface MultiUrlEnvironment {
    urls?: Record<string, unknown>;
}

/**
 * Builder for generating test class boilerplate including setup/teardown methods.
 */
export class TestClassBuilder {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Creates the test class boilerplate with JUnit 5 setup.
     */
    public createTestClassBoilerplate(
        className: string,
        clientClassName: string,
        hasAuth: boolean,
        additionalImports?: Set<string>
    ): (writer: Writer) => void {
        return (writer) => {
            writer.addImport("org.junit.jupiter.api.Assertions");
            writer.addImport("com.fasterxml.jackson.databind.ObjectMapper");
            writer.addImport("com.fasterxml.jackson.databind.JsonNode");
            writer.addImport("okhttp3.mockwebserver.MockResponse");
            writer.addImport("okhttp3.mockwebserver.MockWebServer");
            writer.addImport("okhttp3.mockwebserver.RecordedRequest");
            writer.addImport("org.junit.jupiter.api.AfterEach");
            writer.addImport("org.junit.jupiter.api.BeforeEach");
            writer.addImport("org.junit.jupiter.api.Test");
            writer.addImport(`${this.context.getRootPackageName()}.core.ObjectMappers`);

            // Add any additional imports collected from snippets and type resolution
            if (additionalImports) {
                additionalImports.forEach((importStatement) => {
                    writer.addImport(importStatement);
                });
            }

            writer.writeLine(`public class ${className} {`);
            writer.indent();

            writer.writeLine("private MockWebServer server;");
            writer.writeLine(`private ${clientClassName} client;`);
            writer.writeLine("private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;");

            writer.writeLine("@BeforeEach");
            writer.writeLine("public void setup() throws Exception {");
            writer.indent();
            writer.writeLine("server = new MockWebServer();");
            writer.writeLine("server.start();");
            writer.writeLine(`client = ${clientClassName}.builder()`);
            writer.indent();

            this.generateEnvironmentConfiguration(writer);

            const authConfig = this.getAuthClientBuilderCalls();
            if (authConfig) {
                writer.writeLine(authConfig);
            }

            writer.writeLine(".build();");
            writer.dedent();
            writer.dedent();
            writer.writeLine("}");

            writer.writeLine("@AfterEach");
            writer.writeLine("public void teardown() throws Exception {");
            writer.indent();
            writer.writeLine("server.shutdown();");
            writer.dedent();
            writer.writeLine("}");
        };
    }

    public closeTestClass(writer: Writer): void {
        // Generate compact helper method for numeric equivalence comparison
        this.generateJsonEqualsHelper(writer);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates a compact helper for JSON comparison with numeric equivalence.
     * Treats integers and doubles as numerically equal, which handles the common
     * case where OpenAPI specs have integer examples but Java types are Double.
     */
    private generateJsonEqualsHelper(writer: Writer): void {
        writer.writeLine("");
        writer.writeLine("/**");
        writer.writeLine(" * Compares two JsonNodes with numeric equivalence.");
        writer.writeLine(" */");
        writer.writeLine("private boolean jsonEquals(JsonNode a, JsonNode b) {");
        writer.indent();
        writer.writeLine("if (a.equals(b)) return true;");
        writer.writeLine(
            "if (a.isNumber() && b.isNumber()) return Math.abs(a.doubleValue() - b.doubleValue()) < 1e-10;"
        );
        writer.writeLine("if (a.isObject() && b.isObject()) {");
        writer.indent();
        writer.writeLine("if (a.size() != b.size()) return false;");
        writer.writeLine("java.util.Iterator<java.util.Map.Entry<String, JsonNode>> iter = a.fields();");
        writer.writeLine("while (iter.hasNext()) {");
        writer.indent();
        writer.writeLine("java.util.Map.Entry<String, JsonNode> entry = iter.next();");
        writer.writeLine("if (!jsonEquals(entry.getValue(), b.get(entry.getKey()))) return false;");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("return true;");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("if (a.isArray() && b.isArray()) {");
        writer.indent();
        writer.writeLine("if (a.size() != b.size()) return false;");
        writer.writeLine("for (int i = 0; i < a.size(); i++) {");
        writer.indent();
        writer.writeLine("if (!jsonEquals(a.get(i), b.get(i))) return false;");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("return true;");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("return false;");
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates environment configuration for the client builder
     * Supports both single URL and multi-URL environment setups
     */
    private generateEnvironmentConfiguration(writer: Writer): void {
        const environments = this.context.ir.environments;

        if (!environments) {
            writer.writeLine('.url(server.url("/").toString())');
            return;
        }

        const isMultiUrlEnvironment = this.isMultiUrlEnvironment(environments);

        if (isMultiUrlEnvironment) {
            this.generateMultiUrlEnvironmentConfiguration(writer, environments);
        } else {
            writer.writeLine('.url(server.url("/").toString())');
        }
    }

    /**
     * Determines if the environment configuration uses multiple URLs
     */
    private isMultiUrlEnvironment(environments: EnvironmentsConfig | undefined): boolean {
        if (!environments) {
            return false;
        }

        for (const envValue of Object.values(environments)) {
            if (envValue && typeof envValue === "object" && "urls" in envValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generates client environment configuration for APIs with multiple base URLs
     */
    private generateMultiUrlEnvironmentConfiguration(writer: Writer, environments: EnvironmentsConfig): void {
        let environmentWithUrls: MultiUrlEnvironment | null = null;
        for (const envValue of Object.values(environments)) {
            if (envValue && typeof envValue === "object" && "urls" in envValue) {
                environmentWithUrls = envValue as MultiUrlEnvironment;
                break;
            }
        }

        if (!environmentWithUrls || !environmentWithUrls.urls) {
            writer.writeLine('.url(server.url("/").toString())');
            return;
        }

        writer.writeLine(".environment(Environment.custom()");
        writer.indent();

        for (const [urlKey, _urlValue] of Object.entries(environmentWithUrls.urls)) {
            const methodName = `${urlKey}Url`;
            writer.writeLine(`.${methodName}(server.url("/").toString())`);
        }

        writer.writeLine(".build())");
        writer.dedent();
    }

    /**
     * Generates authentication client builder calls based on test example data.
     * Extracts realistic auth values from the example HTTP requests.
     * Supports multiple authentication schemes including Bearer, Basic, Header, and OAuth.
     */
    private getAuthClientBuilderCalls(): string | undefined {
        const auth = this.context.ir.auth;
        if (!auth?.schemes || auth.schemes.length === 0) {
            return undefined;
        }

        const scheme = auth.schemes[0];
        if (!scheme) {
            return undefined;
        }

        return this.getAuthCallForScheme(scheme);
    }

    /**
     * Generates the appropriate auth configuration call for a given authentication scheme.
     * Maps each auth scheme type to its corresponding client builder method with appropriate test values.
     */
    private getAuthCallForScheme(scheme: AuthScheme): string | undefined {
        switch (scheme.type) {
            case "bearer":
                return '.token("test-token")';
            case "basic":
                return '.credentials("testuser", "testpass")';
            case "header": {
                if (scheme.name?.name?.camelCase?.unsafeName) {
                    const methodName = scheme.name.name.camelCase.unsafeName;
                    return `.${methodName}("test-api-key")`;
                }
                return '.apiKey("test-api-key")';
            }
            case "oauth":
                return '.token("oauth-test-token")';
            default:
                return undefined;
        }
    }
}
