import { Options, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext, FilePropertyInfo } from "./context";

const CLIENT_CONST_NAME = "client";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    public constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
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
        return this.buildCodeBlock({ endpoint, snippetRequest: request, options });
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
        return this.buildCodeBlock({ endpoint, snippetRequest: request, options });
    }

    private buildCodeBlock({
        endpoint,
        snippetRequest,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippetRequest: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }) {
        const fileComponents: swift.FileComponent[] = [
            this.generateImportFoundationStatement(),
            this.generateImportModuleStatement(),
            swift.LineBreak.single(),
            this.generateMainFunctionDeclarationWithEndpointSnippet({ endpoint, snippet: snippetRequest }),
            swift.LineBreak.single(),
            this.generateMainFunctionInvocationStatement()
        ];
        return fileComponents.map((c) => c.toString()).join("");
    }

    private generateImportFoundationStatement() {
        return swift.Statement.import("Foundation");
    }

    private generateImportModuleStatement() {
        const sourceModuleSymbol = this.context.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return swift.Statement.import(sourceModuleSymbol.name);
    }

    private generateMainFunctionDeclarationWithEndpointSnippet({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }) {
        return swift.Statement.functionDeclaration({
            unsafeName: "main",
            accessLevel: "private",
            async: true,
            throws: true,
            body: swift.CodeBlock.withStatements([
                this.generateRootClientInitializationStatement({
                    auth: endpoint.auth,
                    snippet: snippet
                }),
                swift.LineBreak.single(),
                this.generateEndpointMethodCallStatement({ endpoint, snippet })
            ])
        });
    }

    public generateRootClientInitializationStatement({
        auth,
        snippet,
        additionalArgs = []
    }: {
        auth: FernIr.dynamic.Auth | undefined;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        additionalArgs?: swift.FunctionArgument[];
    }) {
        const rootClientArgs: swift.FunctionArgument[] = [];
        const baseUrlArg = this.getRootClientBaseURLArg({ snippet });
        if (baseUrlArg != null) {
            rootClientArgs.push(baseUrlArg);
        }
        const authArgs = auth ? this.getRootClientAuthArgs({ auth, snippet }) : [];
        rootClientArgs.push(...authArgs);
        rootClientArgs.push(...additionalArgs);
        const nonNopRootClientArgs = rootClientArgs.filter((arg) => !arg.value.isNop());
        const rootClientSymbol = this.context.nameRegistry.getRootClientSymbolOrThrow();
        return swift.Statement.constantDeclaration({
            unsafeName: CLIENT_CONST_NAME,
            value: swift.Expression.classInitialization({
                unsafeName: rootClientSymbol.name,
                arguments_: nonNopRootClientArgs,
                multiline: nonNopRootClientArgs.length > 1 ? true : undefined
            })
        });
    }

    private getRootClientBaseURLArg({ snippet }: { snippet: FernIr.dynamic.EndpointSnippetRequest }) {
        if (snippet.baseURL != null && snippet.environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return null;
        }
        if (snippet.baseURL != null) {
            if (this.context.ir.environments?.environments.type === "multipleBaseUrls") {
                // TODO(kafkas): Not implemented yet
                return null;
            } else {
                return swift.functionArgument({
                    label: "baseURL",
                    value: swift.Expression.stringLiteral(snippet.baseURL)
                });
            }
        }
        return null;
    }

    private getRootClientAuthArgs({
        auth,
        snippet
    }: {
        auth: FernIr.dynamic.Auth;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        const args: swift.FunctionArgument[] = [];

        const values = snippet.auth;

        if (values == null) {
            return args;
        }

        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    break;
                }
                args.push(
                    swift.functionArgument({
                        label: auth.username.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.username)
                    }),
                    swift.functionArgument({
                        label: auth.password.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.password)
                    })
                );
                break;
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return args;
                }
                args.push(
                    swift.functionArgument({
                        label: auth.token.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.token)
                    })
                );
                break;
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth: auth, values }).message
                    });
                    return args;
                }
                args.push(
                    swift.functionArgument({
                        label: auth.header.name.name.camelCase.unsafeName,
                        value: this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: auth.header.typeReference,
                            value: values.value
                        })
                    })
                );
                break;
            case "oauth":
                if (values.type !== "oauth") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return args;
                }
                // TODO(kafkas): Add when oauth is supported
                return args;
            case "inferred":
                if (values.type !== "inferred") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return args;
                }
                // TODO(kafkas): Add when inferred auth is supported
                return args;
            default:
                assertNever(auth);
        }
        return args;
    }

    private generateEndpointMethodCallStatement({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }) {
        return swift.Statement.discardAssignment(
            this.generateEndpointMethodCallExpression({
                endpoint,
                snippet
            })
        );
    }

    public generateEndpointMethodCallExpression({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }) {
        const nonNopArguments = this.getMethodArguments({ endpoint, snippet }).filter((arg) => !arg.value.isNop());
        return swift.Expression.try(
            swift.Expression.await(
                swift.Expression.methodCall({
                    target: swift.Expression.rawValue(CLIENT_CONST_NAME),
                    methodName: this.getMethodName({ endpoint }),
                    arguments_: nonNopArguments,
                    multiline: nonNopArguments.length > 1 ? true : undefined
                })
            )
        );
    }

    private generateMainFunctionInvocationStatement() {
        return swift.Statement.expressionStatement(
            swift.Expression.try(
                swift.Expression.await(
                    swift.Expression.functionCall({
                        unsafeName: "main"
                    })
                )
            )
        );
    }

    private getMethodName({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            const pathToMethod = `${endpoint.declaration.fernFilepath.allParts.map((p) => p.camelCase.unsafeName).join(".")}`;
            return `${pathToMethod}.${endpoint.declaration.name.camelCase.unsafeName}`;
        }
        return endpoint.declaration.name.camelCase.unsafeName;
    }

    private getMethodArguments({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        switch (endpoint.request.type) {
            case "inlined":
                return this.getMethodArgsForInlinedRequest({ request: endpoint.request, snippet });
            case "body":
                return this.getMethodArgsForBodyRequest({ request: endpoint.request, snippet });
            default:
                assertNever(endpoint.request);
        }
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        const args: swift.FunctionArgument[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: swift.FunctionArgument[] = [];
        if (request.pathParameters != null) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: request.pathParameters, snippet }));
        }
        this.context.errors.unscope();
        args.push(...pathParameterFields);

        this.context.errors.scope(Scope.QueryParameters);
        const queryParameterFields: swift.FunctionArgument[] = [];
        if (request.queryParameters != null) {
            queryParameterFields.push(
                ...this.getQueryParameters({ namedParameters: request.queryParameters, snippet })
            );
        }
        this.context.errors.unscope();
        args.push(...queryParameterFields);

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (request.body != null) {
            args.push(
                swift.functionArgument({
                    label: "request",
                    value: this.getInlinedRequestArg({
                        request,
                        snippet,
                        filePropertyInfo
                    })
                })
            );
        }

        return args;
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        return this.context
            .getExampleObjectProperties({
                parameters: namedParameters,
                snippetObject: snippet.pathParameters ?? {}
            })
            .map((parameter) => {
                return swift.functionArgument({
                    label: parameter.name.name.camelCase.unsafeName,
                    value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                });
            });
    }

    private getQueryParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        return this.context
            .getExampleObjectProperties({
                parameters: namedParameters,
                snippetObject: snippet.queryParameters ?? {}
            })
            .map((parameter) => {
                return swift.functionArgument({
                    label: parameter.name.name.camelCase.unsafeName,
                    value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                });
            });
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
        filePropertyInfo
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        filePropertyInfo: FilePropertyInfo;
    }): swift.Expression {
        this.context.errors.scope(Scope.RequestBody);
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyObjectFields({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : [];
        this.context.errors.unscope();

        const nonNopArguments = requestBodyFields.filter((arg) => !arg.value.isNop());

        return swift.Expression.contextualMethodCall({
            methodName: "init",
            arguments_: nonNopArguments,
            multiline: nonNopArguments.length > 1 ? true : undefined
        });
    }

    private getInlinedRequestBodyObjectFields({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        filePropertyInfo: FilePropertyInfo;
    }): swift.FunctionArgument[] {
        switch (body.type) {
            case "fileUpload":
                return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
            case "properties":
                return this.getInlinedRequestBodyPropertyObjectFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyObjectField({ body, value })];
            default:
                assertNever(body);
        }
    }

    private getInlinedRequestBodyPropertyObjectFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): swift.FunctionArgument[] {
        return this.context
            .getExampleObjectProperties({
                parameters,
                snippetObject: value
            })
            .map((typeInstance) => {
                return swift.functionArgument({
                    label: typeInstance.name.name.camelCase.unsafeName,
                    value: this.context.dynamicTypeLiteralMapper.convert(typeInstance)
                });
            });
    }

    private getReferencedRequestBodyPropertyObjectField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): swift.FunctionArgument {
        return swift.functionArgument({
            label: body.bodyKey.camelCase.unsafeName,
            value: this.getReferencedRequestBodyPropertyTypeLiteral({ body: body.bodyType, value })
        });
    }

    private getReferencedRequestBodyPropertyTypeLiteral({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): swift.Expression {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): swift.Expression {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return swift.Expression.dataLiteral("data");
        }
        return swift.Expression.dataLiteral(value);
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        const args: swift.FunctionArgument[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            args.push(...this.getPathParameters({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        if (request.body != null) {
            args.push(this.getBodyRequestArg({ body: request.body, value: snippet.requestBody }));
        }
        this.context.errors.unscope();

        return args;
    }

    private getBodyRequestArg({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): swift.FunctionArgument {
        switch (body.type) {
            case "bytes":
                return swift.functionArgument({
                    label: "request",
                    value: this.getBytesBodyRequestArg({ value })
                });
            case "typeReference":
                return swift.functionArgument({
                    label: "request",
                    value: this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value })
                });
            default:
                assertNever(body);
        }
    }
}
