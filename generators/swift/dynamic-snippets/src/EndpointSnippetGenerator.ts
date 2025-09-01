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
        options: Options;
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
        options: Options;
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
        options: Options;
    }) {
        const fileComponents: swift.FileComponent[] = [
            this.generateImportModuleStatement(),
            swift.LineBreak.single(),
            this.generateRootClientInitializationStatement({ auth: endpoint.auth, values: snippetRequest.auth }),
            swift.LineBreak.single(),
            this.generateEndpointMethodCallStatement({ endpoint, snippet: snippetRequest })
        ];
        return fileComponents.map((c) => c.toString()).join("");
    }

    private generateImportModuleStatement() {
        // TODO(kafkas): Implement
        return swift.Statement.import("Acme");
    }

    private generateRootClientInitializationStatement({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth | undefined;
        values: FernIr.dynamic.AuthValues | undefined;
    }) {
        const rootClientArgs = auth && values ? this.getRootClientAuthArgs({ auth, values }) : [];
        return swift.Statement.constantDeclaration({
            unsafeName: CLIENT_CONST_NAME,
            value: swift.Expression.classInitialization({
                unsafeName: this.context.getRootClientClassName(),
                arguments_: rootClientArgs,
                multiline: rootClientArgs.length > 1 ? true : undefined
            })
        });
    }

    private getRootClientAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): swift.FunctionArgument[] {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.username.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.username)
                    }),
                    swift.functionArgument({
                        label: auth.password.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.password)
                    })
                ];
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.token.camelCase.unsafeName,
                        value: swift.Expression.stringLiteral(values.token)
                    })
                ];
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return [
                    swift.functionArgument({
                        label: auth.header.name.name.camelCase.unsafeName,
                        value: this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: auth.header.typeReference,
                            value: values.value
                        })
                    })
                ];
            case "oauth":
                if (values.type !== "oauth") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                // TODO(kafkas): Add when oauth is supported
                return [];
            default:
                assertNever(auth);
        }
    }

    private generateEndpointMethodCallStatement({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }) {
        return swift.Statement.expressionStatement(
            swift.Expression.try(
                swift.Expression.await(
                    swift.Expression.methodCall({
                        target: swift.Expression.rawValue(CLIENT_CONST_NAME),
                        methodName: this.getMethodName({ endpoint }),
                        arguments_: this.getMethodArguments({ endpoint, snippet }),
                        multiline: true
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

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        args.push(...pathParameterFields);

        args.push(
            swift.functionArgument({
                label: "request",
                value: this.getInlinedRequestArg({
                    request,
                    snippet,
                    pathParameterFields,
                    filePropertyInfo
                })
            })
        );

        return args;
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): swift.FunctionArgument[] {
        const args: swift.FunctionArgument[] = [];
        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {},
            ignoreMissingParameters: true
        });
        for (const parameter of pathParameters) {
            args.push(
                swift.functionArgument({
                    label: parameter.name.name.camelCase.unsafeName,
                    value: this.context.dynamicTypeLiteralMapper.convert(parameter)
                })
            );
        }
        return args;
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
        pathParameterFields: swift.FunctionArgument[];
        filePropertyInfo: FilePropertyInfo;
    }): swift.Expression {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const queryParameterFields = queryParameters.map((queryParameter) =>
            swift.functionArgument({
                label: queryParameter.name.name.camelCase.unsafeName,
                value: this.context.dynamicTypeLiteralMapper.convert(queryParameter)
            })
        );
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const headerFields = headers.map((header) =>
            swift.functionArgument({
                label: header.name.name.camelCase.unsafeName,
                value: this.context.dynamicTypeLiteralMapper.convert(header)
            })
        );
        this.context.errors.unscope();

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

        const arguments_ = [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields];

        return swift.Expression.contextualMethodCall({
            methodName: "init",
            arguments_,
            multiline: arguments_.length > 1 ? true : undefined
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
        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        return bodyProperties.map((parameter) =>
            swift.functionArgument({
                label: parameter.name.name.camelCase.unsafeName,
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
            })
        );
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
            return swift.Expression.nop();
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
