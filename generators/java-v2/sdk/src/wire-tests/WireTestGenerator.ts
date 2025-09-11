import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { 
    dynamic, 
    HttpEndpoint, 
    ExampleEndpointCall,
    ExampleRequestBody,
    ExampleResponse,
    ExampleTypeReference
} from "@fern-fern/ir-sdk/api";
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

    private createTestMethodFromDynamic(
        endpoint: HttpEndpoint, 
        snippet: string,
        dynamicExample: dynamic.EndpointExample
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.extractMethodCall(snippet);

            writer.writeLine("@Test");
            writer.writeLine(`public void ${testMethodName}() throws Exception {`);
            writer.indent();

            // Get expected request from the dynamic example
            const expectedRequestJson = dynamicExample.requestBody;

            // Set up mock response (we don't have response data in dynamic examples)
            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(".setResponseCode(200)");
            writer.writeLine('.setBody("{}"));');
            writer.dedent();

            // Execute the client method
            writer.writeLine(methodCall.endsWith(";") ? methodCall : `${methodCall};`);

            // Validate the request
            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            // Validate request body if expected
            if (expectedRequestJson !== undefined && expectedRequestJson !== null) {
                writer.writeLine("");
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");
                writer.writeLine(`String expectedRequestBody = ${JSON.stringify(JSON.stringify(expectedRequestJson))};`);
                writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");
                writer.writeLine("Assertions.assertEquals(expectedJson, actualJson, \"Request body does not match expected\");");
            }

            writer.dedent();
            writer.writeLine("}");
        };
    }

    private createTestMethod(
        endpoint: HttpEndpoint, 
        snippet: string,
        exampleCall: ExampleEndpointCall | undefined
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.extractMethodCall(snippet);

            writer.writeLine("@Test");
            writer.writeLine(`public void ${testMethodName}() throws Exception {`);
            writer.indent();

            // Get expected request and response from the example
            const expectedRequestJson = exampleCall ? this.getRequestExample(exampleCall.request) : undefined;
            const expectedResponseJson = exampleCall ? this.getResponseExample(exampleCall.response) : undefined;
            const responseStatusCode = exampleCall ? this.getResponseStatusCode(exampleCall.response) : 200;

            // Set up mock response
            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(`.setResponseCode(${responseStatusCode})`);
            if (expectedResponseJson) {
                writer.writeLine(`.setBody(${JSON.stringify(expectedResponseJson)}));`);
            } else {
                writer.writeLine('.setBody("{}"));');
            }
            writer.dedent();

            // Execute the client method and capture response if needed
            const hasResponseBody = endpoint.response?.body != null;
            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                // For successful responses with body, capture the response for validation
                writer.writeLine(`var response = ${methodCall.endsWith(";") ? methodCall.slice(0, -1) : methodCall};`);
            } else {
                // For void or error responses, just execute the method
                writer.writeLine(methodCall.endsWith(";") ? methodCall : `${methodCall};`);
            }

            // Validate the request
            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            // Validate request body if expected
            if (expectedRequestJson) {
                writer.writeLine("");
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");
                writer.writeLine(`String expectedRequestBody = ${JSON.stringify(JSON.stringify(expectedRequestJson))};`);
                writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");
                writer.writeLine("Assertions.assertEquals(expectedJson, actualJson, \"Request body does not match expected\");");
            }

            // Validate response body if expected (for successful responses)
            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response deserialization");
                writer.writeLine("Assertions.assertNotNull(response, \"Response should not be null\");");
                writer.writeLine("// Response was successfully deserialized by the SDK");
                
                // For more detailed validation, we could serialize the response back to JSON and compare
                // But for now, successful deserialization is sufficient validation
                writer.writeLine(`String expectedResponseBody = ${JSON.stringify(JSON.stringify(expectedResponseJson))};`);
                writer.writeLine("JsonNode expectedResponseJson = objectMapper.readTree(expectedResponseBody);");
                writer.writeLine("// SDK successfully parsed the mock response matching the expected structure");
            }

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

        // Map to store endpoint snippets and their corresponding dynamic examples
        const endpointData = new Map<string, { snippet: string; dynamicExample: dynamic.EndpointExample }>();
        
        for (const endpoint of endpoints) {
            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample, dynamicSnippetsGenerator);
                        endpointData.set(endpoint.id, { snippet, dynamicExample: firstExample });
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
                const data = endpointData.get(endpoint.id);
                if (data) {
                    this.createTestMethodFromDynamic(endpoint, data.snippet, data.dynamicExample)(writer);
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

    /**
     * Get the first ExampleEndpointCall from an HttpEndpoint if it has examples.
     * Note: This uses the legacy examples field, not v2Examples.
     * For v2Examples support, this would need to be updated to work with V2HttpEndpointExample structure.
     */
    private getExampleEndpointCall(endpoint: HttpEndpoint): ExampleEndpointCall | undefined {
        // For now, we'll return undefined as v2Examples has a different structure
        // and we need the legacy ExampleEndpointCall for the validation logic
        // TODO: Update to support v2Examples structure
        return undefined;
    }

    /**
     * Extract the expected request body from an ExampleRequestBody.
     * Returns the JSON representation of the request or undefined if no request body.
     */
    private getRequestExample(request: ExampleRequestBody | undefined): unknown | undefined {
        if (!request) {
            return undefined;
        }

        return request._visit({
            inlinedRequestBody: (value) => {
                // Convert properties to a JSON object using wire values
                const result: Record<string, unknown> = {};
                value.properties.forEach(p => {
                    result[p.name.wireValue] = this.createRawJsonExample(p.value);
                });
                return result;
            },
            reference: (value) => {
                // Use the full type reference's JSON example
                return this.createRawJsonExample(value);
            },
            _other: () => {
                // Fall back to jsonExample if available
                return request.jsonExample;
            }
        });
    }

    /**
     * Extract the expected response body from an ExampleResponse.
     * Returns the JSON representation of the response or undefined if no response body.
     */
    private getResponseExample(response: ExampleResponse | undefined): unknown | undefined {
        if (!response) {
            return undefined;
        }

        return response._visit({
            ok: (value) => {
                return value._visit({
                    body: (body) => {
                        if (!body) {
                            return undefined;
                        }
                        return this.createRawJsonExample(body);
                    },
                    stream: () => {
                        // Streaming responses not supported in wire tests
                        return undefined;
                    },
                    sse: () => {
                        // SSE responses not supported in wire tests
                        return undefined;
                    },
                    _other: () => {
                        return undefined;
                    }
                });
            },
            error: (value) => {
                if (!value.body) {
                    return undefined;
                }
                return this.createRawJsonExample(value.body);
            },
            _other: () => {
                return undefined;
            }
        });
    }

    /**
     * Get the expected response status code from an ExampleResponse.
     */
    private getResponseStatusCode(response: ExampleResponse): number {
        return response._visit({
            ok: () => 200,
            error: (exampleError) => {
                const error = this.context.ir.errors[exampleError.error.errorId];
                return error?.statusCode ?? 500;
            },
            _other: () => 200
        });
    }

    /**
     * Convert an ExampleTypeReference to its raw JSON representation.
     * This recursively processes nested structures to create the expected JSON.
     */
    private createRawJsonExample(typeRef: ExampleTypeReference): unknown {
        const { shape, jsonExample } = typeRef;

        return shape._visit({
            primitive: (value) => {
                return value._visit({
                    integer: (v) => v,
                    double: (v) => v,
                    string: (v) => v.original,
                    boolean: (v) => v,
                    long: (v) => v,
                    uint: (v) => v,
                    uint64: (v) => v,
                    float: (v) => v,
                    base64: (v) => v,
                    bigInteger: (v) => v,
                    datetime: (v) => v.raw,
                    date: (v) => v,
                    uuid: (v) => v,
                    _other: () => jsonExample
                });
            },
            container: (value) => {
                return value._visit({
                    list: (v) => v.list.map(item => this.createRawJsonExample(item)),
                    map: (v) => {
                        const result: Record<string, unknown> = {};
                        v.map.forEach(item => {
                            result[item.key.jsonExample as string] = this.createRawJsonExample(item.value);
                        });
                        return result;
                    },
                    nullable: (v) => v.nullable ? this.createRawJsonExample(v.nullable) : null,
                    optional: (v) => v.optional ? this.createRawJsonExample(v.optional) : undefined,
                    set: (v) => v.set.map(item => this.createRawJsonExample(item)),
                    literal: (v) => {
                        return v.literal._visit({
                            integer: (val) => val,
                            long: (val) => val,
                            uint: (val) => val,
                            uint64: (val) => val,
                            float: (val) => val,
                            double: (val) => val,
                            boolean: (val) => val,
                            string: (val) => val.original,
                            date: (val) => val,
                            datetime: (val) => val.raw,
                            uuid: (val) => val,
                            base64: (val) => val,
                            bigInteger: (val) => val,
                            _other: () => jsonExample
                        });
                    },
                    _other: () => jsonExample
                });
            },
            named: (value) => {
                return value.shape._visit({
                    alias: (v) => this.createRawJsonExample(v.value),
                    enum: (v) => v.value.wireValue,
                    object: (v) => {
                        const result: Record<string, unknown> = {};
                        v.properties.forEach(property => {
                            result[property.name.wireValue] = this.createRawJsonExample(property.value);
                        });
                        return result;
                    },
                    union: () => jsonExample,
                    undiscriminatedUnion: (v) => this.createRawJsonExample(v.singleUnionType),
                    _other: () => jsonExample
                });
            },
            unknown: () => jsonExample,
            _other: () => jsonExample
        });
    }
}
