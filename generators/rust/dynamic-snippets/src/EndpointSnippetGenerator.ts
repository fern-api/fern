import { AbstractAstNode, Options, Scope, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { formatRustSnippet, formatRustSnippetAsync } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const CLIENT_VAR_NAME = "client";

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

    public async generateSnippetAst({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<AbstractAstNode> {
        throw new Error("Unsupported");
    }

    public buildCodeComponents({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string[] {
        // Get use statements, passing endpoint to collect type imports
        const useStatements = this.getUseStatements({ endpoint });

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

    private getUseStatements({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): rust.UseStatement[] {
        const useStatements: rust.UseStatement[] = [];

        // Use prelude import for all crate types
        // The prelude re-exports all types via `pub use crate::api::*;`
        // so no additional type imports are needed
        useStatements.push(
            new rust.UseStatement({
                path: `${this.context.getCrateName()}::prelude`,
                items: ["*"]
            })
        );

        return useStatements;
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
                            name: "token",
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
            fields.map((field) => ({ name: field.name, value: field.value })),
            true // Enable ..Default::default() pattern
        );
    }

    private getClientName(): string {
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
        let args: rust.Expression[] = [];

        switch (endpoint.request.type) {
            case "inlined":
                args = this.getMethodArgsForInlinedRequest({ endpoint, request: endpoint.request, snippet });
                break;
            case "body":
                args = this.getMethodArgsForBodyRequest({ request: endpoint.request, snippet });
                break;
            default:
                assertNever(endpoint.request);
        }

        return args;
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        // Organize request components like Swift does
        const requestComponents = this.buildRequestComponents({
            pathParameters: [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])],
            snippet,
            body: request.body
        });

        // Add path parameters
        args.push(...requestComponents.pathArgs);

        // Add request body
        if (requestComponents.bodyArg != null) {
            args.push(rust.Expression.referenceOf(requestComponents.bodyArg));
        }

        // Add default None for RequestOptions parameter
        args.push(rust.Expression.raw("None"));

        return args;
    }

    private getMethodArgsForInlinedRequest({
        endpoint,
        request,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression[] {
        const args: rust.Expression[] = [];

        // Path parameters
        this.context.errors.scope(Scope.PathParameters);
        this.context.scopeError("pathParameters");
        try {
            const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
            if (pathParameters.length > 0) {
                args.push(...this.getPathParameterArgs({ namedParameters: pathParameters, snippet }));
            }
        } finally {
            this.context.unscopeError();
            this.context.errors.unscope();
        }

        // Only create request struct if it has meaningful parameters beyond headers
        // Match the SDK generator logic: headers are handled separately, not as request struct parameters
        const hasQueryParams = (request.queryParameters ?? []).length > 0;
        const hasBody = request.body != null;

        // SDK generator behavior (from SubClientGenerator.ts):
        // - Referenced body WITHOUT query params → uses inner type directly
        // - Referenced body WITH query params → creates wrapper type
        // - Inlined body (properties) → creates wrapper type
        const body = request.body;
        const isReferencedBodyOnly = body != null && !hasQueryParams && body.type === "referenced";

        if (isReferencedBodyOnly && body.type === "referenced") {
            // Use inner type directly - match SDK generator's behavior for referenced body without query params
            const bodyExpr = this.getReferencedRequestBodyPropertyExpression({
                body: body.bodyType,
                value: snippet.requestBody
            });
            args.push(rust.Expression.referenceOf(bodyExpr));
        } else if (hasQueryParams || hasBody) {
            // Create request struct for:
            // - Query params only
            // - Query params + body (referenced or properties)
            // - Body with properties type
            args.push(rust.Expression.referenceOf(this.getInlinedRequestArg({ endpoint, request, snippet })));
        }

        // Add RequestOptions with headers if present, otherwise None
        const hasHeaders = (request.headers ?? []).length > 0 && Object.keys(snippet.headers ?? {}).length > 0;
        if (hasHeaders) {
            args.push(rust.Expression.functionCall("Some", [this.getRequestOptionsWithHeaders({ request, snippet })]));
        } else {
            args.push(rust.Expression.raw("None"));
        }

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
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
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
        endpoint,
        request,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression {
        const structFields: Array<{ name: string; value: rust.Expression }> = [];
        const providedFieldNames = new Set<string>();

        // Query parameters with enhanced error scoping
        this.context.errors.scope(Scope.QueryParameters);
        this.context.scopeError("queryParameters");
        try {
            const queryParameters = this.context.associateQueryParametersByWireValue({
                parameters: request.queryParameters ?? [],
                values: snippet.queryParameters ?? {}
            });
            for (const queryParameter of queryParameters) {
                this.context.scopeError(queryParameter.name.wireValue);
                try {
                    const fieldName = this.context.getPropertyName(queryParameter.name.name);
                    structFields.push({
                        name: fieldName,
                        value: this.context.dynamicTypeLiteralMapper.convert(queryParameter)
                    });
                    providedFieldNames.add(fieldName);
                } finally {
                    this.context.unscopeError();
                }
            }
        } finally {
            this.context.unscopeError();
            this.context.errors.unscope();
        }

        // Headers are handled via RequestOptions, not in the request struct
        // Skip headers here

        // Request body
        this.context.errors.scope(Scope.RequestBody);
        if (request.body != null) {
            const requestBodyFields = this.getInlinedRequestBodyStructFields({
                body: request.body,
                value: snippet.requestBody
            });
            for (const field of requestBodyFields) {
                structFields.push(field);
                providedFieldNames.add(field.name);
            }
        }
        this.context.errors.unscope();

        // Use organized struct construction for better readability
        const structName = this.getCorrectRequestStructName(endpoint, request);

        // For wire tests, we always explicitly provide all fields instead of using ..Default::default()
        // This is more robust and avoids compilation errors when types don't derive Default.
        // The model generator only derives Default when ALL properties are optional AND there are no
        // extended properties, which is a complex condition that's hard to perfectly mirror in dynamic snippets.
        // By always providing explicit values, we ensure the generated tests always compile.
        const useDefault = false;

        // Always add missing fields with explicit values
        this.addMissingFields({
            request,
            structFields,
            providedFieldNames
        });

        return this.createStructExpression(structName, structFields, useDefault);
    }

    private addMissingFields({
        request,
        structFields,
        providedFieldNames
    }: {
        request: FernIr.dynamic.InlinedRequest;
        structFields: Array<{ name: string; value: rust.Expression }>;
        providedFieldNames: Set<string>;
    }): void {
        // Add missing query parameters (both optional and required)
        const allQueryParams = request.queryParameters ?? [];
        for (const param of allQueryParams) {
            const fieldName = this.context.getPropertyName(param.name.name);
            if (!providedFieldNames.has(fieldName)) {
                if (this.context.isOptionalType(param.typeReference)) {
                    structFields.push({
                        name: fieldName,
                        value: rust.Expression.raw("None")
                    });
                } else {
                    // Required field is missing - generate a default value
                    structFields.push({
                        name: fieldName,
                        value: this.generateDefaultValueForType(param.typeReference)
                    });
                }
            }
        }

        // Add missing body parameters (both optional and required)
        if (request.body != null && request.body.type === "properties") {
            for (const param of request.body.value) {
                const fieldName = this.context.getPropertyName(param.name.name);
                if (!providedFieldNames.has(fieldName)) {
                    if (this.context.isOptionalType(param.typeReference)) {
                        structFields.push({
                            name: fieldName,
                            value: rust.Expression.raw("None")
                        });
                    } else {
                        // Required field is missing - generate a default value
                        structFields.push({
                            name: fieldName,
                            value: this.generateDefaultValueForType(param.typeReference)
                        });
                    }
                }
            }
        }
    }

    private generateDefaultValueForType(typeRef: FernIr.dynamic.TypeReference): rust.Expression {
        switch (typeRef.type) {
            case "primitive":
                switch (typeRef.value) {
                    case "STRING":
                        return rust.Expression.stringLiteral("string");
                    case "INTEGER":
                    case "LONG":
                    case "UINT":
                    case "UINT_64":
                        return rust.Expression.raw("0");
                    case "FLOAT":
                    case "DOUBLE":
                        return rust.Expression.raw("0.0");
                    case "BOOLEAN":
                        return rust.Expression.raw("false");
                    default:
                        return rust.Expression.stringLiteral("default");
                }
            case "list":
                return rust.Expression.raw("vec![]");
            case "map":
                return rust.Expression.raw("std::collections::HashMap::new()");
            case "set":
                return rust.Expression.raw("std::collections::HashSet::new()");
            case "named": {
                // For named types, we need to construct them properly.
                // Named types can be aliases (newtypes), enums, objects, or unions.
                // For aliases, we recursively generate the default value for the underlying type
                // and wrap it with the alias type constructor.
                const typeId = typeRef.value;
                const namedType = this.context.ir.types[typeId];
                const typeName = this.context.getTypeNameById(typeId);

                if (!namedType) {
                    // If we can't find the type, fall back to string wrapper assumption
                    return rust.Expression.raw(`${typeName}("value".to_string())`);
                }

                // Handle different kinds of named types
                switch (namedType.type) {
                    case "alias":
                        // For alias types (newtypes), recursively generate the inner value
                        // and wrap it with the type constructor
                        const innerValue = this.generateDefaultValueForType(namedType.typeReference);
                        return rust.Expression.raw(`${typeName}(${innerValue.toString()})`);
                    case "enum":
                        // For enums, use the first variant if available
                        if (namedType.values.length > 0) {
                            const firstVariant = namedType.values[0];
                            if (firstVariant) {
                                const rawVariantName = firstVariant.name.pascalCase.unsafeName;
                                const variantName = this.context.escapeRustReservedType(rawVariantName);
                                return rust.Expression.raw(`${typeName}::${variantName}`);
                            }
                        }
                        // Fallback if no variants (shouldn't happen)
                        return rust.Expression.raw(`${typeName}::default()`);
                    case "object":
                    case "discriminatedUnion":
                    case "undiscriminatedUnion":
                        // For complex types, try Default::default() or use a placeholder
                        return rust.Expression.raw(`${typeName}::default()`);
                    default:
                        // Unknown named type, fall back to string wrapper assumption
                        return rust.Expression.raw(`${typeName}("value".to_string())`);
                }
            }
            default:
                // For complex types (unions, etc.), use Default::default() to avoid compilation errors
                return rust.Expression.raw("Default::default()");
        }
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
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
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
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value });
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
            const expr = this.context.dynamicTypeLiteralMapper.convert(parameter);
            // Copy types (numeric primitives and booleans) should be passed by value, not by reference
            if (this.isCopyPrimitive(parameter.typeReference)) {
                args.push(expr);
            } else {
                args.push(rust.Expression.referenceOf(expr));
            }
        }

        return args;
    }

    /**
     * Check if a type reference is a Copy primitive type that should be passed by value.
     * In Rust, numeric types (i32, i64, u32, u64, f32, f64) and bool are Copy types
     * that don't need to be borrowed.
     */
    private isCopyPrimitive(typeReference: FernIr.dynamic.TypeReference): boolean {
        if (typeReference.type !== "primitive") {
            return false;
        }
        switch (typeReference.value) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
            case "BOOLEAN":
                return true;
            default:
                return false;
        }
    }

    private getRequestOptionsWithHeaders({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): rust.Expression {
        // Create RequestOptions with additional headers
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        });

        // Build the RequestOptions::new().additional_header("key", "value") chain
        let optionsExpr = rust.Expression.functionCall("RequestOptions::new", []);

        for (const header of headers) {
            this.context.scopeError(header.name.wireValue);
            try {
                // Headers should always be passed as plain strings to additional_header,
                // regardless of their type reference (e.g., optional, named types like IdempotencyKey).
                // The additional_header method expects `impl Into<String>`.
                const headerValue = this.getHeaderValueAsString(header.value);
                optionsExpr = rust.Expression.methodCall({
                    target: optionsExpr,
                    method: "additional_header",
                    args: [rust.Expression.stringLiteral(header.name.wireValue), headerValue]
                });
            } finally {
                this.context.unscopeError();
            }
        }

        return optionsExpr;
    }

    /**
     * Convert a header value to a plain string expression.
     * Headers are always strings in HTTP, so we extract the raw string value
     * regardless of the type reference (e.g., optional, named types).
     */
    private getHeaderValueAsString(value: unknown): rust.Expression {
        if (value == null) {
            return rust.Expression.stringLiteral("");
        }
        const strValue = String(value);
        return rust.Expression.stringLiteral(strValue);
    }

    private buildRequestComponents({
        pathParameters,
        snippet,
        body
    }: {
        pathParameters: FernIr.dynamic.NamedParameter[];
        snippet: FernIr.dynamic.EndpointSnippetRequest;
        body?: FernIr.dynamic.ReferencedRequestBodyType;
    }): {
        pathArgs: rust.Expression[];
        bodyArg: rust.Expression | null;
    } {
        const pathArgs: rust.Expression[] = [];
        let bodyArg: rust.Expression | null = null;

        // Handle path parameters with proper error scoping
        this.context.errors.scope(Scope.PathParameters);
        if (pathParameters.length > 0) {
            pathArgs.push(...this.getPathParameterArgs({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // Handle request body with proper error scoping
        this.context.errors.scope(Scope.RequestBody);
        if (body != null) {
            bodyArg = this.getBodyRequestArg({ body, value: snippet.requestBody });
        }
        this.context.errors.unscope();

        return { pathArgs, bodyArg };
    }

    private getMethodName({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getMethodName(val))
                .join(".")}.${this.context.getMethodName(endpoint.declaration.name)}`;
        }
        return this.context.getMethodName(endpoint.declaration.name);
    }

    private createStructExpression(
        structName: string,
        structFields: Array<{ name: string; value: rust.Expression }>,
        shouldUseDefault: boolean = false
    ): rust.Expression {
        // For complex objects with many fields or nested structures,
        // prefer struct construction over JSON for better type safety and readability
        if (this.shouldUseStructConstruction(structFields)) {
            return rust.Expression.structConstruction(
                structName,
                structFields.map((field) => ({ name: field.name, value: field.value })),
                shouldUseDefault // Use ..Default::default() only when we know the type has Default derived
            );
        }
        return rust.Expression.structLiteral(structName, structFields);
    }

    private shouldUseStructConstruction(structFields: Array<{ name: string; value: rust.Expression }>): boolean {
        // Always use struct construction (multiline format) so we can include ..Default::default()
        // This ensures optional fields are properly initialized for all request types
        return true;
    }

    private getCorrectRequestStructName(
        endpoint: FernIr.dynamic.Endpoint,
        request: FernIr.dynamic.InlinedRequest
    ): string {
        const hasQueryParams = (request.queryParameters ?? []).length > 0;
        const hasBody = request.body != null;
        const methodName = endpoint.declaration.name.pascalCase.safeName;

        if (hasQueryParams && !hasBody) {
            // Query-only: look up the pre-registered deduplicated name from the context
            const queryRequestName = this.context.getQueryRequestNameByEndpoint(endpoint.declaration);
            if (queryRequestName) {
                return queryRequestName;
            }
            // Fallback to manual construction if not found (shouldn't happen)
            return `${methodName}QueryRequest`;
        }

        // For inlined requests with body, check if it's a referenced type
        // If so, use the referenced type name directly instead of creating a wrapper
        if (hasBody && request.body != null) {
            // Check if this is a referenced body (even if it has query params)
            if (request.body.type === "referenced" && request.body.bodyType.type === "typeReference") {
                const typeRef = request.body.bodyType.value;
                if (typeRef.type === "named") {
                    // Use the actual referenced type name from the IR
                    const typeId = typeRef.value;
                    const typeName = this.context.getTypeNameById(typeId);
                    if (typeName) {
                        // If there are query params, the SDK creates a wrapper type
                        // Otherwise, use the referenced type directly
                        if (hasQueryParams) {
                            // SDK creates {EndpointName}Request wrapper for referenced body + query params
                            return `${methodName}Request`;
                        }
                        // No query params: use the referenced type directly
                        // But this case is already handled in getMethodArgsForInlinedRequest (lines 645-653)
                        // so we shouldn't reach here. Fall through to default.
                    }
                }
            }
            
            // For inlined requests with properties body, use the declaration name from the IR
            // This ensures we use the actual type name (e.g., ResponseChargeBack) instead of
            // a synthetic name (e.g., AddResponseRequest)
            if (request.body.type === "properties") {
                // Use the request struct's declaration name from the IR
                return this.context.getStructNameByDeclaration(request.declaration);
            }
            
            // For other body types (e.g., fileUpload), fall back to endpoint-based naming
            return `${methodName}Request`;
        }

        // Default fallback: use the request struct's declaration name
        return this.context.getStructNameByDeclaration(request.declaration);
    }
}
