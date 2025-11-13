import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { SnippetExtractor } from "../extractors/SnippetExtractor";
import { WireTestExample } from "../extractors/TestDataExtractor";
import { HeaderValidator } from "../validators/HeaderValidator";
import { JsonValidator } from "../validators/JsonValidator";
import { PaginationValidator } from "../validators/PaginationValidator";

/**
 * Builder for generating individual test methods in wire tests.
 */
export class TestMethodBuilder {
    private readonly headerValidator: HeaderValidator;
    private readonly jsonValidator: JsonValidator;
    private readonly paginationValidator: PaginationValidator;
    private readonly snippetExtractor: SnippetExtractor;

    constructor(private readonly context: SdkGeneratorContext) {
        this.headerValidator = new HeaderValidator();
        this.jsonValidator = new JsonValidator(context);
        this.paginationValidator = new PaginationValidator(context);
        this.snippetExtractor = new SnippetExtractor(context);
    }

    /**
     * Creates a test method for an endpoint with mock setup and validation.
     */
    public createTestMethod(
        endpoint: HttpEndpoint,
        snippet: string,
        testExample: WireTestExample
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toJavaMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.snippetExtractor.extractMethodCall(snippet);

            // If we can't extract a method call, this endpoint should have been filtered out upstream
            if (methodCall === null) {
                throw new Error(
                    `INTERNAL ERROR: Null method call reached TestMethodBuilder for endpoint ${endpoint.id}. ` +
                        `This should have been caught upstream in SdkWireTestGenerator.`
                );
            }

            writer.writeLine("@Test");
            writer.writeLine(`public void ${testMethodName}() throws Exception {`);
            writer.indent();

            const expectedRequestJson = testExample.request.body;
            const expectedResponseJson = testExample.response.body;
            const responseStatusCode = testExample.response.statusCode;

            const mockResponseBody = expectedResponseJson
                ? JSON.stringify(expectedResponseJson)
                : this.generateMockResponseForEndpoint(endpoint);

            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(`.setResponseCode(${responseStatusCode})`);
            writer.writeLine(`.setBody(${JSON.stringify(mockResponseBody)}));`);
            writer.dedent();

            const hasResponseBody = endpoint.response?.body != null;
            if (hasResponseBody) {
                const returnType = this.getEndpointReturnType(endpoint);
                writer.writeLine(
                    `${returnType} response = ${methodCall.endsWith(";") ? methodCall.slice(0, -1) : methodCall};`
                );
            } else {
                writer.writeLine(methodCall.endsWith(";") ? methodCall : `${methodCall};`);
            }

            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            this.headerValidator.generateHeaderValidation(writer, testExample);

            if (expectedRequestJson !== undefined && expectedRequestJson !== null) {
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");

                const isFormEncoded = this.isFormUrlEncodedEndpoint(endpoint);

                if (isFormEncoded) {
                    // For form-urlencoded requests, validate the raw form data format
                    const formDataPairs: string[] = [];
                    if (typeof expectedRequestJson === "object" && expectedRequestJson !== null) {
                        for (const [key, value] of Object.entries(expectedRequestJson)) {
                            formDataPairs.push(`${key}=${encodeURIComponent(String(value))}`);
                        }
                    }
                    const expectedFormData = formDataPairs.join("&");

                    writer.writeLine(`String expectedRequestBody = ${JSON.stringify(expectedFormData)};`);
                    writer.writeLine(
                        'Assertions.assertEquals(expectedRequestBody, actualRequestBody, "Form-urlencoded request body does not match expected");'
                    );
                } else {
                    // Standard JSON validation
                    this.jsonValidator.formatMultilineJson(writer, "expectedRequestBody", expectedRequestJson);

                    writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                    writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");

                    this.jsonValidator.generateEnhancedJsonValidation(
                        writer,
                        endpoint,
                        "request",
                        "actualJson",
                        "expectedJson"
                    );
                }
            }

            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response body");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');

                // For paginated endpoints, we can't directly compare the response as it's a SyncPagingIterable
                const isPaginated = endpoint.pagination != null;
                if (isPaginated) {
                    writer.writeLine("// Pagination response validated via MockWebServer");
                    writer.writeLine("// The SDK correctly parses the response into a SyncPagingIterable");
                } else {
                    writer.writeLine("String actualResponseJson = objectMapper.writeValueAsString(response);");

                    this.jsonValidator.formatMultilineJson(writer, "expectedResponseBody", expectedResponseJson);

                    writer.writeLine("JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);");
                    writer.writeLine("JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);");

                    this.jsonValidator.generateEnhancedJsonValidation(
                        writer,
                        endpoint,
                        "response",
                        "actualResponseNode",
                        "expectedResponseNode"
                    );
                }
            } else if (hasResponseBody) {
                writer.writeLine("");
                writer.writeLine("// Validate response deserialization");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');
                writer.writeLine("// Verify the response can be serialized back to JSON");
                writer.writeLine("String responseJson = objectMapper.writeValueAsString(response);");
                writer.writeLine("Assertions.assertNotNull(responseJson);");
                writer.writeLine("Assertions.assertFalse(responseJson.isEmpty());");
            }

