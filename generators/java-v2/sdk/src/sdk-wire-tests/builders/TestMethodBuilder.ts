import { java, Writer } from "@fern-api/java-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { SnippetExtractor } from "../extractors/SnippetExtractor.js";
import { WireTestExample } from "../extractors/TestDataExtractor.js";
import { TestResourceWriter } from "../resources/TestResourceWriter.js";
import { HeaderValidator } from "../validators/HeaderValidator.js";
import { JsonValidator } from "../validators/JsonValidator.js";
import { PaginationValidator } from "../validators/PaginationValidator.js";
import { TestClassBuilder } from "./TestClassBuilder.js";

/**
 * Builder for generating individual test methods in wire tests.
 */
export class TestMethodBuilder {
    private readonly headerValidator: HeaderValidator;
    private readonly jsonValidator: JsonValidator;
    private readonly paginationValidator: PaginationValidator;
    private readonly snippetExtractor: SnippetExtractor;
    private readonly testClassBuilder: TestClassBuilder;
    private resourceWriter: TestResourceWriter | undefined;
    private currentTestClassName: string | undefined;

    constructor(private readonly context: SdkGeneratorContext) {
        this.headerValidator = new HeaderValidator();
        this.jsonValidator = new JsonValidator(context);
        this.paginationValidator = new PaginationValidator(context);
        this.snippetExtractor = new SnippetExtractor(context);
        this.testClassBuilder = new TestClassBuilder(context);
    }

    /**
     * Sets the resource writer for storing large JSON payloads.
     */
    public setResourceWriter(resourceWriter: TestResourceWriter): void {
        this.resourceWriter = resourceWriter;
    }

    /**
     * Sets the current test class name for resource file naming.
     */
    public setCurrentTestClassName(className: string): void {
        this.currentTestClassName = className;
    }

