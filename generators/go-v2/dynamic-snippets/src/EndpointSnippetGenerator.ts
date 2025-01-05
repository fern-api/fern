import { AbstractFormatter, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

const SNIPPET_PACKAGE_NAME = "example";
const SNIPPET_IMPORT_PATH = "fern";
const SNIPPET_FUNC_NAME = "do";
const CLIENT_VAR_NAME = "client";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;
    private formatter: AbstractFormatter | undefined;

    constructor({ context, formatter }: { context: DynamicSnippetsGeneratorContext; formatter?: AbstractFormatter }) {
        this.context = context;
        this.formatter = formatter;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return await code.toString({
            packageName: SNIPPET_PACKAGE_NAME,
            importPath: SNIPPET_IMPORT_PATH,
            rootImportPath: this.context.rootImportPath,
            customConfig: this.context.customConfig ?? {},
            formatter: this.formatter
        });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toStringSync({
            packageName: SNIPPET_PACKAGE_NAME,
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
        return go.func({
            name: SNIPPET_FUNC_NAME,
            parameters: [],
            return_: [],
            body: go.codeblock((writer) => {
                writer.writeNode(this.constructClient({ endpoint, snippet }));
                writer.writeLine();
                writer.writeNode(this.callMethod({ endpoint, snippet }));
            })
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

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.MethodInvocation {
        return go.invokeMethod({
            on: go.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: [this.context.getContextTodoFunctionInvocation(), ...this.getMethodArgs({ endpoint, snippet })]
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

    private getConstructorAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): go.AstNode {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return go.TypeInstantiation.nop();
                }
                return this.getConstructorBasicAuthArg({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return go.TypeInstantiation.nop();
                }
                return this.getConstructorBearerAuthArg({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return go.TypeInstantiation.nop();
                }
                return this.getConstructorHeaderAuthArg({ auth, values });
        }
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
    }): go.AstNode[] {
        switch (endpoint.request.type) {
            case "inlined":
                return this.getMethodArgsForInlinedRequest({ request: endpoint.request, snippet });
            case "body":
                return this.getMethodArgsForBodyRequest({ request: endpoint.request, snippet });
        }
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): go.TypeInstantiation[] {
        const args: go.TypeInstantiation[] = [];

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
    }): go.TypeInstantiation {
        switch (body.type) {
            case "bytes": {
                return this.getBytesBodyRequestArg({ value });
            }
            case "typeReference":
                return this.context.dynamicTypeInstantiationMapper.convert({ typeReference: body.value, value });
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
    }): go.TypeInstantiation[] {
        const args: go.TypeInstantiation[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: go.StructField[] = [];
        if (request.pathParameters != null) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: request.pathParameters, snippet }));
        }
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        this.context.errors.unscope();

        if (!this.context.includePathParametersInWrappedRequest({ request })) {
            args.push(...pathParameterFields.map((field) => field.value));
        }

        if (!this.context.customConfig?.inlineFileProperties) {
            args.push(...filePropertyInfo.fileFields.map((field) => field.value));
        }

        if (this.context.needsRequestParameter({ request })) {
            args.push(
                this.getInlinedRequestArg({
                    request,
                    snippet,
                    pathParameterFields: this.context.includePathParametersInWrappedRequest({ request })
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
                importPath: this.context.getImportPath(request.declaration.fernFilepath)
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
                value: this.context.dynamicTypeInstantiationMapper.convert(parameter)
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

    private newAuthMismatchError({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): Error {
        return new Error(`Expected auth type ${auth.type}, got ${values.type}`);
    }
}
