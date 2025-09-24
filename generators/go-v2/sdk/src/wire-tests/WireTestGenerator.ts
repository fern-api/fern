import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";
import { dynamic, HttpEndpoint, QueryParameter } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

const WIREMOCK_BASE_URL = "WireMockBaseURL";
const WIREMOCK_CLIENT_VAR_NAME = "WireMockClient";
const CLIENT_VAR_NAME = "client";

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

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
    }

    public async generate(): Promise<void> {
        await this.context.project.writeSharedTestFiles();

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

            this.context.project.addRawFiles(serviceTestFile);
        }
    }

    private async generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): Promise<File> {
        const endpointTestCases = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
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

        const serviceTestFileContent = go
            .codeblock((writer) => {
                for (const [_, importPath] of imports.entries()) {
                    writer.addImport(importPath);
                }
                // this.writeImports(writer, imports);
                writer.writeNewLineIfLastLineNot();
                writer.writeLine();
                for (const endpointTestCaseCodeBlock of endpointTestCaseCodeBlocks) {
                    writer.writeNode(endpointTestCaseCodeBlock);
                    writer.writeNewLineIfLastLineNot();
                    writer.writeLine();
                }
            })
            .toString({
                packageName: "wiremock",
                rootImportPath: this.context.getRootPackageName(),
                importPath: this.context.getRootPackageName(),
                customConfig: this.context.customConfig ?? {},
                formatter: undefined
            });

        return new File(serviceName + "_test.go", RelativeFilePath.of("./test"), serviceTestFileContent);
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
        const clientCall = this.parseClientCall(snippet);
        const imports = this.parseImportsFromSnippet(snippet);
        const testFunctionName = this.parseTestFunctionName(snippet);

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
                        for (const node of this.buildWiremockTestSetup({ endpoint })) {
                            writer.writeNode(node);
                            writer.writeLine();
                        }
                        writer.writeLine();
                        writer.writeNode(this.constructWiremockTestClient({ endpoint, snippet }));
                        writer.writeLine();
                        writer.writeNode(this.callClientMethodAndAssert({ clientCall, endpoint, snippet }));
                    })
                })
            );
            writer.writeNewLineIfLastLineNot();
        });

        return [testMethod, imports];
    }

    private parseClientCall(snippet: string): string {
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

    private parseTestFunctionName(snippet: string): string {
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

    private buildWiremockTestSetup({
        endpoint,
        errorCase
    }: {
        endpoint: HttpEndpoint;
        errorCase?: boolean;
    }): go.AstNode[] {
        const ENDPOINT_STUB_NAME = "stub";
        const usedSharedMainTest = true;
        return [
            ...(!usedSharedMainTest
                ? [
                      // Initialize context
                      go.codeblock((writer) => {
                          writer.write("ctx := ");
                          writer.writeNode(
                              go.invokeFunc({
                                  func: go.typeReference({
                                      name: "Background",
                                      importPath: "context"
                                  }),
                                  arguments_: [],
                                  multiline: false
                              })
                          );
                      }),

                      // Start WireMock container
                      go.codeblock((writer) => {
                          writer.write(`container, containerErr := `);
                          writer.writeNode(
                              go.invokeFunc({
                                  func: go.typeReference({
                                      name: "RunContainerAndStopOnCleanup",
                                      importPath: "github.com/wiremock/wiremock-testcontainers-go"
                                  }),
                                  arguments_: [
                                      go.codeblock("ctx"),
                                      go.codeblock("t"),
                                      go.invokeFunc({
                                          func: go.typeReference({
                                              name: "WithImage",
                                              importPath: "github.com/wiremock/wiremock-testcontainers-go"
                                          }),
                                          arguments_: [
                                              go.TypeInstantiation.string("docker.io/wiremock/wiremock:3.9.1")
                                          ],
                                          multiline: false
                                      })
                                  ],
                                  multiline: true
                              })
                          );
                      }),

                      // Check for container error
                      go.codeblock((writer) => {
                          writer.write("if containerErr != nil {");
                          writer.writeLine();
                          writer.write("    t.Fatal(containerErr)");
                          writer.writeLine();
                          writer.write("}");
                      }),

                      // Get WireMock URL from container
                      go.codeblock((writer) => {
                          writer.write(`${WIREMOCK_BASE_URL}, endpointErr := `);
                          writer.writeNode(
                              go.invokeMethod({
                                  on: go.codeblock("container"),
                                  method: "Endpoint",
                                  arguments_: [go.codeblock("ctx"), go.TypeInstantiation.string("")],
                                  multiline: false
                              })
                          );
                      }),

                      go.invokeFunc({
                          func: go.typeReference({
                              name: "NoError",
                              importPath: "github.com/stretchr/testify/require"
                          }),
                          arguments_: [
                              go.codeblock("t"),
                              go.codeblock("endpointErr"),
                              go.TypeInstantiation.string("Failed to get WireMock container endpoint")
                          ],
                          multiline: false
                      }),

                      go.codeblock((writer) => {
                          writer.write(`${WIREMOCK_BASE_URL} = "http://" + ${WIREMOCK_BASE_URL}`);
                      }),

                      // Get WireMock client from container
                      go.codeblock((writer) => {
                          writer.write(`${WIREMOCK_CLIENT_VAR_NAME} := `);
                          writer.writeNode(
                              go.selector({
                                  on: go.codeblock("container"),
                                  selector: go.codeblock("Client")
                              })
                          );
                      })
                  ]
                : []),

            ...(usedSharedMainTest
                ? [
                      go.codeblock((writer) => {
                          writer.write("// wiremock client and server initialized in shared main_test.go ");
                      })
                  ]
                : []),

            go.codeblock((writer) => {
                writer.write("defer ");
                writer.writeNode(
                    go.invokeMethod({
                        on: go.codeblock(WIREMOCK_CLIENT_VAR_NAME),
                        method: "Reset",
                        arguments_: [],
                        multiline: false
                    })
                );
            }),

            // Create a mock response for the endpoint
            go.codeblock((writer) => {
                writer.write(`${ENDPOINT_STUB_NAME} := `);
                writer.writeNode(
                    SdkGeneratorContext.chainMethods(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: endpoint.method.toLowerCase().replace(/^./, (c) => c.toUpperCase()),
                                importPath: "github.com/wiremock/go-wiremock"
                            }),
                            arguments_: [
                                go.invokeFunc({
                                    func: go.typeReference({
                                        name: "URLPathTemplate",
                                        importPath: "github.com/wiremock/go-wiremock"
                                    }),
                                    arguments_: [go.TypeInstantiation.string(this.buildFullPath(endpoint))],
                                    multiline: false
                                })
                            ],
                            multiline: false
                        }),
                        ...(endpoint.requestBody?.type === "inlinedRequestBody"
                            ? endpoint.queryParameters
                                  //Exclude optional since it appears that optional query params do not automatically get mocked in the dynamic snippet invocation (for now)
                                  .filter(
                                      (queryParameter: QueryParameter) =>
                                          !this.context.isOptional(queryParameter.valueType)
                                  )
                                  .map((queryParameter: QueryParameter) => ({
                                      method: "WithQueryParam",
                                      arguments_: [
                                          go.TypeInstantiation.string(queryParameter.name.wireValue),
                                          go.invokeFunc({
                                              func: go.typeReference({
                                                  name: "Matching",
                                                  importPath: "github.com/wiremock/go-wiremock"
                                              }),
                                              arguments_: [go.TypeInstantiation.string(".+")],
                                              multiline: false
                                          })
                                      ]
                                  }))
                            : []),
                        ...(endpoint.pathParameters && endpoint.pathParameters.length > 0
                            ? endpoint.pathParameters.map((pathParameter) => ({
                                  method: "WithPathParam",
                                  arguments_: [
                                      go.TypeInstantiation.string(pathParameter.name.originalName),
                                      go.invokeFunc({
                                          func: go.typeReference({
                                              name: "Matching",
                                              importPath: "github.com/wiremock/go-wiremock"
                                          }),
                                          arguments_: [
                                              go.TypeInstantiation.string(
                                                  this.resolvePathParamValue(endpoint, pathParameter.name.originalName)
                                              )
                                          ],
                                          multiline: false
                                      })
                                  ]
                              }))
                            : []),
                        {
                            method: "WillReturnResponse",
                            arguments_: [
                                SdkGeneratorContext.chainMethods(
                                    go.invokeFunc({
                                        func: go.typeReference({
                                            name: "NewResponse",
                                            importPath: "github.com/wiremock/go-wiremock"
                                        }),
                                        arguments_: [],
                                        multiline: false
                                    }),
                                    ...(errorCase
                                        ? [
                                              {
                                                  method: "WithStatus",
                                                  arguments_: [
                                                      go.typeReference({
                                                          name: "StatusInternalServerError",
                                                          importPath: "net/http"
                                                      })
                                                  ],
                                                  multiline: false
                                              }
                                          ]
                                        : [
                                              {
                                                  method: "WithJSONBody",
                                                  arguments_: [go.codeblock("map[string]interface{}{}")]
                                              },
                                              {
                                                  method: "WithStatus",
                                                  arguments_: [
                                                      go.typeReference({
                                                          name: "StatusOK",
                                                          importPath: "net/http"
                                                      })
                                                  ],
                                                  multiline: false
                                              }
                                          ])
                                )
                            ]
                        }
                    )
                );
            }),

            // Register the stub with WireMock
            go.codeblock((writer) => {
                writer.write("err := ");
                writer.writeNode(
                    go.invokeMethod({
                        on: go.codeblock(WIREMOCK_CLIENT_VAR_NAME),
                        method: "StubFor",
                        arguments_: [go.codeblock(ENDPOINT_STUB_NAME)],
                        multiline: false
                    })
                );
            }),

            go.invokeFunc({
                func: go.typeReference({
                    name: "NoError",
                    importPath: "github.com/stretchr/testify/require"
                }),
                arguments_: [
                    go.codeblock("t"),
                    go.codeblock("err"),
                    go.TypeInstantiation.string("Failed to create WireMock stub")
                ],
                multiline: false
            })
        ];
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
        clientCall,
        endpoint,
        snippet
    }: {
        clientCall: string;
        endpoint: HttpEndpoint;
        snippet: string;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            // IMPORTANT: currently not capturing the response/error values since its not trivial to determine
            // the number of return values for the method using the dynamic ir

            // Call the method and capture response and error
            // writer.write("_, invocationErr := ");
            writer.write(clientCall);
            writer.writeLine();
            writer.writeLine();

            // Verify WireMock request was matched
            writer.write("ok, countErr := ");
            writer.writeNode(
                go.invokeMethod({
                    on: go.codeblock(WIREMOCK_CLIENT_VAR_NAME),
                    method: "Verify",
                    arguments_: [
                        go.invokeMethod({
                            on: go.codeblock("stub"),
                            method: "Request",
                            arguments_: [],
                            multiline: false
                        }),
                        go.codeblock("1")
                    ],
                    multiline: false
                })
            );
            writer.writeLine();

            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "NoError",
                        importPath: "github.com/stretchr/testify/require"
                    }),
                    arguments_: [
                        go.codeblock("t"),
                        go.codeblock("countErr"),
                        go.TypeInstantiation.string("Failed to verify WireMock request was matched")
                    ],
                    multiline: false
                })
            );
            writer.writeLine();

            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "True",
                        importPath: "github.com/stretchr/testify/require"
                    }),
                    arguments_: [
                        go.codeblock("t"),
                        go.codeblock("ok"),
                        go.TypeInstantiation.string("WireMock request was not matched")
                    ],
                    multiline: false
                })
            );
            writer.writeLine();

            // IMPORTANT: currently not asserting that the call succeeded since its not trivial to determine
            // the number of return values for the method using the dynamic ir

            // Verify the call succeeded (may not assert this at all and only assert the WireMock request was matched)
            // Since we don't necessarily have valid response bodies in our WireMock stubs (so type casting will fail)
            // writer.writeNode(
            //     go.invokeFunc({
            //         func: go.typeReference({
            //             name: "NoError",
            //             importPath: "github.com/stretchr/testify/require"
            //         }),
            //         arguments_: [
            //             go.codeblock("t"),
            //             go.codeblock("invocationErr"),
            //             go.TypeInstantiation.string(`${this.getMethod({ endpoint })} call should succeed with WireMock`)
            //         ],
            //         multiline: false
            //     })
            // );
            // writer.writeLine();
        });
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

    private resolvePathParamValue(endpoint: HttpEndpoint, pathParameterName: string): string {
        const autoGeneratedExample = endpoint.autogeneratedExamples[0];
        if (!autoGeneratedExample) {
            return ".+"; //return regex that will match all nonempty strings
        }

        const pathParameterValue = autoGeneratedExample.example.endpointPathParameters.find(
            (pathParameter) => pathParameter.name.originalName === pathParameterName
        )?.value.jsonExample;
        if (!pathParameterValue) {
            return ".+"; //return regex that will match all nonempty strings
        }

        return pathParameterValue as string;
    }

    private writeImports(writer: go.Writer, imports: Map<string, string>): void {
        const standardLibraryImports: string[] = [];
        const externalImports: Array<[string, string]> = [];

        for (const [alias, importPath] of imports.entries()) {
            if (this.isStandardLibraryImport(importPath)) {
                standardLibraryImports.push(importPath);
            } else {
                externalImports.push([alias, importPath]);
            }
        }

        standardLibraryImports.sort();
        externalImports.sort(([, pathA], [, pathB]) => pathA.localeCompare(pathB));

        writer.writeLine("import (");
        for (const importPath of standardLibraryImports) {
            writer.writeLine(`\t"${importPath}"`);
        }
        if (standardLibraryImports.length > 0 && externalImports.length > 0) {
            writer.writeLine();
        }
        for (const [alias, importPath] of externalImports) {
            writer.writeLine(`\t${alias} "${importPath}"`);
        }

        writer.writeLine(")");
    }

    private isStandardLibraryImport(importPath: string): boolean {
        const standardLibraryPackages = [
            "context",
            "fmt",
            "io",
            "net",
            "net/http",
            "os",
            "strings",
            "testing",
            "time",
            "encoding/json",
            "encoding/base64",
            "crypto/md5",
            "crypto/sha1",
            "crypto/sha256",
            "crypto/sha512",
            "hash",
            "math",
            "math/rand",
            "sort",
            "strconv",
            "sync",
            "unicode",
            "unicode/utf8",
            "unsafe",
            "reflect",
            "runtime",
            "path",
            "path/filepath",
            "regexp",
            "bytes",
            "bufio",
            "compress/gzip",
            "compress/flate",
            "archive/tar",
            "archive/zip",
            "database/sql",
            "database/sql/driver",
            "html",
            "html/template",
            "image",
            "image/color",
            "image/draw",
            "image/gif",
            "image/jpeg",
            "image/png",
            "log",
            "log/syslog",
            "mime",
            "mime/multipart",
            "net/mail",
            "net/smtp",
            "net/textproto",
            "net/url",
            "net/rpc",
            "net/rpc/jsonrpc",
            "plugin",
            "text",
            "text/scanner",
            "text/tabwriter",
            "text/template",
            "text/template/parse",
            "vendor"
        ];

        const path = importPath.replace(/"/g, "");
        return !path.includes(".") || standardLibraryPackages.includes(path);
    }

    private getTestMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.pascalCase.unsafeName;
    }

    private getWiremockTestConstructorArgs(): go.AstNode[] {
        return [go.codeblock("ctx"), go.codeblock(WIREMOCK_BASE_URL)];
    }

    private getRootClientFuncInvocation(args: go.AstNode[]): go.AstNode {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewClient",
                importPath: this.context.getRootPackageName()
            }),
            arguments_: args,
            multiline: true
        });
    }

    private getMethod({ endpoint }: { endpoint: HttpEndpoint }): string {
        return endpoint.name.camelCase.unsafeName;
    }

    private getMethodArgs({ endpoint, snippet }: { endpoint: HttpEndpoint; snippet: string }): go.AstNode[] {
        // This is a simplified implementation - you may need to parse the snippet
        // to extract the actual method arguments
        return [];
    }

    private buildFullPath(endpoint: HttpEndpoint): string {
        const parts = endpoint.fullPath.parts;
        let fullPath = "/" + endpoint.fullPath.head;

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
            const serviceName =
                service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }
}
