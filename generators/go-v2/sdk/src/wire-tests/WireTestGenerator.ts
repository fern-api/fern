import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";
import { WireMockMapping } from "@fern-api/mock-utils";
import {
    dynamic,
    ExampleEndpointCall,
    FernFilepath,
    HttpEndpoint,
    HttpService,
    PrimitiveTypeV1,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });
        this.wireMockConfigContent = this.getWireMockConfigContent();
    }

    private wiremockMappingKey({
        requestMethod,
        requestUrlPathTemplate
    }: {
        requestMethod: string;
        requestUrlPathTemplate: string;
    }): string {
        return `${requestMethod} - ${requestUrlPathTemplate}`;
    }

    private getWireMockConfigContent(): Record<string, WireMockMapping> {
        let out: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(this.context.ir);
        for (const mapping of wiremockStubMapping.mappings) {
            const key = this.wiremockMappingKey({
                requestMethod: mapping.request.method,
                requestUrlPathTemplate: mapping.request.urlPathTemplate
            });
            out[key] = mapping;
        }
        return out;
    }

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();
        const filePathsByServiceName = this.getFilePathsByServiceName();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(
                serviceName,
                endpointsWithExamples,
                filePathsByServiceName.get(serviceName) ?? {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                }
            );

            this.context.project.addGoFiles(serviceTestFile);
        }
        // Generate docker-compose.test.yml for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[],
        filePath: FernFilepath
    ): Promise<GoFile> {
        const endpointTestCases = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = this.getDynamicEndpointExample(endpoint);
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample);
                        endpointTestCases.set(endpoint.id, snippet);
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        // Skip this endpoint if snippet generation fails
                        continue;
                    }
                }
            }
        }

        const imports = new Map<string, string>();

        imports.set("http", "net/http");
        imports.set("bytes", "bytes");
        imports.set("encoding/json", "encoding/json");

        const endpointTestCaseCodeBlocks = endpoints
            .map((endpoint) => {
                const snippet = endpointTestCases.get(endpoint.id);
                if (!snippet) {
                    this.context.logger.warn(`No snippet found for endpoint ${endpoint.id}`);
                    return null;
                }
                const [endpointTestCaseCodeBlock, endpointImports] = this.generateEndpointTestMethod(endpoint, snippet);
                for (const [importName, importPath] of endpointImports.entries()) {
                    imports.set(importName, importPath);
                }

                return endpointTestCaseCodeBlock;
            })
            .filter((endpointTestCaseCodeBlock) => endpointTestCaseCodeBlock !== null);

        const serviceTestFileContent = go.codeblock((writer) => {
            for (const [_, importPath] of imports.entries()) {
                // Manually add any imports that were used in the snippet (client/request types)
                // but that may not be used in the rest of the generated test file and therefore would be missed
                writer.addImport(importPath);
            }
            writer.writeNewLineIfLastLineNot();
            writer.newLine();
            writer.write(
                go.func({
                    name: "ResetWireMockRequests",
                    parameters: [
                        go.parameter({
                            name: "t",
                            type: go.Type.pointer(go.Type.reference(this.context.getTestingTypeReference()))
                        })
                    ],
                    return_: [],
                    body: go.codeblock((writer) => {
                        writer.writeNode(go.codeblock('WiremockAdminURL := "http://localhost:8080/__admin"'));
                        writer.newLine();
                        writer.writeNode(
                            go.codeblock(
                                '_, err := http.Post(WiremockAdminURL+"/requests/reset", "application/json", nil)'
                            )
                        );
                        writer.newLine();
                        writer.writeNode(go.codeblock("require.NoError(t, err)"));
                        writer.newLine();
                    })
                })
            );

            // Uses the requests/find endpoint for more flexible matching based on query parameters and base URL
            // This allows proper matching even when SDKs reorder query parameters alphabetically
            writer.writeNewLineIfLastLineNot();
            writer.newLine();
            writer.write(
                go.func({
                    name: "VerifyRequestCount",
                    parameters: [
                        go.parameter({
                            name: "t",
                            type: go.Type.pointer(go.Type.reference(this.context.getTestingTypeReference()))
                        }),
                        go.parameter({
                            name: "method",
                            type: go.Type.string()
                        }),
                        go.parameter({
                            name: "urlPath",
                            type: go.Type.string()
                        }),
                        go.parameter({
                            name: "queryParams",
                            type: go.Type.map(go.Type.string(), go.Type.string())
                        }),
                        go.parameter({
                            name: "expected",
                            type: go.Type.int()
                        })
                    ],
                    return_: [],
                    body: go.codeblock((writer) => {
                        // Build the request body for WireMock's requests/find endpoint
                        writer.writeNode(go.codeblock('WiremockAdminURL := "http://localhost:8080/__admin"'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("var reqBody bytes.Buffer"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('reqBody.WriteString(`{"method":"`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("reqBody.WriteString(method)"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('reqBody.WriteString(`","urlPath":"`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("reqBody.WriteString(urlPath)"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('reqBody.WriteString(`"}`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("if len(queryParams) > 0 {"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('    reqBody.WriteString(`,"queryParameters":{`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("    first := true"));
                        writer.newLine();
                        writer.writeNode(go.codeblock("    for key, value := range queryParams {"));
                        writer.newLine();
                        writer.writeNode(go.codeblock("        if !first {"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('            reqBody.WriteString(",")'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("        }"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('        reqBody.WriteString(`"`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("        reqBody.WriteString(key)"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('        reqBody.WriteString(`":{"equalTo":"`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("        reqBody.WriteString(value)"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('        reqBody.WriteString(`"}`)'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("        first = false"));
                        writer.newLine();
                        writer.writeNode(go.codeblock("    }"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('    reqBody.WriteString("}")'));
                        writer.newLine();
                        writer.writeNode(go.codeblock("}"));
                        writer.newLine();
                        writer.writeNode(go.codeblock('reqBody.WriteString("}")'));
                        writer.newLine();
                        writer.writeNode(
                            go.codeblock(
                                'resp, err := http.Post(WiremockAdminURL+"/requests/find", "application/json", &reqBody)'
                            )
                        );
                        writer.newLine();
                        writer.writeNode(go.codeblock("require.NoError(t, err)"));
                        writer.newLine();
                        writer.writeNode(
                            go.codeblock('var result struct { Requests []interface{} `json:"requests"` }')
                        );
                        writer.newLine();
                        writer.writeNode(go.codeblock("json.NewDecoder(resp.Body).Decode(&result)"));
                        writer.newLine();
                        writer.writeNode(go.codeblock("require.Equal(t, expected, len(result.Requests))"));
                    })
                })
            );
            writer.writeNewLineIfLastLineNot();
            writer.newLine();
            for (const endpointTestCaseCodeBlock of endpointTestCaseCodeBlocks) {
                writer.writeNode(endpointTestCaseCodeBlock);
                writer.writeNewLineIfLastLineNot();
                writer.newLine();
            }
        });

        const packageLocation = this.context.getClientFileLocation({
            fernFilepath: filePath,
            subpackage: undefined
        });

        return new GoFile({
            node: serviceTestFileContent,
            directory: RelativeFilePath.of(`./${packageLocation.directory}/${serviceName}_test`),
            filename: serviceName + "_test.go",
            packageName: `${serviceName}_test`,
            rootImportPath: this.context.getRootPackageName(),
            importPath: this.context.getRootPackageName(),
            customConfig: this.context.customConfig ?? {},
            formatter: undefined
        });
    }

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest, {
            config: { outputWiremockTests: true }
        });
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private generateEndpointTestMethod(endpoint: HttpEndpoint, snippet: string): [go.CodeBlock, Map<string, string>] {
        const imports = this.parseImportsFromSnippet(snippet);
        const testFunctionName = this.parseTestFunctionNameFromSnippet(snippet);

        const testMethod = go.codeblock((writer) => {
            writer.writeNode(
                go.func({
                    name: testFunctionName,
                    parameters: [
                        go.parameter({
                            name: "t",
                            type: go.Type.pointer(go.Type.reference(this.context.getTestingTypeReference()))
                        })
                    ],
                    return_: [],
                    body: go.codeblock((writer) => {
                        writer.writeNode(go.codeblock(`ResetWireMockRequests(t)`));
                        writer.newLine();
                        writer.writeNode(go.codeblock('WireMockBaseURL := "http://localhost:8080"'));
                        writer.newLine();
                        writer.writeNode(this.constructWiremockTestClient({ endpoint, snippet }));
                        writer.newLine();
                        writer.writeNode(this.callClientMethodAndAssert({ endpoint, snippet }));
                    })
                })
            );
            writer.writeNewLineIfLastLineNot();
        });

        return [testMethod, imports];
    }

    private parseClientCallFromSnippet(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with "client." (after trimming whitespace)
        let clientCallStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("client.")) {
                clientCallStartIndex = i;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            return ""; // No client call found
        }

        // Track parentheses to find the end of the method call
        let parenCount = 0;
        let clientCallEndIndex = -1;
        let foundOpenParen = false;

        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === "(") {
                    parenCount++;
                    foundOpenParen = true;
                } else if (char === ")") {
                    parenCount--;
                    if (foundOpenParen && parenCount === 0) {
                        clientCallEndIndex = i;
                        break;
                    }
                }
            }

            if (clientCallEndIndex !== -1) {
                break;
            }
        }

        if (clientCallEndIndex === -1) {
            return ""; // No matching closing parenthesis found
        }

        // Extract the client call lines
        const clientCallLines = lines.slice(clientCallStartIndex, clientCallEndIndex + 1);
        return clientCallLines.join("\n");
    }

    private parseRequestBodyInstantiation(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with "request :="
        let requestStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("request :=")) {
                requestStartIndex = i;
                break;
            }
        }

        if (requestStartIndex === -1) {
            return ""; // No request body instantiation found
        }

        // Track braces to find the end of the request body
        let braceCount = 0;
        let requestEndIndex = -1;
        let foundOpenBrace = false;

        for (let i = requestStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === "{") {
                    braceCount++;
                    foundOpenBrace = true;
                } else if (char === "}") {
                    braceCount--;
                    if (foundOpenBrace && braceCount === 0) {
                        requestEndIndex = i;
                        break;
                    }
                }
            }

            if (requestEndIndex !== -1) {
                break;
            }
        }

        if (requestEndIndex === -1) {
            return ""; // No matching closing brace found
        }

        // Extract the request body lines
        const requestBodyLines = lines.slice(requestStartIndex, requestEndIndex + 1);
        return requestBodyLines.join("\n");
    }

    private parseClientConstructor(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with client constructor (e.g., "client := client.NewWithOptions")
        let constructorStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.includes("client :=") && trimmedLine.includes("client.")) {
                constructorStartIndex = i;
                break;
            }
        }

        if (constructorStartIndex === -1) {
            return ""; // No client constructor found
        }

        // Track parentheses to find the end of the constructor call
        let parenCount = 0;
        let constructorEndIndex = -1;
        let foundOpenParen = false;

        for (let i = constructorStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === "(") {
                    parenCount++;
                    foundOpenParen = true;
                } else if (char === ")") {
                    parenCount--;
                    if (foundOpenParen && parenCount === 0) {
                        constructorEndIndex = i;
                        break;
                    }
                }
            }

            if (constructorEndIndex !== -1) {
                break;
            }
        }

        if (constructorEndIndex === -1) {
            return ""; // No matching closing parenthesis found
        }

        // Extract the constructor lines
        const constructorLines = lines.slice(constructorStartIndex, constructorEndIndex + 1);
        return constructorLines.join("\n");
    }

    private parseTestFunctionNameFromSnippet(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with "func Test"
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("func Test")) {
                // Extract the method name from "func TestMethodName("
                const match = trimmedLine.match(/^func (Test.*?)(?:\s*\(|$)/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }

        return ""; // No test method found
    }

    private parseImportsFromSnippet(snippet: string): Map<string, string> {
        const imports = new Map<string, string>();
        const lines = snippet.split("\n");

        let inImportBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? "";

            // Parse import statements
            if (line === "import (") {
                inImportBlock = true;
                continue;
            }

            if (inImportBlock) {
                if (line === ")") {
                    inImportBlock = false;
                    continue;
                }

                // Parse import with alias: alias "path"
                const importMatch = line.match(/^(\w+)\s+"([^"]+)"/);
                if (importMatch && importMatch[1] && importMatch[2]) {
                    const [, alias, path] = importMatch;
                    imports.set(alias, path);
                }
            }
        }

        return imports;
    }

    private constructWiremockTestClient({
        endpoint,
        snippet
    }: {
        endpoint: HttpEndpoint;
        snippet: string;
    }): go.CodeBlock {
        const clientConstructor = this.parseClientConstructor(snippet);

        return go.codeblock((writer) => {
            writer.write(clientConstructor);
        });
    }

    private callClientMethodAndAssert({
        endpoint,
        snippet
    }: {
        endpoint: HttpEndpoint;
        snippet: string;
    }): go.CodeBlock {
        const requestBodyInstantiation = this.parseRequestBodyInstantiation(snippet);
        const clientCall = this.parseClientCallFromSnippet(snippet);

        return go.codeblock((writer) => {
            if (requestBodyInstantiation) {
                writer.write(requestBodyInstantiation);
                writer.newLine();
            }

            // Call the method and capture response and error (error onlyif response body is nonexistent)
            if (endpoint.response?.body != null) {
                writer.write("_, invocationErr := ");
            } else {
                writer.write("invocationErr := ");
            }
            writer.write(clientCall);
            writer.writeNewLineIfLastLineNot();
            writer.newLine();

            // Assert no error on the invocation
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "NoError",
                        importPath: "github.com/stretchr/testify/require"
                    }),
                    arguments_: [
                        go.codeblock("t"),
                        go.codeblock("invocationErr"),
                        go.TypeInstantiation.string("Client method call should succeed")
                    ],
                    multiline: false
                })
            );

            writer.writeLine();

            // Build URL path and query parameters separately
            const basePath = this.buildBasePath(endpoint);
            const queryParamsMap = this.buildQueryParamsMap(endpoint);

            writer.writeNode(
                go.codeblock(`VerifyRequestCount(t, "${endpoint.method}", "${basePath}", ${queryParamsMap}, 1)`)
            );

            writer.writeLine();
        });
    }

    private buildBasePath(endpoint: HttpEndpoint): string {
        let basePath =
            endpoint.fullPath.head +
            endpoint.fullPath.parts.map((part) => `{${part.pathParameter}}${part.tail}`).join("");

        if (!basePath.startsWith("/")) {
            basePath = `/${basePath}`;
        }

        const mappingKey = this.wiremockMappingKey({
            requestMethod: endpoint.method,
            requestUrlPathTemplate: basePath
        });

        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        // Take the first 15 keys
        if (!wiremockMapping) {
            throw new Error(
                `No wiremock mapping found for endpoint ${endpoint.id} and mappingKey "${mappingKey}". Keys available look like "${Object.keys(this.wireMockConfigContent).slice(0, 15).join('", "')}"`
            );
        }

        // As an example, we return /email-templates/verify_email in the case of the following wiremock mapping:
        // {
        //     "id": "5348c89b-9cdd-4376-9b4f-f9c4922fa0f1",
        //     "name": "Patch an email template - default",
        //     "request": {
        //         "urlPathTemplate": "/email-templates/{templateName}",
        //         "method": "PATCH",
        //         "pathParameters": {
        //             "templateName": {
        //                 "equalTo": "verify_email"
        //             }
        //         }
        //     }

        Object.entries(wiremockMapping.request.pathParameters || {}).forEach(([paramName, paramValue]) => {
            basePath = basePath.replace(`{${paramName}}`, paramValue.equalTo);
        });

        return basePath;
    }

    private buildQueryParamsMap(endpoint: HttpEndpoint): string {
        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return "nil";
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
                const key = JSON.stringify(paramName);
                const value = JSON.stringify(String(paramValue));
                queryParamEntries.push(`${key}: ${value}`);
            }
        }

        if (queryParamEntries.length === 0) {
            return "nil";
        }

        return `map[string]string{${queryParamEntries.join(", ")}}`;
    }

    private buildUrlPathWithQueryParams(endpoint: HttpEndpoint): string {
        let basePath =
            endpoint.fullPath.head +
            endpoint.fullPath.parts.map((part) => `${part.pathParameter}${part.tail}`).join("");

        if (!basePath.startsWith("/")) {
            basePath = `/${basePath}`;
        }

        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return basePath;
        }

        const queryParams: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
                // URL encode the parameter name and value
                const encodedName = encodeURIComponent(paramName);
                const encodedValue = encodeURIComponent(String(paramValue));
                queryParams.push(`${encodedName}=${encodedValue}`);
            }
        }

        if (queryParams.length === 0) {
            return basePath;
        }

        return `${basePath}?${queryParams.join("&")}`;
    }

    private parseEndpointTestCaseSnippet(fileString: string): [string, Map<string, string>] {
        const imports = new Map<string, string>();
        const lines = fileString.split("\n");

        let inImportBlock = false;
        let testMethodStart = -1;
        let braceCount = 0;
        let testMethodEnd = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? "";

            // Parse import statements
            if (line === "import (") {
                inImportBlock = true;
                continue;
            }

            if (inImportBlock) {
                if (line === ")") {
                    inImportBlock = false;
                    continue;
                }

                // Parse import with alias: alias "path"
                const importMatch = line.match(/^(\w+)\s+"([^"]+)"/);
                if (importMatch && importMatch[1] && importMatch[2]) {
                    const [, alias, path] = importMatch;
                    imports.set(alias, path);
                }
            }

            // Find test method start
            if (line.startsWith("func") && testMethodStart === -1) {
                testMethodStart = i;
            }

            // Count braces to find test method end
            if (testMethodStart !== -1 && testMethodEnd === -1) {
                for (const char of line) {
                    if (char === "{") {
                        braceCount++;
                    } else if (char === "}") {
                        braceCount--;
                        if (braceCount === 0) {
                            testMethodEnd = i;
                            break;
                        }
                    }
                }
            }
        }

        // Extract test method content
        let testMethodContent = "";
        if (testMethodStart !== -1 && testMethodEnd !== -1) {
            testMethodContent = lines.slice(testMethodStart, testMethodEnd + 1).join("\n") + "\n";
        }

        return [testMethodContent, imports];
    }

    private getDynamicEndpointExample(endpoint: HttpEndpoint): dynamic.EndpointExample | null {
        const example = this.dynamicIr.endpoints[endpoint.id];
        if (!example) {
            return null;
        }

        return example.examples?.[0] ?? null;
    }

    private getEndpointExample(endpoint: HttpEndpoint): ExampleEndpointCall | null {
        const firstUserSpecifiedExample = endpoint.userSpecifiedExamples?.[0]?.example;
        const firstAutogeneratedExample = endpoint.autogeneratedExamples?.[0]?.example;
        const firstExample = firstUserSpecifiedExample ?? firstAutogeneratedExample;

        if (!firstExample) {
            return null;
        }

        return firstExample;
    }

    private resolvePathParamValue(endpoint: HttpEndpoint, pathParameterName: string): string {
        const endpointExample = this.getDynamicEndpointExample(endpoint);
        if (!endpointExample) {
            return ".+"; //return regex that will match all nonempty strings
        }

        const pathParameterValue = endpointExample.pathParameters?.[pathParameterName];
        if (!pathParameterValue) {
            return ".+"; //return regex that will match all nonempty strings
        }

        return pathParameterValue as string;
    }

    private resolveQueryParamValue(endpoint: HttpEndpoint, queryParameterName: string): string {
        const endpointExample = this.getDynamicEndpointExample(endpoint);
        if (!endpointExample) {
            return ".+";
        }

        const queryParameterValue = endpointExample.queryParameters?.[queryParameterName];
        if (!queryParameterValue) {
            return ".+";
        }

        return queryParameterValue as string;
    }

    private resolveResponseBody(endpoint: HttpEndpoint): go.AstNode {
        const endpointExample = this.getEndpointExample(endpoint);
        if (!endpointExample) {
            return go.codeblock("map[string]interface{}{}");
        }

        const exampleResponse = endpointExample.response;
        if (exampleResponse.type !== "ok") {
            return go.codeblock("map[string]interface{}{}");
        }

        const responseValue = exampleResponse.value;
        if (responseValue.type !== "body") {
            return go.codeblock("map[string]interface{}{}");
        }

        if (!responseValue.value) {
            return go.codeblock("map[string]interface{}{}");
        }

        const responseExampleJson = responseValue.value.jsonExample;

        // Convert JSON example to Go map[string]interface{}
        const goMapString = this.convertJsonToGoMap(responseExampleJson);
        return go.codeblock(goMapString);
    }

    private convertJsonToGoMap(obj: unknown): string {
        if (obj === null || obj === undefined) {
            return "nil";
        }

        if (typeof obj === "string") {
            // Escape special characters in strings
            const escaped = obj
                .replace(/\\/g, "\\\\") // Escape backslashes
                .replace(/"/g, '\\"') // Escape quotes
                .replace(/\n/g, "\\n") // Escape newlines
                .replace(/\r/g, "\\r") // Escape carriage returns
                .replace(/\t/g, "\\t"); // Escape tabs
            return `"${escaped}"`;
        }

        if (typeof obj === "number") {
            return obj.toString();
        }

        if (typeof obj === "boolean") {
            return obj.toString();
        }

        if (Array.isArray(obj)) {
            const items = obj.map((item) => this.convertJsonToGoMap(item));
            const trailingComma = items.length > 0 ? "," : "";
            return `[]interface{}{${items.join(", ")}${trailingComma}}`;
        }

        if (typeof obj === "object") {
            const entries = Object.entries(obj).map(([key, value]) => {
                return `"${key}": ${this.convertJsonToGoMap(value)}`;
            });
            const trailingComma = entries.length > 0 ? "," : "";
            return `map[string]interface{}{${entries.join(", ")}${trailingComma}}`;
        }

        return "nil";
    }

    private resolveRequestBody(endpoint: HttpEndpoint): string | null {
        const endpointExample = this.getDynamicEndpointExample(endpoint);
        if (!endpointExample) {
            return null;
        }

        const requestBodyValue = endpointExample.requestBody;
        if (!requestBodyValue) {
            return null;
        }

        // Return the raw JSON string escape inner quotes
        return JSON.stringify(requestBodyValue).replace(/"/g, '\\"');
    }

    private buildMinimalJsonSchema(endpoint: HttpEndpoint): string {
        const requestBodyType = endpoint.requestBody?.type;
        if (requestBodyType !== "inlinedRequestBody") {
            return "{}";
        }

        const requiredProperties =
            endpoint.requestBody?.properties.filter((property) => !this.context.isOptional(property.valueType)) || [];

        const requiredKeys = requiredProperties.map((property) => property.name.wireValue);
        const properties = requiredProperties.map((property) => {
            const jsonType = this.getJsonSchemaType(property.valueType);
            return `"${property.name.wireValue}": ${jsonType}`;
        });

        const schema = `
            {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "type": "object",
                "required": [${requiredKeys.map((key) => `"${key}"`).join(", ")}],
                "properties": {
                    ${properties.join(", ")}
                },
                "additionalProperties": true
            }`;

        return schema.trim(); //** .replace(/\s+/g, " ") */
    }

    private getJsonSchemaType(valueType: TypeReference): string {
        // Check if it's a primitive type
        const primitive = this.context.maybePrimitive(valueType);
        if (primitive != null) {
            switch (primitive) {
                case PrimitiveTypeV1.Integer:
                case PrimitiveTypeV1.Uint:
                    return '{"type": "integer"}';
                case PrimitiveTypeV1.Long:
                case PrimitiveTypeV1.Uint64:
                    return '{"type": "integer", "format": "int64"}';
                case PrimitiveTypeV1.Float:
                case PrimitiveTypeV1.Double:
                    return '{"type": "number"}';
                case PrimitiveTypeV1.Boolean:
                    return '{"type": "boolean"}';
                case PrimitiveTypeV1.String:
                case PrimitiveTypeV1.Date:
                case PrimitiveTypeV1.DateTime:
                case PrimitiveTypeV1.Uuid:
                case PrimitiveTypeV1.Base64:
                case PrimitiveTypeV1.BigInteger:
                    return '{"type": "string"}';
                default:
                    return '{"type": "string"}';
            }
        }

        // Check if it's an array (list or set)
        const iterableType = this.context.maybeUnwrapIterable(valueType);
        if (iterableType != null) {
            const itemType = this.getJsonSchemaType(iterableType);
            return `{"type": "array", "items": ${itemType}}`;
        }

        // Check if it's a map
        if (valueType.type === "container" && valueType.container.type === "map") {
            const valueTypeSchema = this.getJsonSchemaType(valueType.container.valueType);
            return `{"type": "object", "additionalProperties": ${valueTypeSchema}}`;
        }

        // Check if it's a literal
        if (valueType.type === "container" && valueType.container.type === "literal") {
            const literal = valueType.container.literal;
            switch (literal.type) {
                case "string":
                    return `{"type": "string", "const": "${literal.string}"}`;
                case "boolean":
                    return `{"type": "boolean", "const": ${literal.boolean}}`;
                default:
                    return '{"type": "string"}';
            }
        }

        // For named types, check if it's an enum (which serializes to string)
        if (valueType.type === "named") {
            const enumType = this.context.maybeEnum(valueType);
            if (enumType != null) {
                return '{"type": "string"}';
            }

            // Check if it's an alias of a primitive type
            const declaration = this.context.getTypeDeclarationOrThrow(valueType.typeId);
            if (declaration.shape.type === "alias") {
                // Recursively get the JSON schema type for the aliased type
                return this.getJsonSchemaType(declaration.shape.aliasOf);
            }

            // For other named types (objects, unions, etc.), default to object
            return '{"type": "object"}';
        }

        // Default fallback
        return '{"type": "string"}';
    }

    private buildFullPath(endpoint: HttpEndpoint): string {
        const parts = endpoint.fullPath.parts;
        let fullPath = endpoint.fullPath.head.startsWith("/") ? endpoint.fullPath.head : "/" + endpoint.fullPath.head;

        for (const part of parts) {
            if (part.pathParameter) {
                fullPath += `{${part.pathParameter}}`;
            }
            fullPath += part.tail;
        }

        return fullPath;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private getFilePathsByServiceName(): Map<string, FernFilepath> {
        const filePathsByServiceName = new Map<string, FernFilepath>();
        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            filePathsByServiceName.set(serviceName, service.name?.fernFilepath);
        }
        return filePathsByServiceName;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";
    }
}
