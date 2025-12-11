import { Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AstNode, ts } from "@fern-api/typescript-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const CLIENT_VAR_NAME = "client";
const MAIN_FUNCTION_NAME = "main";
const STRING_TYPE_REFERENCE: FernIr.dynamic.TypeReference = {
    type: "primitive",
    value: "STRING"
};

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
        return await code.toStringAsync({ customConfig: this.context.customConfig });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toString({ customConfig: this.context.customConfig });
    }

    public async generateSnippetAst({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<AstNode> {
        return this.buildCodeBlock({ endpoint, snippet: request });
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.function_({
                    name: MAIN_FUNCTION_NAME,
                    async: true,
                    parameters: [],
                    body: ts.codeblock((writer) => {
                        writer.writeNodeStatement(this.constructClient({ endpoint, snippet }));
                        writer.writeNodeStatement(this.callMethod({ endpoint, snippet }));
                    })
                })
            );
            writer.writeNodeStatement(
                ts.invokeFunction({
                    function_: ts.reference({
                        name: MAIN_FUNCTION_NAME
                    }),
                    arguments_: []
                })
            );
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.variable({
            name: CLIENT_VAR_NAME,
            const: true,
            initializer: ts.instantiateClass({
                class_: ts.reference({
                    name: this.context.getRootClientName(),
                    importFrom: this.context.getModuleImport()
                }),
                arguments_: [this.getConstructorArgs({ endpoint, snippet })]
            })
        });
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        const fields: ts.ObjectField[] = [];
        const environmentArgs = this.getConstructorEnvironmentArgs({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (environmentArgs.length > 0) {
            fields.push(...environmentArgs);
        }
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                fields.push(...this.getConstructorAuthArgs({ auth: endpoint.auth, values: snippet.auth }));
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                });
            }
        }

        this.context.errors.scope(Scope.PathParameters);
        if (this.context.ir.pathParameters != null) {
            fields.push(...this.getPathParameters({ namedParameters: this.context.ir.pathParameters, snippet }));
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            fields.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            );
        }
        this.context.errors.unscope();
        if (fields.length === 0) {
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.object({ fields });
    }

    private getConstructorEnvironmentArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ts.ObjectField[] {
        const environmentValue = this.getEnvironmentValue({ baseUrl, environment });
        if (environmentValue == null) {
            return [];
        }
        return [
            {
                name: "environment",
                value: environmentValue
            }
        ];
    }

    private getEnvironmentValue({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): ts.TypeLiteral | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            return ts.TypeLiteral.string(baseUrl);
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const environmentTypeReference = this.context.getEnvironmentTypeReferenceFromID(environment);
                if (environmentTypeReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return undefined;
                }
                return ts.TypeLiteral.reference(environmentTypeReference);
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return undefined;
                }
                return ts.TypeLiteral.object({
                    fields: Object.entries(environment).map(([key, value]) => ({
                        name: key,
                        value: this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: STRING_TYPE_REFERENCE,
                            value
                        })
                    }))
                });
            }
        }
        return undefined;
    }

    private getConstructorAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): ts.ObjectField[] {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.addAuthMismatchError(auth, values);
                    return [];
                }
                return this.getConstructorBasicAuthArg({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.addAuthMismatchError(auth, values);
                    return [];
                }
                return this.getConstructorBearerAuthArgs({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.addAuthMismatchError(auth, values);
                    return [];
                }
                return this.getConstructorHeaderAuthArgs({ auth, values });
            case "oauth":
                if (values.type !== "oauth") {
                    this.addAuthMismatchError(auth, values);
                    return [];
                }
                return this.getConstructorOAuthArgs({ auth, values });
            case "inferred":
                if (values.type !== "inferred") {
                    this.addAuthMismatchError(auth, values);
                    return [];
                }
                this.addWarning("The TypeScript SDK v2 Generator does not support Inferred auth scheme yet");
                return [];
            default:
                assertNever(auth);
        }
    }

    private addAuthMismatchError(auth: FernIr.dynamic.Auth, values: FernIr.dynamic.AuthValues): void {
        this.context.errors.add({
            severity: Severity.Critical,
            message: this.context.newAuthMismatchError({ auth, values }).message
        });
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
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.username),
                value: ts.TypeLiteral.string(values.username)
            },
            {
                name: this.context.getPropertyName(auth.password),
                value: ts.TypeLiteral.string(values.password)
            }
        ];
    }

    private getConstructorBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.token),
                value: ts.TypeLiteral.string(values.token)
            }
        ];
    }

    private getConstructorHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.header.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
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
    }): ts.ObjectField[] {
        return [
            {
                name: this.context.getPropertyName(auth.clientId),
                value: ts.TypeLiteral.string(values.clientId)
            },
            {
                name: this.context.getPropertyName(auth.clientSecret),
                value: ts.TypeLiteral.string(values.clientSecret)
            }
        ];
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): ts.ObjectField[] {
        const fields: ts.ObjectField[] = [];
        for (const header of headers) {
            const field = this.getConstructorHeaderArg({ header, value: values.value });
            if (field != null) {
                fields.push(field);
            }
        }
        return fields;
    }

    private getConstructorHeaderArg({
        header,
        value
    }: {
        header: FernIr.dynamic.NamedParameter;
        value: unknown;
    }): ts.ObjectField | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (ts.TypeLiteral.isNop(typeLiteral)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return {
            name: this.context.getPropertyName(header.name.name),
            value: typeLiteral
        };
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.invokeMethod({
            on: ts.reference({ name: CLIENT_VAR_NAME }),
            method: this.getMethod({ endpoint }),
            async: true,
            arguments_: this.getMethodArgs({ endpoint, snippet })
        });
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode[] {
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
    }): ts.TypeLiteral[] {
        const args: ts.TypeLiteral[] = [];

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
    }): ts.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    convertOpts: {
                        isForRequest: true
                    }
                });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): ts.TypeLiteral {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.blob(value);
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.TypeLiteral[] {
        const args: ts.TypeLiteral[] = [];

        const { inlinePathParameters, inlineFileProperties } = {
            inlinePathParameters: this.context.customConfig?.inlinePathParameters ?? false,
            inlineFileProperties: this.context.customConfig?.inlineFileProperties ?? false
        };

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: ts.ObjectField[] = [];
        if (request.pathParameters != null) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: request.pathParameters, snippet }));
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

        if (!inlineFileProperties) {
            args.push(...filePropertyInfo.fileFields.map((field) => field.value));
        }

        if (
            this.context.needsRequestParameter({
                request,
                inlinePathParameters,
                inlineFileProperties
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
        pathParameterFields: ts.ObjectField[];
        filePropertyInfo: FilePropertyInfo;
    }): ts.TypeLiteral {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const queryParameterFields = queryParameters.map((queryParameter) => ({
            name: this.context.getPropertyName(queryParameter.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({
                ...queryParameter,
                convertOpts: { isForRequest: true }
            })
        }));
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const headerFields = headers.map((header) => ({
            name: this.context.getPropertyName(header.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert({ ...header, convertOpts: { isForRequest: true } })
        }));
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

        return ts.TypeLiteral.object({
            fields: [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields]
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
    }): ts.ObjectField[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyObjectFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyObjectField({ body, value })];
            case "fileUpload":
                return this.getFileUploadRequestBodyObjectFields({ filePropertyInfo });
            default:
                assertNever(body);
        }
    }

    private getFileUploadRequestBodyObjectFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): ts.ObjectField[] {
        if (this.context.customConfig?.inlineFileProperties) {
            return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
        }
        return filePropertyInfo.bodyPropertyFields;
    }

    private getReferencedRequestBodyPropertyObjectField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): ts.ObjectField {
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
    }): ts.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: body.value,
                    value,
                    convertOpts: { isForRequest: true }
                });
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
    }): ts.ObjectField[] {
        const fields: ts.ObjectField[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
                    ...parameter,
                    convertOpts: { isForRequest: true }
                })
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
    }): ts.ObjectField[] {
        const args: ts.ObjectField[] = [];

        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {},

            // Path parameters are distributed across the client constructor
            // and the request method, so we ignore missing parameters here.
            ignoreMissingParameters: true
        });
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert({
                    ...parameter,
                    convertOpts: { isForRequest: true }
                })
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
}
