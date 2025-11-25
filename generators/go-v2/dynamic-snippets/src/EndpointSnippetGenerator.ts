import { AbstractFormatter, Options, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const SNIPPET_PACKAGE_NAME = "example";
const SNIPPET_IMPORT_PATH = "fern";
const SNIPPET_FUNC_NAME = "do";
const CLIENT_VAR_NAME = "client";
const TypeInst = go.TypeInstantiation;
const WIREMOCK_BASE_URL = "WireMockBaseURL";
const WIREMOCK_CLIENT_VAR_NAME = "WireMockClient";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;
    private formatter: AbstractFormatter | undefined;

    constructor({ context, formatter }: { context: DynamicSnippetsGeneratorContext; formatter?: AbstractFormatter }) {
        this.context = context;
        this.formatter = formatter;
    }

    public async generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<string> {
        const outputWiremockTests =
            (options?.config as { outputWiremockTests?: boolean })?.outputWiremockTests ?? false;
        if (outputWiremockTests) {
            return this.generateWiremockTest({ endpoint, snippet: request });
        }
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return await code.toStringAsync({
            packageName: SNIPPET_PACKAGE_NAME,
            importPath: SNIPPET_IMPORT_PATH,
            rootImportPath: this.context.rootImportPath,
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    public generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): string {
        const outputWiremockTests =
            (options?.config as { outputWiremockTests?: boolean })?.outputWiremockTests ?? false;
        if (outputWiremockTests) {
            return this.generateWiremockTest({ endpoint, snippet: request });
        }
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toString({
            packageName: SNIPPET_PACKAGE_NAME,
            importPath: SNIPPET_IMPORT_PATH,
            rootImportPath: this.context.rootImportPath,
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    public async generateSnippetAst({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<go.AstNode> {
        throw new Error("Unsupported");
    }

    private generateWiremockTest({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildWiremockTestCodeBlock({ endpoint, snippet });
        return code.toString({
            packageName: "wiremock",
            importPath: SNIPPET_IMPORT_PATH,
            rootImportPath: this.context.rootImportPath,
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.func({
                    name: SNIPPET_FUNC_NAME,
                    parameters: [],
                    return_: [],
                    body: go.codeblock((writer) => {
                        writer.writeNode(this.constructClient({ endpoint, snippet }));
                        writer.writeLine();
                        writer.writeNode(this.callMethod({ endpoint, snippet }));
                    })
                })
            );
            writer.writeNewLineIfLastLineNot();
        });
    }

    private buildWiremockTestCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.func({
                    name: "Test" + this.context.getTestMethodName(endpoint) + "WithWireMock",
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
                        writer.writeNode(this.callClientMethodAndAssert({ endpoint, snippet }));
                    })
                })
            );
            // Not including error case for now until I can figure out why its not matching the wiremock stub
            // writer.writeLine();
            // writer.writeNode(
            //     go.func({
            //         name: "Test" + this.context.getMethodName(endpoint.declaration.name) + "Error" + "WithWireMock",
            //         parameters: [
            //             go.parameter({
            //                 name: "t",
            //                 type: go.Type.pointer(go.Type.reference(this.context.getTestingTypeReference()))
            //             })
            //         ],
            //         return_: [],
            //         body: go.codeblock((writer) => {
            //             for (const node of this.buildWiremockTestSetup({ endpoint, errorCase: true })) {
            //                 writer.writeNode(node);
            //                 writer.writeLine();
            //             }
            //             writer.writeLine();
            //             writer.writeNode(this.constructWiremockTestClient({ endpoint, snippet }));
            //             writer.writeLine();
            //             writer.writeNode(this.callClientMethodAndAssert({ endpoint, snippet }));
            //         })
            //     })
            // );
            writer.writeNewLineIfLastLineNot();
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`${CLIENT_VAR_NAME} := `);
            writer.writeNode(this.getRootClientFuncInvocation(this.getConstructorArgs({ endpoint, snippet })));
        });
    }

    private constructWiremockTestClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`${CLIENT_VAR_NAME} := `);
            writer.writeNode(this.getRootClientFuncInvocation(this.getWiremockTestConstructorArgs()));
        });
    }

    private writeMethodInvocation({
        writer,
        endpoint,
        snippet
    }: {
        writer: go.Writer;
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): void {
        const { otherArgs, requestArg } = this.getMethodArgs({ endpoint, snippet });

        if (requestArg != null) {
            if (requestArg instanceof go.TypeInstantiation && go.TypeInstantiation.isNop(requestArg)) {
                writer.writeNode(
                    go.invokeMethod({
                        on: go.codeblock(CLIENT_VAR_NAME),
                        method: this.getMethod({ endpoint }),
                        arguments_: [this.context.getContextTodoFunctionInvocation(), ...otherArgs, go.codeblock("nil")]
                    })
                );
            } else {
                writer.write("request := ");
                writer.writeNode(requestArg);
                writer.writeLine();

                const requestRef = go.codeblock("request");
                writer.writeNode(
                    go.invokeMethod({
                        on: go.codeblock(CLIENT_VAR_NAME),
                        method: this.getMethod({ endpoint }),
                        arguments_: [this.context.getContextTodoFunctionInvocation(), ...otherArgs, requestRef]
                    })
                );
            }
        } else {
            writer.writeNode(
                go.invokeMethod({
                    on: go.codeblock(CLIENT_VAR_NAME),
                    method: this.getMethod({ endpoint }),
                    arguments_: [this.context.getContextTodoFunctionInvocation(), ...otherArgs]
                })
            );
        }
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            this.writeMethodInvocation({ writer, endpoint, snippet });
        });
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.AstNode[] {
        const args: go.AstNode[] = [];
        const baseUrlArg = this.getConstructorBaseUrlArg({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArg != null) {
            args.push(baseUrlArg);
        }
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                args.push(this.getConstructorAuthArg({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            args.push(...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers }));
        }
        this.context.errors.unscope();
        return args;
    }

    private getWiremockTestConstructorArgs(): go.AstNode[] {
        return [
            go.codeblock((writer) => {
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "WithBaseURL",
                            importPath: this.context.getOptionImportPath()
                        }),
                        arguments_: [go.codeblock(WIREMOCK_BASE_URL)]
                    })
                );
            })
        ];
    }

    private getConstructorAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): go.AstNode {
        if (values.type !== auth.type) {
            this.addError(this.context.newAuthMismatchError({ auth, values }).message);
            return TypeInst.nop();
        }
        switch (auth.type) {
            case "basic":
                return values.type === "basic" ? this.getConstructorBasicAuthArg({ auth, values }) : TypeInst.nop();
            case "bearer":
                return values.type === "bearer" ? this.getConstructorBearerAuthArg({ auth, values }) : TypeInst.nop();
            case "header":
                return values.type === "header" ? this.getConstructorHeaderAuthArg({ auth, values }) : TypeInst.nop();
            case "oauth":
                this.addWarning("The Go SDK doesn't support OAuth client credentials yet");
                return TypeInst.nop();
            case "inferred":
                this.addWarning("The Go SDK Generator does not support Inferred auth scheme yet");
                return TypeInst.nop();
            default:
                assertNever(auth);
        }
    }

    private addError(message: string): void {
        this.context.errors.add({ severity: Severity.Critical, message });
    }

    private addWarning(message: string): void {
        this.context.errors.add({ severity: Severity.Warning, message });
    }

    private getConstructorBasicAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "WithBasicAuth",
                        importPath: this.context.getOptionImportPath()
                    }),
                    arguments_: [
                        go.TypeInstantiation.string(values.username),
                        go.TypeInstantiation.string(values.password)
                    ]
                })
            );
        });
    }

    private getConstructorBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): go.AstNode | undefined {
        const baseUrlArg = this.getBaseUrlArg({ baseUrl, environment });
        if (baseUrlArg == null) {
            return undefined;
        }
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "WithBaseURL",
                        importPath: this.context.getOptionImportPath()
                    }),
                    arguments_: [baseUrlArg]
                })
            );
        });
    }

    private getBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): go.AstNode | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            return go.TypeInstantiation.string(baseUrl);
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const typeReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (typeReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return undefined;
                }
                return go.TypeInstantiation.reference(typeReference);
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message:
                        "The Go SDK doesn't support a multi-environment client option yet; use the baseUrl option instead"
                });
            }
        }
        return undefined;
    }

    private getConstructorBearerAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: `With${auth.token.pascalCase.unsafeName}`,
                        importPath: this.context.getOptionImportPath()
                    }),
                    arguments_: [go.TypeInstantiation.string(values.token)]
                })
            );
        });
    }

    private getConstructorHeaderAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: `With${auth.header.name.name.pascalCase.unsafeName}`,
                        importPath: this.context.getOptionImportPath()
                    }),
                    arguments_: [
                        this.context.dynamicTypeInstantiationMapper.convert({
                            typeReference: auth.header.typeReference,
                            value: values.value
                        })
                    ]
                })
            );
        });
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): go.AstNode[] {
        const args: go.AstNode[] = [];
        for (const header of headers) {
            const arg = this.getConstructorHeaderArg({ header, value: values.value });
            if (arg != null) {
                args.push(arg);
            }
        }
        return args;
    }

    private getConstructorHeaderArg({
        header,
        value
    }: {
        header: FernIr.dynamic.NamedParameter;
        value: unknown;
    }): go.AstNode | undefined {
        const typeInstantiation = this.context.dynamicTypeInstantiationMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (go.TypeInstantiation.isNop(typeInstantiation)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: `With${header.name.name.pascalCase.unsafeName}`,
                        importPath: this.context.getOptionImportPath()
                    }),
                    arguments_: [typeInstantiation]
                })
            );
        });
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): { otherArgs: go.AstNode[]; requestArg: go.AstNode | undefined } {
        switch (endpoint.request.type) {
            case "inlined":
                return this.getMethodArgsForInlinedRequest({ request: endpoint.request, snippet });
            case "body":
                return this.getMethodArgsForBodyRequest({ request: endpoint.request, snippet });
            default:
                assertNever(endpoint.request);
        }
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): { otherArgs: go.AstNode[]; requestArg: go.AstNode | undefined } {
        const otherArgs: go.AstNode[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            otherArgs.push(
                ...this.getPathParameters({ namedParameters: pathParameters, snippet }).map((field) => field.value)
            );
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const requestArg: go.AstNode | undefined =
            request.body != null
                ? this.getBodyRequestArg({ body: request.body, value: snippet.requestBody })
                : undefined;
        this.context.errors.unscope();

        return { otherArgs, requestArg };
    }

    private getBodyRequestArg({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): go.TypeInstantiation {
        switch (body.type) {
            case "bytes": {
                return this.getBytesBodyRequestArg({ value });
            }
            case "typeReference":
                return this.context.dynamicTypeInstantiationMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): go.TypeInstantiation {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.bytes(value as string);
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): { otherArgs: go.AstNode[]; requestArg: go.AstNode | undefined } {
        const otherArgs: go.AstNode[] = [];

        const { inlinePathParameters, inlineFileProperties } = {
            inlinePathParameters: this.context.customConfig?.inlinePathParameters ?? true,
            inlineFileProperties: this.context.customConfig?.inlineFileProperties ?? true
        };

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: go.StructField[] = [];
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            pathParameterFields.push(
                ...this.getPathParameters({
                    namedParameters: pathParameters,
                    snippet
                })
            );
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (!this.context.includePathParametersInWrappedRequest({ request, inlinePathParameters })) {
            otherArgs.push(...pathParameterFields.map((field) => field.value));
        }

        if (!inlineFileProperties) {
            otherArgs.push(...filePropertyInfo.fileFields.map((field) => field.value));
        }

        const requestArg: go.AstNode | undefined = this.context.needsRequestParameter({
            request,
            inlinePathParameters,
            inlineFileProperties
        })
            ? this.getInlinedRequestArg({
                  request,
                  snippet,
                  pathParameterFields: this.context.includePathParametersInWrappedRequest({
                      request,
                      inlinePathParameters
                  })
                      ? pathParameterFields
                      : [],
                  filePropertyInfo
              })
            : undefined;
        return { otherArgs, requestArg };
    }

    private getFilePropertyInfo({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): FilePropertyInfo {
        if (request.body == null || !this.context.isFileUploadRequestBody(request.body)) {
            return {
                fileFields: [],
                bodyPropertyFields: []
            };
        }
        return this.context.filePropertyMapper.getFilePropertyInfo({
            body: request.body,
            value: snippet.requestBody
        });
    }

    private getInlinedRequestArg({
        request,
        snippet,
        pathParameterFields,
        filePropertyInfo
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        pathParameterFields: go.StructField[];
        filePropertyInfo: FilePropertyInfo;
    }): go.TypeInstantiation {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const queryParameterFields = queryParameters.map((queryParameter) => ({
            name: queryParameter.name.name.pascalCase.unsafeName,
            value: this.context.dynamicTypeInstantiationMapper.convert(queryParameter)
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const headerFields = headers.map((header) => ({
            name: header.name.name.pascalCase.unsafeName,
            value: this.context.dynamicTypeInstantiationMapper.convert(header)
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyStructFields({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : [];
        this.context.errors.unscope();

        return go.TypeInstantiation.structPointer({
            typeReference: go.typeReference({
                name: this.context.getMethodName(request.declaration.name),
                importPath: this.context.getImportPathForRequest(request.declaration.fernFilepath)
            }),
            fields: [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields]
        });
    }

    private getInlinedRequestBodyStructFields({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        filePropertyInfo: FilePropertyInfo;
    }): go.StructField[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyStructFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyStructField({ body, value })];
            case "fileUpload":
                return this.getFileUploadRequestBodyStructFields({ filePropertyInfo });
            default:
                assertNever(body);
        }
    }

    private getFileUploadRequestBodyStructFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): go.StructField[] {
        if (this.context.customConfig?.inlineFileProperties) {
            return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
        }
        return filePropertyInfo.bodyPropertyFields;
    }

    private getReferencedRequestBodyPropertyStructField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): go.StructField {
        return {
            name: this.context.getTypeName(body.bodyKey),
            value: this.getReferencedRequestBodyPropertyTypeInstantiation({ body: body.bodyType, value })
        };
    }

    private getReferencedRequestBodyPropertyTypeInstantiation({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): go.TypeInstantiation {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeInstantiationMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getInlinedRequestBodyPropertyStructFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): go.StructField[] {
        const fields: go.StructField[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getTypeName(parameter.name.name),
                value: this.context.dynamicTypeInstantiationMapper.convert(parameter)
            });
        }

        return fields;
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.StructField[] {
        const args: go.StructField[] = [];

        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getTypeName(parameter.name.name),
                value: this.context.dynamicTypeInstantiationMapper.convertToPointerIfPossible(parameter)
            });
        }

        return args;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getMethodName(val))
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }

    private getRootClientFuncInvocation(arguments_: go.AstNode[]): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: this.context.getClientConstructorName(),
                importPath: this.context.getClientImportPath()
            }),
            arguments_
        });
    }

    private buildWiremockTestSetup({
        endpoint,
        errorCase
    }: {
        endpoint: FernIr.dynamic.Endpoint;
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
                : [])
        ];
    }

    private callClientMethodAndAssert({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            // IMPORTANT: currently not capturing the response/error values since its not trivial to determine
            // the number of return values for the method using the dynamic ir

            // Call the method and capture response and error
            // writer.write("_, invocationErr := ");
            this.writeMethodInvocation({ writer, endpoint, snippet });
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
}
