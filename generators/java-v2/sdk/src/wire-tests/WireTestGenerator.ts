import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { AuthScheme, dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestDataExtractor, WireTestExample } from "./WireTestDataExtractor";

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
            const testMethodName = `test${this.toMethodName(endpoint.name.pascalCase.safeName)}`;
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

            if (expectedRequestJson !== undefined && expectedRequestJson !== null) {
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");

                // Format JSON for readability using string concatenation (Java 8+ compatible)
                const formattedJson = JSON.stringify(expectedRequestJson, null, 2);
                const lines = formattedJson.split("\n");
                if (lines.length === 1) {
                    // Single line JSON - no need for concatenation
                    writer.writeLine(`String expectedRequestBody = ${JSON.stringify(formattedJson)};`);
                } else {
                    // Multi-line JSON - format with concatenation
                    writer.writeLine(
                        'String expectedRequestBody = "' + (lines[0] ?? "").replace(/"/g, '\\"') + '\\n" +'
                    );
                    for (let i = 1; i < lines.length - 1; i++) {
                        writer.writeLine('    "' + (lines[i] ?? "").replace(/"/g, '\\"') + '\\n" +');
                    }
                    writer.writeLine('    "' + (lines[lines.length - 1] ?? "").replace(/"/g, '\\"') + '";');
                }

                writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");
                writer.writeLine(
                    'Assertions.assertEquals(expectedJson, actualJson, "Request body does not match expected");'
                );
            }

            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response body");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');

                writer.writeLine("String actualResponseJson = objectMapper.writeValueAsString(response);");

                const formattedResponseJson = JSON.stringify(expectedResponseJson, null, 2);
                const responseLines = formattedResponseJson.split("\n");
                if (responseLines.length === 1) {
                    writer.writeLine(`String expectedResponseBody = ${JSON.stringify(formattedResponseJson)};`);
                } else {
                    writer.writeLine(
                        'String expectedResponseBody = "' + (responseLines[0] ?? "").replace(/"/g, '\\"') + '\\n" +'
                    );
                    for (let i = 1; i < responseLines.length - 1; i++) {
                        writer.writeLine('    "' + (responseLines[i] ?? "").replace(/"/g, '\\"') + '\\n" +');
                    }
                    writer.writeLine(
                        '    "' + (responseLines[responseLines.length - 1] ?? "").replace(/"/g, '\\"') + '";'
                    );
                }

                writer.writeLine("JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);");
                writer.writeLine("JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);");
                writer.writeLine(
                    'Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");'
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
}
