import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { RustFile } from "@fern-api/rust-base";
import {
    CodeBlock,
    DocComment,
    Expression,
    Module,
    Reference,
    StandaloneFunction,
    Statement,
    Type,
    UseStatement,
    Writer
} from "@fern-api/rust-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/rust-dynamic-snippets";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest, convertIr } from "../utils";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

/**
 * Generates WireMock-based integration tests for Rust SDK.
 *
 * Architecture:
 * - Uses AST builders (Module, UseStatement) for file structure
 * - Uses CodeBlock with raw strings for helper functions (reset, verify)
 * - Parses dynamic snippets (strings) for test content
 * - Generates test functions with structured approach
 *
 * This hybrid approach balances:
 * - Type safety and maintainability (AST for structure)
 * - Practicality (strings for complex Rust expressions)
 * - Compatibility (dynamic snippets produce strings)
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
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

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, endpointsWithExamples);
            this.context.project.addSourceFiles(serviceTestFile);
        }

        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    // =============================================================================
    // FILE GENERATION
    // =============================================================================

    private async generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): Promise<RustFile> {
        const endpointTestCases = new Map<string, { snippet: string; endpoint: HttpEndpoint }>();

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = this.getDynamicEndpointExample(endpoint);
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample);
                        endpointTestCases.set(endpoint.id, { snippet, endpoint });
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        continue;
                    }
                }
            }
        }

        const testModule = this.buildTestModule(serviceName, endpointTestCases);

        return new RustFile({
            filename: `${serviceName}_test.rs`,
            directory: RelativeFilePath.of("tests"),
            fileContents: testModule.toString()
        });
    }

    // =============================================================================
    // MODULE CONSTRUCTION (AST-based)
    // =============================================================================

    private buildTestModule(
        serviceName: string,
        endpointTestCases: Map<string, { snippet: string; endpoint: HttpEndpoint }>
    ): Module {
        const rawDeclarations: string[] = [];

        // Add helper functions using raw strings (complex logic)
        rawDeclarations.push(this.generateResetWireMockFunction());
        rawDeclarations.push("");
        rawDeclarations.push(this.generateVerifyRequestCountFunction());
        rawDeclarations.push("");

        // Add test functions
        for (const { snippet, endpoint } of endpointTestCases.values()) {
            const testFunction = this.generateEndpointTestFunction(endpoint, snippet, serviceName);
            if (testFunction) {
                rawDeclarations.push(testFunction);
                rawDeclarations.push("");
            }
        }

        return new Module({
            useStatements: this.generateUseStatements(),
            rawDeclarations
        });
    }

    private generateUseStatements(): UseStatement[] {
        return [
            new UseStatement({ path: "reqwest::Client", isPublic: false }),
            new UseStatement({ path: `${this.context.getCrateName()}::prelude::*`, isPublic: false })
        ];
    }

    // =============================================================================
    // HELPER FUNCTION GENERATION (AST-based)
    // =============================================================================

    private generateResetWireMockFunction(): string {
        const func = new StandaloneFunction({
            name: "reset_wiremock_requests",
            isAsync: true,
            parameters: [],
            returnType: Type.result(
                Type.unit(),
                Type.reference(
                    new Reference({
                        name: "Box",
                        genericArgs: [Type.trait("std::error::Error")]
                    })
                )
            ),
            body: CodeBlock.fromStatements([
                // let wiremock_admin_url = "http://localhost:8080/__admin";
                Statement.let({
                    name: "wiremock_admin_url",
                    value: Expression.stringLiteral("http://localhost:8080/__admin")
                }),

                // Client::new().delete(format!("{}/requests", wiremock_admin_url)).send().await?;
                Statement.expression(
                    Expression.try(
                        Expression.await(
                            Expression.methodCall({
                                target: Expression.methodCall({
                                    target: Expression.functionCall("Client::new", []),
                                    method: "delete",
                                    args: [
                                        Expression.macroCall("format", [
                                            Expression.stringLiteral("{}/requests"),
                                            Expression.reference("wiremock_admin_url")
                                        ])
                                    ]
                                }),
                                method: "send",
                                args: []
                            })
                        )
                    )
                ),

                // Ok(())
                Statement.return(Expression.ok(Expression.tuple([])))
            ])
        });

        const docComment = new DocComment({
            summary: "Resets all WireMock request journal"
        });

        return this.functionToString(docComment, func);
    }

    private generateVerifyRequestCountFunction(): string {
        const func = new StandaloneFunction({
            name: "verify_request_count",
            isAsync: true,
            parameters: [
                { name: "method", parameterType: Type.str() },
                { name: "url_path", parameterType: Type.str() },
                {
                    name: "query_params",
                    parameterType: Type.option(Type.hashMap(Type.string(), Type.string()))
                },
                { name: "expected", parameterType: Type.reference(new Reference({ name: "usize" })) }
            ],
            returnType: Type.result(
                Type.unit(),
                Type.reference(
                    new Reference({
                        name: "Box",
                        genericArgs: [Type.trait("std::error::Error")]
                    })
                )
            ),
            body: CodeBlock.fromStatements([
                // let wiremock_admin_url = "http://localhost:8080/__admin";
                Statement.let({
                    name: "wiremock_admin_url",
                    value: Expression.stringLiteral("http://localhost:8080/__admin")
                }),

                // let mut request_body = json!({...});
                Statement.let({
                    name: "request_body",
                    mutable: true,
                    value: Expression.macroCall("json", [
                        Expression.raw(`{
        "method": method,
        "urlPath": url_path,
    }`)
                    ])
                }),

                // if let Some(params) = query_params { ... }
                Statement.ifLet("Some(params)", Expression.reference("query_params"), [
                    Statement.let({
                        name: "query_parameters",
                        type_: Type.reference(new Reference({ name: "Value" })),
                        value: Expression.raw(`params
            .into_iter()
            .map(|(k, v)| (k, json!({"equalTo": v})))
            .collect()`)
                    }),
                    Statement.assignment(
                        Expression.raw('request_body["queryParameters"]'),
                        Expression.reference("query_parameters")
                    )
                ]),

                // let response = Client::new()...await?;
                Statement.let({
                    name: "response",
                    value: Expression.try(
                        Expression.await(
                            Expression.methodCall({
                                target: Expression.methodCall({
                                    target: Expression.methodCall({
                                        target: Expression.functionCall("Client::new", []),
                                        method: "post",
                                        args: [
                                            Expression.macroCall("format", [
                                                Expression.stringLiteral("{}/requests/find"),
                                                Expression.reference("wiremock_admin_url")
                                            ])
                                        ]
                                    }),
                                    method: "json",
                                    args: [Expression.referenceOf(Expression.reference("request_body"))]
                                }),
                                method: "send",
                                args: []
                            })
                        )
                    )
                }),

                // let result: Value = response.json().await?;
                Statement.let({
                    name: "result",
                    type_: Type.reference(new Reference({ name: "Value" })),
                    value: Expression.try(
                        Expression.await(
                            Expression.methodCall({
                                target: Expression.reference("response"),
                                method: "json",
                                args: []
                            })
                        )
                    )
                }),

                // let requests = result["requests"].as_array().ok_or(...)?;
                Statement.let({
                    name: "requests",
                    value: Expression.try(
                        Expression.methodCall({
                            target: Expression.methodCall({
                                target: Expression.raw('result["requests"]'),
                                method: "as_array",
                                args: []
                            }),
                            method: "ok_or",
                            args: [Expression.stringLiteral("Invalid response from WireMock")]
                        })
                    )
                }),

                // assert_eq!(requests.len(), expected, ...);
                Statement.expression(
                    Expression.macroCall("assert_eq", [
                        Expression.methodCall({
                            target: Expression.reference("requests"),
                            method: "len",
                            args: []
                        }),
                        Expression.reference("expected"),
                        Expression.stringLiteral("Expected {} requests, found {}"),
                        Expression.reference("expected"),
                        Expression.methodCall({
                            target: Expression.reference("requests"),
                            method: "len",
                            args: []
                        })
                    ])
                ),

                // Ok(())
                Statement.return(Expression.ok(Expression.tuple([])))
            ])
        });

        const docComment = new DocComment({
            summary: "Verifies the number of requests made to WireMock"
        });

        return this.functionToString(docComment, func);
    }

    private functionToString(docComment: DocComment, func: StandaloneFunction): string {
        const writer = new Writer();
        docComment.write(writer);
        func.write(writer);
        return writer.toString();
    }

    // =============================================================================
    // TEST FUNCTION GENERATION (Structured Approach)
    // =============================================================================

    private generateEndpointTestFunction(endpoint: HttpEndpoint, snippet: string, serviceName: string): string | null {
        try {
            const testName = this.getTestFunctionName(endpoint, serviceName);
            const clientSetup = this.parseClientConstructor(snippet);
            const clientCall = this.parseClientCallFromSnippet(snippet);

            const basePath = this.buildBasePath(endpoint);
            const queryParamsMap = this.buildQueryParamsMap(endpoint);

            // Build test function using structured approach
            const lines: string[] = [];

            // Function attribute and signature
            lines.push(`#[tokio::test]`);
            lines.push(`async fn ${testName}() {`);

            // Test body
            lines.push(`    reset_wiremock_requests().await.unwrap();`);
            lines.push(`    let wiremock_base_url = "http://localhost:8080";`);
            lines.push(``);

            // Client setup (parsed from snippet)
            if (clientSetup) {
                const setupLines = this.processClientSetupLines(clientSetup);
                lines.push(...setupLines);
                lines.push(``);
            }

            // Client method call (parsed from snippet)
            if (clientCall) {
                const callLines = this.processClientCallLines(clientCall);
                lines.push(...callLines);
                lines.push(``);
            }

            // Assertion
            lines.push(`    assert!(result.is_ok(), "Client method call should succeed");`);
            lines.push(``);

            // Verify request count
            lines.push(
                `    verify_request_count("${endpoint.method}", "${basePath}", ${queryParamsMap}, 1).await.unwrap();`
            );

            lines.push(`}`);

            return lines.join("\n");
        } catch (error) {
            this.context.logger.warn(`Failed to generate test function for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    // =============================================================================
    // SNIPPET PROCESSING (String Parsing with Improvements)
    // =============================================================================

    /**
     * Processes client setup lines from snippet, handling config mutation and base_url override.
     *
     * This method:
     * 1. Makes the config mutable (for base_url override)
     * 2. Skips the original base_url field
     * 3. Adds base_url override after struct creation
     */
    private processClientSetupLines(clientSetup: string): string[] {
        const lines: string[] = [];
        const setupLines = clientSetup.split("\n");
        let inConfigStruct = false;

        for (const line of setupLines) {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                continue;
            }

            // Make config mutable and handle struct initialization
            if (trimmedLine.includes("let config") && trimmedLine.includes("ClientConfig {")) {
                lines.push(`    let mut config = ClientConfig {`);
                inConfigStruct = true;
            } else if (trimmedLine.includes("let config") && !trimmedLine.includes("{")) {
                lines.push(`    let mut ${trimmedLine.replace("let ", "")}`);
            } else if (trimmedLine === "};") {
                if (inConfigStruct) {
                    lines.push(`        ..Default::default()`);
                    lines.push(`    };`);
                    // Add base_url override after config creation
                    lines.push(`    config.base_url = wiremock_base_url.to_string();`);
                    inConfigStruct = false;
                } else {
                    lines.push(`    ${trimmedLine}`);
                }
            } else if (trimmedLine.includes("..Default::default()")) {
                // Skip - we'll add this before the closing brace
            } else if (trimmedLine.includes("base_url:")) {
                // Skip the base_url line in the struct - we'll set it after
            } else if (trimmedLine.includes("let client")) {
                lines.push(`    ${trimmedLine}`);
            } else if (inConfigStruct) {
                // Config field - add with proper indentation
                lines.push(`        ${trimmedLine}`);
            } else {
                lines.push(`    ${trimmedLine}`);
            }
        }

        return lines;
    }

    /**
     * Processes client call lines from snippet, handling single and multi-line calls.
     *
     * Key improvements:
     * - Properly handles single-line calls (adds semicolon)
     * - Handles multi-line calls (proper indentation)
     * - Ensures .await gets semicolon
     */
    private processClientCallLines(clientCall: string): string[] {
        const lines: string[] = [];
        const callLines = clientCall.split("\n");

        // Handle single-line case (when callLines.length === 1)
        if (callLines.length === 1) {
            const singleLine = callLines[0]?.trim();
            if (singleLine) {
                // Add semicolon if line ends with .await
                if (singleLine.endsWith(".await")) {
                    lines.push(`    let result = ${singleLine};`);
                } else {
                    lines.push(`    let result = ${singleLine}`);
                }
            }
        } else {
            // Handle multi-line case
            lines.push(`    let result = ${callLines[0]?.trim()}`);
            for (let i = 1; i < callLines.length; i++) {
                const line = callLines[i]?.trim();
                if (line) {
                    // Add semicolon to the last line if it ends with .await
                    if (i === callLines.length - 1 && line.endsWith(".await")) {
                        lines.push(`        ${line};`);
                    } else {
                        lines.push(`        ${line}`);
                    }
                }
            }
        }

        return lines;
    }

    /**
     * Parses client constructor from dynamic snippet.
     *
     * Extracts the config and client instantiation code.
     */
    private parseClientConstructor(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line with client construction (looking for "let config" or "Client::new")
        let constructorStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.includes("let config") || trimmedLine.includes("::new(")) {
                constructorStartIndex = i;
                break;
            }
        }

        if (constructorStartIndex === -1) {
            return "";
        }

        // Collect lines until we find the client variable
        const constructorLines: string[] = [];
        for (let i = constructorStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";
            constructorLines.push(line);

            // Stop after we see the client creation
            if (line.trim().includes("let client")) {
                break;
            }
        }

        return constructorLines.join("\n");
    }

    /**
     * Parses client method call from dynamic snippet.
     *
     * Extracts the complete method call chain including .await.
     */
    private parseClientCallFromSnippet(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with client (may be just "client" or "client.")
        let clientCallStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            // Look for lines that start with "client" (either "client" or "client.")
            if (trimmedLine === "client" || trimmedLine.startsWith("client.")) {
                clientCallStartIndex = i;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            return "";
        }

        // Collect lines until we find .await (include the line with .await)
        const clientCallLines: string[] = [];
        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";
            clientCallLines.push(line.trim());

            // Stop after we find .await
            if (line.includes(".await")) {
                break;
            }
        }

        // Remove trailing semicolon if present
        const joined = clientCallLines.join("\n").trim();
        return joined.replace(/;$/, "");
    }

    // =============================================================================
    // PATH AND QUERY PARAMETER HANDLING
    // =============================================================================

    /**
     * Builds the base path for endpoint, substituting path parameters with actual values.
     *
     * Strategy:
     * 1. Try wiremock mapping pathParameters first (preferred)
     * 2. Fall back to dynamic endpoint example pathParameters
     */
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
            throw new Error(`No wiremock mapping found for endpoint ${endpoint.id} and mappingKey "${mappingKey}"`);
        }

        // Try to get path parameters from wiremock mapping first
        if (wiremockMapping.request.pathParameters && Object.keys(wiremockMapping.request.pathParameters).length > 0) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        } else {
            // Fallback: Get path parameters from dynamic endpoint example
            const dynamicExample = this.getDynamicEndpointExample(endpoint);
            if (dynamicExample?.pathParameters) {
                Object.entries(dynamicExample.pathParameters).forEach(([paramName, paramValue]) => {
                    if (paramValue != null) {
                        basePath = basePath.replace(`{${paramName}}`, String(paramValue));
                    }
                });
            }
        }

        return basePath;
    }

    /**
     * Builds query parameters map for verify_request_count.
     *
     * Returns "None" if no query params, otherwise Some(HashMap::from([...]))
     */
    private buildQueryParamsMap(endpoint: HttpEndpoint): string {
        const dynamicEndpointExample = this.getDynamicEndpointExample(endpoint);

        if (!dynamicEndpointExample?.queryParameters) {
            return "None";
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
                const key = JSON.stringify(paramName);
                const value = JSON.stringify(String(paramValue));
                queryParamEntries.push(`(${key}.to_string(), ${value}.to_string())`);
            }
        }

        if (queryParamEntries.length === 0) {
            return "None";
        }

        return `Some(HashMap::from([${queryParamEntries.join(", ")}]))`;
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    private getTestFunctionName(endpoint: HttpEndpoint, serviceName: string): string {
        const endpointName = endpoint.name.snakeCase.safeName;
        return `test_${serviceName}_${endpointName}_with_wiremock`;
    }

    private getDynamicEndpointExample(endpoint: HttpEndpoint): dynamic.EndpointExample | null {
        const example = this.dynamicIr.endpoints[endpoint.id];
        if (!example) {
            return null;
        }
        return example.examples?.[0] ?? null;
    }

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";
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
}
