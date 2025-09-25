import { AbstractFormatter, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { formatRustSnippet, formatRustSnippetAsync } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

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
        const rawCode = components.join("\n") + "\n";
        // Try to format with rustfmt
        const formattedCode = await formatRustSnippetAsync(rawCode);
        return formattedCode;
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const components = this.buildCodeComponents({ endpoint, snippet: request });
        const rawCode = components.join("\n") + "\n";
        // Try sync formatting with rustfmt, but fallback to raw code if it fails
        const formattedCode = formatRustSnippet(rawCode);
        return formattedCode;
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
                    target: rust.Expression.raw(`${this.getClientName({ endpoint })}::new(config)`),
                    method: "expect",
                    args: [rust.Expression.stringLiteral("Failed to build client")]
                })
            }),
            // Add the actual API method call
            this.callMethod({ endpoint, snippet })
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
        const imports = ["ClientConfig", this.getClientName({ endpoint })];

        // Add request struct import if this endpoint uses an inlined request
        if (endpoint.request.type === "inlined") {
            const requestStructName = this.context.getStructName(endpoint.request.declaration.name);
            imports.push(requestStructName);
        }

        return [
            new rust.UseStatement({
                path: this.context.getCrateName(),
                items: imports
            })
        ];
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
                            name: "api_key",
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

        return rust.Expression.structConstruction(
            "ClientConfig",
            fields.map((field) => ({ name: field.name, value: field.value }))
        );
    }

    private getClientName({ endpoint }: { endpoint?: FernIr.dynamic.Endpoint } = {}): string {
        // Use the configured client class name from custom config
        return this.context.getClientStructName();
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
}
