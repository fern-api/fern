import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "@fern-api/rust-model";

import {
    CursorPagination,
    HttpEndpoint,
    HttpService,
    OffsetPagination,
    Pagination,
    PrimitiveTypeV1,
    ResponseProperty,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointParameter {
    name: string;
    type: rust.Type;
    isRef: boolean;
    optional: boolean;
}

export class SubClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly subpackage: Subpackage;
    private readonly service?: HttpService;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public generate(): RustFile {
        const filename = `${this.subpackage.name.snakeCase.safeName}.rs`;
        const endpoints = this.service?.endpoints || [];

        const rustClient = rust.client({
            name: this.subClientName,
            fields: this.generateFields(),
            constructors: [this.generateConstructor()],
            methods: this.convertEndpointsToHttpMethods(endpoints)
        });

        const module = rust.module({
            useStatements: this.generateImports(),
            rawDeclarations: [rustClient.toString()]
        });

        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src/client"),
            fileContents: module.toString()
        });
    }

    // =============================================================================
    // CLIENT STRUCTURE GENERATION
    // =============================================================================

    private get subClientName(): string {
        return this.subpackage.name.pascalCase.safeName + "Client";
    }

    private generateImports(): UseStatement[] {
        const hasTypes = this.hasTypes(this.context);
        const hasHashMapInQueryParams = this.hasHashMapInQueryParams();

        const imports = [
            new UseStatement({
                path: "crate",
                items: ["ClientConfig", "ClientError", "HttpClient", "RequestOptions"]
            }),
            new UseStatement({
                path: "reqwest",
                items: ["Method"]
            })
        ];

        if (hasHashMapInQueryParams) {
            imports.push(
                new UseStatement({
                    path: "std::collections",
                    items: ["HashMap"]
                })
            );
        }

        if (hasTypes) {
            imports.push(
                new UseStatement({
                    path: "crate",
                    items: ["types::*"]
                })
            );
        }

        // Add pagination imports if there are paginated endpoints
        if (this.hasPaginatedEndpoints()) {
            imports.push(
                new UseStatement({
                    path: "crate",
                    items: ["AsyncPaginator", "PaginationResult"]
                })
            );
        }

        return imports;
    }

    private generateFields(): rust.Client.Field[] {
        const fields: rust.Client.Field[] = [
            {
                name: "http_client",
                type: rust.Type.reference(rust.reference({ name: "HttpClient" })).toString(),
                visibility: "pub"
            }
        ];

        return fields;
    }

    private generateConstructor(): rust.Client.SimpleMethod {
        const selfType = rust.Type.reference(rust.reference({ name: "Self" }));
        const errorType = rust.Type.reference(rust.reference({ name: "ClientError" }));
        const returnType = rust.Type.result(selfType, errorType);

        // Use simple parameter signature with just config
        const parameters = ["config: ClientConfig"];

        const constructorBody = `let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })`;

        return {
            name: "new",
            parameters,
            returnType: returnType.toString(),
            isAsync: false,
            body: constructorBody
        };
    }

    // =============================================================================
    // CAPABILITY DETECTION
    // =============================================================================

    private hasTypes(context: SdkGeneratorContext): boolean {
        return Object.keys(context.ir.types).length > 0;
    }

    private hasPaginatedEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => endpoint.pagination != null);
    }

    private hasHashMapInQueryParams(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) =>
            endpoint.queryParameters.some((queryParam) => this.isCollectionType(queryParam.valueType))
        );
    }

    // =============================================================================
    // HTTP METHOD GENERATION
    // =============================================================================

    private convertEndpointsToHttpMethods(endpoints: HttpEndpoint[]): rust.Client.SimpleMethod[] {
        const methods: rust.Client.SimpleMethod[] = [];

        for (const endpoint of endpoints) {
            if (endpoint.pagination) {
                // For paginated endpoints, only generate the paginated version
                methods.push(...this.generatePaginatedMethods(endpoint));
            } else {
                // For non-paginated endpoints, generate the regular method
                methods.push(this.generateHttpMethod(endpoint));
            }
        }

        return methods;
    }

    private generateHttpMethod(endpoint: HttpEndpoint): rust.Client.SimpleMethod {
        const params = this.extractParametersFromEndpoint(endpoint);
        const parameters = this.buildMethodParameters(params);
        const httpMethod = this.getHttpMethod(endpoint);
        const pathExpression = this.getPathExpression(endpoint);
        const requestBody = this.getRequestBody(endpoint, params);

        const returnType = rust.Type.result(
            this.getReturnType(endpoint),
            rust.Type.reference(rust.reference({ name: "ClientError" }))
        );

        return {
            name: endpoint.name.snakeCase.safeName,
            parameters,
            returnType: returnType.toString(),
            isAsync: true,
            body: `self.http_client.execute_request(
            Method::${httpMethod},
            ${pathExpression},
            ${requestBody},
            ${this.buildQueryParameters(endpoint)},
            options,
        ).await`
        };
    }

    private buildMethodParameters(params: EndpointParameter[]): string[] {
        return [
            ...params.map((param) => {
                let paramType = param.type.toString();

                if (param.isRef) {
                    paramType = `&${paramType}`;
                }

                if (param.optional) {
                    paramType = `Option<${paramType}>`;
                }

                return `${param.name}: ${paramType}`;
            }),
            "options: Option<RequestOptions>"
        ];
    }

    // =============================================================================
    // PARAMETER EXTRACTION
    // =============================================================================

    private extractParametersFromEndpoint(endpoint: HttpEndpoint): EndpointParameter[] {
        const params: EndpointParameter[] = [];

        this.addPathParameters(endpoint, params);
        this.addQueryParameters(endpoint, params);
        this.addRequestBodyParameter(endpoint, params);

        return params;
    }

    private addPathParameters(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    params.push({
                        name: pathParam.name.snakeCase.safeName,
                        type: generateRustTypeForTypeReference(pathParam.valueType),
                        isRef: this.shouldPassByReference(pathParam.valueType),
                        optional: false
                    });
                }
            }
        });
    }

    private addQueryParameters(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        endpoint.queryParameters.forEach((queryParam) => {
            // Check if the type is already optional from the IR
            const isAlreadyOptional = this.isOptionalContainerType(queryParam.valueType);

            params.push({
                name: queryParam.name.name.snakeCase.safeName,
                type: generateRustTypeForTypeReference(queryParam.valueType),
                optional: !isAlreadyOptional, // Only wrap in Option if not already optional
                isRef: false
            });
        });
    }

    private addRequestBodyParameter(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        if (endpoint.requestBody) {
            const requestBodyType = endpoint.requestBody._visit({
                inlinedRequestBody: () => {
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                },
                reference: (reference) => generateRustTypeForTypeReference(reference.requestBodyType),
                fileUpload: () => {
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                },
                bytes: () => rust.Type.vec(rust.Type.primitive(rust.PrimitiveType.U8)),
                _other: () => {
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                }
            });

            params.push({
                name: "request",
                type: requestBodyType,
                isRef: true,
                optional: false
            });
        }
    }

    // =============================================================================
    // QUERY PARAMETER BUILDING
    // =============================================================================

    private buildQueryParameters(endpoint: HttpEndpoint): string {
        const queryParams = endpoint.queryParameters;
        if (queryParams.length === 0) {
            return "None";
        }

        // Check if this endpoint would benefit from enhanced query parameter handling
        const shouldUseEnhancedBuilder = this.shouldUseEnhancedQueryBuilder(endpoint);

        if (shouldUseEnhancedBuilder) {
            return this.buildEnhancedQueryParameters(endpoint);
        }

        return this.buildQueryParameterStatements(queryParams);
    }

    private buildQueryParametersWithoutPagination(endpoint: HttpEndpoint, paginationConfig: Pagination): string {
        const queryParams = endpoint.queryParameters;
        if (queryParams.length === 0) {
            return "None";
        }

        // Get pagination param names to exclude
        const paginationParamNames = this.extractPaginationParameterNames(paginationConfig);

        // Filter out pagination parameters
        const filteredParams = queryParams.filter((param) => !paginationParamNames.has(param.name.wireValue));

        if (filteredParams.length === 0) {
            return "None";
        }

        return this.buildQueryParameterStatements(filteredParams);
    }

    private buildQueryParameterStatements(queryParams: any[]): string {
        const queryParamStatements = queryParams.map((queryParam) => {
            const paramName = queryParam.name.name.snakeCase.safeName;
            const wireValue = queryParam.name.wireValue;
            const pattern = `Some(value)`;

            // Handle string types properly - no JSON serialization
            let valueExpression: string;
            if (this.isStringType(queryParam.valueType)) {
                valueExpression = "value.clone()";
            } else if (this.isComplexType(queryParam.valueType)) {
                valueExpression = "serde_json::to_string(&value).unwrap_or_default()";
            } else {
                valueExpression = "value.to_string()";
            }

            return `if let ${pattern} = ${paramName} {
                query_params.push(("${wireValue}".to_string(), ${valueExpression}));
            }`;
        });

        return `{
            let mut query_params = Vec::new();
            ${queryParamStatements.join("\\n            ")}
            Some(query_params)
        }`;
    }

    private extractPaginationParameterNames(paginationConfig: Pagination): Set<string> {
        const paginationParamNames = new Set<string>();
        if (paginationConfig) {
            paginationConfig._visit({
                cursor: (cursor) => {
                    cursor.page.property._visit({
                        query: (query) => {
                            paginationParamNames.add(query.name.wireValue);
                        },
                        body: (body) => {
                            paginationParamNames.add(body.name.wireValue);
                        },
                        _other: () => {
                            /* no-op */
                        }
                    });
                },
                offset: (offset) => {
                    offset.page.property._visit({
                        query: (query) => {
                            paginationParamNames.add(query.name.wireValue);
                        },
                        body: (body) => {
                            paginationParamNames.add(body.name.wireValue);
                        },
                        _other: () => {
                            /* no-op */
                        }
                    });
                    if (offset.step) {
                        offset.step.property._visit({
                            query: (query) => {
                                paginationParamNames.add(query.name.wireValue);
                            },
                            body: (body) => {
                                paginationParamNames.add(body.name.wireValue);
                            },
                            _other: () => {
                                /* no-op */
                            }
                        });
                    }
                },
                custom: () => {
                    /* no-op */
                },
                _other: () => {
                    /* no-op */
                }
            });
        }
        return paginationParamNames;
    }

    private shouldUseEnhancedQueryBuilder(endpoint: HttpEndpoint): boolean {
        const queryParams = endpoint.queryParameters;

        // Use enhanced builder if:
        // 1. There's a parameter named "query" (structured query string)
        // 2. There are many query parameters (>5) suggesting complex filtering
        // 3. There's a mix of sort parameters (sortBy, sortOrder) indicating advanced querying
        return (
            queryParams.some(
                (param) =>
                    param.name.wireValue === "query" || // Structured query parameter
                    param.name.wireValue === "filter" || // Generic filter parameter
                    param.name.wireValue.includes("sort") // Sort-related parameters
            ) || queryParams.length > 5
        ); // Many parameters suggest complex usage
    }

    private buildEnhancedQueryParameters(endpoint: HttpEndpoint): string {
        const queryParams = endpoint.queryParameters;
        const statements: string[] = [];

        queryParams.forEach((param) => {
            const paramName = param.name.name.snakeCase.safeName;
            const wireValue = param.name.wireValue;
            const pattern = `Some(value)`;

            if (wireValue === "query" && this.isStringType(param.valueType)) {
                // Handle structured query strings with fallback
                statements.push(`
            if let ${pattern} = ${paramName} {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("${wireValue}", &value);
                }
            }`);
            } else {
                // Handle regular parameters
                let valueExpression: string;
                if (this.isStringType(param.valueType)) {
                    valueExpression = "&value";
                } else if (this.isComplexType(param.valueType)) {
                    valueExpression = "&serde_json::to_string(&value).unwrap_or_default()";
                } else {
                    valueExpression = "&value.to_string()";
                }

                statements.push(`
            if let ${pattern} = ${paramName} {
                query_builder.add_simple("${wireValue}", ${valueExpression});
            }`);
            }
        });

        return `{
            let mut query_builder = crate::QueryParameterBuilder::new();${statements.join("")}
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        }`;
    }

    // =============================================================================
    // HTTP REQUEST BUILDING
    // =============================================================================

    private getHttpMethod(endpoint: HttpEndpoint): string {
        return endpoint.method.toUpperCase();
    }

    private getPathExpression(endpoint: HttpEndpoint): string {
        const pathParams: string[] = [];
        let path = endpoint.fullPath.head;

        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    path += "{}";
                    const paramName = this.getPathParameterExpression(
                        pathParam.valueType,
                        pathParam.name.snakeCase.safeName
                    );
                    pathParams.push(paramName);
                }
            } else {
                path += part.tail;
            }
        });

        if (pathParams.length > 0) {
            return `&format!("${path}", ${pathParams.join(", ")})`;
        }
        return `"${path}"`;
    }

    private getPathParameterExpression(typeRef: TypeReference, paramName: string): string {
        return TypeReference._visit(typeRef, {
            primitive: () => paramName,
            named: (namedType) => {
                const typeDeclaration = this.context.ir.types[namedType.typeId];
                if (typeDeclaration?.shape.type === "alias") {
                    const aliasedType = typeDeclaration.shape.aliasOf;
                    if (
                        TypeReference._visit(aliasedType, {
                            primitive: () => true,
                            named: () => false,
                            container: () => false,
                            unknown: () => false,
                            _other: () => false
                        })
                    ) {
                        return `${paramName}.0`;
                    }
                }
                return paramName;
            },
            container: () => paramName,
            unknown: () => paramName,
            _other: () => paramName
        });
    }

    private getRequestBody(endpoint: HttpEndpoint, params: EndpointParameter[]): string {
        const requestBodyParam = params.find((param) => param.name === "request");
        if (requestBodyParam && endpoint.requestBody) {
            return "Some(serde_json::to_value(request).unwrap_or_default())";
        }
        return "None";
    }

    private getReturnType(endpoint: HttpEndpoint): rust.Type {
        if (endpoint.response?.body) {
            return endpoint.response.body._visit({
                json: (jsonResponse) => {
                    if (jsonResponse.responseBodyType) {
                        return generateRustTypeForTypeReference(jsonResponse.responseBodyType);
                    }
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                },
                fileDownload: () => rust.Type.vec(rust.Type.primitive(rust.PrimitiveType.U8)),
                text: () => rust.Type.primitive(rust.PrimitiveType.String),
                bytes: () => rust.Type.vec(rust.Type.primitive(rust.PrimitiveType.U8)),
                streaming: () => {
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                },
                streamParameter: () => rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" })),
                _other: () => rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }))
            });
        }

        return rust.Type.tuple([]);
    }

    // =============================================================================
    // TYPE UTILITIES
    // =============================================================================

    private shouldPassByReference(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: (primitiveType) => {
                return PrimitiveTypeV1._visit(primitiveType.v1, {
                    string: () => true,
                    boolean: () => false,
                    integer: () => false,
                    uint: () => false,
                    uint64: () => false,
                    long: () => false,
                    float: () => false,
                    double: () => false,
                    bigInteger: () => true, // BigInt is large, pass by reference
                    date: () => true,
                    dateTime: () => true,
                    base64: () => true, // Base64 strings are typically large
                    uuid: () => true,
                    _other: () => true
                });
            },
            named: () => true, // User-defined types usually passed by reference
            container: () => true, // Collections passed by reference
            unknown: () => true,
            _other: () => true
        });
    }

    private isCollectionType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: () => false,
            named: () => false,
            container: (container) => {
                return container._visit({
                    map: () => true,
                    set: () => true,
                    list: () => false,
                    optional: (innerType) => this.isCollectionType(innerType),
                    nullable: (innerType) => this.isCollectionType(innerType),
                    literal: () => false,
                    _other: () => false
                });
            },
            unknown: () => false,
            _other: () => false
        });
    }

    private isComplexType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: () => false,
            named: () => true,
            container: () => true,
            unknown: () => true,
            _other: () => true
        });
    }

    private isStringType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: (primitive) => {
                return primitive.v1 === PrimitiveTypeV1.String;
            },
            named: () => false,
            container: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    private isOptionalContainerType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: () => false,
            named: () => false,
            container: (container) => {
                return container._visit({
                    optional: () => true,
                    nullable: () => true,
                    list: () => false,
                    set: () => false,
                    map: () => false,
                    literal: () => false,
                    _other: () => false
                });
            },
            unknown: () => false,
            _other: () => false
        });
    }

    // =============================================================================
    // PAGINATION SUPPORT
    // =============================================================================

    private generatePaginatedMethods(endpoint: HttpEndpoint): rust.Client.SimpleMethod[] {
        const methods: rust.Client.SimpleMethod[] = [];

        if (endpoint.pagination) {
            // Generate simple paginated method that follows the same pattern as regular methods
            methods.push(this.generatePaginatedMethod(endpoint));
        }

        return methods;
    }

    private generatePaginatedMethod(endpoint: HttpEndpoint): rust.Client.SimpleMethod {
        if (!endpoint.pagination) {
            throw new Error("Cannot generate paginated method for endpoint without pagination");
        }

        const params = this.extractParametersFromEndpoint(endpoint);
        const parameters = this.buildMethodParameters(params);
        const baseName = endpoint.name.snakeCase.safeName;
        const httpMethod = this.getHttpMethod(endpoint);
        const pathExpression = this.getPathExpression(endpoint);
        const requestBody = this.getRequestBody(endpoint, params);

        // Always use generic serde_json::Value for maximum compatibility
        const itemType = rust.Type.reference(rust.reference({ name: "serde_json::Value" }));

        // Return AsyncPaginator<ItemType> with proper typing
        const returnType = rust.Type.result(
            rust.Type.reference(
                rust.reference({
                    name: "AsyncPaginator",
                    genericArgs: [itemType]
                })
            ),
            rust.Type.reference(rust.reference({ name: "ClientError" }))
        );

        // Generate pagination logic based on pagination type
        const paginationLogic = this.generatePaginationLogic(endpoint, httpMethod, pathExpression, requestBody);

        return {
            name: baseName,
            parameters,
            returnType: returnType.toString(),
            isAsync: true,
            body: paginationLogic
        };
    }

    private generatePaginationLogic(
        endpoint: HttpEndpoint,
        httpMethod: string,
        pathExpression: string,
        requestBody: string
    ): string {
        if (!endpoint.pagination) {
            throw new Error("Cannot generate pagination logic without pagination configuration");
        }

        return Pagination._visit(endpoint.pagination, {
            cursor: (cursor) =>
                this.generateCursorPaginationLogic(endpoint, httpMethod, pathExpression, requestBody, cursor),
            offset: (offset) =>
                this.generateOffsetPaginationLogic(endpoint, httpMethod, pathExpression, requestBody, offset),
            custom: (_custom) => this.generateCustomPaginationLogic(endpoint, httpMethod, pathExpression, requestBody),
            _other: () => {
                throw new Error("Unknown pagination type");
            }
        });
    }

    private generateCursorPaginationLogic(
        endpoint: HttpEndpoint,
        httpMethod: string,
        pathExpression: string,
        requestBody: string,
        cursor: CursorPagination
    ): string {
        const queryParams = this.buildQueryParametersWithoutPagination(endpoint, Pagination.cursor(cursor));
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate cloning statements for reference parameters to avoid lifetime issues
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_clone = ${param.name}.clone();`)
            .join("\\n            ");

        // Extract the cursor parameter name from the pagination configuration
        const cursorParamName = this.getCursorParamName(cursor);

        return `let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = ${queryParams};
            let options_clone = options.clone();
            ${cloningStatements}
            
            AsyncPaginator::new(
                http_client,
                move |client, cursor_value| {
                    let mut query_params: Vec<(String, String)> = base_query_params.clone().unwrap_or_default();
                    if let Some(cursor) = cursor_value {
                        // Add cursor parameter based on pagination configuration
                        query_params.push(("${cursorParamName}".to_string(), cursor));
                    }
                    let options_for_request = options_clone.clone();
                    
                    // Clone captured variables to move into the async block
                    ${this.generateCapturedVariableCloningForAsyncMove(params)}
                    
                    Box::pin(async move {
                        let response: serde_json::Value = client.execute_request(
                            Method::${httpMethod},
                            ${this.buildPathExpressionForAsyncMove(pathExpression, params)},
                            ${this.buildRequestBodyForAsyncMove(requestBody, params)},
                            Some(query_params),
                            options_for_request,
                        ).await?;
                        
                        // Extract pagination info from response
                        ${this.generatePaginationExtraction(endpoint, false)}
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None, // Start with no cursor
            )`;
    }

    private generateOffsetPaginationLogic(
        endpoint: HttpEndpoint,
        httpMethod: string,
        pathExpression: string,
        requestBody: string,
        offset: OffsetPagination
    ): string {
        const queryParams = this.buildQueryParametersWithoutPagination(endpoint, Pagination.offset(offset));
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate cloning statements for reference parameters to avoid lifetime issues
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_clone = ${param.name}.clone();`)
            .join("\\n            ");

        const pageParamName = offset.page?.property?.name?.wireValue || "page";

        return `let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = ${queryParams};
            let options_clone = options.clone();
            ${cloningStatements}
            
            AsyncPaginator::new(
                http_client,
                move |client, page_token| {
                    let mut query_params: Vec<(String, String)> = base_query_params.clone().unwrap_or_default();
                    
                    // Use page_token as offset/page number (start from 0 if None)
                    let current_page = page_token.unwrap_or_else(|| "0".to_string());
                    query_params.push(("${pageParamName}".to_string(), current_page.clone()));
                    
                    let options_for_request = options_clone.clone();
                    
                    // Clone captured variables to move into the async block
                    ${this.generateCapturedVariableCloningForAsyncMove(params)}
                    
                    Box::pin(async move {
                        let response: serde_json::Value = client.execute_request(
                            Method::${httpMethod},
                            ${this.buildPathExpressionForAsyncMove(pathExpression, params)},
                            ${this.buildRequestBodyForAsyncMove(requestBody, params)},
                            Some(query_params),
                            options_for_request,
                        ).await?;
                        
                        // Extract pagination info from response
                        ${this.generatePaginationExtraction(endpoint, true)}
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None, // Start with page 0
            )`;
    }

    private generateCustomPaginationLogic(
        endpoint: HttpEndpoint,
        httpMethod: string,
        pathExpression: string,
        requestBody: string
    ): string {
        // For custom pagination, generate a basic implementation that can be customized
        const queryParams = this.buildQueryParameters(endpoint);
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate cloning statements for reference parameters to avoid lifetime issues
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_clone = ${param.name}.clone();`)
            .join("\\n            ");

        return `let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = ${queryParams};
            let options_clone = options.clone();
            ${cloningStatements}
            
            AsyncPaginator::new(
                http_client,
                move |client, cursor_value| {
                    let query_params = base_query_params.clone();
                    let options_for_request = options_clone.clone();
                    // Custom pagination logic would go here
                    
                    // Clone captured variables to move into the async block
                    ${this.generateCapturedVariableCloningForAsyncMove(params)}
                    
                    Box::pin(async move {
                        let response: serde_json::Value = client.execute_request(
                            Method::${httpMethod},
                            ${this.buildPathExpressionForAsyncMove(pathExpression, params)},
                            ${this.buildRequestBodyForAsyncMove(requestBody, params)},
                            query_params,
                            options_for_request,
                        ).await?;
                        
                        // Custom extraction logic would go here
                        ${this.generatePaginationExtraction(endpoint)}
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None,
            )`;
    }

    // =============================================================================
    // PAGINATION UTILITIES
    // =============================================================================

    private generateCapturedVariableCloningForAsyncMove(params: EndpointParameter[]): string {
        // Generate cloning statements for each captured variable inside the closure
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_for_async = ${param.name}_clone.clone();`)
            .join("\\n                    ");

        return cloningStatements;
    }

    private buildPathExpressionForAsyncMove(pathExpression: string, params: EndpointParameter[]): string {
        // Replace references with async-move versions
        let result = pathExpression;

        params
            .filter((param) => param.isRef)
            .forEach((param) => {
                const originalRef = param.name;
                const asyncRef = `${param.name}_for_async`;
                result = result.replace(new RegExp(`\\\\b${originalRef}\\\\b`, "g"), asyncRef);
            });

        return result;
    }

    private buildRequestBodyForAsyncMove(requestBody: string, params: EndpointParameter[]): string {
        // Replace references with async-move versions
        let result = requestBody;

        params
            .filter((param) => param.isRef)
            .forEach((param) => {
                const originalRef = param.name;
                const asyncRef = `${param.name}_for_async`;
                result = result.replace(new RegExp(`\\\\b${originalRef}\\\\b`, "g"), asyncRef);
            });

        return result;
    }

    private generatePaginationExtraction(endpoint: HttpEndpoint, isOffsetPagination: boolean = false): string {
        if (!endpoint.pagination) {
            return `let items = vec![];
                        let next_cursor: Option<String> = None;
                        let has_next_page = false;`;
        }

        return Pagination._visit(endpoint.pagination, {
            cursor: (cursor) => this.generateGenericCursorExtraction(cursor),
            offset: (offset) => this.generateGenericOffsetExtraction(offset, isOffsetPagination),
            custom: () => this.generateGenericCustomExtraction(),
            _other: () => this.generateGenericCustomExtraction()
        });
    }

    private generateGenericCursorExtraction(cursor: CursorPagination): string {
        // Build field paths from the pagination configuration
        const resultsPath = this.buildResponseFieldPath(cursor.results);
        const cursorPath = cursor.next ? this.buildResponseFieldPath(cursor.next) : null;

        // For cursor path, it's already properly formatted with and_then chains
        const cursorExtraction = cursorPath
            ? `response${cursorPath}.and_then(|v| v.as_str().map(|s| s.to_string()))`
            : "None";

        return `// Generic field extraction using pagination configuration
                        let items: Vec<serde_json::Value> = response
                            ${resultsPath}
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let next_cursor: Option<String> = ${cursorExtraction};
                        let has_next_page = next_cursor.is_some();`;
    }

    private generateGenericOffsetExtraction(offset: OffsetPagination, isInPaginationLoop: boolean = false): string {
        const resultsPath = this.buildResponseFieldPath(offset.results);
        const hasNextPath = offset.hasNextPage ? this.buildResponseFieldPath(offset.hasNextPage) : null;
        const stepParamName = this.getStepParamName(offset);

        // For hasNextPage path, it's already properly formatted with and_then chains
        const hasNextPageCheck = hasNextPath
            ? `response${hasNextPath}.and_then(|v| v.as_bool()).unwrap_or(!items.is_empty())`
            : "!items.is_empty()";

        if (isInPaginationLoop) {
            return `// Generic field extraction for offset pagination
                        let items: Vec<serde_json::Value> = response
                            ${resultsPath}
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let has_next_page = ${hasNextPageCheck};
                        // Calculate next page number for offset pagination
                        let next_cursor: Option<String> = if has_next_page {
                            let current_page_num: u64 = current_page.parse().unwrap_or(0);
                            let step_size = if let Some(step) = response.get("${stepParamName}") {
                                step.as_u64().unwrap_or(1)
                            } else {
                                1 // Default step size
                            };
                            Some((current_page_num + step_size).to_string())
                        } else {
                            None
                        };`;
        } else {
            return `// Generic field extraction for offset pagination
                        let items: Vec<serde_json::Value> = response
                            ${resultsPath}
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        // Offset pagination tracking handled by paginator
                        let next_cursor: Option<String> = None;
                        let has_next_page = ${hasNextPageCheck};`;
        }
    }

    private generateGenericCustomExtraction(): string {
        return `// Generic extraction for custom pagination - tries common field names
                        let items: Vec<serde_json::Value> = response
                            .get("data")
                            .or_else(|| response.get("results"))
                            .or_else(|| response.get("items"))
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let next_cursor: Option<String> = None;
                        let has_next_page = false; // Custom pagination requires manual implementation`;
    }

    private buildResponseFieldPath(property: ResponseProperty): string {
        if (!property) {
            return '.get("data")'; // Default fallback
        }

        // Extract the complete property path from the ResponseProperty structure
        const fieldPath = this.extractResponseFieldPath(property);

        // For nested paths, we need to chain .and_then() calls properly
        if (fieldPath.length === 1) {
            return `.get("${fieldPath[0]}")`;
        } else if (fieldPath.length > 1) {
            // Build a chain of .and_then() for nested paths
            let result = "";
            for (let i = 0; i < fieldPath.length; i++) {
                if (i === 0) {
                    result = `.get("${fieldPath[i]}")`;
                } else {
                    result += `.and_then(|v| v.get("${fieldPath[i]}"))`;
                }
            }
            return result;
        }
        return '.get("data")';
    }

    private extractResponseFieldPath(property: ResponseProperty): string[] {
        if (!property) {
            return ["data"];
        }

        const path: string[] = [];

        // If there's a propertyPath (nested properties), add them first
        if (property.propertyPath && Array.isArray(property.propertyPath)) {
            property.propertyPath.forEach((pathItem) => {
                path.push(pathItem.originalName);
            });
        }

        // Finally, add the property name itself
        path.push(property.property.name.wireValue);

        // If path is still empty, use default
        return path.length > 0 ? path : ["data"];
    }

    private getCursorParamName(cursor: CursorPagination): string {
        // Extract cursor parameter name from pagination configuration
        return cursor.page.property._visit({
            query: (query) => query.name.wireValue,
            body: (body) => body.name.wireValue,
            _other: () => "cursor"
        });
    }

    private getStepParamName(offset: OffsetPagination): string {
        // Extract step parameter name from pagination configuration
        if (offset.step) {
            return offset.step.property._visit({
                query: (query) => query.name.wireValue,
                body: (body) => body.name.wireValue,
                _other: () => "step"
            });
        }
        return "per_page"; // Default fallback
    }
}
