import { AbstractFormatter, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { FilePropertyInfo } from "./context/FilePropertyMapper";

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
        const components = this.buildCodeComponents({ endpoint, snippet: request });
        return components.join("\n") + "\n";
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const components = this.buildCodeComponents({ endpoint, snippet: request });
        return components.join("\n") + "\n";
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.AstNode {
        // Create use statements using AST
        const useStatements = this.getUseStatements({ endpoint, snippet });

        // Create the main function body
        const mainBody = rust.CodeBlock.fromStatements([
            // Create config variable
            rust.Statement.let({
                name: "config",
                value: this.getClientConfigStruct({ endpoint, snippet })
            }),
            // Create client variable
            rust.Statement.let({
                name: CLIENT_VAR_NAME,
                value: rust.Expression.methodCall({
                    target: rust.Expression.raw(`${this.getClientName()}::new(config)`),
                    method: "expect",
                    args: [rust.Expression.stringLiteral("Failed to build client")]
                })
            }),
            // API method call
            rust.Statement.expression(
                rust.Expression.methodCall({
                    target: rust.Expression.reference(CLIENT_VAR_NAME),
                    method: this.getMethodName({ endpoint }),
                    args: this.getMethodArgs({ endpoint, snippet }),
                    isAsync: true
                })
            )
        ]);

        // Create the standalone function
        const mainFunction = rust.standaloneFunction({
            name: "main",
            attributes: [rust.attribute({ name: "tokio::main" })],
            parameters: [],
            isAsync: true,
            body: mainBody
        });

        // Create code block with use statements and function
        const statements = [
            ...useStatements.map((use) => rust.Statement.raw(use.toString())),
            rust.Statement.raw(""),
            rust.Statement.raw(mainFunction.toString())
        ];

        return rust.CodeBlock.fromStatements(statements);
    }

    private buildCodeComponents({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string[] {
        // Get use statements
        const useStatements = this.getUseStatements({ endpoint, snippet });

        // Create the main function body
        const mainBody = rust.CodeBlock.fromStatements([
            // Create config variable
            rust.Statement.let({
                name: "config",
                value: this.getClientConfigStruct({ endpoint, snippet })
            }),
            // Create client variable
            rust.Statement.let({
                name: CLIENT_VAR_NAME,
                value: rust.Expression.methodCall({
                    target: rust.Expression.raw(`${this.getClientName()}::new(config)`),
                    method: "expect",
                    args: [rust.Expression.stringLiteral("Failed to build client")]
                })
            }),
            // API method call
            rust.Statement.expression(
                rust.Expression.methodCall({
                    target: rust.Expression.reference(CLIENT_VAR_NAME),
                    method: this.getMethodName({ endpoint }),
                    args: this.getMethodArgs({ endpoint, snippet }),
                    isAsync: true
                })
            )
        ]);

        // Create the standalone function
        const mainFunction = rust.standaloneFunction({
            name: "main",
            attributes: [rust.attribute({ name: "tokio::main" })],
            parameters: [],
            isAsync: true,
            body: mainBody
        });

        // Return components as strings without extra wrapping
        const components: string[] = [];

        // Add use statements
        useStatements.forEach((useStmt) => {
            components.push(useStmt.toString());
        });

        // Add empty line
        components.push("");

        // Add main function
        components.push(mainFunction.toString());

        return components;
    }

    private getUseStatements({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.UseStatement[] {
        const imports = [
            new rust.UseStatement({
                path: this.context.getPackageName(),
                items: ["ClientConfig", this.getClientName()]
            })
        ];

        return imports;
    }

    private getClientConfigStruct({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression {
        const fields: Array<{ name: string; value: rust.Expression }> = [];

        // Add base URL
        const baseUrlValue = this.getBaseUrlValue({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlValue != null) {
            fields.push({
                name: "base_url",
                value: rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(baseUrlValue),
                    method: "to_string",
                    args: []
                })
            });
        }

        // Add auth fields
        if (endpoint.auth != null && snippet.auth != null) {
            switch (endpoint.auth.type) {
                case "bearer":
                    if (snippet.auth.type === "bearer") {
                        fields.push({
                            name: "bearer_token",
                            value: rust.Expression.functionCall("Some", [
                                rust.Expression.methodCall({
                                    target: rust.Expression.stringLiteral(snippet.auth.token),
                                    method: "to_string",
                                    args: []
                                })
                            ])
                        });
                    }
                    break;
                case "basic":
                    if (snippet.auth.type === "basic") {
                        fields.push({
                            name: "username",
                            value: rust.Expression.functionCall("Some", [
                                rust.Expression.methodCall({
                                    target: rust.Expression.stringLiteral(snippet.auth.username),
                                    method: "to_string",
                                    args: []
                                })
                            ])
                        });
                        fields.push({
                            name: "password",
                            value: rust.Expression.functionCall("Some", [
                                rust.Expression.methodCall({
                                    target: rust.Expression.stringLiteral(snippet.auth.password),
                                    method: "to_string",
                                    args: []
                                })
                            ])
                        });
                    }
                    break;
                case "header":
                    if (snippet.auth.type === "header") {
                        fields.push({
                            name: "api_key",
                            value: rust.Expression.functionCall("Some", [
                                rust.Expression.methodCall({
                                    target: rust.Expression.stringLiteral(String(snippet.auth.value)),
                                    method: "to_string",
                                    args: []
                                })
                            ])
                        });
                    }
                    break;
            }
        }

        return rust.Expression.structLiteral("ClientConfig", fields);
    }

    private getClientName(): string {
        // Convert package name to client name (e.g., "my_package" -> "MyPackageClient")
        const packageName = this.context.getPackageName();
        const pascalCase = packageName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
        return `${pascalCase}Client`;
    }

    private constructClientCode({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const clientBuilder = this.getClientBuilderCall(this.getConstructorArgs({ endpoint, snippet }));
        return `let ${CLIENT_VAR_NAME} = ${clientBuilder.toString()};`;
    }

    private callMethodCode({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const methodCall = rust.Expression.methodCall({
            target: rust.Expression.reference(CLIENT_VAR_NAME),
            method: this.getMethodName({ endpoint }),
            args: this.getMethodArgs({ endpoint, snippet }),
            isAsync: true
        });
        return `${methodCall.toString()};`;
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Statement {
        return rust.Statement.let({
            name: CLIENT_VAR_NAME,
            value: this.getClientBuilderCall(this.getConstructorArgs({ endpoint, snippet }))
        });
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Statement {
        return rust.Statement.expression(
            rust.Expression.methodCall({
                target: rust.Expression.reference(CLIENT_VAR_NAME),
                method: this.getMethodName({ endpoint }),
                args: this.getMethodArgs({ endpoint, snippet }),
                isAsync: true
            })
        );
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        // Add base URL
        const baseUrlArg = this.getConstructorBaseUrlArg({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlArg != null) {
            args.push(baseUrlArg);
        }

        // Add auth
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

        // Add headers
        this.context.errors.scope(Scope.Headers);
        if (this.context.ir.headers != null && snippet.headers != null) {
            args.push(...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers }));
        }
        this.context.errors.unscope();

        return args;
    }

    private getConstructorBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): rust.Expression | undefined {
        const baseUrlValue = this.getBaseUrlValue({ baseUrl, environment });
        if (baseUrlValue == null) {
            return undefined;
        }
        return rust.Expression.methodCall({
            target: rust.Expression.reference(this.context.getClientBuilderName()),
            method: "base_url",
            args: [rust.Expression.stringLiteral(baseUrlValue)]
        });
    }

    private getBaseUrlValue({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined;
        environment: FernIr.dynamic.EnvironmentValues | undefined;
    }): string | undefined {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Cannot specify both baseUrl and environment options"
            });
            return undefined;
        }
        if (baseUrl != null) {
            return baseUrl;
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const envName = this.context.resolveEnvironmentName("default");
                if (envName == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    });
                    return undefined;
                }
                return envName.snakeCase.safeName;
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: "Multi-environment values are not supported yet; use the baseUrl option instead"
                });
            }
        }
        return undefined;
    }

    private getConstructorAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth;
        values: FernIr.dynamic.AuthValues;
    }): rust.Expression {
        switch (auth.type) {
            case "basic":
                if (values.type !== "basic") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return rust.Expression.raw('todo!("Auth mismatch error")');
                }
                return this.getConstructorBasicAuthArg({ auth, values });
            case "bearer":
                if (values.type !== "bearer") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return rust.Expression.raw('todo!("Auth mismatch error")');
                }
                return this.getConstructorBearerAuthArg({ auth, values });
            case "header":
                if (values.type !== "header") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return rust.Expression.raw('todo!("Auth mismatch error")');
                }
                return this.getConstructorHeaderAuthArg({ auth, values });
            case "oauth":
                if (values.type !== "oauth") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    });
                    return rust.Expression.raw('todo!("Auth mismatch error")');
                }
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: "OAuth client credentials are not supported yet"
                });
                return rust.Expression.raw('todo!("OAuth not implemented")');
            default:
                assertNever(auth);
        }
    }

    private getConstructorBasicAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth;
        values: FernIr.dynamic.BasicAuthValues;
    }): rust.Expression {
        return rust.Expression.methodCall({
            target: rust.Expression.reference("BasicAuth"),
            method: "new",
            args: [rust.Expression.stringLiteral(values.username), rust.Expression.stringLiteral(values.password)]
        });
    }

    private getConstructorBearerAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth;
        values: FernIr.dynamic.BearerAuthValues;
    }): rust.Expression {
        return rust.Expression.methodCall({
            target: rust.Expression.reference("BearerAuth"),
            method: "new",
            args: [rust.Expression.stringLiteral(values.token)]
        });
    }

    private getConstructorHeaderAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth;
        values: FernIr.dynamic.HeaderAuthValues;
    }): rust.Expression {
        return rust.Expression.methodCall({
            target: rust.Expression.reference("HeaderAuth"),
            method: "new",
            args: [
                rust.Expression.stringLiteral(auth.header.name.name.snakeCase.safeName),
                this.context.dynamicTypeInstantiationMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value
                })
            ]
        });
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];
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
    }): rust.Expression | undefined {
        const headerValue = this.context.dynamicTypeInstantiationMapper.convert({
            typeReference: header.typeReference,
            value
        });

        return rust.Expression.methodCall({
            target: rust.Expression.reference("HeaderValue"),
            method: "new",
            args: [rust.Expression.stringLiteral(header.name.name.snakeCase.safeName), headerValue]
        });
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
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
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        // Path parameters
        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            args.push(...this.getPathParameterArgs({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // Request body
        this.context.errors.scope(Scope.RequestBody);
        if (request.body != null) {
            args.push(this.getBodyRequestArg({ body: request.body, value: snippet.requestBody }));
        }
        this.context.errors.unscope();

        return args;
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        // Path parameters
        this.context.errors.scope(Scope.PathParameters);
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            args.push(...this.getPathParameterArgs({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // Create request struct
        args.push(this.getInlinedRequestArg({ request, snippet }));

        return args;
    }

    private getBodyRequestArg({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): rust.Expression {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeInstantiationMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): rust.Expression {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected bytes value to be a string, got ${typeof value}`
            });
            return rust.Expression.raw('todo!("Invalid bytes value")');
        }
        return rust.Expression.stringLiteral(value as string);
    }

    private getInlinedRequestArg({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression {
        const structFields: Array<{ name: string; value: rust.Expression }> = [];

        // Query parameters
        this.context.errors.scope(Scope.QueryParameters);
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        });
        for (const queryParameter of queryParameters) {
            structFields.push({
                name: this.context.getPropertyName(queryParameter.name.name),
                value: this.context.dynamicTypeInstantiationMapper.convert(queryParameter)
            });
        }
        this.context.errors.unscope();

        // Headers
        this.context.errors.scope(Scope.Headers);
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });
        for (const header of headers) {
            structFields.push({
                name: this.context.getPropertyName(header.name.name),
                value: this.context.dynamicTypeInstantiationMapper.convert(header)
            });
        }
        this.context.errors.unscope();

        // Request body
        this.context.errors.scope(Scope.RequestBody);
        if (request.body != null) {
            const requestBodyFields = this.getInlinedRequestBodyStructFields({
                body: request.body,
                value: snippet.requestBody
            });
            structFields.push(...requestBodyFields);
        }
        this.context.errors.unscope();

        return rust.Expression.structLiteral(this.context.getStructName(request.declaration.name), structFields);
    }

    private getInlinedRequestBodyStructFields({
        body,
        value
    }: {
        body: FernIr.dynamic.InlinedRequestBody;
        value: unknown;
    }): Array<{ name: string; value: rust.Expression }> {
        switch (body.type) {
            case "properties":
                return this.getInlinedRequestBodyPropertyStructFields({ parameters: body.value, value });
            case "referenced":
                return [this.getReferencedRequestBodyPropertyStructField({ body, value })];
            case "fileUpload":
                return this.getFileUploadRequestBodyStructFields({ body, value });
            default:
                assertNever(body);
        }
    }

    private getInlinedRequestBodyPropertyStructFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        value: unknown;
    }): Array<{ name: string; value: rust.Expression }> {
        const fields: Array<{ name: string; value: rust.Expression }> = [];

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeInstantiationMapper.convert(parameter)
            });
        }

        return fields;
    }

    private getReferencedRequestBodyPropertyStructField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody;
        value: unknown;
    }): { name: string; value: rust.Expression } {
        return {
            name: this.context.getPropertyName(body.bodyKey),
            value: this.getReferencedRequestBodyPropertyExpression({ body: body.bodyType, value })
        };
    }

    private getReferencedRequestBodyPropertyExpression({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): rust.Expression {
        switch (body.type) {
            case "bytes":
                return this.getBytesBodyRequestArg({ value });
            case "typeReference":
                return this.context.dynamicTypeInstantiationMapper.convert({ typeReference: body.value, value });
            default:
                assertNever(body);
        }
    }

    private getFileUploadRequestBodyStructFields({
        body,
        value
    }: {
        body: FernIr.dynamic.FileUploadRequestBody;
        value: unknown;
    }): Array<{ name: string; value: rust.Expression }> {
        const fields: Array<{ name: string; value: rust.Expression }> = [];
        const filePropertyInfo = this.context.filePropertyMapper.getFilePropertyInfo({ body, value });

        // Add file fields
        fields.push(
            ...filePropertyInfo.fileFields.map((field) => ({
                name: field.name,
                value: field.value
            }))
        );

        // Add body property fields
        fields.push(
            ...filePropertyInfo.bodyPropertyFields.map((field) => ({
                name: field.name,
                value: field.value
            }))
        );

        return fields;
    }

    private getPathParameterArgs({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push(this.context.dynamicTypeInstantiationMapper.convert(parameter));
        }

        return args;
    }

    private getMethodName({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getMethodName(val))
                .join("_")}_${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }

    private getClientBuilderCallNew({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression {
        const methods: Array<{ method: string; args: rust.Expression[] }> = [];

        // Add base URL
        const baseUrlValue = this.getBaseUrlValue({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        });
        if (baseUrlValue != null) {
            methods.push({ method: "base_url", args: [rust.Expression.stringLiteral(baseUrlValue)] });
        }

        // Add auth
        if (endpoint.auth != null && snippet.auth != null) {
            const authExpr = this.getConstructorAuthArg({ auth: endpoint.auth, values: snippet.auth });
            methods.push({ method: "auth", args: [authExpr] });
        }

        // Add headers
        if (this.context.ir.headers != null && snippet.headers != null) {
            for (const header of this.context.ir.headers) {
                const headerValues = snippet.headers.value as Record<string, unknown>;
                const value = headerValues?.[header.name.wireValue];
                if (value != null) {
                    methods.push({
                        method: "header",
                        args: [
                            rust.Expression.stringLiteral(header.name.wireValue),
                            rust.Expression.stringLiteral(String(value))
                        ]
                    });
                }
            }
        }

        // Add build() at the end
        methods.push({ method: "build", args: [] });

        return rust.Expression.methodChain(rust.Expression.reference(this.context.getClientBuilderName()), methods);
    }

    private getClientBuilderCall(arguments_: rust.Expression[]): rust.Expression {
        return rust.Expression.methodChain(rust.Expression.reference(this.context.getClientBuilderName()), [
            ...arguments_.map((arg) => ({ method: "with_arg", args: [arg] })),
            { method: "build", args: [] }
        ]);
    }
}
