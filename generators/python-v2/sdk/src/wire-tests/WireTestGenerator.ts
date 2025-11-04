import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";
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
import { convertDynamicEndpointSnippetRequest } from "./convertEndpointSnippetRequest";
import { convertIr } from "./convertIr";
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
        const out: Record<string, WireMockMapping> = {};
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

            this.context.project.addSourceFiles(serviceTestFile);
        }
        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: HttpEndpoint[],
        filePath: FernFilepath
    ): Promise<WriteablePythonFile> {
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

        const testFile = python.file({
            path: [serviceName, "test_" + serviceName],
            statements: []
        });

        this.addResetWireMockRequestsFunction(testFile);
        this.addVerifyRequestCountFunction(testFile);

        for (const endpoint of endpoints) {
            const snippet = endpointTestCases.get(endpoint.id);
            if (!snippet) {
                this.context.logger.warn(`No snippet found for endpoint ${endpoint.id}`);
                continue;
            }
            this.generateEndpointTestMethod(testFile, endpoint, snippet);
        }

        return new WriteablePythonFile({
            filename: `test_${serviceName}`,
            contents: testFile,
            directory: RelativeFilePath.of(`tests/wire_tests/${serviceName}`)
        });
    }

    private addResetWireMockRequestsFunction(testFile: python.PythonFile): void {
        const resetMethod = python.method({
            name: "reset_wiremock_requests",
            parameters: [],
            return_: python.Type.none(),
            docstring: "Reset WireMock request journal"
        });

        resetMethod.addStatement(python.codeBlock('wiremock_admin_url = "http://localhost:8080/__admin"'));
        resetMethod.addStatement(
            python.invokeFunction({
                reference: python.reference({
                    name: "post",
                    modulePath: ["requests"]
                }),
                arguments_: [
                    python.methodArgument({
                        name: "url",
                        value: python.codeBlock('wiremock_admin_url + "/requests/reset"')
                    }),
                    python.methodArgument({
                        name: "headers",
                        value: python.codeBlock('{"Content-Type": "application/json"}')
                    })
                ]
            })
        );

        testFile.addStatement(resetMethod);
    }

    private addVerifyRequestCountFunction(testFile: python.PythonFile): void {
        const verifyMethod = python.method({
            name: "verify_request_count",
            parameters: [
                python.parameter({
                    name: "method",
                    type: python.Type.str()
                }),
                python.parameter({
                    name: "url_path",
                    type: python.Type.str()
                }),
                python.parameter({
                    name: "query_params",
                    type: python.Type.optional(python.Type.dict(python.Type.str(), python.Type.str()))
                }),
                python.parameter({
                    name: "expected",
                    type: python.Type.int()
                })
            ],
            return_: python.Type.none(),
            docstring: "Verify the number of requests made to WireMock"
        });

        verifyMethod.addStatement(python.codeBlock('wiremock_admin_url = "http://localhost:8080/__admin"'));
        verifyMethod.addStatement(
            python.assign({
                lhs: python.codeBlock("request_body"),
                rhs: python.codeBlock('{"method": method, "urlPath": url_path}')
            })
        );
        verifyMethod.addStatement(
            python.codeBlock(`if query_params:
    request_body["queryParameters"] = {
        key: {"equalTo": value} for key, value in query_params.items()
    }`)
        );
        verifyMethod.addStatement(
            python.assign({
                lhs: python.codeBlock("response"),
                rhs: python.invokeFunction({
                    reference: python.reference({
                        name: "post",
                        modulePath: ["requests"]
                    }),
                    arguments_: [
                        python.methodArgument({
                            name: "url",
                            value: python.codeBlock('wiremock_admin_url + "/requests/find"')
                        }),
                        python.methodArgument({
                            name: "json",
                            value: python.codeBlock("request_body")
                        })
                    ]
                })
            })
        );
        verifyMethod.addStatement(
            python.assign({
                lhs: python.codeBlock("result"),
                rhs: python.invokeMethod({
                    on: python.reference({
                        name: "response",
                        modulePath: []
                    }),
                    method: "json",
                    arguments_: []
                })
            })
        );
        verifyMethod.addStatement(
            python.invokeFunction({
                reference: python.reference({
                    name: "assertEqual",
                    modulePath: []
                }),
                arguments_: [
                    python.methodArgument({
                        value: python.codeBlock("expected")
                    }),
                    python.methodArgument({
                        value: python.codeBlock('len(result.get("requests", []))')
                    })
                ]
            })
        );

        testFile.addStatement(verifyMethod);
    }

    private generateEndpointTestMethod(testFile: python.PythonFile, endpoint: HttpEndpoint, snippet: string): void {
        const testFunctionName = this.parseTestFunctionNameFromSnippet(snippet);
        const clientConstructor = this.parseClientConstructor(snippet);
        const requestBodyInstantiation = this.parseRequestBodyInstantiation(snippet);
        const clientCall = this.parseClientCallFromSnippet(snippet);

        const testMethod = python.method({
            name: testFunctionName,
            parameters: [],
            return_: python.Type.none(),
            docstring: `Test ${endpoint.name.originalName}`
        });

        testMethod.addStatement(
            python.invokeFunction({
                reference: python.reference({
                    name: "reset_wiremock_requests",
                    modulePath: []
                }),
                arguments_: []
            })
        );

        testMethod.addStatement(python.codeBlock('wiremock_base_url = "http://localhost:8080"'));

        if (clientConstructor) {
            testMethod.addStatement(python.codeBlock(clientConstructor));
        }

        if (requestBodyInstantiation) {
            testMethod.addStatement(python.codeBlock(requestBodyInstantiation));
        }

        if (clientCall) {
            if (endpoint.response?.body != null) {
                testMethod.addStatement(python.codeBlock(`response = ${clientCall}`));
            } else {
                testMethod.addStatement(python.codeBlock(clientCall));
            }
        }

        const basePath = this.buildBasePath(endpoint);
        const queryParamsMap = this.buildQueryParamsMap(endpoint);

        testMethod.addStatement(
            python.invokeFunction({
                reference: python.reference({
                    name: "verify_request_count",
                    modulePath: []
                }),
                arguments_: [
                    python.methodArgument({
                        value: python.codeBlock(`"${endpoint.method}"`)
                    }),
                    python.methodArgument({
                        value: python.codeBlock(`"${basePath}"`)
                    }),
                    python.methodArgument({
                        value: python.codeBlock(queryParamsMap)
                    }),
                    python.methodArgument({
                        value: python.codeBlock("1")
                    })
                ]
            })
        );

        testFile.addStatement(testMethod);
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

        // Find the line that starts with "request ="
        let requestStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("request =")) {
                requestStartIndex = i;
                break;
            }
        }

        if (requestStartIndex === -1) {
            return ""; // No request body instantiation found
        }

        let braceCount = 0;
        let parenCount = 0;
        let requestEndIndex = -1;
        let foundOpen = false;

        for (let i = requestStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === "{" || char === "(") {
                    if (char === "{") braceCount++;
                    if (char === "(") parenCount++;
                    foundOpen = true;
                } else if (char === "}" || char === ")") {
                    if (char === "}") braceCount--;
                    if (char === ")") parenCount--;
                    if (foundOpen && braceCount === 0 && parenCount === 0) {
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
            return ""; // No matching closing found
        }

        // Extract the request body lines
        const requestBodyLines = lines.slice(requestStartIndex, requestEndIndex + 1);
        return requestBodyLines.join("\n");
    }

    private parseClientConstructor(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with client constructor (e.g., "client = Client")
        let constructorStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.includes("client =") && trimmedLine.includes("Client")) {
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

        const constructorLines = lines.slice(constructorStartIndex, constructorEndIndex + 1);
        return constructorLines.join("\n").replace(/base_url\s*=\s*"[^"]*"/, "base_url=wiremock_base_url");
    }

    private parseTestFunctionNameFromSnippet(snippet: string): string {
        const lines = snippet.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.startsWith("def test_")) {
                const match = trimmedLine.match(/^def (test_.*?)(?:\s*\(|:)/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }

        return "test_endpoint"; // Default test method name
    }

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
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
        if (!wiremockMapping) {
            throw new Error(
                `No wiremock mapping found for endpoint ${endpoint.id} and mappingKey "${mappingKey}". Keys available look like "${Object.keys(this.wireMockConfigContent).slice(0, 15).join('", "')}"`
            );
        }

        Object.entries(wiremockMapping.request.pathParameters || {}).forEach(([paramName, paramValue]) => {
            basePath = basePath.replace(`{${paramName}}`, paramValue.equalTo);
        });

        return basePath;
    }

    private buildQueryParamsMap(endpoint: HttpEndpoint): string {
        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return "None";
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
                const key = JSON.stringify(paramName);
                const value = JSON.stringify(String(paramValue as string | number | boolean));
                queryParamEntries.push(`${key}: ${value}`);
            }
        }

        if (queryParamEntries.length === 0) {
            return "None";
        }

        return `{${queryParamEntries.join(", ")}}`;
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
