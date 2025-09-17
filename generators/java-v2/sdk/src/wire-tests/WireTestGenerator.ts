import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import {
    AuthScheme,
    dynamic,
    EnvironmentsConfig,
    HttpEndpoint,
    ObjectProperty,
    Pagination,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestDataExtractor, WireTestExample } from "./WireTestDataExtractor";

interface MultiUrlEnvironment {
    urls: Record<string, string>;
}

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

            // Generate environment configuration based on IR setup
            this.generateEnvironmentConfiguration(writer);

            const authConfig = this.getAuthClientBuilderCalls();
            if (authConfig) {
                writer.writeLine(authConfig);
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

    private createTestMethod(
        endpoint: HttpEndpoint,
        snippet: string,
        testExample: WireTestExample
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toJavaMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.extractMethodCall(snippet);

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

            // Validate headers
            this.generateHeaderValidation(writer, testExample);

            if (expectedRequestJson !== undefined && expectedRequestJson !== null) {
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");

                // Format JSON for readability using the helper method
                this.formatMultilineJson(writer, "expectedRequestBody", expectedRequestJson);

                writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");

                this.generateEnhancedJsonValidation(writer, endpoint, "request", "actualJson", "expectedJson");
            }

            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response body");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');

                writer.writeLine("String actualResponseJson = objectMapper.writeValueAsString(response);");

                // Format JSON for readability using the helper method
                this.formatMultilineJson(writer, "expectedResponseBody", expectedResponseJson);

                writer.writeLine("JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);");
                writer.writeLine("JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);");

                this.generateEnhancedJsonValidation(
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
            const testFileName = `${this.toJavaClassName(serviceName)}WireTest.java`;
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
        const className = `${this.toJavaClassName(serviceName)}WireTest`;
        const clientClassName = this.context.getRootClientClassName();

        const testDataExtractor = new WireTestDataExtractor(this.context);

        const endpointTests = new Map<string, { snippet: string; testExample: WireTestExample }>();

        for (const endpoint of endpoints) {
            const testExamples = testDataExtractor.getTestExamples(endpoint);
            if (testExamples.length === 0) {
                continue;
            }

            // Generate snippet using dynamic snippets (only for code generation)
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
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        continue;
                    }
                }
            }
        }

        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;

        const testClass = java.codeblock((writer) => {
            this.createTestClassBoilerplate(className, clientClassName, hasAuth)(writer);

            for (const endpoint of endpoints) {
                const testData = endpointTests.get(endpoint.id);
                if (testData) {
                    this.createTestMethod(endpoint, testData.snippet, testData.testExample)(writer);
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

        let clientInstantiationIndex = -1;
        let clientCallStartIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) {
                continue;
            }

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

    /**
     * Converts a service name to a valid Java class name by removing non-alphanumeric characters.
     * @param serviceName The service name to convert
     * @returns A valid Java class name
     */
    private toJavaClassName(serviceName: string): string {
        return serviceName.replace(/[^a-zA-Z0-9]/g, "");
    }

    /**
     * Converts a name to a valid Java method name by capitalizing the first letter.
     * @param name The name to convert
     * @returns A valid Java method name
     */
    private toJavaMethodName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * Formats a JSON object as a multi-line Java string variable with proper concatenation.
     * This generates Java 8+ compatible string concatenation for better readability.
     * @param writer The Writer instance to write to
     * @param variableName The name of the Java variable to declare
     * @param jsonData The JSON data to format
     */
    private formatMultilineJson(writer: Writer, variableName: string, jsonData: unknown): void {
        const formattedJson = JSON.stringify(jsonData, null, 2);
        const lines = formattedJson.split("\n");

        if (lines.length === 1) {
            // Single line JSON - no need for concatenation
            writer.writeLine(`String ${variableName} = ${JSON.stringify(formattedJson)};`);
        } else {
            // Multi-line JSON - format with concatenation
            writer.writeLine(
                `String ${variableName} = "` + (lines[0] ?? "").replace(/"/g, '\\"') + '\\n" +'
            );
            for (let i = 1; i < lines.length - 1; i++) {
                writer.writeLine('    "' + (lines[i] ?? "").replace(/"/g, '\\"') + '\\n" +');
            }
            writer.writeLine('    "' + (lines[lines.length - 1] ?? "").replace(/"/g, '\\"') + '";');
        }
    }

    private getTestFilePath(): string {
        const packagePath = this.context.getRootPackageName().replace(/\./g, "/");
        return `src/test/java/${packagePath}`;
    }

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

            // Create a temporary writer to get the string representation
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
     * Generates authentication configuration for the client builder based on auth schemes
     * Enhanced to extract auth values from IR examples for more realistic tests
     */
    private getAuthClientBuilderCalls(): string | undefined {
        if (!this.context.ir.auth?.schemes || this.context.ir.auth.schemes.length === 0) {
            return undefined;
        }

        const authCalls: string[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            const authCall = this.getAuthCallForScheme(scheme);
            if (authCall) {
                authCalls.push(authCall);
            }
        }

        return authCalls.length > 0 ? authCalls.join("\n            ") : undefined;
    }

    private getAuthCallForScheme(scheme: AuthScheme): string | undefined {
        switch (scheme.type) {
            case "bearer": {
                const bearerScheme = scheme as AuthScheme.Bearer;
                const methodName = bearerScheme.token.camelCase?.unsafeName || "token";
                const rawTokenValue = this.extractAuthValueFromExamples("bearer", "token", scheme) || "test-token";
                const tokenValue = this.sanitizeAuthValue(rawTokenValue);
                return `.${methodName}("${tokenValue}")`;
            }

            case "basic": {
                const basicScheme = scheme as AuthScheme.Basic;
                const rawUsername = this.extractAuthValueFromExamples("basic", "username", scheme) || "test-user";
                const rawPassword = this.extractAuthValueFromExamples("basic", "password", scheme) || "test-password";
                const username = this.sanitizeAuthValue(rawUsername);
                const password = this.sanitizeAuthValue(rawPassword);
                if (basicScheme.username && basicScheme.password) {
                    const usernameMethod = basicScheme.username.camelCase?.unsafeName || "username";
                    const passwordMethod = basicScheme.password.camelCase?.unsafeName || "password";
                    return `.${usernameMethod}("${username}")\n            .${passwordMethod}("${password}")`;
                } else {
                    return `.credentials("${username}", "${password}")`;
                }
            }

            case "header": {
                const headerScheme = scheme as AuthScheme.Header;
                const headerName = headerScheme.name.wireValue;
                const headerMethodName = headerScheme.name.name.camelCase?.unsafeName || "apiKey";
                const rawHeaderValue =
                    this.extractAuthValueFromExamples("header", headerName, scheme) || "test-api-key";
                const headerValue = this.sanitizeAuthValue(rawHeaderValue);

                const prefix = headerScheme.prefix || "";
                const fullValue = prefix ? `${prefix}${headerValue}` : headerValue;

                return `.${headerMethodName}("${fullValue}")`;
            }

            case "oauth": {
                const oauthScheme = scheme as AuthScheme.Oauth;
                const rawClientId = this.extractAuthValueFromExamples("oauth", "clientId", scheme) || "test-client-id";
                const rawClientSecret =
                    this.extractAuthValueFromExamples("oauth", "clientSecret", scheme) || "test-client-secret";
                const clientId = this.sanitizeAuthValue(rawClientId);
                const clientSecret = this.sanitizeAuthValue(rawClientSecret);
                return `.clientId("${clientId}")\n            .clientSecret("${clientSecret}")`;
            }

            default: {
                if ((scheme as { type: string }).type === "inferred") {
                    const inferredValue = this.extractInferredAuthFromExamples(scheme);
                    if (inferredValue) {
                        return inferredValue;
                    }
                    this.context.logger.debug("Inferred auth scheme detected - using default test token");
                    return `.token("test-token")`;
                }

                this.context.logger.warn(
                    `Unsupported auth scheme type: ${(scheme as { type: string }).type} - skipping auth configuration for wire test`
                );
                return undefined;
            }
        }
    }

    /**
     * Extracts authentication values from IR examples for more realistic test data
     */
    private extractAuthValueFromExamples(authType: string, field: string, scheme: AuthScheme): string | undefined {
        if (!this.context.ir.services) {
            return undefined;
        }

        // Look through all endpoints for examples
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (!endpoint.userSpecifiedExamples || endpoint.userSpecifiedExamples.length === 0) {
                    continue;
                }

                for (const example of endpoint.userSpecifiedExamples) {
                    const exampleCall = example.example;
                    if (!exampleCall) {
                        continue;
                    }

                    if (authType === "bearer" && scheme.type === "bearer") {
                        const authHeader = [
                            ...(exampleCall.serviceHeaders || []),
                            ...(exampleCall.endpointHeaders || [])
                        ].find((h) => h.name.wireValue === "Authorization");
                        if (authHeader && authHeader.value?.jsonExample) {
                            const value = String(authHeader.value.jsonExample);
                            const bearerMatch = value.match(/^Bearer\s+(.+)$/i);
                            if (bearerMatch) {
                                return bearerMatch[1];
                            }
                            return value;
                        }
                    }

                    if (authType === "basic") {
                        const authHeader = [
                            ...(exampleCall.serviceHeaders || []),
                            ...(exampleCall.endpointHeaders || [])
                        ].find((h) => h.name.wireValue === "Authorization");
                        if (authHeader && authHeader.value?.jsonExample) {
                            const value = String(authHeader.value.jsonExample);
                            const basicMatch = value.match(/^Basic\s+(.+)$/i);
                            if (basicMatch && basicMatch[1]) {
                                try {
                                    const decoded = Buffer.from(basicMatch[1], "base64").toString("utf-8");
                                    const [username, password] = decoded.split(":", 2);
                                    if (username && password) {
                                        return field === "username" ? username : password;
                                    }
                                    return field === "username" ? "example-user" : "example-pass";
                                } catch (error) {
                                    this.context.logger.warn(
                                        `Failed to decode basic auth for scheme ${scheme.type} in endpoint ${endpoint.name.originalName}: ${error}. Using fallback values.`
                                    );
                                    return field === "username" ? "example-user" : "example-pass";
                                }
                            }
                        }
                    }

                    if (authType === "header" && scheme.type === "header") {
                        const headerScheme = scheme as {
                            header?: { name?: { wireValue?: string } };
                            name?: { wireValue?: string };
                        };
                        const headerName = headerScheme.header?.name?.wireValue || headerScheme.name?.wireValue;
                        if (headerName) {
                            const customHeader = [
                                ...(exampleCall.serviceHeaders || []),
                                ...(exampleCall.endpointHeaders || [])
                            ].find((h) => h.name.wireValue === headerName);
                            if (customHeader && customHeader.value?.jsonExample) {
                                return String(customHeader.value.jsonExample);
                            }
                        }
                    }

                    if (authType === "oauth") {
                        if (exampleCall.request?.type === "inlinedRequestBody") {
                            const request = exampleCall.request as {
                                body?: { type?: string; value?: { jsonExample?: unknown } };
                            };
                            const body = request.body;
                            if (body?.type === "json" && body.value?.jsonExample) {
                                const jsonBody = body.value.jsonExample as Record<string, unknown>;
                                if (field === "clientId" && jsonBody.client_id) {
                                    return String(jsonBody.client_id);
                                }
                                if (field === "clientSecret" && jsonBody.client_secret) {
                                    return String(jsonBody.client_secret);
                                }
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    }

    private extractInferredAuthFromExamples(scheme: AuthScheme): string | undefined {
        if (scheme.type !== "inferred") {
            return undefined;
        }

        // Type guard to safely access inferred scheme properties
        const inferredScheme = scheme as { tokenEndpoint?: { endpoint?: { serviceId?: string; endpointId?: string } } };
        if (!inferredScheme.tokenEndpoint?.endpoint?.serviceId) {
            return undefined;
        }

        const serviceId = inferredScheme.tokenEndpoint.endpoint.serviceId;
        const endpointId = inferredScheme.tokenEndpoint.endpoint.endpointId;
        const service = this.context.ir.services[serviceId];
        if (!service || !endpointId) {
            return undefined;
        }

        const endpoint = service.endpoints.find((e) => e.id === endpointId);
        if (!endpoint) {
            return undefined;
        }

        const successfulExamples =
            endpoint.userSpecifiedExamples?.filter((ex) => ex.example && ex.example.response.type === "ok") || [];

        if (successfulExamples.length === 0) {
            return undefined;
        }

        const example = successfulExamples[0]?.example;
        if (!example) {
            return undefined;
        }

        const authParams: string[] = [];

        for (const header of [...(example.serviceHeaders || []), ...(example.endpointHeaders || [])]) {
            const methodName = header.name.name.camelCase?.unsafeName || header.name.name.camelCase?.safeName;
            if (methodName) {
                const rawValue = header.value?.jsonExample ? String(header.value.jsonExample) : "test";
                const value = this.sanitizeAuthValue(rawValue);
                authParams.push(`.${methodName}("${value}")`);
            }
        }

        for (const queryParam of example.queryParameters || []) {
            const methodName = queryParam.name.name.camelCase?.unsafeName || queryParam.name.name.camelCase?.safeName;
            if (methodName) {
                const rawValue = queryParam.value?.jsonExample ? String(queryParam.value.jsonExample) : "test";
                const value = this.sanitizeAuthValue(rawValue);
                authParams.push(`.${methodName}("${value}")`);
            }
        }

        return authParams.length > 0 ? authParams.join("\n            ") : undefined;
    }

    /**
     * Sanitizes auth values to prevent breaking Java string literals
     */
    private sanitizeAuthValue(value: string): string {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
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
     * Generates client environment configuration for APIs with multiple base URLs (microservices).
     * Detects if the API has multi-URL environments and generates appropriate Environment.custom()
     * builder calls with individual service URL configurations.
     *
     * @param writer The Writer instance to write Java code to
     * @param environments The environments configuration from IR containing URL mappings
     *
     * @example
     * // For multi-URL environment with ec2 and s3 services:
     * .environment(Environment.custom()
     *     .ec2Url(server.url("/").toString())
     *     .s3Url(server.url("/").toString())
     *     .build())
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

        for (const [serviceName, _] of Object.entries(environmentWithUrls.urls)) {
            const methodName = this.getEnvironmentUrlMethodName(serviceName);
            writer.writeLine(`.${methodName}(server.url("/").toString())`);
        }

        writer.writeLine(".build())");
        writer.dedent();
    }

    /**
     * Converts service name to environment URL method name
     * e.g., "ec2" -> "ec2Url", "s3" -> "s3Url"
     */
    private getEnvironmentUrlMethodName(serviceName: string): string {
        // Convert to camelCase and add "Url" suffix
        const camelCased = serviceName.toLowerCase().replace(/[-_](.)/g, (_, char) => char.toUpperCase());
        return `${camelCased}Url`;
    }

    /**
     * Generates enhanced JSON validation with support for complex types
     * Provides better validation than basic JsonNode.equals() for unions, generics, etc.
     */
    private generateEnhancedJsonValidation(
        writer: Writer,
        endpoint: HttpEndpoint,
        context: "request" | "response",
        actualVarName: string,
        expectedVarName: string
    ): void {
        writer.writeLine(
            `Assertions.assertEquals(${expectedVarName}, ${actualVarName}, ` +
                `"${context === "request" ? "Request" : "Response"} body structure does not match expected");`
        );

        if (context === "response") {
            this.generateResponseTypeValidation(writer, endpoint, actualVarName);
        } else {
            this.generateRequestTypeValidation(writer, endpoint, actualVarName);
        }
    }

    /**
     * Generates enhanced validation for response types
     */
    private generateResponseTypeValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const responseBody = endpoint.response?.body;
        if (!responseBody || responseBody.type !== "json") {
            return;
        }

        if (this.isPaginatedEndpoint(endpoint)) {
            this.generatePaginationValidation(writer, endpoint, actualVarName);
        }

        this.generateUnionTypeValidation(writer, actualVarName, "response");

        this.generateOptionalTypeValidation(writer, actualVarName, "response");

        this.generateGenericTypeValidation(writer, actualVarName, "response");
    }

    /**
     * Generates enhanced validation for request types
     */
    private generateRequestTypeValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const requestBody = endpoint.requestBody;
        if (!requestBody) {
            return;
        }

        this.generateUnionTypeValidation(writer, actualVarName, "request");

        this.generateOptionalTypeValidation(writer, actualVarName, "request");

        this.generateGenericTypeValidation(writer, actualVarName, "request");
    }

    /**
     * Generates union type validation assertions
     */
    private generateUnionTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine(
            `if (${jsonVarName}.has("type") || ${jsonVarName}.has("_type") || ${jsonVarName}.has("kind")) {`
        );
        writer.indent();
        writer.writeLine(`String discriminator = null;`);
        writer.writeLine(`if (${jsonVarName}.has("type")) discriminator = ${jsonVarName}.get("type").asText();`);
        writer.writeLine(`else if (${jsonVarName}.has("_type")) discriminator = ${jsonVarName}.get("_type").asText();`);
        writer.writeLine(`else if (${jsonVarName}.has("kind")) discriminator = ${jsonVarName}.get("kind").asText();`);
        writer.writeLine(`Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");`);
        writer.writeLine(`Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");`);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates optional/nullable type validation
     */
    private generateOptionalTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine("");
        writer.writeLine(`if (!${jsonVarName}.isNull()) {`);
        writer.indent();
        writer.writeLine(
            `Assertions.assertTrue(${jsonVarName}.isObject() || ${jsonVarName}.isArray() || ${jsonVarName}.isValueNode(), ` +
                `"${context} should be a valid JSON value");`
        );
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates validation for generic/collection types
     */
    private generateGenericTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine("");
        writer.writeLine(`if (${jsonVarName}.isArray()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${jsonVarName}.size() >= 0, "Array should have valid size");`);
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine(`if (${jsonVarName}.isObject()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${jsonVarName}.size() >= 0, "Object should have valid field count");`);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Checks if an endpoint has pagination configuration
     */
    private isPaginatedEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.pagination != null;
    }

    /**
     * Generates pagination-specific validation for Iterable<T> responses
     */
    private generatePaginationValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const pagination = endpoint.pagination;
        if (!pagination) {
            return;
        }

        writer.writeLine("");
        writer.writeLine("// Pagination validation");

        const resultsPath = this.extractPaginationResultsPath(pagination);
        if (resultsPath) {
            writer.writeLine(`// Results at path: ${resultsPath}`);
            this.generatePaginationResultsValidation(writer, actualVarName, resultsPath);
        }

        const nextCursorPath = this.extractPaginationNextCursorPath(pagination);
        if (nextCursorPath) {
            writer.writeLine(`// Next cursor at path: ${nextCursorPath}`);
            this.generatePaginationNextCursorValidation(writer, actualVarName, nextCursorPath);
        }

        writer.writeLine(
            `Assertions.assertTrue(${actualVarName}.isObject(), "Paginated response should be an object");`
        );
    }

    /**
     * Extracts the results path from pagination configuration
     * Handles different pagination types (Cursor, Offset)
     */
    private extractPaginationResultsPath(pagination: Pagination): string | null {
        // Use visitor pattern to extract results path
        return pagination._visit({
            cursor: (cursor) => {
                return this.buildPathFromResponseProperty(cursor.results);
            },
            offset: (offset) => {
                return this.buildPathFromResponseProperty(offset.results);
            },
            custom: () => {
                return "data";
            },
            _other: () => {
                return "data";
            }
        });
    }

    /**
     * Extracts the next cursor path from pagination configuration
     * Handles different pagination types and structures
     */
    private extractPaginationNextCursorPath(pagination: Pagination): string | null {
        return pagination._visit({
            cursor: (cursor) => {
                // cursor.next is a ResponseProperty object
                return this.buildPathFromResponseProperty(cursor.next);
            },
            offset: () => {
                return null;
            },
            custom: () => {
                return "next";
            },
            _other: () => {
                return "next";
            }
        });
    }

    /**
     * Extracts a JSON path string from a ResponseProperty for pagination validation.
     * Handles complex nested structures like "data.items" or "results.users" by traversing
     * the property path and joining the parts with dots.
     *
     * @param responseProperty The IR ResponseProperty containing the path information,
     *                        typically from pagination configuration (cursor.results, offset.results)
     * @returns A dot-separated path string (e.g., "data", "results.items") that can be used
     *          to navigate the JSON response structure. Returns "data" as default fallback.
     *
     * @example
     * // For a response structure: { data: { items: [...] } }
     * // ResponseProperty with propertyPath: ["data"] and property: "items"
     * // Returns: "data.items"
     */
    private buildPathFromResponseProperty(responseProperty: ResponseProperty | undefined | null): string {
        // Defensive null check with clear fallback
        if (!responseProperty) {
            this.context.logger.debug("ResponseProperty is null or undefined, using default 'data' path");
            return "data";
        }

        const pathParts: string[] = [];

        if (responseProperty.propertyPath != null && Array.isArray(responseProperty.propertyPath)) {
            for (const pathItem of responseProperty.propertyPath) {
                // Defensive checks for deeply nested properties
                if (pathItem != null) {
                    const pathItemName = this.extractNameFromPathItem(pathItem);
                    if (pathItemName) {
                        pathParts.push(pathItemName);
                    }
                }
            }
        }

        if (responseProperty.property != null) {
            const propertyName = this.extractNameFromProperty(responseProperty.property);
            if (propertyName) {
                pathParts.push(propertyName);
            }
        }

        if (pathParts.length > 0) {
            const result = pathParts.join(".");
            this.context.logger.debug(`Extracted pagination path: ${result}`);
            return result;
        }

        this.context.logger.debug("Could not extract path from ResponseProperty, using default 'data'");
        return "data";
    }

    /**
     * Safely extracts name from a PropertyPathItem
     * PropertyPathItem has a name property of type Name
     * Using a structural type to avoid importing the internal type
     */
    private extractNameFromPathItem(
        pathItem:
            | {
                  name?: {
                      originalName?: string;
                      camelCase?: {
                          unsafeName?: string;
                          safeName?: string;
                      };
                  };
              }
            | unknown
    ): string | undefined {
        const item = pathItem as {
            name?: {
                originalName?: string;
                camelCase?: {
                    unsafeName?: string;
                    safeName?: string;
                };
            };
        };

        if (item?.name?.originalName) {
            return item.name.originalName;
        }
        if (item?.name?.camelCase?.unsafeName) {
            return item.name.camelCase.unsafeName;
        }
        if (item?.name?.camelCase?.safeName) {
            return item.name.camelCase.safeName;
        }
        return undefined;
    }

    /**
     * Safely extracts name from an ObjectProperty
     */
    private extractNameFromProperty(property: ObjectProperty): string | undefined {
        if (property.name?.wireValue) {
            return property.name.wireValue;
        }
        if (property.name?.name?.originalName) {
            return property.name.name.originalName;
        }
        if (property.name?.name?.camelCase?.unsafeName) {
            return property.name.name.camelCase.unsafeName;
        }
        if (property.name?.name?.camelCase?.safeName) {
            return property.name.name.camelCase.safeName;
        }
        return undefined;
    }

    /**
     * Generates validation for pagination results field
     */
    private generatePaginationResultsValidation(writer: Writer, actualVarName: string, resultsPath: string): void {
        const pathParts = resultsPath.split(".");
        let currentPath = actualVarName;

        for (const part of pathParts) {
            writer.writeLine(`if (${currentPath}.has("${part}")) {`);
            writer.indent();
            currentPath = `${currentPath}.get("${part}")`;
        }

        writer.writeLine(`Assertions.assertTrue(${currentPath}.isArray(), "Pagination results should be an array");`);
        writer.writeLine(
            `Assertions.assertTrue(${currentPath}.size() >= 0, "Pagination results array should have valid size");`
        );

        for (let i = 0; i < pathParts.length; i++) {
            writer.dedent();
            writer.writeLine("}");
        }
    }

    /**
     * Generates validation for pagination next cursor field
     */
    private generatePaginationNextCursorValidation(
        writer: Writer,
        actualVarName: string,
        nextCursorPath: string
    ): void {
        const pathParts = nextCursorPath.split(".");
        let currentPath = actualVarName;

        for (const part of pathParts) {
            writer.writeLine(`if (${currentPath}.has("${part}")) {`);
            writer.indent();
            currentPath = `${currentPath}.get("${part}")`;
        }

        writer.writeLine(`// Next cursor can be null for last page, or string for next page`);
        writer.writeLine(
            `Assertions.assertTrue(${currentPath}.isNull() || ${currentPath}.isTextual(), ` +
                `"Next cursor should be null (last page) or string (next page)");`
        );

        for (let i = 0; i < pathParts.length; i++) {
            writer.dedent();
            writer.writeLine("}");
        }
    }

    /**
     * Generates header validation assertions for wire tests
     * Validates that all expected headers are present in the recorded request
     */
    private generateHeaderValidation(writer: Writer, testExample: WireTestExample): void {
        const headers = testExample.request.headers;

        if (!headers || Object.keys(headers).length === 0) {
            return;
        }

        writer.writeLine("");
        writer.writeLine("// Validate headers");

        for (const [headerName, expectedValue] of Object.entries(headers)) {
            const sanitizedValue = this.sanitizeAuthValue(expectedValue);

            writer.writeLine(
                `Assertions.assertEquals("${sanitizedValue}", request.getHeader("${headerName}"), ` +
                    `"Header '${headerName}' should match expected value");`
            );
        }
    }
}
