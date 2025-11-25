import { AbstractAstNode, NamedArgument, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
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

    public async generateSnippetAst({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<AbstractAstNode> {
        return this.buildCodeBlock({ endpoint, snippet: request });
    }

    public buildCodeBlock({
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

        const hasMultiUrlEnvironments = this.context.ir.environments?.environments.type === "multipleBaseUrls";
        const environmentArg = this.getConstructorEnvironmentArg({
            environment: snippet.environment,
            hasMultiUrlEnvironments
        });

        const optionArgs: php.ConstructorField[] = [];

        if (!hasMultiUrlEnvironments) {
            const baseUrlArgs = this.getConstructorBaseUrlArgs({
                baseUrl: snippet.baseURL,
                environment: snippet.environment
            });
            if (baseUrlArgs.length > 0) {
                optionArgs.push(...baseUrlArgs);
            }
        }

        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            optionArgs.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();

        const args: NamedArgument[] = [...authArgs];

        if (environmentArg != null) {
            args.push(environmentArg);
        }

        if (optionArgs.length > 0) {
            args.push({
                name: "options",
                assignment: php.TypeLiteral.map({
                    entries: optionArgs.map((arg) => ({
                        key: php.TypeLiteral.string(arg.name),
                        value: arg.value
                    }))
                })
            });
        }

        return args;
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
                return values.type === "basic" ? this.getConstructorBasicAuthArgs({ auth, values }) : [];
            case "bearer":
                return values.type === "bearer" ? this.getConstructorBearerAuthArgs({ auth, values }) : [];
            case "header":
                return values.type === "header" ? this.getConstructorHeaderAuthArgs({ auth, values }) : [];
            case "oauth":
                return values.type === "oauth" ? this.getConstructorOAuthArgs({ auth, values }) : [];
            case "inferred":
                this.addWarning("The PHP SDK Generator does not support Inferred auth scheme yet");
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

    private getConstructorEnvironmentArg({
        environment,
        hasMultiUrlEnvironments
    }: {
        environment: FernIr.dynamic.EnvironmentValues | undefined;
        hasMultiUrlEnvironments: boolean;
    }): NamedArgument | undefined {
        if (!hasMultiUrlEnvironments) {
            return undefined;
        }

        const environmentClassRef = this.context.getEnvironmentsClassReference();

        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const environmentName = this.context.resolveEnvironmentName(environment);
                if (environmentName == null) {
                    this.addWarning(`Environment "${environment}" was not found`);
                    return undefined;
                }
                const className = this.context.getClassName(environmentName);
                return {
                    name: "environment",
                    assignment: php.TypeLiteral.reference(
                        php.codeblock((writer) => {
                            writer.writeNode(environmentClassRef);
                            writer.write(`::`);
                            writer.write(className);
                            writer.write(`()`);
                        })
                    )
                };
            }

            if (this.context.isMultiEnvironmentValues(environment)) {
                const result = this.resolveMultiEnvironmentName(environment);
                if (result == null) {
                    this.addWarning("Invalid multi url environment");
                    return undefined;
                }
                if (result.type === "named") {
                    return {
                        name: "environment",
                        assignment: php.TypeLiteral.reference(
                            php.codeblock((writer) => {
                                writer.writeNode(environmentClassRef);
                                writer.write(`::`);
                                writer.write(result.name);
                                writer.write(`()`);
                            })
                        )
                    };
                } else {
                    return {
                        name: "environment",
                        assignment: php.TypeLiteral.reference(
                            php.codeblock((writer) => {
                                writer.writeNode(environmentClassRef);
                                writer.write(`::custom(`);
                                const entries = Object.entries(result.urls);
                                entries.forEach(([paramName, url], index) => {
                                    writer.write(`${paramName}: '${url}'`);
                                    if (index < entries.length - 1) {
                                        writer.write(`, `);
                                    }
                                });
                                writer.write(`)`);
                            })
                        )
                    };
                }
            }
        }

        const defaultName = this.getDefaultEnvironmentName();
        if (defaultName == null) {
            return undefined;
        }

        return {
            name: "environment",
            assignment: php.TypeLiteral.reference(
                php.codeblock((writer) => {
                    writer.writeNode(environmentClassRef);
                    writer.write(`::`);
                    writer.write(defaultName);
                    writer.write(`()`);
                })
            )
        };
    }

    private getDefaultEnvironmentName(): string | undefined {
        if (this.context.ir.environments?.environments.type !== "multipleBaseUrls") {
            return undefined;
        }

        const environmentsConfig = this.context.ir.environments.environments;
        if (environmentsConfig.type !== "multipleBaseUrls") {
            return undefined;
        }

        const environments = environmentsConfig.environments;
        if (environments.length === 0) {
            return undefined;
        }

        for (const env of environments) {
            const className = this.context.getClassName(env.name);
            if (className === "Production") {
                return className;
            }
        }

        const firstEnv = environments[0];
        if (firstEnv == null) {
            return undefined;
        }
        return this.context.getClassName(firstEnv.name);
    }

    private resolveMultiEnvironmentName(
        environment: FernIr.dynamic.MultipleEnvironmentUrlValues
    ): { type: "named"; name: string } | { type: "custom"; urls: Record<string, string> } | undefined {
        const baseUrlIds = Object.keys(environment);
        if (baseUrlIds.length === 0) {
            return undefined;
        }

        const firstBaseUrlId = baseUrlIds[0];
        if (firstBaseUrlId == null) {
            return undefined;
        }

        const firstBaseUrlValue = environment[firstBaseUrlId];
        if (firstBaseUrlValue == null) {
            return undefined;
        }

        if (this.context.isSingleEnvironmentID(firstBaseUrlValue)) {
            const environmentName = this.context.resolveEnvironmentName(firstBaseUrlValue);
            if (environmentName == null) {
                return undefined;
            }

            const allSameEnvironment = baseUrlIds.every((baseUrlId) => {
                const value = environment[baseUrlId];
                return value != null && this.context.isSingleEnvironmentID(value) && value === firstBaseUrlValue;
            });

            if (allSameEnvironment) {
                return { type: "named", name: this.context.getClassName(environmentName) };
            }
        }

        const urls: Record<string, string> = {};
        let hasAnyLiteralUrl = false;
        for (const baseUrlId of baseUrlIds) {
            const value = environment[baseUrlId];
            if (value == null) {
                continue;
            }
            if (!this.context.isSingleEnvironmentID(value)) {
                hasAnyLiteralUrl = true;
                const paramName = this.getBaseUrlPropertyName(baseUrlId);
                urls[paramName] = value;
            }
        }

        if (hasAnyLiteralUrl && Object.keys(urls).length > 0) {
            return { type: "custom", urls };
        }

        return undefined;
    }

    private getBaseUrlPropertyName(baseUrlId: string): string {
        if (this.context.ir.environments?.environments.type !== "multipleBaseUrls") {
            return baseUrlId;
        }

        const environmentsConfig = this.context.ir.environments.environments;
        if (environmentsConfig.type !== "multipleBaseUrls") {
            return baseUrlId;
        }

        const baseUrl = environmentsConfig.baseUrls.find((url) => url.id === baseUrlId);
        if (baseUrl == null) {
            return baseUrlId;
        }

        return baseUrl.name.camelCase.safeName;
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
            if (this.context.ir.environments?.environments.type === "multipleBaseUrls") {
                return php.TypeLiteral.nop();
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

    private getConstructorOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth;
        values: FernIr.dynamic.OAuthValues;
    }): NamedArgument[] {
        return [
            {
                name: this.context.getPropertyName(auth.clientId),
                assignment: php.TypeLiteral.string(values.clientId)
            },
            {
                name: this.context.getPropertyName(auth.clientSecret),
                assignment: php.TypeLiteral.string(values.clientSecret)
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

        const inlinePathParameters = this.context.customConfig?.inlinePathParameters ?? false;

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: php.ConstructorField[] = [];
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: pathParameters, snippet }));
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