            writer.dedent();
            writer.writeLine("}");
        };
    }

    /**
     * Checks if the endpoint uses application/x-www-form-urlencoded content type.
     */
    private isFormUrlEncodedEndpoint(endpoint: HttpEndpoint): boolean {
        const requestBody = endpoint.requestBody;
        if (!requestBody) {
            return false;
        }

        // Check inlined request body
        if (requestBody.type === "inlinedRequestBody") {
            return requestBody.contentType === "application/x-www-form-urlencoded";
        }

        // Check referenced request body
        if (requestBody.type === "reference") {
            return requestBody.contentType === "application/x-www-form-urlencoded";
        }

        // Check bytes request body
        if (requestBody.type === "bytes") {
            return requestBody.contentType === "application/x-www-form-urlencoded";
        }

        return false;
    }

    /**
     * Converts a name to a valid Java method name.
     */
    private toJavaMethodName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * Generates a mock response body for endpoints without example data.
     */
    private generateMockResponseForEndpoint(endpoint: HttpEndpoint): string {
        const responseBody = endpoint.response?.body;

        if (!responseBody || responseBody.type !== "json") {
            return "{}";
        }

        return JSON.stringify({
            id: "test-id",
            name: "test-name",
            value: "test-value",
            success: true,
            data: {}
        });
    }

    private getEndpointReturnType(endpoint: HttpEndpoint): string {
        try {
            const javaType = this.context.getReturnTypeForEndpoint(endpoint);

            const simpleWriter = new java.Writer({
                packageName: this.context.getCorePackageName(),
                customConfig: this.context.customConfig
            });

            javaType.write(simpleWriter);

            const typeName = simpleWriter.buffer.trim();

            if (typeName === "Void") {
                return "void";
            }

            return typeName;
        } catch (error) {
            this.context.logger.warn(`Could not resolve return type for endpoint ${endpoint.id}, using Object`);
            return "Object";
        }
    }

    /**
     * Gets the return type for an endpoint and collects its imports.
     */
    public getEndpointReturnTypeWithImports(endpoint: HttpEndpoint): { typeName: string; imports: Set<string> } {
        try {
            const imports = new Set<string>();

            // Check if this is a pagination endpoint
            if (endpoint.pagination != null) {
                // Add the pagination import
                const paginationPackage = this.context.getPaginationPackageName();
                imports.add(`${paginationPackage}.SyncPagingIterable`);
            }

            const javaType = this.context.getReturnTypeForEndpoint(endpoint);

            const simpleWriter = new java.Writer({
                packageName: this.context.getCorePackageName(),
                customConfig: this.context.customConfig
            });

            javaType.write(simpleWriter);

            const typeName = simpleWriter.buffer.trim();
            const writerImports = simpleWriter.getImports();
            writerImports.forEach((imp) => imports.add(imp));

            if (typeName === "Void") {
                return { typeName: "void", imports };
            }

            return { typeName, imports };
        } catch (error) {
            this.context.logger.warn(`Could not resolve return type for endpoint ${endpoint.id}, using Object`);
            return { typeName: "Object", imports: new Set<string>() };
        }
    }
}
