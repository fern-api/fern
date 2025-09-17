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
 * Builder for generating individual test methods in contract tests.
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

            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response body");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');

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

    /**
     * Gets the return type for an endpoint.
     */
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
}
