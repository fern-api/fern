import { Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const STRING_TYPE_REFERENCE: FernIr.dynamic.TypeReference = {
    type: "primitive",
    value: "STRING"
};
const SNIPPET_MODULE_PATH = ["example"];
const CLIENT_VAR_NAME = "client";
const REQUEST_BODY_ARG_NAME = "request";

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
        const file = this.buildPythonFile({ endpoint, snippet: request });
        return file.toString();
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const file = this.buildPythonFile({ endpoint, snippet: request });
        return file.toString();
    }

    private buildPythonFile({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): python.PythonFile {
        return python.file({
            path: SNIPPET_MODULE_PATH,
            statements: [this.constructClient({ endpoint, snippet }), this.callMethod({ endpoint, snippet })]
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): python.AstNode {
        return python.assign({
            lhs: python.reference({ name: CLIENT_VAR_NAME }),
            rhs: python.instantiateClass({
                classReference: this.context.getRootClientClassReference(),
                arguments_: this.getConstructorArgs({ endpoint, snippet }).map((arg) =>
                    python.methodArgument({
                        name: arg.name,
                        value: arg.value
                    })
                ),
                multiline: true
            })
        });
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): python.NamedValue[] {
        const fields: python.NamedValue[] = [];
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
        return fields;
    }

    private getConstructorEnvironmentArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): python.NamedValue[] {
        const environmentValue = this.getEnvironmentValue({ baseUrl, environment });
        if (environmentValue == null) {
            return [];
        }

        if (environment != null && this.context.isMultiEnvironmentValues(environment)) {
            return [
                {
                    name: "environment",
                    value: environmentValue
                }
            ];
        }

        return [
            {
                name: this.getEnvironmentOptionName({ environment }),
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
    }): python.TypeInstantiation | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            return python.TypeInstantiation.str(baseUrl);
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
                return python.TypeInstantiation.reference(environmentTypeReference);
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return undefined;
                }
                return python.TypeInstantiation.reference(
                    python.instantiateClass({
                        classReference: this.context.getEnvironmentClassReference(),
                        arguments_: Object.entries(environment)
                            .map(([key, value]) => ({
                                name: key,
                                value: this.context.dynamicTypeLiteralMapper.convert({
                                    typeReference: STRING_TYPE_REFERENCE,
                                    value
                                })
                            }))
                            .map((arg) =>
                                python.methodArgument({
                                    name: arg.name,
                                    value: arg.value
                                })
                            ),
                        multiline: true
                    })
                );
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
    }): python.NamedValue[] {
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
                this.addWarning("The Python SDK Generator does not support Inferred auth scheme yet");
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
    }): python.NamedValue[] {
        return [
            {
                name: this.context.getPropertyName(auth.username),
                value: python.TypeInstantiation.str(values.username)
            },
            {
                name: this.context.getPropertyName(auth.password),
                value: python.TypeInstantiation.str(values.password)
            }
        ];
    }

    private getConstructorBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): python.NamedValue[] {
        return [
            {
                name: this.context.getPropertyName(auth.token),
                value: python.TypeInstantiation.str(values.token)
            }
        ];
    }

    private getConstructorHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): python.NamedValue[] {
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
    }): python.NamedValue[] {
        return [
            {
                name: this.context.getPropertyName(auth.clientId),
                value: python.TypeInstantiation.str(values.clientId)
            },
            {
                name: this.context.getPropertyName(auth.clientSecret),
                value: python.TypeInstantiation.str(values.clientSecret)
            }
        ];
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): python.NamedValue[] {
        const fields: python.NamedValue[] = [];
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
    }): python.NamedValue | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (python.TypeInstantiation.isNop(typeLiteral)) {
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
    }): python.AstNode {
        return python.invokeMethod({
            on: python.reference({ name: CLIENT_VAR_NAME }),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet }).map((arg) =>
                python.methodArgument({
                    name: arg.name,
                    value: arg.value
                })
            ),
            multiline: true
        });
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): python.NamedValue[] {
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
    }): python.NamedValue[] {
        const args: python.NamedValue[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];

        // Get body property names to check for collisions
        let bodyPropertyNames: Set<string> = new Set();
        if (request.body != null) {
            const bodyArgs = this.getBodyRequestArgs({ body: request.body, value: snippet.requestBody });
            bodyPropertyNames = new Set(bodyArgs.map(arg => arg.name));
        }

        // Add path parameters, adding underscore suffix if they collide with body properties
        if (pathParameters.length > 0) {
            const pathArgs = this.getPathParameters({ namedParameters: pathParameters, snippet });
            const disambiguatedPathArgs = pathArgs.map(arg => {
                // If this path parameter name collides with a body property, add underscore suffix
                if (bodyPropertyNames.has(arg.name)) {
                    return { ...arg, name: arg.name + "_" };
                }
                return arg;
            });
            args.push(...disambiguatedPathArgs);
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        if (request.body != null) {
            args.push(...this.getBodyRequestArgs({ body: request.body, value: snippet.requestBody }));
        }
        this.context.errors.unscope();

        return args;
    }

    private getBodyRequestArgs({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): python.NamedValue[] {
        switch (body.type) {
            case "bytes":
                return [
                    {
                        name: REQUEST_BODY_ARG_NAME,
                        value: this.getBytesBodyRequestTypeInstantiation({ value })
                    }
                ];
            case "typeReference":
                return this.getBodyRequestArgsForTypeReference({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getBodyRequestArgsForTypeReference({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): python.NamedValue[] {
        switch (typeReference.type) {
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return [];
                }
                return this.getBodyRequestArgsForNamedTypeReference({ typeReference, named, value });
            }
            case "nullable":
            case "optional":
                return this.getBodyRequestArgsForTypeReference({ typeReference: typeReference.value, value });
            case "list":
            case "map":
            case "set":
            case "literal":
            case "primitive":
            case "unknown":
                return [
                    {
                        name: REQUEST_BODY_ARG_NAME,
                        value: this.context.dynamicTypeLiteralMapper.convert({ typeReference, value })
                    }
                ];
            default:
                assertNever(typeReference);
        }
    }

    private getBodyRequestArgsForNamedTypeReference({
        typeReference,
        named,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        named: FernIr.dynamic.NamedType;
        value: unknown;
    }): python.NamedValue[] {
        switch (named.type) {
            case "alias":
                return this.getBodyRequestArgsForTypeReference({ typeReference: named.typeReference, value });
            case "enum":
            case "discriminatedUnion":
            case "undiscriminatedUnion":
                return [
                    {
                        name: REQUEST_BODY_ARG_NAME,
                        value: this.context.dynamicTypeLiteralMapper.convert({ typeReference, value })
                    }
                ];
            case "object": {
                const bodyProperties = this.context.associateByWireValue({
                    parameters: named.properties,
                    values: this.context.getRecord(value) ?? {}
                });
                return bodyProperties.map((property) => ({
                    name: this.context.getPropertyName(property.name.name),
                    value: this.context.dynamicTypeLiteralMapper.convert(property)
                }));
            }
            default:
                assertNever(named);
        }
    }

    private getBodyRequestArgsForBytes({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): python.NamedValue[] {
        const typeInstantiation = this.getBytesBodyRequestTypeInstantiation({ value });
        if (python.TypeInstantiation.isNop(typeInstantiation)) {
            return [];
        }
        return [
            {
                name: this.context.getPropertyName(body.bodyKey),
                value: typeInstantiation
            }
        ];
    }

    private getBytesBodyRequestTypeInstantiation({ value }: { value: unknown }): python.TypeInstantiation {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return python.TypeInstantiation.nop();
        }
        return python.TypeInstantiation.bytes(value);
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): python.NamedValue[] {
        const args: python.NamedValue[] = [];

        const inlinePathParameters = this.context.shouldInlinePathParameters();

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: python.NamedValue[] = [];
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
            args.push(...pathParameterFields);
        }

        if (
            this.context.needsRequestParameter({
                request,
                inlinePathParameters,
                inlineFileProperties: true
            })
        ) {
            args.push(
                ...this.getInlinedRequestArgs({
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

    private getInlinedRequestArgs({
        request,
        snippet,
        pathParameterFields,
        filePropertyInfo
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        pathParameterFields: python.NamedValue[];
        filePropertyInfo: FilePropertyInfo;
    }): python.NamedValue[] {
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
                ? this.getInlinedRequestBodyObjectFields({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : [];
        this.context.errors.unscope();

        return [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields];
    }

    private getInlinedRequestBodyObjectFields({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        filePropertyInfo: FilePropertyInfo;
    }): python.NamedValue[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyObjectFields({ parameters: body.value, value });
            case "referenced":
                return this.getReferencedRequestBodyPropertyTypeInstantiation({ body, value });
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
    }): python.NamedValue[] {
        return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields];
    }

    private getReferencedRequestBodyPropertyTypeInstantiation({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): python.NamedValue[] {
        const bodyType = body.bodyType;
        switch (bodyType.type) {
            case "bytes":
                return this.getBodyRequestArgsForBytes({ body, value });
            case "typeReference":
                return this.getBodyRequestArgsForTypeReference({ typeReference: bodyType.value, value });
            default:
                assertNever(bodyType);
        }
    }

    private getInlinedRequestBodyPropertyObjectFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): python.NamedValue[] {
        const fields: python.NamedValue[] = [];

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
    }): python.NamedValue[] {
        const args: python.NamedValue[] = [];

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
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
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

    private getEnvironmentOptionName({
        environment
    }: {
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): string {
        if (environment != null) {
            return "environment";
        }
        return "base_url";
    }
}
