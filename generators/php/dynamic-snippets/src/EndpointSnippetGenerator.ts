import { NamedArgument, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { php } from "@fern-api/php-codegen";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const CLIENT_VAR_NAME = "$client";
const SNIPPET_NAMESPACE = "Example";
const PHP_PREFIX = "<?php\n\n";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return (
            PHP_PREFIX +
            (await code.toStringAsync({
                namespace: SNIPPET_NAMESPACE,
                rootNamespace: SNIPPET_NAMESPACE,
                customConfig: this.context.customConfig ?? {}
            }))
        );
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return (
            PHP_PREFIX +
            code.toString({
                namespace: SNIPPET_NAMESPACE,
                rootNamespace: SNIPPET_NAMESPACE,
                customConfig: this.context.customConfig ?? {}
            })
        );
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): php.AstNode {
        return php.codeblock((writer) => {
            writer.writeNodeStatement(this.constructClient({ endpoint, snippet }));
            writer.writeNodeStatement(this.callMethod({ endpoint, snippet }));
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write(`${CLIENT_VAR_NAME} = `);
            writer.writeNode(this.getRootClientClassInstantiation(this.getConstructorArgs({ endpoint, snippet })));
        });
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): php.MethodInvocation {
        return php.invokeMethod({
            on: php.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet }),
            multiline: true
        });
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
        const optionArgs: php.ConstructorField[] = [];
        const baseUrlArgs = this.getConstructorBaseUrlArgs({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArgs.length > 0) {
            optionArgs.push(...baseUrlArgs);
        }
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            optionArgs.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();

        if (optionArgs.length === 0) {
            return authArgs;
        }
        return [
            ...authArgs,
            {
                name: "options",
                assignment: php.TypeLiteral.map({
                    entries: optionArgs.map((arg) => ({
                        key: php.TypeLiteral.string(arg.name),
                        value: arg.value
                    }))
                })
            }
        ];
    }

    private getConstructorAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): NamedArgument[] {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorBasicAuthArgs({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorBearerAuthArgs({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return [];
                }
                return this.getConstructorHeaderAuthArgs({ auth, values });
            default:
                assertNever(auth);
        }
    }

    private getConstructorBasicAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): NamedArgument[] {
        return [
            {
                name: this.context.getPropertyName(auth.username),
                assignment: php.TypeLiteral.string(values.username)
            },
            {
                name: this.context.getPropertyName(auth.password),
                assignment: php.TypeLiteral.string(values.password)
            }
        ];
    }

    private getConstructorBaseUrlArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): php.ConstructorField[] {
        const baseUrlArg = this.getBaseUrlArg({ baseUrl, environment });
        if (php.TypeLiteral.isNop(baseUrlArg)) {
            return [];
        }
        return [
            {
                name: "baseUrl",
                value: baseUrlArg
            }
        ];
    }

    private getBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): php.TypeLiteral {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return php.TypeLiteral.nop();
        }
        if (baseUrl != null) {
            return php.TypeLiteral.string(baseUrl);
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const classReference = this.context.getEnvironmentClassAccessFromID(environment);
                if (classReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return php.TypeLiteral.nop();
                }
                return php.TypeLiteral.reference(
                    php.codeblock((writer) => {
                        writer.writeNode(classReference);
                        writer.write("->value");
                    })
                );
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message:
                        "The PHP SDK doesn't support a multi-environment client option yet; use the baseUrl option instead"
                });
            }
        }
        return php.TypeLiteral.nop();
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
                name: this.context.getPropertyName(auth.token),
                assignment: php.TypeLiteral.string(values.token)
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
                name: this.context.getPropertyName(auth.header.name.name),
                assignment: this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value
                })
            }
        ];
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): php.ConstructorField[] {
        const args: php.ConstructorField[] = [];
        for (const header of headers) {
            const arg = this.getConstructorHeaderArg({ header, value: values.value });
            if (arg != null) {
                args.push({
                    name: this.context.getPropertyName(header.name.name),
                    value: arg
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
    }): php.TypeLiteral | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (php.TypeLiteral.isNop(typeLiteral)) {
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
    }): php.TypeLiteral[] {
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
    }): php.TypeLiteral[] {
        const args: php.TypeLiteral[] = [];

        this.context.errors.scope(Scope.PathParameters);
        if (request.pathParameters != null) {
            const pathParameterFields = this.getPathParameters({ namedParameters: request.pathParameters, snippet });
            args.push(...pathParameterFields.map((field) => field.value));
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
    }): php.TypeLiteral {
        switch (body.type) {
            case "bytes": {
                return this.getBytesBodyRequestArg({ value });
            }
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): php.TypeLiteral {
        this.context.errors.add({
            severity: Severity.Critical,
            message: "The PHP SDK doesn't support bytes requests yet"
        });
        return php.TypeLiteral.nop();
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): php.TypeLiteral[] {
        const args: php.TypeLiteral[] = [];

        // TODO: Add support for inlinePathParameters, when available.
        const inlinePathParameters = false;

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: php.ConstructorField[] = [];
        if (request.pathParameters != null) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: request.pathParameters, snippet }));
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (!this.context.includePathParametersInWrappedRequest({ request, inlinePathParameters })) {
            args.push(...pathParameterFields.map((field) => field.value));
        }

        if (
            this.context.needsRequestParameter({
                request,
                inlinePathParameters,
                inlineFileProperties: true // The PHP SDK requires inlineFileProperties.
            })
        ) {
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
        pathParameterFields: php.ConstructorField[];
        filePropertyInfo: FilePropertyInfo;
    }): php.TypeLiteral {
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
            value: this.context.dynamicTypeLiteralMapper.convert(header)
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

        return php.TypeLiteral.class_({
            reference: php.classReference({
                name: this.context.getClassName(request.declaration.name),
                namespace: this.context.getRequestNamespace(request.declaration.fernFilepath)
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
    }): php.ConstructorField[] {
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

    private getFileUploadRequestBodyConstructorFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): php.ConstructorField[] {
        return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
    }

    private getReferencedRequestBodyPropertyConstructorField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): php.ConstructorField {
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
    }): php.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
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
    }): php.ConstructorField[] {
        const fields: php.ConstructorField[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
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
    }): php.ConstructorField[] {
        const args: php.ConstructorField[] = [];

        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
            });
        }

        return args;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getPropertyName(val))
                .join("->")}->${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }

    private getRootClientClassInstantiation(arguments_: NamedArgument[]): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: php.classReference({
                name: this.context.getRootClientClassName(),
                namespace: this.context.rootNamespace
            }),
            arguments_,
            multiline: true
        });
    }
}