    /**
     * Creates a test method for an endpoint with mock setup and validation.
     */
    public createTestMethod(
        endpoint: FernIr.HttpEndpoint,
        snippet: string,
        testExample: WireTestExample
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toJavaMethodName(this.context.caseConverter.pascalSafe(endpoint.name))}`;
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

            // For OAuth APIs, we need to enqueue an OAuth token response FIRST
            // because the client will fetch a token before making the actual API call
            const isOAuth = this.testClassBuilder.isOAuthApi();
            if (isOAuth) {
                writer.writeLine("// OAuth: enqueue token response (client fetches token before API call)");
                writer.writeLine("server.enqueue(new MockResponse()");
                writer.indent();
                writer.writeLine(".setResponseCode(200)");
                writer.writeLine('.setBody("{\\"access_token\\":\\"test-token\\",\\"expires_in\\":3600}"));');
                writer.dedent();
            }

            const expectedRequestJson = testExample.request.body;
            const rawResponseJson = testExample.response.body;
            const responseStatusCode = testExample.response.statusCode;

            // Convert RFC 2822 dates to ISO 8601 in the response JSON BEFORE using it for both
            // the mock response body (served by MockWebServer) and the expected response assertion.
            // Jackson's JavaTimeModule expects ISO 8601 for OffsetDateTime fields typed as "dateTime";
            // RFC 2822 dates would cause DateTimeParseException during deserialization.
            const expectedResponseJson = rawResponseJson
                ? (this.convertRfc2822DatesToIso8601(rawResponseJson) as typeof rawResponseJson)
                : rawResponseJson;

            const mockResponseBody = expectedResponseJson
                ? JSON.stringify(expectedResponseJson)
                : this.generateMockResponseForEndpoint(endpoint);

            // Pre-register response resource file if needed - used for both mock setup and validation
            // to avoid creating duplicate files with identical content
            let responseResourcePath: string | undefined;
            if (
                this.resourceWriter &&
                this.currentTestClassName &&
                expectedResponseJson &&
                this.jsonValidator.shouldUseResourceFile(expectedResponseJson)
            ) {
                responseResourcePath = this.resourceWriter.registerResource(
                    this.currentTestClassName,
                    testMethodName,
                    "response",
                    expectedResponseJson
                );
            }

            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(`.setResponseCode(${responseStatusCode})`);

            if (responseResourcePath) {
                writer.addImport(`${this.context.getRootPackageName()}.TestResources`);
                writer.writeLine(`.setBody(TestResources.loadResource("${responseResourcePath}")));`);
            } else {
                writer.writeLine(`.setBody(${JSON.stringify(mockResponseBody)}));`);
            }
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

            // For OAuth APIs, consume the OAuth token request first
            if (isOAuth) {
                writer.writeLine("// OAuth: consume the token request");
                writer.writeLine("server.takeRequest();");
            }
            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            // For OAuth APIs, validate that the Authorization header contains the Bearer token
            if (isOAuth) {
                writer.writeLine("");
                writer.writeLine("// Validate OAuth Authorization header");
                writer.writeLine(
                    'Assertions.assertEquals("Bearer test-token", request.getHeader("Authorization"), ' +
                        '"OAuth Authorization header should contain Bearer token from OAuth flow");'
                );
            }

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
                            formDataPairs.push(`${key}=${this.formUrlEncode(value)}`);
                        }
                    }
                    const expectedFormData = formDataPairs.join("&");

                    writer.writeLine(`String expectedRequestBody = ${JSON.stringify(expectedFormData)};`);
                    writer.writeLine(
                        'Assertions.assertEquals(expectedRequestBody, actualRequestBody, "Form-urlencoded request body does not match expected");'
                    );
                } else {
                    // Use resource file for large request payloads to avoid stack overflow
                    if (
                        this.resourceWriter &&
                        this.currentTestClassName &&
                        this.jsonValidator.shouldUseResourceFile(expectedRequestJson)
                    ) {
                        const resourcePath = this.resourceWriter.registerResource(
                            this.currentTestClassName,
                            testMethodName,
                            "request",
                            expectedRequestJson
                        );
                        writer.addImport(`${this.context.getRootPackageName()}.TestResources`);
                        writer.writeLine(`String expectedRequestBody = TestResources.loadResource("${resourcePath}");`);
                    } else {
                        this.jsonValidator.formatMultilineJson(writer, "expectedRequestBody", expectedRequestJson);
                    }

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

                    // RFC 2822 dates are already converted to ISO 8601 upfront (before mock response registration),
                    // so the response resource file and expected response use the same normalized data.
                    if (responseResourcePath) {
                        writer.addImport(`${this.context.getRootPackageName()}.TestResources`);
                        writer.writeLine(
                            `String expectedResponseBody = TestResources.loadResource("${responseResourcePath}");`
                        );
                    } else {
                        this.jsonValidator.formatMultilineJson(writer, "expectedResponseBody", expectedResponseJson);
                    }

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
    /**
     * Encodes a value for application/x-www-form-urlencoded format, matching Java's URLEncoder.encode() behavior.
     * - Spaces are encoded as '+' (not '%20' like encodeURIComponent)
     * - Arrays are serialized as '[val1, val2]' (matching Java's List.toString())
     * - Objects are serialized as JSON strings
     */
    private formUrlEncode(value: unknown): string {
        const stringValue = this.formValueToString(value);
        // Match Java's URLEncoder.encode() behavior:
        // - Spaces as '+' (encodeURIComponent uses %20)
        // - '!', '~', "'", '(', ')' are encoded (encodeURIComponent leaves them unencoded)
        return encodeURIComponent(stringValue)
            .replace(/%20/g, "+")
            .replace(/!/g, "%21")
            .replace(/~/g, "%7E")
            .replace(/'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29");
    }

    /**
     * Converts a value to its string representation matching Java SDK serialization.
     */
    private formValueToString(value: unknown): string {
        if (Array.isArray(value)) {
            // Java's List.toString() produces "[val1, val2]"
            return `[${value.join(", ")}]`;
        }
        if (typeof value === "object" && value !== null) {
            // Java's Map.toString() produces "{key1=value1, key2=value2}"
            const entries = Object.entries(value);
            return `{${entries.map(([k, v]) => `${k}=${v}`).join(", ")}}`;
        }
        if (typeof value === "string") {
            return this.normalizeIso8601ForJava(value);
        }
        return String(value);
    }

    /**
     * Normalizes ISO 8601 date strings to match Java's OffsetDateTime.toString() output.
     * Java drops zero seconds (e.g. "2015-07-30T20:00:00Z" → "2015-07-30T20:00Z").
     */
    private normalizeIso8601ForJava(value: string): string {
        // Match ISO 8601 with zero seconds: "2015-07-30T20:00:00Z" or "2015-07-30T20:00:00+00:00"
        return value.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}):00(Z|[+-]\d{2}:\d{2})$/, "$1$2");
    }

    /**
     * Recursively converts RFC 2822 date strings to ISO 8601 format with Z suffix
     * in JSON data. This is needed because Jackson's JavaTimeModule serializes
     * OffsetDateTime as ISO 8601 (e.g. "2015-07-30T20:00:00Z"), but the IR example
     * data may contain RFC 2822 dates (e.g. "Thu, 30 Jul 2015 20:00:00 +0000").
     */
    private convertRfc2822DatesToIso8601(data: unknown): unknown {
        if (typeof data === "string") {
            return this.tryConvertRfc2822Date(data);
        }
        if (Array.isArray(data)) {
            return data.map((item) => this.convertRfc2822DatesToIso8601(item));
        }
        if (typeof data === "object" && data !== null) {
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(data)) {
                result[key] = this.convertRfc2822DatesToIso8601(value);
            }
            return result;
        }
        return data;
    }

    /**
     * Attempts to parse an RFC 2822 date string and convert it to ISO 8601 with Z suffix.
     * Returns the original string if it's not an RFC 2822 date.
     */
    private tryConvertRfc2822Date(value: string): string {
        // Match RFC 2822 date format: "Thu, 30 Jul 2015 20:00:00 +0000"
        const rfc2822Pattern =
            /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/;
        if (!rfc2822Pattern.test(value)) {
            return value;
        }
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return value;
            }
            return date.toISOString().replace(".000Z", "Z");
        } catch {
            return value;
        }
    }

    private isFormUrlEncodedEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
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
    private generateMockResponseForEndpoint(endpoint: FernIr.HttpEndpoint): string {
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

    private getEndpointReturnType(endpoint: FernIr.HttpEndpoint): string {
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
    public getEndpointReturnTypeWithImports(endpoint: FernIr.HttpEndpoint): { typeName: string; imports: Set<string> } {
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
