import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { 
    HttpService, 
    HttpEndpoint,
    ExampleEndpointCall,
    IntermediateRepresentation 
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { getExampleEndpointCalls } from "./getExampleEndpointCalls";
import { shouldBuildTest } from "./shouldBuildTest";
import { generateTestMethod } from "./generateTestMethod";

export class WireTestGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public async generate(): Promise<void> {
        // Check if wire tests are enabled
        if (!this.context.customConfig["enable-wire-tests"]) {
            this.context.logger.debug("Wire tests are not enabled, skipping generation");
            return;
        }

        this.context.logger.info("Generating wire tests...");

        // Generate a test class for each service
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Skip if service has no endpoints to test
                const hasTestableEndpoints = service.endpoints.some(ep => shouldBuildTest(ep, this.context.ir));
                if (!hasTestableEndpoints) {
                    continue;
                }

                const testClass = this.generateTestClass(service);
                if (testClass) {
                    // Generate the Java file content
                    const packageName = this.getTestPackageName();
                    const className = this.getTestClassName(service);
                    const content = await testClass.toStringAsync({
                        packageName,
                        customConfig: this.context.customConfig,
                        formatter: undefined
                    });
                    
                    // Create File object with proper path
                    const testFilePath = this.getTestFilePath(service);
                    const file = new File(
                        `${className}.java`,
                        RelativeFilePath.of(testFilePath),
                        content
                    );
                    
                    // Add to project files
                    this.context.project.addJavaFiles(file);
                }
            }
        }
    }

    private generateTestClass(service: HttpService): java.AstNode | undefined {
        const testableEndpoints = service.endpoints.filter(endpoint => 
            shouldBuildTest(endpoint, this.context.ir)
        );

        if (testableEndpoints.length === 0) {
            return undefined;
        }

        const className = this.getTestClassName(service);
        
        // Generate the class with proper imports and annotations
        return java.codeblock((writer) => {
            // Package declaration is handled by toStringAsync
            
            // Add imports
            writer.writeLine("import static org.junit.jupiter.api.Assertions.*;");
            writer.newLine();
            writer.writeLine("import com.fasterxml.jackson.databind.ObjectMapper;");
            writer.writeLine("import okhttp3.mockwebserver.MockResponse;");
            writer.writeLine("import okhttp3.mockwebserver.MockWebServer;");
            writer.writeLine("import okhttp3.mockwebserver.RecordedRequest;");
            writer.writeLine("import org.junit.jupiter.api.AfterEach;");
            writer.writeLine("import org.junit.jupiter.api.BeforeEach;");
            writer.writeLine("import org.junit.jupiter.api.Test;");
            writer.writeLine("import org.junit.jupiter.api.TestInstance;");
            writer.newLine();
            // Import the client using context methods
            const clientClassName = this.context.getRootClientClassName();
            const clientPackage = this.context.getRootPackageName();
            writer.writeLine(`import ${clientPackage}.${clientClassName};`);
            writer.newLine();
            
            // Class declaration with annotations
            writer.writeLine("@TestInstance(TestInstance.Lifecycle.PER_CLASS)");
            writer.writeLine(`public class ${className} {`);
            writer.indent();
            
            // Fields
            writer.writeLine("private MockWebServer server;");
            writer.writeLine(`private ${clientClassName} client;`);
            writer.writeLine("private ObjectMapper objectMapper = new ObjectMapper();");
            writer.newLine();
            
            // Setup method
            writer.writeLine("@BeforeEach");
            writer.writeLine("public void setup() throws Exception {");
            writer.indent();
            writer.writeLine("server = new MockWebServer();");
            writer.writeLine("server.start();");
            writer.newLine();
            const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;
            if (hasAuth) {
                writer.writeLine(`client = ${clientClassName}.builder()`);
                writer.indent();
                writer.writeLine(`.url(server.url("/").toString())`);
                writer.writeLine(`.token("test-token")`);
                writer.writeLine(`.build();`);
                writer.dedent();
            } else {
                writer.writeLine(`client = ${clientClassName}.builder()`);
                writer.indent();
                writer.writeLine(`.url(server.url("/").toString())`);
                writer.writeLine(`.build();`);
                writer.dedent();
            }
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();
            
            // Teardown method
            writer.writeLine("@AfterEach");
            writer.writeLine("public void teardown() throws Exception {");
            writer.indent();
            writer.writeLine("server.shutdown();");
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();
            
            // Test methods
            testableEndpoints.forEach(endpoint => {
                const method = generateTestMethod(endpoint, service, this.context);
                if (method) {
                    writer.writeLine("@Test");
                    writer.writeNode(method);
                    writer.newLine();
                }
            });
            
            writer.dedent();
            writer.writeLine("}");
        });
    }

    // Note: Field generation removed as java-v2 AST doesn't support fields in classes yet
    // These would be added as member variables in the setup method or as class-level constants

    private generateSetupMethod(): java.Method {
        const clientClassName = this.context.getRootClientClassName();

        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;
        
        return java.method({
            name: "setup",
            access: java.Access.Public,
            parameters: [],
            body: java.codeblock((writer) => {
                writer.writeLine("server = new MockWebServer();");
                writer.writeLine("server.start();");
                writer.newLine();
                if (hasAuth) {
                    writer.writeLine(`client = ${clientClassName}.builder()`);
                    writer.indent();
                    writer.writeLine(`.url(server.url("/").toString())`);
                    writer.writeLine(`.token("test-token")`);
                    writer.writeLine(`.build();`);
                    writer.dedent();
                } else {
                    writer.writeLine(`client = ${clientClassName}.builder()`);
                    writer.indent();
                    writer.writeLine(`.url(server.url("/").toString())`);
                    writer.writeLine(`.build();`);
                    writer.dedent();
                }
            })
        });
    }

    private generateTeardownMethod(): java.Method {
        return java.method({
            name: "teardown",
            access: java.Access.Public,
            parameters: [],
            body: java.codeblock((writer) => {
                writer.writeLine("server.shutdown();");
            })
        });
    }

    private getTestClassName(service: HttpService): string {
        const serviceParts = service.name?.fernFilepath?.allParts || [];
        const serviceName = serviceParts.map(part => part.pascalCase.safeName).join("") || "Service";
        return `${serviceName}WireTest`;
    }

    private getTestPackageName(): string {
        // Use the same package as the main client
        return this.context.getRootPackageName();
    }

    private getClientPackageName(): string {
        // Get the base package name for the client using context
        return this.context.getRootPackageName();
    }

    private getTestFilePath(service: HttpService): string {
        // Return the directory path for test files
        return "src/test/java/" + this.getTestPackageName().replace(/\./g, "/");
    }
}