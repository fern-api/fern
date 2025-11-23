import { AbstractFormatter, Options, Scope, Severity, Style } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { Config } from "./Config";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const SNIPPET_PACKAGE_NAME = "com.example.usage";
const SNIPPET_CLASS_NAME = "Example";
const SNIPPET_METHOD_NAME = "main";
const SNIPPET_METHOD_ARG = "args";
const CLIENT_VAR_NAME = "client";
const STRING_TYPE_REFERENCE: FernIr.dynamic.TypeReference = {
    type: "primitive",
    value: "STRING"
};

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
        options: Options;
    }): Promise<string> {
        const config = this.getConfig(options);
        const code = this.buildCodeBlock({ endpoint, snippet: request, options });
        return await code.toStringAsync({
            packageName: config.fullStylePackageName ?? SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig,
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
        options: Options;
    }): string {
        const config = this.getConfig(options);
        const code = this.buildCodeBlock({ endpoint, snippet: request, options });
        return code.toString({
            packageName: config.fullStylePackageName ?? SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig,
            formatter: this.formatter
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
    }): java.AstNode {
        const body = java.codeblock((writer) => {
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

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.CodeBlock {
        return java.codeblock((writer) => {
            writer.writeNode(this.context.getRootClientClassReference());
            writer.write(` ${CLIENT_VAR_NAME} = `);
            writer.writeNode(
                java.TypeLiteral.builder({
                    classReference: this.context.getRootClientClassReference(),
                    parameters: this.getRootClientBuilderArgs({ endpoint, snippet })
                })
            );
        });
    }

    private buildFullCodeBlock({ body, options }: { body: java.CodeBlock; options: Options }): java.AstNode {
        const config = this.getConfig(options);
        const class_ = java.class_({
            name: config.fullStyleClassName ?? SNIPPET_CLASS_NAME,
            access: java.Access.Public
        });
        const stringArgs = java.parameter({
            name: SNIPPET_METHOD_ARG,
            type: java.Type.array(java.Type.string())
        });
        class_.addMethod(
            java.method({
                name: SNIPPET_METHOD_NAME,
                access: java.Access.Public,
                static_: true,
                parameters: [stringArgs],
                body
            })
        );
        return class_;
    }

    private getRootClientBuilderArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.BuilderParameter[] {
        const builderArgs: java.BuilderParameter[] = [];
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                builderArgs.push(...this.getRootClientAuthArgs({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }
        const baseUrlArg = this.getRootClientBaseUrlArg({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArg != null) {
            builderArgs.push(baseUrlArg);
        }
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            builderArgs.push(
                ...this.getRootClientHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();

        const usedVariables = new Set<string>();
        const allPathParams = [...(this.context.ir.pathParameters ?? []), ...(endpoint.request.pathParameters ?? [])];

        allPathParams.forEach((param) => {
            if (param.variable != null) {
                usedVariables.add(param.variable);
            }
        });

        if (this.context.ir.variables != null && this.context.ir.variables.length > 0) {
            for (const variable of this.context.ir.variables) {
                if (usedVariables.has(variable.id)) {
                    const variableName = variable.name.camelCase.unsafeName;
                    builderArgs.push({
                        name: variableName,
                        value: java.TypeLiteral.string(`YOUR_${variable.name.screamingSnakeCase.unsafeName}`)
                    });
                }
            }
        }

        this.context.errors.scope(Scope.PathParameters);
        if (this.context.ir.pathParameters != null && this.context.ir.pathParameters.length > 0) {
            const apiPathParams = this.context.ir.pathParameters.filter((param) => param.variable == null);
            if (apiPathParams.length > 0) {
                builderArgs.push(...this.getPathParameters({ namedParameters: apiPathParams, snippet }));
            }
        }
        this.context.errors.unscope();

        return builderArgs;
    }

    private getRootClientBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): java.BuilderParameter | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            if (this.context.ir.environments?.environments.type === "multipleBaseUrls") {
                this.context.errors.add({
                    severity: Severity.Critical,
                    message: "The Java SDK doesn't support a baseUrl when multiple URL environments are configured"
                });
                return undefined;
            }
            return {
                name: "url",
                value: java.TypeLiteral.string(baseUrl)
            };
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const classReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (classReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return undefined;
                }
                return {
                    name: "environment",
                    value: java.TypeLiteral.reference(classReference)
                };
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return undefined;
                }
                return {
                    name: "environment",
                    value: java.TypeLiteral.reference(
                        java.instantiateClass({
                            classReference: this.context.getEnvironmentClassReference(),
                            arguments_: Object.values(environment).map((value) =>
                                this.context.dynamicTypeLiteralMapper.convert({
                                    typeReference: STRING_TYPE_REFERENCE,
                                    value
                                })
                            )
                        })
                    )
                };
            }
        }
        return undefined;
    }

    private getRootClientAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): java.BuilderParameter[] {
        if (values.type !== auth.type) {
            this.addError(this.context.newAuthMismatchError({ auth, values }).message);
            return [];
        }
        switch (auth.type) {
            case "basic":
                return values.type === "basic" ? this.getRootClientBasicAuthArgs({ auth, values }) : [];
            case "bearer":
                return values.type === "bearer" ? this.getRootClientBearerAuthArgs({ auth, values }) : [];
            case "header":
                return values.type === "header" ? this.getRootClientHeaderAuthArgs({ auth, values }) : [];
            case "oauth":
                return values.type === "oauth" ? this.getRootClientOAuthArgs({ auth, values }) : [];
            case "inferred":
                this.addWarning("The Java SDK Generator does not support Inferred auth scheme yet");
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

    private getRootClientBasicAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): java.BuilderParameter[] {
        return [
            {
                name: "credentials",
                value: java.TypeLiteral.raw(`"${values.username}", "${values.password}"`)
            }
        ];
    }

    private getRootClientBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): java.BuilderParameter[] {
        return [
            {
                name: this.context.getMethodName(auth.token),
                value: java.TypeLiteral.string(values.token)
            }
        ];
    }

    private getRootClientHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): java.BuilderParameter[] {
        return [
            {
                name: this.context.getMethodName(auth.header.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value
                })
            }
        ];
    }

    private getRootClientOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth;
        values: FernIr.dynamic.OAuthValues;
    }): java.BuilderParameter[] {
        return [
            {
                name: this.context.getMethodName(auth.clientId),
                value: java.TypeLiteral.string(values.clientId)
            },
            {
                name: this.context.getMethodName(auth.clientSecret),
                value: java.TypeLiteral.string(values.clientSecret)
            }
        ];
    }

    private getRootClientHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): java.BuilderParameter[] {
        const args: java.BuilderParameter[] = [];
        for (const header of headers) {
            const arg = this.getRootClientHeaderArg({ header, value: values.value });
            if (arg != null) {
                args.push({
                    name: this.context.getMethodName(header.name.name),
                    value: arg
                });
            }
        }
        return args;
    }

    private getRootClientHeaderArg({
        header,
        value
    }: {
        header: FernIr.dynamic.NamedParameter;
        value: unknown;
    }): java.TypeLiteral | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (java.TypeLiteral.isNop(typeLiteral)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return typeLiteral;
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.MethodInvocation {
        return java.invokeMethod({
            on: java.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet })
        });
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.TypeLiteral[] {
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
    }): java.TypeLiteral[] {
        const args: java.TypeLiteral[] = [];

        this.context.errors.scope(Scope.PathParameters);
        // Only include endpoint-level path parameters that don't reference variables
        // Variables are configured at client level, not passed as method args
        const pathParameters = (request.pathParameters ?? []).filter((param) => param.variable == null);
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

        // For body requests, headers are passed via RequestOptions
        const requestOptionsArg = this.getRequestOptionsArg({ request, snippet });
        if (requestOptionsArg != null) {
            args.push(requestOptionsArg);
        }

        return args;
    }

    private usesOptionalNullable(): boolean {
        return this.context.customConfig?.["collapse-optional-nullable"] === true;
    }

    private getBodyRequestArg({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): java.TypeLiteral {
        switch (body.type) {
            case "bytes": {
                return this.getBytesBodyRequestArg({ value });
            }
            case "typeReference": {
                if (body.value.type === "optional") {
                    // TODO(amckinney): This endpoint defines an optional request body, so the
                    // Java SDK requires the Optional.of(...) wrapper.
                    //
                    // We should fix the generator to permit the non-Optional type and
                    // remove this special case.

                    // Check if value is undefined/null and use Optional.empty() or OptionalNullable.absent()
                    if (value === undefined || value === null) {
                        if (this.usesOptionalNullable()) {
                            return this.context.getOptionalNullableAbsent();
                        } else {
                            return java.TypeLiteral.reference(
                                java.invokeMethod({
                                    on: java.classReference({
                                        name: "Optional",
                                        packageName: "java.util"
                                    }),
                                    method: "empty",
                                    arguments_: []
                                })
                            );
                        }
                    }

                    const convertedValue = this.context.dynamicTypeLiteralMapper.convert({
                        typeReference: body.value.value,
                        value,
                        as: "request"
                    });

                    // Check if the converted value is already Optional.empty() to avoid double-wrapping
                    const convertedValueStr = convertedValue.toString({
                        packageName: "com.example",
                        customConfig: this.context.customConfig
                    });

                    if (convertedValueStr.includes("Optional.empty()")) {
                        return convertedValue;
                    }

                    if (this.usesOptionalNullable()) {
                        return this.context.getOptionalNullableOf(convertedValue);
                    } else {
                        return java.TypeLiteral.optional({
                            value: convertedValue,
                            useOf: true
                        });
                    }
                }
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    as: "request"
                });
            }
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): java.TypeLiteral {
        if (value === undefined || value === null) {
            return java.TypeLiteral.bytes("");
        }
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return java.TypeLiteral.nop();
        }
        return java.TypeLiteral.bytes(value as string);
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.TypeLiteral[] {
        const args: java.TypeLiteral[] = [];

        const { inlinePathParameters, inlineFileProperties } = {
            inlinePathParameters: this.context.shouldInlinePathParameters(),
            inlineFileProperties: this.context.shouldInlineFileProperties()
        };

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: java.BuilderParameter[] = [];
        // Only include endpoint-level path parameters that don't reference variables
        const nonVariablePathParams = (request.pathParameters ?? []).filter((param) => param.variable == null);
        if (nonVariablePathParams.length > 0) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: nonVariablePathParams, snippet }));
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (
            !this.context.includePathParametersInWrappedRequest({
                request,
                inlinePathParameters
            })
        ) {
            args.push(...pathParameterFields.map((field) => field.value));
        }

        // For now, the Java SDK always includes file properties as positional parameters.
        if (!inlineFileProperties) {
            args.push(...filePropertyInfo.fileFields.map((field) => field.value));
        }

        // For now, the Java SDK always requires the inlined request parameter.
        args.push(
            this.getInlinedRequestArg({
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
        pathParameterFields: java.BuilderParameter[];
        filePropertyInfo: FilePropertyInfo;
    }): java.TypeLiteral {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const filteredQueryParameters = queryParameters.filter(
            (queryParameter) => !this.context.isDirectLiteral(queryParameter.typeReference)
        );
        const sortedQueryParameters = this.context.sortTypeInstancesByRequiredFirst(
            filteredQueryParameters,
            request.queryParameters ?? []
        );
        const queryParameterFields = sortedQueryParameters.map((queryParameter) => ({
            name: this.context.getMethodName(queryParameter.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({
                typeReference: queryParameter.typeReference,
                value: queryParameter.value,
                as: "request"
            })
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const filteredHeaders = headers.filter((header) => !this.context.isDirectLiteral(header.typeReference));
        const sortedHeaders = this.context.sortTypeInstancesByRequiredFirst(filteredHeaders, request.headers ?? []);
        const headerFields = sortedHeaders.map((header) => ({
            name: this.context.getMethodName(header.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({
                typeReference: header.typeReference,
                value: header.value,
                as: "request"
            })
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyBuilderParameters({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : [];
        this.context.errors.unscope();

        return java.TypeLiteral.builder({
            classReference: java.classReference({
                name: this.context.getClassName(request.declaration.name),
                packageName: this.context.getRequestsPackageName(request.declaration.fernFilepath)
            }),
            parameters: [...pathParameterFields, ...headerFields, ...queryParameterFields, ...requestBodyFields]
        });
    }

    private getRequestOptionsArg({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest | FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.TypeLiteral | undefined {
        const requestHeaders = "headers" in request ? (request.headers ?? []) : [];

        if (requestHeaders.length === 0 || Object.keys(snippet.headers ?? {}).length === 0) {
            return undefined;
        }

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: requestHeaders,
            values: snippet.headers ?? {}
        });
        this.context.errors.unscope();

        if (headers.length === 0) {
            return undefined;
        }

        const requestOptionsClass = java.classReference({
            name: "RequestOptions",
            packageName: this.context.getCorePackageName()
        });

        let builderChain: java.AstNode = java.invokeMethod({
            on: requestOptionsClass,
            method: "builder",
            arguments_: []
        });

        for (const header of headers) {
            builderChain = java.invokeMethod({
                on: builderChain,
                method: "addHeader",
                arguments_: [
                    java.TypeLiteral.string(header.name.wireValue),
                    this.context.dynamicTypeLiteralMapper.convert(header)
                ]
            });
        }

        const buildMethodCall = java.invokeMethod({
            on: builderChain,
            method: "build",
            arguments_: []
        });

        return java.TypeLiteral.reference(buildMethodCall);
    }

    private getInlinedRequestBodyBuilderParameters({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        filePropertyInfo: FilePropertyInfo;
    }): java.BuilderParameter[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyBuilderParameters({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyBuilderParameter({ body, value })];
            case "fileUpload":
                return this.getFileUploadRequestBodyBuilderParameters({ filePropertyInfo });
            default:
                assertNever(body);
        }
    }

    private getFileUploadRequestBodyBuilderParameters({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): java.BuilderParameter[] {
        if (this.context.shouldInlineFileProperties()) {
            return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
        }
        return filePropertyInfo.bodyPropertyFields;
    }

    private getReferencedRequestBodyPropertyBuilderParameter({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): java.BuilderParameter {
        return {
            name: this.context.getMethodName(body.bodyKey),
            value: this.getReferencedRequestBodyPropertyTypeLiteral({ body: body.bodyType, value })
        };
    }

    private getReferencedRequestBodyPropertyTypeLiteral({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): java.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    as: "request"
                });
            default:
                assertNever(body);
        }
    }

    private getInlinedRequestBodyPropertyBuilderParameters({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): java.BuilderParameter[] {
        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        const filteredProperties = bodyProperties.filter(
            (parameter) => !this.context.isDirectLiteral(parameter.typeReference)
        );
        const sortedProperties = this.context.sortTypeInstancesByRequiredFirst(filteredProperties, parameters);
        return sortedProperties.map((parameter) => ({
            name: this.context.getMethodName(parameter.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({
                typeReference: parameter.typeReference,
                value: parameter.value,
                as: "request"
            })
        }));
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): java.BuilderParameter[] {
        const args: java.BuilderParameter[] = [];
        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getMethodName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
            });
        }
        return args;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => `${this.context.getMethodName(val)}()`)
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }

    private getStyle(options: Options): Style {
        return options.style ?? this.context.options.style ?? Style.Full;
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {};
    }
}
