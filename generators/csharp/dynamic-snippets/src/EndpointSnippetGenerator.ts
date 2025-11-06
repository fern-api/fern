import { NamedArgument, Options, Scope, Severity, Style } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, is, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { camelCase, upperFirst } from "lodash-es";
import { Config } from "./Config";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

export class EndpointSnippetGenerator extends WithGeneration {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        super(context);
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
        const code = this.buildCodeBlock({ endpoint, snippet: request, options });
        return code.toString({
            namespace: "Usage",
            generation: this.generation,
            allNamespaceSegments: new Set(),
            allTypeClassReferences: new Map()
        });
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
        const code = this.buildCodeBlock({ endpoint, snippet: request, options });
        return code.toString({
            namespace: "Usage",
            generation: this.generation,
            allNamespaceSegments: new Set(),
            allTypeClassReferences: new Map()
        });
    }

    private buildCodeBlock({
        endpoint,
        snippet,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): ast.AstNode {
        // if we're actually passed the examples, we need to
        // check that the endpoint that we're generating has an example that matches the snippet
        if (
            endpoint.examples &&
            !endpoint.examples?.find((each) => is.DynamicIR.EndpointExample(snippet) && each.id === snippet.id)
        ) {
            // the dsg expects us to just throw when there is nothing to generate.
            throw new Error("Endpoint does not have an example that matches the snippet");
        }

        const body = this.csharp.codeblock((writer) => {
            writer.writeNodeStatement(this.constructClient({ endpoint, snippet }));
            writer.newLine();
            writer.writeNodeStatement(this.callMethod({ endpoint, snippet }));
        });
        const style = this.getStyle(options);
        switch (style) {
            case Style.Concise:
                return body;
            case Style.Full:
                return this.buildFullCodeBlock({ body, options });
            default:
                assertNever(style);
        }
    }

    private buildFullCodeBlock({ body, options }: { body: ast.CodeBlock; options: Options }): ast.AstNode {
        const config = this.getConfig(options);
        const class_ = this.csharp.class_({
            name: config.fullStyleClassName ?? "Example",
            namespace: "Usage",
            access: ast.Access.Public
        });

        // before we add the method, we're going to make the class aware of the root client namespace
        // which can help when finding out if we're going to have an ambiguous type of some kind.
        class_.addNamespaceReference(this.types.RootClient.namespace);

        class_.addMethod({
            name: "Do",
            access: ast.Access.Public,
            isAsync: true,
            parameters: [],
            body
        });
        return class_;
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.write(`var client = `);
            writer.writeNode(this.getRootClientConstructorInvocation(this.getConstructorArgs({ endpoint, snippet })));
        });
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ast.CodeBlock | ast.MethodInvocation {
        // if the example has *any* sample with stream set to true, then the method is an async enumerable
        const isAsyncEnumerable =
            endpoint.response?.type === "streaming" || endpoint.response?.type === "streamParameter";

        const invocation = this.csharp.invokeMethod({
            on: this.csharp.codeblock("client"),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet }),
            async: true,
            configureAwait: true,
            multiline: true,
            isAsyncEnumerable
        });

        if (isAsyncEnumerable) {
            return this.csharp.codeblock((writer) => {
                writer.write("await foreach (var item in ");
                writer.writeNode(invocation);
                writer.writeLine(")");
                writer.pushScope();
                writer.writeLine("/* consume each item */");
                writer.popScope();
            });
        }
        return invocation;
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): NamedArgument[] {
        const authArgs: NamedArgument[] = [];
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                authArgs.push(...this.getConstructorAuthArgs({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }
        const optionArgs: NamedArgument[] = [];
        const baseUrlArgs = this.getConstructorBaseUrlArgs({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArgs.length > 0) {
            optionArgs.push(...baseUrlArgs);
        }
        this.context.errors.scope(Scope.Headers);
        const headerArgs: NamedArgument[] = [];
        if (this.context.ir.headers != null && snippet.headers != null) {
            headerArgs.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();

        if (optionArgs.length === 0) {
            return [...authArgs, ...headerArgs];
        }
        return [
            ...authArgs,
            ...headerArgs,
            {
                name: "clientOptions",
                assignment: this.csharp.instantiateClass({
                    classReference: this.types.ClientOptions,
                    arguments_: optionArgs.map((arg) => ({
                        name: arg.name,
                        assignment: arg.assignment
                    })),
                    multiline: true
                })
            }
        ];
    }

    private getConstructorBaseUrlArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): NamedArgument[] {
        const baseUrlArg = this.getBaseUrlArg({ baseUrl, environment });
        if (is.TypeLiteral.nop(baseUrlArg)) {
            return [];
        }
        return [
            {
                name: this.getBaseUrlOptionName(),
                assignment: baseUrlArg
            }
        ];
    }

    private getBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ast.TypeLiteral {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return this.csharp.TypeLiteral.nop();
        }
        if (baseUrl != null) {
            if (this.context.ir.environments?.environments.type === "multipleBaseUrls") {
                this.context.errors.add({
                    severity: Severity.Critical,
                    message: "The C# SDK doesn't support a baseUrl when multiple URL environments are configured"
                });
                return this.csharp.TypeLiteral.nop();
            }
            return this.csharp.TypeLiteral.string(baseUrl);
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const classReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (classReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.reference(classReference);
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.reference(
                    this.csharp.instantiateClass({
                        classReference: this.types.Environments,
                        arguments_: Object.entries(environment).map(([key, value]) => ({
                            name: upperFirst(camelCase(key)),
                            assignment: this.context.dynamicTypeLiteralMapper.convert({
                                typeReference: {
                                    type: "primitive",
                                    value: "STRING"
                                },
                                value
                            })
                        })),
                        multiline: true
                    })
                );
            }
        }
        return this.csharp.TypeLiteral.nop();
    }

    private getConstructorAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): NamedArgument[] {
        if (values.type !== auth.type) {
            this.addError(this.context.newAuthMismatchError({ auth, values }).message);
            return [];
        }

        switch (auth.type) {
            case "basic":
                return values.type === "basic" ? this.getConstructorBasicAuthArg({ auth, values }) : [];
            case "bearer":
                return values.type === "bearer" ? this.getConstructorBearerAuthArgs({ auth, values }) : [];
            case "header":
                return values.type === "header" ? this.getConstructorHeaderAuthArgs({ auth, values }) : [];
            case "oauth":
                return values.type === "oauth" ? this.getConstructorOAuthArgs({ auth, values }) : [];
            case "inferred":
                this.addWarning("The C# SDK Generator does not support Inferred auth scheme yet");
                return [];
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
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.username),
                assignment: this.csharp.TypeLiteral.string(values.username)
            },
            {
                name: this.context.getParameterName(auth.password),
                assignment: this.csharp.TypeLiteral.string(values.password)
            }
        ];
    }

    private getConstructorBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.token),
                assignment: this.csharp.TypeLiteral.string(values.token)
            }
        ];
    }

    private getConstructorHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.header.name.name),
                assignment: this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value,
                    fallbackToDefault: auth.header.name.wireValue
                })
            }
        ];
    }

    private getConstructorOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth;
        values: FernIr.dynamic.OAuthValues;
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.clientId),
                assignment: this.csharp.TypeLiteral.string(values.clientId)
            },
            {
                name: this.context.getParameterName(auth.clientSecret),
                assignment: this.csharp.TypeLiteral.string(values.clientSecret)
            }
        ];
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): NamedArgument[] {
        const args: NamedArgument[] = [];
        for (const header of headers) {
            const arg = this.getConstructorHeaderArg({ header, value: values.value });
            if (arg != null) {
                args.push({
                    name: this.context.getParameterName(header.name.name),
                    assignment: arg
                });
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
    }): ast.TypeLiteral | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value,
            fallbackToDefault: header.name.wireValue
        });
        if (is.TypeLiteral.nop(typeLiteral)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return typeLiteral;
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ast.TypeLiteral[] {
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
    }): ast.TypeLiteral[] {
        const args: ast.TypeLiteral[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: ast.ConstructorField[] = [];
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // TODO: Add support for file properties.
        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (
            !this.context.includePathParametersInWrappedRequest({
                request,
                inlinePathParameters: this.settings.shouldInlinePathParameters
            })
        ) {
            args.push(...pathParameterFields.map((field) => field.value));
        }
        // For now, the C# SDK always requires the inlined request parameter.
        args.push(
            this.getInlinedRequestArg({
                request,
                snippet,
                pathParameterFields: this.context.includePathParametersInWrappedRequest({
                    request,
                    inlinePathParameters: this.settings.shouldInlinePathParameters
                })
                    ? pathParameterFields
                    : [],
                filePropertyInfo
            })
        );
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
        pathParameterFields: ast.ConstructorField[];
        filePropertyInfo: FilePropertyInfo;
    }): ast.TypeLiteral {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const queryParameterFields = queryParameters.map((queryParameter) => ({
            name: this.context.getPropertyName(queryParameter.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert(queryParameter)
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const headerFields = headers.map((header) => ({
            name: this.context.getPropertyName(header.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({
                ...header,
                fallbackToDefault: header.name.wireValue
            })
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyConstructorFields({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : [];
        this.context.errors.unscope();

        return this.csharp.TypeLiteral.class_({
            reference: this.csharp.classReference({
                origin: request.declaration,
                namespace: this.context.getNamespace(request.declaration.fernFilepath)
            }),
            fields: [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields]
        });
    }

    private getInlinedRequestBodyConstructorFields({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        filePropertyInfo: FilePropertyInfo;
    }): ast.ConstructorField[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyConstructorFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyConstructorField({ body, value })];
            case "fileUpload":
                return this.getFileUploadRequestBodyConstructorFields({ filePropertyInfo });
            default:
                assertNever(body);
        }
    }

    private getInlinedRequestBodyPropertyConstructorFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): ast.ConstructorField[] {
        const fields: ast.ConstructorField[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
                    ...parameter,
                    fallbackToDefault: parameter.name.wireValue
                })
            });
        }

        return fields;
    }

    private getFileUploadRequestBodyConstructorFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): ast.ConstructorField[] {
        return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
    }

    private getReferencedRequestBodyPropertyConstructorField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): ast.ConstructorField {
        return {
            name: this.context.getPropertyName(body.bodyKey),
            value: this.getReferencedRequestBodyPropertyTypeLiteral({ body: body.bodyType, value })
        };
    }

    private getReferencedRequestBodyPropertyTypeLiteral({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): ast.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    fallbackToDefault: JSON.stringify(body.value)
                });
            default:
                assertNever(body);
        }
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ast.TypeLiteral[] {
        const args: ast.TypeLiteral[] = [];
        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            args.push(
                ...this.getPathParameters({ namedParameters: pathParameters, snippet }).map((field) => field.value)
            );
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
    }): ast.TypeLiteral {
        switch (body.type) {
            case "bytes": {
                return this.getBytesBodyRequestArg({ value });
            }
            case "typeReference":
                // if the body type is optional, but not provided, then we should use null
                // (the generated body arg parameter is currently required)
                if (body.value.type === "optional" && value == undefined) {
                    return this.csharp.TypeLiteral.null();
                }
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    fallbackToDefault: JSON.stringify(body.value)
                });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): ast.TypeLiteral {
        let str = this.context.getValueAsString({ value });
        if (str == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "The bytes request body must be provided in string format"
            });

            // if there is no value, then let's just use a random string
            str = "[bytes]";
        }
        return this.csharp.TypeLiteral.reference(this.context.getMemoryStreamForString(str));
    }

    private getRootClientConstructorInvocation(arguments_: NamedArgument[]): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.types.RootClient,
            arguments_,
            forceUseConstructor: true,
            multiline: true
        });
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ast.ConstructorField[] {
        const args: ast.ConstructorField[] = [];
        const pathParameters = this.context.associateByWireValueOrDefault({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
                    ...parameter,
                    fallbackToDefault: parameter.name.wireValue
                })
            });
        }
        return args;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getClassName(val))
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }

        return this.context.getMethodName(endpoint.declaration.name);
    }

    private getBaseUrlOptionName(): string {
        if (this.context.ir.environments?.environments.type === "multipleBaseUrls") {
            return "Environment";
        }
        return "BaseUrl";
    }

    private getStyle(options: Options): Style {
        return options.style ?? this.context.options.style ?? Style.Full;
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {};
    }
}
