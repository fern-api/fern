import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbstractFormatter, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { ts } from "@fern-api/typescript-ast";
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
        return await code.toString();
        // {
        //     packageName: SNIPPET_PACKAGE_NAME,
        //     importPath: SNIPPET_IMPORT_PATH,
        //     rootImportPath: this.context.rootImportPath,
        //     customConfig: this.context.customConfig ?? {},
        //     formatter: this.formatter
        // });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toStringSync();

        // return ts.TypeLiteral.string("TODO: Implement me!").toString();
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.AstNode {
        return ts.func({
            name: SNIPPET_FUNC_NAME,
            parameters: [] as ts.Parameter[],
            return_: [] as ts.Type[],
            body: ts.codeblock((writer) => {
                writer.writeNode(this.constructClient({ endpoint, snippet }));
                writer.writeLine();
                writer.writeNode(this.callMethod({ endpoint, snippet }));
            }),
            docs: undefined
        });
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.CodeBlock {
        return ts.codeblock((writer) => {
            writer.write(`const ${CLIENT_VAR_NAME} = `);
            writer.writeNode(this.getRootClientFuncInvocation(this.getConstructorArgs({ endpoint, snippet })));
        });
    }

    private getRootClientFuncInvocation(arguments_: ts.AstNode[]): ts.FunctionInvocation {
        return ts.invokeFunction({
            func: ts.reference({
                name: this.context.getClientConstructorName()
                //importPath: this.context.getClientImportPath()
            }),
            arguments_
        });
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.MethodInvocation {
        return ts.invokeMethod({
            on: ts.reference({ name: CLIENT_VAR_NAME }),
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
    }): ts.AstNode[] {
        const args: ts.AstNode[] = [];
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
            }
        }
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            args.push(...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers }));
        }
        this.context.errors.unscope();
        return args;
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): ts.AstNode[] {
        const args: ts.AstNode[] = [];
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
    }): ts.AstNode | undefined {
        const typeInstantiation = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        });
        if (ts.TypeLiteral.isNop(typeInstantiation)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined;
        }
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.invokeFunction({
                    func: ts.reference({
                        name: `With${header.name.name.pascalCase.unsafeName}`
                        //importFrom: this.context.getOptionImportPath()
                    }),
                    arguments_: [typeInstantiation]
                })
            );
        });
    }

    private getConstructorAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): ts.AstNode {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return ts.TypeLiteral.nop();
                }
                return this.getConstructorBasicAuthArg({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return ts.TypeLiteral.nop();
                }
                return this.getConstructorBearerAuthArg({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.newAuthMismatchError({ auth, values }).message
                    });
                    return ts.TypeLiteral.nop();
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
    }): ts.AstNode {
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.invokeFunction({
                    func: ts.reference({
                        name: "WithBasicAuth"
                        //importFrom: this.context.getOptionImportPath()
                    }),
                    arguments_: [ts.TypeLiteral.string(values.username), ts.TypeLiteral.string(values.password)]
                })
            );
        });
    }

    private getConstructorBearerAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): ts.AstNode {
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.invokeFunction({
                    func: ts.reference({
                        name: `With${auth.token.pascalCase.unsafeName}`
                        //importFrom: this.context.getOptionImportPath()
                    }),
                    arguments_: [ts.TypeLiteral.string(values.token)]
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
    }): ts.AstNode {
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.invokeFunction({
                    func: ts.reference({
                        name: `With${auth.header.name.name.pascalCase.unsafeName}`
                    }),
                    arguments_: [
                        this.context.dynamicTypeLiteralMapper.convert({
                            typeReference: auth.header.typeReference,
                            value: values.value
                        })
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
    }): ts.AstNode | undefined {
        if (baseUrl == null) {
            return undefined;
        }
        return ts.codeblock((writer) => {
            writer.writeNode(
                ts.invokeFunction({
                    func: ts.reference({ name: "withBaseURL" /*importPath: SNIPPET_IMPORT_PATH*/ }),
                    arguments_: [ts.TypeLiteral.string(baseUrl)]
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
    }): ts.AstNode | undefined {
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
                const typeReference = this.context.getEnvironmentTypeReferenceFromID(environment);
            }
        }
        return undefined;
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getMethodName(val))
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
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
        if (request.pathParameters != null) {
            const pathParameterFields = this.getPathParameters({ namedParameters: request.pathParameters, snippet });
            args.push(...pathParameterFields);
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
            case "bytes": {
                return ts.TypeLiteral.string(value as string);
            }
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
        }
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): ts.TypeLiteral[] {
        const args: ts.TypeLiteral[] = [];

        this.context.errors.scope(Scope.PathParameters);
        const pathParameterFields: ts.TypeLiteral[] = [];
        if (request.pathParameters != null) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: request.pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // this.context.errors.scope(Scope.RequestBody);
        // const filePropertyInfo = this.getFilePropertyInfo({ request, snippet });
        // this.context.errors.unscope();

        if (!this.context.includePathParametersInWrappedRequest({ request })) {
            args.push(...pathParameterFields.map((field) => field));
        }

        // if (!this.context.customConfig?.inlineFileProperties) {
        //     args.push(...filePropertyInfo.fileFields.map((field) => field.value));
        // }

        if (this.context.needsRequestParameter({ request })) {
            args.push(
                this.getInlinedRequestArg({
                    request,
                    snippet,
                    pathParameterFields: this.context.includePathParametersInWrappedRequest({ request })
                        ? pathParameterFields
                        : [],
                    filePropertyInfo: undefined
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
    }): ts.TypeLiteral[] {
        const args: ts.TypeLiteral[] = [];

        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push(
                ts.TypeLiteral.objectField(
                    this.context.getTypeName(parameter.name.name),
                    this.context.dynamicTypeLiteralMapper.convert(parameter)
                )
            );
        }

        return args;
    }

    private getInlinedRequestArg({
        request,
        snippet,
        pathParameterFields,
        filePropertyInfo
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        pathParameterFields: ts.TypeLiteral[];
        filePropertyInfo: FilePropertyInfo | undefined;
    }): ts.TypeLiteral {
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        const queryParameterFields = queryParameters.map((queryParameter) =>
            ts.TypeLiteral.objectField(
                queryParameter.name.name.pascalCase.unsafeName,
                this.context.dynamicTypeLiteralMapper.convert(queryParameter)
            )
        );
        this.context.errors.unscope();

        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        const headerFields = headers.map((header) =>
            ts.TypeLiteral.objectField(
                header.name.name.pascalCase.unsafeName,
                this.context.dynamicTypeLiteralMapper.convert(header)
            )
        );
        this.context.errors.unscope();

        this.context.errors.scope(Scope.RequestBody);
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyStructFields({
                      body: request.body,
                      value: snippet.requestBody
                  })
                : [];
        this.context.errors.unscope();

        const fields: Record<string, ts.TypeLiteral> = {};
        [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields].forEach((field) => {
            if (field.internalType.type === "objectField") {
                fields[field.internalType.name] = field.internalType.value;
            }
        });

        return ts.TypeLiteral.object(fields);
    }

    private getInlinedRequestBodyStructFields({
        body,
        value
    }: // filePropertyInfo
    {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
        // filePropertyInfo: FilePropertyInfo | undefined;
    }): ts.TypeLiteral[] {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyStructFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyStructField({ body, value })];
            case "fileUpload":
                return [ts.TypeLiteral.nop()]; // return this.getFileUploadRequestBodyStructFields({ filePropertyInfo });
        }
    }

    private getFileUploadRequestBodyStructFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo;
    }): ts.TypeLiteral[] {
        return [ts.TypeLiteral.nop()];
    }

    private getReferencedRequestBodyPropertyStructField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): ts.TypeLiteral {
        return ts.TypeLiteral.objectField(
            this.context.getTypeName(body.bodyKey),
            this.getReferencedRequestBodyPropertyTypeInstantiation({ body: body.bodyType, value })
        );
    }

    private getReferencedRequestBodyPropertyTypeInstantiation({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): ts.TypeLiteral {
        switch (body.type) {
            case "bytes":
                return ts.TypeLiteral.string(value as string);
            case "typeReference":
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
        }
    }

    private getInlinedRequestBodyPropertyStructFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): ts.TypeLiteral[] {
        const fields: ts.TypeLiteral[] = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push(
                ts.TypeLiteral.objectField(
                    this.context.getTypeName(parameter.name.name),
                    this.context.dynamicTypeLiteralMapper.convert(parameter)
                )
            );
        }

        return fields;
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
