import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "@fern-api/rust-model";

import {
    ApiAuth,
    AuthScheme,
    HttpEndpoint,
    HttpService,
    Pagination,
    PrimitiveTypeV1,
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
    private readonly auth: ApiAuth;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
        this.auth = context.ir.auth;
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
    // HTTP METHOD GENERATION
    // =============================================================================

    private convertEndpointsToHttpMethods(endpoints: HttpEndpoint[]): rust.Client.SimpleMethod[] {
        const methods: rust.Client.SimpleMethod[] = [];

        for (const endpoint of endpoints) {
            // Generate regular method
            methods.push(this.generateHttpMethod(endpoint));

            // Generate paginated methods if endpoint supports pagination
            if (endpoint.pagination) {
                methods.push(...this.generatePaginatedMethods(endpoint));
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
        // Remove this line as we're now handling query params separately

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
            params.push({
                name: queryParam.name.name.snakeCase.safeName,
                type: generateRustTypeForTypeReference(queryParam.valueType),
                optional: true,
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
    // TYPE AND REFERENCE UTILITIES
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

    private isOptionalType(typeRef: TypeReference): boolean {
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

    private buildQueryParameters(endpoint: HttpEndpoint): string {
        const queryParams = endpoint.queryParameters;
        if (queryParams.length === 0) {
            return "None";
        }

        // Generate code to build Vec<(String, String)> with query parameters
        const queryParamStatements = queryParams.map((queryParam) => {
            const paramName = queryParam.name.name.snakeCase.safeName;
            const wireValue = queryParam.name.wireValue;
            const isOptionalType = this.isOptionalType(queryParam.valueType);
            const pattern = isOptionalType ? `Some(Some(value))` : `Some(value)`;
            const valueExpression = this.isComplexType(queryParam.valueType)
                ? "serde_json::to_string(&value).unwrap_or_default()"
                : "value.to_string()";

            return `if let ${pattern} = ${paramName} {
                query_params.push(("${wireValue}".to_string(), ${valueExpression}));
            }`;
        });

        return `{
            let mut query_params = Vec::new();
            ${queryParamStatements.join("\n            ")}
            Some(query_params)
        }`;
    }

    // =============================================================================
    // PAGINATION METHODS
    // =============================================================================

    private generatePaginatedMethods(endpoint: HttpEndpoint): rust.Client.SimpleMethod[] {
        const methods: rust.Client.SimpleMethod[] = [];

        if (endpoint.pagination) {
            // Generate simple paginated method that follows the same pattern as regular methods
            methods.push(this.generateSimplePaginatedMethod(endpoint));
        }

        return methods;
    }

    private generateSimplePaginatedMethod(endpoint: HttpEndpoint): rust.Client.SimpleMethod {
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
            name: `${baseName}_paginated`,
            parameters,
            returnType: returnType.toString(),
            isAsync: true,
            body: paginationLogic
        };
    }

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

    // =============================================================================
    // PAGINATION HELPER METHODS
    // =============================================================================

    private getItemTypeFromPaginatedResponse(endpoint: HttpEndpoint): rust.Type {
        if (!endpoint.pagination) {
            throw new Error("Endpoint does not have pagination configuration");
        }

        // Get the response type and extract the results field type
        return Pagination._visit(endpoint.pagination, {
            cursor: (cursor) => {
                // For cursor pagination, extract the type from the results property
                // This would typically be the array element type
                return this.extractItemTypeFromResultsProperty(endpoint, cursor.results);
            },
            offset: (offset) => {
                // For offset pagination, extract the type from the results property
                return this.extractItemTypeFromResultsProperty(endpoint, offset.results);
            },
            custom: (_custom) => {
                // For custom pagination, we need to infer the item type
                // For now, use a generic approach
                return rust.Type.reference(rust.reference({ name: "serde_json::Value" }));
            },
            _other: () => {
                return rust.Type.reference(rust.reference({ name: "serde_json::Value" }));
            }
        });
    }

    private extractItemTypeFromResultsProperty(_endpoint: HttpEndpoint, _resultsProperty: any): rust.Type {
        // This is a simplified approach - in practice, you'd need to analyze the response type
        // and extract the array element type from the results property path
        // For now, we'll return a generic type that can be specialized based on the endpoint

        // For complex type analysis, we would need to:
        // 1. Follow the resultsProperty path in the response type
        // 2. Extract the array element type from that path
        // 3. Generate the appropriate Rust type

        // For now, fallback to generic JSON value - this should be improved
        // to extract the actual item type from the paginated response
        return rust.Type.reference(rust.reference({ name: "serde_json::Value" }));
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
        cursor: any
    ): string {
        const queryParams = this.buildQueryParameters(endpoint);
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate cloning statements for reference parameters to avoid lifetime issues
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_clone = ${param.name}.clone();`)
            .join("\n            ");

        return `{
            let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = ${queryParams};
            let options_clone = options.clone();
            ${cloningStatements}
            
            AsyncPaginator::new(
                http_client,
                move |client, cursor_value| {
                    let mut query_params: Vec<(String, String)> = base_query_params.clone().unwrap_or_default();
                    if let Some(cursor) = cursor_value {
                        // Add cursor parameter based on pagination configuration
                        query_params.push(("${cursor.page.property?.name?.wireValue || "cursor"}".to_string(), cursor));
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
                        ${this.generateSimplePaginationExtraction(endpoint)}
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None, // Start with no cursor
            )
        }`;
    }

    private generateOffsetPaginationLogic(
        endpoint: HttpEndpoint,
        httpMethod: string,
        pathExpression: string,
        requestBody: string,
        offset: any
    ): string {
        const queryParams = this.buildQueryParameters(endpoint);
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate cloning statements for reference parameters to avoid lifetime issues
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_clone = ${param.name}.clone();`)
            .join("\n            ");

        return `{
            let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = ${queryParams};
            let options_clone = options.clone();
            ${cloningStatements}
            
            AsyncPaginator::new(
                http_client,
                move |client, page_token| {
                    let mut query_params: Vec<(String, String)> = base_query_params.clone().unwrap_or_default();
                    
                    // Use page_token as offset/page number (start from 0 if None)
                    let current_page = page_token.unwrap_or_else(|| "0".to_string());
                    query_params.push(("${offset.page.property?.name?.wireValue || "page"}".to_string(), current_page.clone()));
                    
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
                        ${this.generateSimplePaginationExtraction(endpoint)}
                        
                        // Calculate next page number for offset pagination
                        let next_cursor: Option<String> = if has_next_page {
                            let current_page_num: u64 = current_page.parse().unwrap_or(0);
                            let step_size = if let Some(step) = response.get("${offset.step?.property?.name?.wireValue || "per_page"}") {
                                step.as_u64().unwrap_or(1)
                            } else {
                                1 // Default step size
                            };
                            Some((current_page_num + step_size).to_string())
                        } else {
                            None
                        };
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None, // Start with page 0
            )
        }`;
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
            .join("\n            ");

        return `{
            let http_client = std::sync::Arc::new(self.http_client.clone());
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
                        ${this.generateSimplePaginationExtraction(endpoint)}
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None,
            )
        }`;
    }

    // =============================================================================
    // CLOSURE HELPER METHODS
    // =============================================================================

    private generateCapturedVariableCloningForAsyncMove(params: EndpointParameter[]): string {
        // Generate cloning statements for each captured variable inside the closure
        const cloningStatements = params
            .filter((param) => param.isRef)
            .map((param) => `let ${param.name}_for_async = ${param.name}_clone.clone();`)
            .join("\n                    ");

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
                result = result.replace(new RegExp(`\\b${originalRef}\\b`, "g"), asyncRef);
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
                result = result.replace(new RegExp(`\\b${originalRef}\\b`, "g"), asyncRef);
            });

        return result;
    }

    private generateSimplePaginationExtraction(endpoint: HttpEndpoint): string {
        if (!endpoint.pagination) {
            return `let items = vec![];
                        let next_cursor: Option<String> = None;
                        let has_next_page = false;`;
        }

        return Pagination._visit(endpoint.pagination, {
            cursor: (cursor) => this.generateGenericCursorExtraction(cursor),
            offset: (offset) => this.generateGenericOffsetExtraction(offset),
            custom: () => this.generateGenericCustomExtraction(),
            _other: () => this.generateGenericCustomExtraction()
        });
    }

    private generateGenericCursorExtraction(cursor: any): string {
        // Build field paths from the pagination configuration
        const resultsPath = this.buildFieldPath(cursor.results);
        const cursorPath = cursor.next ? this.buildFieldPath(cursor.next) : null;

        return `// Generic field extraction using pagination configuration
                        let items: Vec<serde_json::Value> = response
                            ${resultsPath}
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let next_cursor: Option<String> = ${cursorPath ? `response${cursorPath}.and_then(|v| v.as_str().map(|s| s.to_string()))` : "None"};
                        let has_next_page = next_cursor.is_some();`;
    }

    private generateGenericOffsetExtraction(offset: any): string {
        const resultsPath = this.buildFieldPath(offset.results);
        const hasNextPath = offset.hasNextPage ? this.buildFieldPath(offset.hasNextPage) : null;

        return `// Generic field extraction for offset pagination
                        let items: Vec<serde_json::Value> = response
                            ${resultsPath}
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let has_next_page = ${hasNextPath ? `response${hasNextPath}.and_then(|v| v.as_bool()).unwrap_or(!items.is_empty())` : "!items.is_empty()"};
                        let next_cursor: Option<String> = None; // Offset pagination doesn't use cursors`;
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

    private buildFieldPath(property: any): string {
        if (!property) return '.get("data")'; // Default fallback

        // Build the path from the property configuration
        const path = this.extractFieldPath(property);
        return path.map((field) => `.get("${field}")`).join("");
    }

    private extractFieldPath(property: any): string[] {
        if (!property) return ["data"];

        // Handle different property types from the IR
        if (property.property) {
            return [property.property.name?.wireValue || property.property.name?.originalName || "data"];
        }

        if (property.name) {
            return [property.name.wireValue || property.name.originalName || "data"];
        }

        // If it's a nested path, build it recursively
        if (property.path && Array.isArray(property.path)) {
            return property.path.map((p: any) => p.name?.wireValue || p.name?.originalName || "data");
        }

        return ["data"]; // Safe default
    }
}
