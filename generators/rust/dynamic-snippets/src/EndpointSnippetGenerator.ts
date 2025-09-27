import { Scope, Severity } from "@fern-api/browser-compatible-base-generator";
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
        const imports = new Set<string>(["ClientConfig", this.getClientName({ endpoint })]);

        // Add request struct import only if this endpoint actually uses a request struct
        // Match the SDK generator logic: only for query params or body, not just headers
        if (endpoint.request.type === "inlined") {
            const request = endpoint.request;
            const hasQueryParams = (request.queryParameters ?? []).length > 0;
            const hasBody = request.body != null;

            if (hasQueryParams || hasBody) {
                const requestStructName = this.getCorrectRequestStructName(endpoint, request);
                imports.add(requestStructName);
            }
        } else if (endpoint.request.type === "body") {
            // For body requests, we need to import the type referenced in the body
            const bodyRequest = endpoint.request;
            if (bodyRequest.body?.type === "typeReference") {
                const typeRef = bodyRequest.body.value;
                if (typeRef.type === "named") {
                    const typeId = typeRef.value;
                    const namedType = this.context.ir.types[typeId];
                    if (namedType) {
                        const typeName = this.context.getStructName(namedType.declaration.name);
                        imports.add(typeName);
                        // Also collect nested types used in this struct
                        this.collectNestedTypeImports(namedType, imports);
                    }
                }
            }
        }

        return [
            new rust.UseStatement({
                path: this.context.getCrateName(),
                items: Array.from(imports)
            })
        ];
    }

    private collectNestedTypeImports(
        namedType: FernIr.dynamic.NamedType,
        imports: Set<string>,
        visited: Set<string> = new Set()
    ): void {
        const typeName = namedType.declaration.name.pascalCase.safeName;

        // Prevent infinite recursion by tracking visited types
        if (visited.has(typeName)) {
            return;
        }
        visited.add(typeName);

        switch (namedType.type) {
            case "object":
                // Add the object type itself
                imports.add(this.context.getStructName(namedType.declaration.name));

                // Recursively collect imports from object properties
                for (const property of namedType.properties) {
                    this.collectTypeReferenceImports(property.typeReference, imports, visited);
                }
                break;
            case "alias":
                // Add the alias type itself
                imports.add(this.context.getStructName(namedType.declaration.name));

                // Recursively collect imports from the aliased type
                this.collectTypeReferenceImports(namedType.typeReference, imports, visited);
                break;
            case "enum":
                // Add the enum type
                imports.add(this.context.getEnumName(namedType.declaration.name));
                break;
            case "discriminatedUnion":
            case "undiscriminatedUnion":
                // Add the union type
                imports.add(this.context.getStructName(namedType.declaration.name));

                // For discriminated unions, collect imports from union members
                if (namedType.type === "discriminatedUnion") {
                    Object.values(namedType.types).forEach((unionType) => {
                        if (unionType.type === "singleProperty") {
                            this.collectTypeReferenceImports(unionType.typeReference, imports, visited);
                        } else if (unionType.type === "samePropertiesAsObject") {
                            // Handle object-based union types
                            const referencedType = this.context.ir.types[unionType.typeId];
                            if (referencedType) {
                                this.collectNestedTypeImports(referencedType, imports, visited);
                            }
                        }
                    });
                }
                break;
        }
    }

    private collectTypeReferenceImports(
        typeReference: FernIr.dynamic.TypeReference,
        imports: Set<string>,
        visited: Set<string> = new Set()
    ): void {
        switch (typeReference.type) {
            case "named": {
                const typeId = typeReference.value;
                const namedType = this.context.ir.types[typeId];
                if (namedType) {
                    this.collectNestedTypeImports(namedType, imports, visited);
                }
                break;
            }
            case "optional":
            case "nullable": {
                // Recursively collect from the inner type
                const innerType = (
                    typeReference as FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable
                ).value;
                if (innerType) {
                    this.collectTypeReferenceImports(innerType, imports, visited);
                }
                break;
            }
            case "list": {
                // Recursively collect from the list element type
                const listElementType = (typeReference as FernIr.dynamic.TypeReference.List).value;
                if (listElementType) {
                    this.collectTypeReferenceImports(listElementType, imports, visited);
                }
                break;
            }
            case "primitive":
            case "literal":
            case "unknown":
                // These don't require additional imports
                break;
        }
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
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])];
        if (pathParameters.length > 0) {
            args.push(...this.getPathParameterArgs({ namedParameters: pathParameters, snippet }));
        }
        this.context.errors.unscope();

        // Only create request struct if it has meaningful parameters beyond headers
        // Match the SDK generator logic: headers are handled separately, not as request struct parameters
        const hasQueryParams = (request.queryParameters ?? []).length > 0;
        const hasBody = request.body != null;

        if (hasQueryParams || hasBody) {
            // Create request struct only if it has actual parameters (query params or body, not just headers)
            args.push(rust.Expression.referenceOf(this.getInlinedRequestArg({ endpoint, request, snippet })));
        }

        // Add default None for RequestOptions parameter
        args.push(rust.Expression.raw("None"));

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
        endpoint,
        request,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
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

        // Use organized struct construction for better readability
        const structName = this.getCorrectRequestStructName(endpoint, request);
        return this.createStructExpression(structName, structFields);
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
            args.push(rust.Expression.referenceOf(this.context.dynamicTypeInstantiationMapper.convert(parameter)));
        }

        return args;
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
        structFields: Array<{ name: string; value: rust.Expression }>
    ): rust.Expression {
        // For complex objects with many fields or nested structures,
        // prefer struct construction over JSON for better type safety and readability
        if (this.shouldUseStructConstruction(structFields)) {
            return rust.Expression.structConstruction(
                structName,
                structFields.map((field) => ({ name: field.name, value: field.value }))
            );
        }
        return rust.Expression.structLiteral(structName, structFields);
    }

    private shouldUseStructConstruction(structFields: Array<{ name: string; value: rust.Expression }>): boolean {
        // Use struct construction for:
        // 1. More than 2 fields
        // 2. Any field has complex nested structure
        // 3. Better type safety than JSON
        if (structFields.length > 2) {
            return true;
        }

        // Check for complex nested objects
        for (const field of structFields) {
            const fieldString = field.value.toString();
            // If field contains nested structures, use struct construction
            if (fieldString.includes("json!") || fieldString.includes("{") || fieldString.length > 30) {
                return true;
            }
        }

        return false;
    }

    private getCorrectRequestStructName(
        endpoint: FernIr.dynamic.Endpoint,
        request: FernIr.dynamic.InlinedRequest
    ): string {
        const hasQueryParams = (request.queryParameters ?? []).length > 0;
        const hasBody = request.body != null;

        if (hasQueryParams && !hasBody) {
            // Query-only: use QueryRequest suffix like SDK generator
            const methodName = endpoint.declaration.name.pascalCase.safeName;
            return `${methodName}QueryRequest`;
        }
        // Default: use regular naming for body requests or mixed requests
        return this.context.getStructName(request.declaration.name);
    }
}
