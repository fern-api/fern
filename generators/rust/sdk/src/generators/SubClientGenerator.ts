import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "@fern-api/rust-model";

import {
    ContainerType,
    CursorPagination,
    HttpEndpoint,
    HttpRequestBody,
    HttpResponseBody,
    HttpService,
    OffsetPagination,
    Pagination,
    PrimitiveTypeV1,
    QueryParameter,
    ResponseProperty,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";

interface EndpointParameter {
    name: string;
    type: rust.Type;
    isRef: boolean;
    optional: boolean;
}

interface ImportAnalysis {
    stdCollections: string[];
    chrono: string[];
    serdeJson: string[];
    uuid: string[];
    numBigint: string[];
    orderedFloat: string[];
}

export class SubClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly subpackage: Subpackage;
    private readonly service?: HttpService;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
        this.clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: subpackage,
            sdkGeneratorContext: context
        });
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public generate(): RustFile | null {
        const hasSubClients = this.hasSubClients();
        const fernFilepathDir = this.context.getDirectoryForFernFilepath(this.subpackage.fernFilepath);

        // If this subpackage has subclients and is in a nested directory,
        // we'll generate a unified mod.rs instead of a separate client file
        if (hasSubClients && fernFilepathDir) {
            return null; // Skip separate client file generation
        }

        // Generate regular client file for subpackages without subclients
        const filename = this.context.getUniqueFilenameForSubpackage(this.subpackage);
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

        const directory = fernFilepathDir ? `src/api/resources/${fernFilepathDir}` : "src/api/resources";

        return new RustFile({
            filename,
            directory: RelativeFilePath.of(directory),
            fileContents: module.toString()
        });
    }

    public generateModFile(): RustFile | null {
        const fernFilepathDir = this.context.getDirectoryForFernFilepath(this.subpackage.fernFilepath);
        if (!fernFilepathDir) {
            return null; // No nested directory, mod.rs not needed
        }

        const filename = this.context.getUniqueFilenameForSubpackage(this.subpackage);
        const moduleName = filename.replace(".rs", "");

        const module = rust.module({
            useStatements: [],
            rawDeclarations: [`pub mod ${moduleName};`, `pub use ${moduleName}::${this.subClientName};`]
        });

        const directory = `src/api/resources/${fernFilepathDir}`;

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of(directory),
            fileContents: module.toString()
        });
    }

    // =============================================================================
    // CLIENT STRUCTURE GENERATION
    // =============================================================================

    private get subClientName(): string {
        // Use centralized method to create unique client names to prevent collisions
        return this.context.getUniqueClientNameForSubpackage(this.subpackage);
    }

    private generateImports(): UseStatement[] {
        const hasQueryParams = this.hasQueryParameters();
        const hasEndpoints = this.hasEndpoints();
        const typeAnalysis = this.analyzeRequiredImports();
        const hasSubClients = this.hasSubClients();
        const endpointsUseCustomTypes = this.endpointsUseCustomTypes();
        const hasBinaryEndpoints = this.hasBinaryEndpoints();
        const hasSseEndpoints = this.hasSseEndpoints();
        const hasJsonStreamingEndpoints = this.hasJsonStreamingEndpoints();

        // Build base crate imports conditionally
        const crateItems = ["ClientConfig", "ApiError", "HttpClient"];

        // Only add RequestOptions if we have endpoints that use it
        if (hasEndpoints) {
            crateItems.push("RequestOptions");
        }

        // Add ByteStream if we have binary endpoints (file downloads)
        if (hasBinaryEndpoints) {
            crateItems.push("ByteStream");
        }

        // Add SseStream if we have SSE endpoints
        if (hasSseEndpoints) {
            crateItems.push("SseStream");
        }

        if (hasQueryParams) {
            crateItems.push("QueryBuilder");
        }

        const imports = [
            new UseStatement({
                path: "crate",
                items: crateItems
            })
        ];

        // Only add reqwest::Method if we have endpoints
        if (hasEndpoints) {
            imports.push(
                new UseStatement({
                    path: "reqwest",
                    items: ["Method"]
                })
            );
        }

        // Add futures::Stream if we have JSON streaming endpoints (they return impl Stream<...>)
        if (hasJsonStreamingEndpoints) {
            imports.push(
                new UseStatement({
                    path: "futures",
                    items: ["Stream"]
                })
            );
        }

        // Add std::collections imports for HashMap, HashSet, BTreeMap, etc.
        if (typeAnalysis.stdCollections.length > 0) {
            imports.push(
                new UseStatement({
                    path: "std::collections",
                    items: typeAnalysis.stdCollections
                })
            );
        }

        // Add chrono imports for DateTime, Utc, NaiveDate
        if (typeAnalysis.chrono.length > 0) {
            imports.push(
                new UseStatement({
                    path: "chrono",
                    items: typeAnalysis.chrono
                })
            );
        }

        // Add uuid imports
        if (typeAnalysis.uuid.length > 0) {
            imports.push(
                new UseStatement({
                    path: "uuid",
                    items: typeAnalysis.uuid
                })
            );
        }

        // Add num_bigint imports
        if (typeAnalysis.numBigint.length > 0) {
            imports.push(
                new UseStatement({
                    path: "num_bigint",
                    items: typeAnalysis.numBigint
                })
            );
        }

        // Add ordered_float imports
        if (typeAnalysis.orderedFloat.length > 0) {
            imports.push(
                new UseStatement({
                    path: "ordered_float",
                    items: typeAnalysis.orderedFloat
                })
            );
        }

        // Add crate::api imports if we have sub-clients OR if endpoints use custom types OR query request types
        const hasQueryRequestTypes = this.hasQueryRequestTypes();
        if (hasSubClients || endpointsUseCustomTypes || hasQueryRequestTypes) {
            imports.push(
                new UseStatement({
                    path: "crate::api",
                    items: ["*"]
                })
            );
        }

        return imports;
    }

    private generateFields(): rust.Client.Field[] {
        const fields: rust.Client.Field[] = [
            {
                name: this.clientGeneratorContext.httpClient.fieldName,
                type: rust.Type.reference(
                    rust.reference({ name: this.clientGeneratorContext.httpClient.clientName })
                ).toString(),
                visibility: "pub"
            }
        ];

        // Add sub-client fields
        this.clientGeneratorContext.subClients.forEach(({ fieldName, clientName }) => {
            fields.push({
                name: fieldName,
                type: rust.Type.reference(rust.reference({ name: clientName })).toString(),
                visibility: "pub"
            });
        });

        return fields;
    }

    private generateConstructor(): rust.Client.SimpleMethod {
        const selfType = rust.Type.reference(rust.reference({ name: "Self" }));
        const errorType = rust.Type.reference(rust.reference({ name: "ApiError" }));
        const returnType = rust.Type.result(selfType, errorType);

        // Use simple parameter signature with just config
        const parameters = ["config: ClientConfig"];

        // Build field assignments using AST
        const fieldAssignments: rust.Expression.FieldAssignment[] = [];

        // Add HTTP client field
        fieldAssignments.push({
            name: this.clientGeneratorContext.httpClient.fieldName,
            value: rust.Expression.try(
                rust.Expression.functionCall(`${this.clientGeneratorContext.httpClient.clientName}::new`, [
                    rust.Expression.methodCall({
                        target: rust.Expression.reference("config"),
                        method: "clone",
                        args: []
                    })
                ])
            )
        });

        // Add sub-client fields
        this.clientGeneratorContext.subClients.forEach(({ fieldName, clientName }) => {
            fieldAssignments.push({
                name: fieldName,
                value: rust.Expression.try(
                    rust.Expression.functionCall(`${clientName}::new`, [
                        rust.Expression.methodCall({
                            target: rust.Expression.reference("config"),
                            method: "clone",
                            args: []
                        })
                    ])
                )
            });
        });

        // Create struct construction expression
        const structConstruction = rust.Expression.structConstruction("Self", fieldAssignments);

        // Wrap in Ok()
        const constructorBody = rust.Expression.ok(structConstruction);

        return {
            name: "new",
            parameters,
            returnType: returnType.toString(),
            isAsync: false,
            body: constructorBody.toString()
        };
    }

    // =============================================================================
    // CAPABILITY DETECTION
    // =============================================================================

    private hasEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.length > 0;
    }

    private hasSubClients(): boolean {
        return this.clientGeneratorContext.subClients.length > 0;
    }

    private endpointsUseCustomTypes(): boolean {
        const endpoints = this.service?.endpoints || [];

        return endpoints.some((endpoint) => {
            // Check if any path parameters use custom types
            const pathUsesCustomTypes = endpoint.allPathParameters.some((pathParam) =>
                this.isCustomType(pathParam.valueType)
            );

            // Check if any query parameters use custom types
            const queryUsesCustomTypes = endpoint.queryParameters.some((queryParam) =>
                this.isCustomType(queryParam.valueType)
            );

            // Check if request body uses custom types
            const requestUsesCustomTypes = endpoint.requestBody
                ? this.requestBodyUsesCustomTypes(endpoint.requestBody)
                : false;

            // Check if response uses custom types
            const responseUsesCustomTypes = endpoint.response?.body
                ? this.responseUsesCustomTypes(endpoint.response.body)
                : false;

            return pathUsesCustomTypes || queryUsesCustomTypes || requestUsesCustomTypes || responseUsesCustomTypes;
        });
    }

    private isCustomType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: () => false, // Built-in types like String, i32, etc.
            named: () => true, // Custom user-defined types
            container: (container) => {
                return container._visit({
                    optional: (innerType) => this.isCustomType(innerType),
                    nullable: (innerType) => this.isCustomType(innerType),
                    list: (innerType) => this.isCustomType(innerType),
                    set: (innerType) => this.isCustomType(innerType),
                    map: (mapType) => this.isCustomType(mapType.keyType) || this.isCustomType(mapType.valueType),
                    literal: () => false,
                    _other: () => false
                });
            },
            unknown: () => false,
            _other: () => false
        });
    }

    private requestBodyUsesCustomTypes(requestBody: HttpRequestBody): boolean {
        return requestBody._visit({
            inlinedRequestBody: (inlinedBody) => {
                // Check if any properties use custom types
                return true;
            },
            reference: (reference) => this.isCustomType(reference.requestBodyType),
            fileUpload: () => false, // File uploads don't typically use custom types
            bytes: () => false, // Bytes are built-in
            _other: () => false
        });
    }

    private responseUsesCustomTypes(responseBody: HttpResponseBody): boolean {
        return responseBody._visit({
            json: (jsonResponse) => {
                return jsonResponse.responseBodyType ? this.isCustomType(jsonResponse.responseBodyType) : false;
            },
            fileDownload: () => false,
            text: () => false,
            bytes: () => false,
            streaming: () => false,
            streamParameter: () => false,
            _other: () => false
        });
    }

    private hasQueryRequestTypes(): boolean {
        const endpoints = this.service?.endpoints || [];

        return endpoints.some((endpoint) => {
            // Check if endpoint has query parameters AND no request body (query-only scenario)
            // OR if it has both query parameters and request body (mixed scenario)
            const hasQueryParams = endpoint.queryParameters.length > 0;

            if (hasQueryParams) {
                // For endpoints with query parameters, we generate request types like:
                // - GetWithQueryQueryRequest (query-only)
                // - CreateUserRequest (mixed - includes both body and query fields)
                return true;
            }

            return false;
        });
    }

    private hasPaginatedEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => endpoint.pagination != null);
    }

    private hasQueryParameters(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => endpoint.queryParameters.length > 0);
    }

    private hasBinaryEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => this.isBinaryResponse(endpoint));
    }

    private hasSseEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => this.getResponseStreamType(endpoint) === "sse");
    }

    private hasJsonStreamingEndpoints(): boolean {
        const endpoints = this.service?.endpoints || [];
        return endpoints.some((endpoint) => this.getResponseStreamType(endpoint) === "json");
    }

    private analyzeRequiredImports(): ImportAnalysis {
        const analysis: ImportAnalysis = {
            stdCollections: [],
            chrono: [],
            serdeJson: [],
            uuid: [],
            numBigint: [],
            orderedFloat: []
        };

        const endpoints = this.service?.endpoints || [];
        if (endpoints.length === 0) {
            return analysis; // No endpoints means no imports needed
        }

        const requiredTypes = new Set<string>();

        // Analyze all type references used in endpoints
        endpoints.forEach((endpoint) => {
            // Analyze path parameters - these can be direct types in method signatures
            endpoint.allPathParameters.forEach((pathParam) => {
                this.collectDirectParameterImports(pathParam.valueType, requiredTypes);
            });

            // Analyze request body types - they can also be direct types in method signatures
            if (endpoint.requestBody) {
                endpoint.requestBody._visit({
                    inlinedRequestBody: () => {
                        // Inlined request bodies use generated structs, no direct imports needed
                    },
                    reference: (reference) => {
                        // Referenced types might be direct primitive containers
                        this.collectDirectParameterImports(reference.requestBodyType, requiredTypes);
                    },
                    fileUpload: () => {
                        // File uploads don't need special imports
                    },
                    bytes: () => {
                        // Bytes are built-in
                    },
                    _other: () => {
                        // Unknown types need serde_json::Value
                        requiredTypes.add("serde_json::Value");
                    }
                });
            }

            // Only add serde_json::Value for untyped responses, but also analyze typed responses
            if (endpoint.response?.body) {
                endpoint.response.body._visit({
                    json: (jsonResponse) => {
                        if (!jsonResponse.responseBodyType) {
                            requiredTypes.add("serde_json::Value");
                        } else {
                            // Typed responses might need direct imports for primitive containers
                            this.collectDirectParameterImports(jsonResponse.responseBodyType, requiredTypes);
                        }
                    },
                    fileDownload: () => {
                        // File downloads use Vec<u8>, no external imports needed
                    },
                    text: () => {
                        // Text uses String, no external imports needed
                    },
                    bytes: () => {
                        // Bytes use Vec<u8>, no external imports needed
                    },
                    streaming: () => {
                        requiredTypes.add("serde_json::Value");
                    },
                    streamParameter: () => {
                        requiredTypes.add("serde_json::Value");
                    },
                    _other: () => {
                        requiredTypes.add("serde_json::Value");
                    }
                });
            }
        });

        // Process the pagination features which always use serde_json::Value
        if (this.hasPaginatedEndpoints()) {
            requiredTypes.add("serde_json::Value");
        }

        // Convert collected types to specific imports
        requiredTypes.forEach((type) => {
            if (type.includes("HashMap")) {
                if (!analysis.stdCollections.includes("HashMap")) {
                    analysis.stdCollections.push("HashMap");
                }
            }
            if (type.includes("HashSet")) {
                if (!analysis.stdCollections.includes("HashSet")) {
                    analysis.stdCollections.push("HashSet");
                }
            }
            if (type.includes("BTreeMap")) {
                if (!analysis.stdCollections.includes("BTreeMap")) {
                    analysis.stdCollections.push("BTreeMap");
                }
            }
            if (type.includes("BTreeSet")) {
                if (!analysis.stdCollections.includes("BTreeSet")) {
                    analysis.stdCollections.push("BTreeSet");
                }
            }
            if (type.includes("DateTime")) {
                if (!analysis.chrono.includes("DateTime")) {
                    analysis.chrono.push("DateTime");
                }
            }
            if (type.includes("Utc")) {
                if (!analysis.chrono.includes("Utc")) {
                    analysis.chrono.push("Utc");
                }
            }
            if (type.includes("NaiveDate")) {
                if (!analysis.chrono.includes("NaiveDate")) {
                    analysis.chrono.push("NaiveDate");
                }
            }
            if (type.includes("serde_json::Value")) {
                if (!analysis.serdeJson.includes("Value")) {
                    analysis.serdeJson.push("Value");
                }
            }
            if (type.includes("Uuid")) {
                if (!analysis.uuid.includes("Uuid")) {
                    analysis.uuid.push("Uuid");
                }
            }
            if (type.includes("BigInt")) {
                if (!analysis.numBigint.includes("BigInt")) {
                    analysis.numBigint.push("BigInt");
                }
            }
            if (type.includes("OrderedFloat")) {
                if (!analysis.orderedFloat.includes("OrderedFloat")) {
                    analysis.orderedFloat.push("OrderedFloat");
                }
            }
        });

        return analysis;
    }

    private collectDirectParameterImports(typeRef: TypeReference, requiredTypes: Set<string>): void {
        TypeReference._visit(typeRef, {
            primitive: (primitive) => {
                PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => {
                        // String is built-in
                    },
                    boolean: () => {
                        // Bool is built-in
                    },
                    integer: () => {
                        // i32 is built-in
                    },
                    uint: () => {
                        // u32 is built-in
                    },
                    uint64: () => {
                        // u64 is built-in
                    },
                    long: () => {
                        // i64 is built-in
                    },
                    float: () => {
                        // f32 is built-in
                    },
                    double: () => {
                        // f64 is built-in
                    },
                    bigInteger: () => requiredTypes.add("BigInt"), // Direct BigInt parameter
                    date: () => requiredTypes.add("NaiveDate"), // Direct NaiveDate parameter
                    dateTime: () => {
                        // Direct DateTime<Utc> parameter
                        requiredTypes.add("DateTime");
                        requiredTypes.add("Utc");
                    },
                    base64: () => {
                        // String is built-in
                    },
                    uuid: () => requiredTypes.add("Uuid"), // Direct Uuid parameter
                    _other: () => {
                        // Other types don't need imports
                    }
                });
            },
            named: () => {
                // Named types are user-defined, no specific imports needed here
            },
            container: (container) => {
                container._visit({
                    map: (mapType) => {
                        requiredTypes.add("HashMap"); // Direct HashMap parameter
                        this.collectDirectParameterImports(mapType.keyType, requiredTypes);
                        this.collectDirectParameterImports(mapType.valueType, requiredTypes);
                    },
                    set: (setType) => {
                        requiredTypes.add("HashSet"); // Direct HashSet parameter
                        this.collectDirectParameterImports(setType, requiredTypes);
                        // Check if we need OrderedFloat for floating point sets
                        if (this.isFloatingPointType(setType)) {
                            requiredTypes.add("OrderedFloat");
                        }
                    },
                    list: (listType) => {
                        // Vec<T> is built-in, no import needed
                        this.collectDirectParameterImports(listType, requiredTypes);
                    },
                    optional: (optionalType) => {
                        // Option<T> is built-in, no import needed
                        this.collectDirectParameterImports(optionalType, requiredTypes);
                    },
                    nullable: (nullableType) => {
                        // Option<T> is built-in, no import needed
                        this.collectDirectParameterImports(nullableType, requiredTypes);
                    },
                    literal: () => {
                        // Literals are built-in
                    },
                    _other: () => requiredTypes.add("serde_json::Value")
                });
            },
            unknown: () => requiredTypes.add("serde_json::Value"),
            _other: () => requiredTypes.add("serde_json::Value")
        });
    }

    private collectTypeFromReference(typeRef: TypeReference, requiredTypes: Set<string>): void {
        // This method is mostly unused now since we only collect direct parameter imports
        // Most types in request/response bodies are serialized and don't need direct imports
        TypeReference._visit(typeRef, {
            primitive: () => {
                // Primitive types in serialized contexts don't need imports
            },
            named: () => {
                // Named types are user-defined, no specific imports needed here
            },
            container: (container) => {
                container._visit({
                    map: (mapType) => {
                        // Recursively check nested types but don't add HashMap import
                        this.collectTypeFromReference(mapType.keyType, requiredTypes);
                        this.collectTypeFromReference(mapType.valueType, requiredTypes);
                    },
                    set: (setType) => {
                        // Recursively check nested types but don't add HashSet import
                        this.collectTypeFromReference(setType, requiredTypes);
                    },
                    list: (listType) => {
                        this.collectTypeFromReference(listType, requiredTypes);
                    },
                    optional: (optionalType) => {
                        this.collectTypeFromReference(optionalType, requiredTypes);
                    },
                    nullable: (nullableType) => {
                        this.collectTypeFromReference(nullableType, requiredTypes);
                    },
                    literal: () => {
                        // Literals are built-in
                    },
                    _other: () => requiredTypes.add("serde_json::Value")
                });
            },
            unknown: () => requiredTypes.add("serde_json::Value"),
            _other: () => requiredTypes.add("serde_json::Value")
        });
    }

    private isFloatingPointType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    float: () => true,
                    double: () => true,
                    string: () => false,
                    boolean: () => false,
                    integer: () => false,
                    uint: () => false,
                    uint64: () => false,
                    long: () => false,
                    bigInteger: () => false,
                    date: () => false,
                    dateTime: () => false,
                    base64: () => false,
                    uuid: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            container: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    // =============================================================================
    // HTTP METHOD GENERATION
    // =============================================================================

    private convertEndpointsToHttpMethods(endpoints: HttpEndpoint[]): rust.Client.SimpleMethod[] {
        const methods: rust.Client.SimpleMethod[] = [];

        for (const endpoint of endpoints) {
            methods.push(this.generateHttpMethod(endpoint));
        }

        return methods;
    }

    private generateHttpMethod(endpoint: HttpEndpoint): rust.Client.SimpleMethod {
        const params = this.extractParametersFromEndpoint(endpoint);
        const parameters = this.buildMethodParameters(params, endpoint);
        const httpMethod = this.getHttpMethod(endpoint);
        const pathExpression = this.getPathExpression(endpoint);
        const requestBody = this.getRequestBody(endpoint, params);

        const returnType = rust.Type.result(
            this.getReturnType(endpoint),
            rust.Type.reference(rust.reference({ name: "ApiError" }))
        );

        // Check if this is a file upload endpoint
        const isFileUpload = this.isFileUploadEndpoint(endpoint);

        // Determine which execute method to use based on request and response types
        const responseType = this.getResponseStreamType(endpoint);
        let executeMethod = "execute_request";
        let typeParameter = "";
        let executeArgs = "";

        if (isFileUpload) {
            // Use multipart request for file uploads
            executeMethod = "execute_multipart_request";
            const multipartBody = "request.clone().to_multipart()";
            executeArgs = `
            Method::${httpMethod},
            ${pathExpression},
            ${multipartBody},
            ${this.buildQueryParameters(endpoint)},
            options,`;
        } else {
            executeArgs = `
            Method::${httpMethod},
            ${pathExpression},
            ${requestBody},
            ${this.buildQueryParameters(endpoint)},
            options,`;

            if (responseType === "binary") {
                executeMethod = "execute_stream_request";
            } else if (responseType === "sse") {
                executeMethod = "execute_sse_request";
                const terminator = this.getSseTerminator(endpoint);
                executeArgs += `\n            ${terminator},`;
            } else if (responseType === "json") {
                // JSON streaming needs explicit type parameter for inference
                const innerType = this.getInnerResponseType(endpoint);
                typeParameter = `::<${innerType}>`;
            }
        }

        return {
            name: endpoint.name.snakeCase.safeName,
            parameters,
            returnType: returnType.toString(),
            isAsync: true,
            body: `self.http_client.${executeMethod}${typeParameter}(${executeArgs}
        ).await`,
            docs: endpoint.docs
                ? rust.docComment({
                      summary: endpoint.docs,
                      parameters: this.extractParameterDocs(params, endpoint),
                      returns: this.getReturnTypeDescription(endpoint)
                  })
                : undefined
        };
    }

    private buildMethodParameters(params: EndpointParameter[], _endpoint: HttpEndpoint): string[] {
        // Separate path parameters from request body
        const pathParams = params.filter((p) => p.name !== "request");
        const requestBodyParam = params.find((p) => p.name === "request");

        const methodParams: string[] = [];

        // Add path parameters individually (they need to be accessible for URL building)
        pathParams.forEach((param) => {
            let paramType = param.type.toString();

            if (param.isRef) {
                paramType = `&${paramType}`;
            }

            if (param.optional) {
                paramType = `Option<${paramType}>`;
            }

            methodParams.push(`${param.name}: ${paramType}`);
        });

        // Add request body parameter if it exists (structured request type)
        if (requestBodyParam) {
            let paramType = requestBodyParam.type.toString();
            if (requestBodyParam.isRef) {
                paramType = `&${paramType}`;
            }
            methodParams.push(`${requestBodyParam.name}: ${paramType}`);
        }

        // Always add options parameter last
        methodParams.push("options: Option<RequestOptions>");

        return methodParams;
    }

    // =============================================================================
    // PARAMETER EXTRACTION
    // =============================================================================

    private extractParametersFromEndpoint(endpoint: HttpEndpoint): EndpointParameter[] {
        const params: EndpointParameter[] = [];

        // Always add path parameters individually (needed for URL building)
        this.addPathParameters(endpoint, params);

        // Handle all three scenarios properly
        if (endpoint.requestBody && endpoint.queryParameters.length > 0) {
            // MIXED: Request body contains both body + query fields
            this.addRequestBodyParameter(endpoint, params);
            // Query params are now included in the request body struct
        } else if (endpoint.requestBody) {
            // BODY-ONLY: Traditional request body
            this.addRequestBodyParameter(endpoint, params);
        } else if (endpoint.queryParameters.length > 0) {
            // QUERY-ONLY: Separate query request struct
            this.addQueryRequestParameter(endpoint, params);
        }
        // ELSE: No parameters beyond path params

        return params;
    }

    private addPathParameters(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    params.push({
                        name: pathParam.name.snakeCase.safeName,
                        type: generateRustTypeForTypeReference(pathParam.valueType, this.context),
                        isRef: this.shouldPassByReference(pathParam.valueType),
                        optional: false
                    });
                }
            }
        });
    }

    // Add query request parameter for query-only endpoints
    private addQueryRequestParameter(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        const requestTypeName = this.context.getQueryRequestTypeName(endpoint, this.subpackage.service ?? "");
        params.push({
            name: "request",
            type: rust.Type.reference(rust.reference({ name: requestTypeName })),
            isRef: true,
            optional: false
        });
    }

    private addRequestBodyParameter(endpoint: HttpEndpoint, params: EndpointParameter[]): void {
        if (endpoint.requestBody) {
            const requestBodyType = endpoint.requestBody._visit({
                inlinedRequestBody: (_inlinedBody) => {
                    // Generate proper request type name based on endpoint
                    const requestTypeName = this.getRequestTypeName(endpoint);
                    return rust.Type.reference(rust.reference({ name: requestTypeName }));
                },
                reference: (reference) => generateRustTypeForTypeReference(reference.requestBodyType, this.context),
                fileUpload: () => {
                    // For file uploads, use a structured type instead of generic Value
                    const requestTypeName = this.getRequestTypeName(endpoint);
                    return rust.Type.reference(rust.reference({ name: requestTypeName }));
                },
                bytes: () => rust.Type.vec(rust.Type.primitive(rust.PrimitiveType.U8)),
                _other: () => {
                    // Generate proper request type for unknown cases too
                    const requestTypeName = this.getRequestTypeName(endpoint);
                    return rust.Type.reference(rust.reference({ name: requestTypeName }));
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

    private getRequestTypeName(endpoint: HttpEndpoint): string {
        // For inlined request bodies, use the name from the IR to ensure consistency
        if (endpoint.requestBody?.type === "inlinedRequestBody") {
            const inlinedRequestBody = endpoint.requestBody as HttpRequestBody.InlinedRequestBody;
            return inlinedRequestBody.name.pascalCase.safeName;
        }

        // Generate TypeScript-style request type name: GetTokenRequest, CreateMovieRequest, etc.
        const methodName = endpoint.name.pascalCase.safeName;
        return `${methodName}Request`;
    }

    // =============================================================================
    // QUERY PARAMETER BUILDING
    // =============================================================================

    private getQueryBuilderMethod(queryParam: QueryParameter): string {
        const valueType = queryParam.valueType;

        // Check for structured query parameter by name
        if (queryParam.name.wireValue === "query" && this.isStringType(valueType)) {
            return "structured_query";
        }

        // Map types to appropriate QueryBuilder methods
        return TypeReference._visit(valueType, {
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => "string",
                    boolean: () => "bool",
                    integer: () => "int",
                    uint: () => "int",
                    uint64: () => "int",
                    long: () => "int",
                    float: () => "float",
                    double: () => "float",
                    bigInteger: () => "string", // Serialize as string
                    date: () => "date",
                    dateTime: () => "datetime",
                    base64: () => "string",
                    uuid: () => "uuid",
                    _other: () => "serialize"
                });
            },
            named: () => "serialize", // User-defined types need serialization
            container: (container) => {
                return container._visit({
                    optional: (innerType) => this.getQueryBuilderMethodForType(innerType),
                    nullable: (innerType) => this.getQueryBuilderMethodForType(innerType),
                    map: () => "serialize",
                    set: () => "serialize",
                    list: () => "serialize",
                    literal: (literal) => {
                        // Handle literal types based on their actual type
                        return literal._visit({
                            string: () => "string",
                            boolean: () => "bool",
                            _other: () => "serialize"
                        });
                    },
                    _other: () => "serialize"
                });
            },
            unknown: () => "serialize",
            _other: () => "serialize"
        });
    }

    private getQueryBuilderMethodForType(typeRef: TypeReference): string {
        return TypeReference._visit(typeRef, {
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => "string",
                    boolean: () => "bool",
                    integer: () => "int",
                    uint: () => "int",
                    uint64: () => "int",
                    long: () => "int",
                    float: () => "float",
                    double: () => "float",
                    bigInteger: () => "string",
                    date: () => "date",
                    dateTime: () => "datetime",
                    base64: () => "string",
                    uuid: () => "uuid",
                    _other: () => "serialize"
                });
            },
            named: () => "serialize",
            container: () => "serialize",
            unknown: () => "serialize",
            _other: () => "serialize"
        });
    }

    private buildQueryParameters(endpoint: HttpEndpoint): string {
        const queryParams = endpoint.queryParameters;
        if (queryParams.length === 0) {
            return "None";
        }

        // Pass endpoint context for smart parameter resolution
        return this.buildQueryParameterStatements(queryParams, endpoint);
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

        return this.buildQueryParameterStatements(filteredParams, endpoint);
    }

    private buildQueryParameterStatements(queryParams: QueryParameter[], endpoint?: HttpEndpoint): string {
        const builderChain = queryParams.map((queryParam) => {
            const wireValue = queryParam.name.wireValue;
            const method = this.getQueryBuilderMethod(queryParam);

            // Determine parameter source based on endpoint type
            const paramName = this.getQueryParameterSource(queryParam, endpoint);

            // Check if we need to wrap in Some() for required serialize values
            const wrappedParam = this.wrapParameterIfNeeded(paramName, method, queryParam);

            return `.${method}("${wireValue}", ${wrappedParam})`;
        });

        return `QueryBuilder::new()${builderChain.join("")}
            .build()`;
    }

    // Smart parameter source detection
    private getQueryParameterSource(queryParam: QueryParameter, endpoint?: HttpEndpoint): string {
        const fieldName = this.context.escapeRustKeyword(queryParam.name.name.snakeCase.safeName);

        if (endpoint?.requestBody) {
            // MIXED or BODY-ONLY: Query params are in request struct
            return `request.${fieldName}.clone()`;
        } else if (endpoint && endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
            // QUERY-ONLY: Query params are in dedicated request struct
            return `request.${fieldName}.clone()`;
        } else {
            // FALLBACK: Individual parameter (legacy behavior)
            return fieldName;
        }
    }

    // Check if parameter needs to be wrapped in Some() for serialize method
    private wrapParameterIfNeeded(paramName: string, method: string, queryParam: QueryParameter): string {
        // Check if this is a serialize method and the type is not already optional
        if (method === "serialize" && !this.isOptionalType(queryParam.valueType)) {
            return `Some(${paramName})`;
        }
        return paramName;
    }

    // Helper to check if a TypeReference is already optional
    private isOptionalType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            container: (container) => {
                return ContainerType._visit(container, {
                    optional: () => true,
                    nullable: () => true,
                    list: () => false,
                    map: () => false,
                    set: () => false,
                    literal: () => false,
                    _other: () => false
                });
            },
            primitive: () => false,
            named: () => false,
            unknown: () => false,
            _other: () => false
        });
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
            }
            // Always append tail if present (can exist alongside pathParameter)
            if (part.tail) {
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

    private isFileUploadEndpoint(endpoint: HttpEndpoint): boolean {
        if (!endpoint.requestBody) {
            return false;
        }
        return endpoint.requestBody.type === "fileUpload";
    }

    private getReturnType(endpoint: HttpEndpoint): rust.Type {
        if (endpoint.response?.body) {
            return endpoint.response.body._visit({
                json: (jsonResponse) => {
                    if (jsonResponse.responseBodyType) {
                        return generateRustTypeForTypeReference(jsonResponse.responseBodyType, this.context);
                    }
                    return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                },
                fileDownload: () => rust.Type.reference(rust.reference({ name: "ByteStream" })),
                text: () => rust.Type.primitive(rust.PrimitiveType.String),
                bytes: () => rust.Type.reference(rust.reference({ name: "ByteStream" })),
                streaming: (streaming) => {
                    return streaming._visit({
                        json: (jsonChunk) => {
                            // Newline-delimited JSON streaming - not yet fully implemented
                            const payloadType = generateRustTypeForTypeReference(jsonChunk.payload, this.context);
                            return rust.Type.reference(
                                rust.reference({
                                    name: `impl Stream<Item = Result<${payloadType.toString()}, ApiError>>`
                                })
                            );
                        },
                        sse: (sseChunk) => {
                            // Server-Sent Events streaming
                            const payloadType = generateRustTypeForTypeReference(sseChunk.payload, this.context);
                            return rust.Type.reference(
                                rust.reference({ name: `SseStream<${payloadType.toString()}>` })
                            );
                        },
                        text: () => {
                            // Text streaming not yet supported
                            return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                        },
                        _other: () => {
                            return rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));
                        }
                    });
                },
                streamParameter: () => rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" })),
                _other: () => rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }))
            });
        }

        return rust.Type.tuple([]);
    }

    private getInnerResponseType(endpoint: HttpEndpoint): string {
        if (endpoint.response?.body) {
            return endpoint.response.body._visit({
                json: (jsonResponse) => {
                    if (jsonResponse.responseBodyType) {
                        return generateRustTypeForTypeReference(jsonResponse.responseBodyType, this.context).toString();
                    }
                    return "serde_json::Value";
                },
                streaming: (streaming) => {
                    return streaming._visit({
                        json: (jsonChunk) => {
                            return generateRustTypeForTypeReference(jsonChunk.payload, this.context).toString();
                        },
                        sse: (sseChunk) => {
                            return generateRustTypeForTypeReference(sseChunk.payload, this.context).toString();
                        },
                        text: () => "String",
                        _other: () => "serde_json::Value"
                    });
                },
                fileDownload: () => "ByteStream",
                text: () => "String",
                bytes: () => "ByteStream",
                streamParameter: () => "serde_json::Value",
                _other: () => "serde_json::Value"
            });
        }
        return "()";
    }

    private isBinaryResponse(endpoint: HttpEndpoint): boolean {
        if (!endpoint.response?.body) {
            return false;
        }

        return endpoint.response.body._visit({
            json: () => false,
            fileDownload: () => true,
            text: () => false,
            bytes: () => true,
            streaming: () => false,
            streamParameter: () => false,
            _other: () => false
        });
    }

    private getResponseStreamType(endpoint: HttpEndpoint): "none" | "binary" | "sse" | "json" {
        if (!endpoint.response?.body) {
            return "none";
        }

        return endpoint.response.body._visit({
            json: () => "none",
            fileDownload: () => "binary",
            text: () => "none",
            bytes: () => "binary",
            streaming: (streaming) => {
                return streaming._visit({
                    json: () => "json",
                    sse: () => "sse",
                    text: () => "none",
                    _other: () => "none"
                });
            },
            streamParameter: () => "none",
            _other: () => "none"
        });
    }

    private getSseTerminator(endpoint: HttpEndpoint): string {
        if (!endpoint.response?.body) {
            return "None";
        }

        return endpoint.response.body._visit({
            json: () => "None",
            fileDownload: () => "None",
            text: () => "None",
            bytes: () => "None",
            streaming: (streaming) => {
                return streaming._visit({
                    json: () => "None",
                    sse: (sseChunk) => {
                        if (sseChunk.terminator) {
                            return `Some("${sseChunk.terminator}".to_string())`;
                        }
                        return "None";
                    },
                    text: () => "None",
                    _other: () => "None"
                });
            },
            streamParameter: () => "None",
            _other: () => "None"
        });
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

    private isStringType(typeRef: TypeReference): boolean {
        return TypeReference._visit(typeRef, {
            primitive: (primitive) => {
                return primitive.v1 === PrimitiveTypeV1.String;
            },
            named: () => false,
            container: (container) => {
                // Check if it's an optional string
                return container._visit({
                    optional: (innerType) => this.isStringType(innerType),
                    nullable: (innerType) => this.isStringType(innerType),
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
        const parameters = this.buildMethodParameters(params, endpoint);
        const baseName = endpoint.name.snakeCase.safeName;
        const httpMethod = this.getHttpMethod(endpoint);
        const pathExpression = this.getPathExpression(endpoint);
        const requestBody = this.getRequestBody(endpoint, params);

        // Always use generic serde_json::Value for maximum compatibility
        const itemType = rust.Type.reference(rust.reference({ name: "Value", module: "serde_json" }));

        // Return AsyncPaginator<ItemType> with proper typing
        const returnType = rust.Type.result(
            rust.Type.reference(
                rust.reference({
                    name: "AsyncPaginator",
                    genericArgs: [itemType]
                })
            ),
            rust.Type.reference(rust.reference({ name: "ApiError" }))
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
            .join("\n            ");

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
            .join("\n            ");

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
            .join("\n            ");

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
                path.push(pathItem.name.originalName);
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

    // Helper methods for documentation generation
    private extractParameterDocs(
        _params: EndpointParameter[],
        endpoint: HttpEndpoint
    ): { name: string; description: string }[] {
        const paramDocs: { name: string; description: string }[] = [];

        // Add path parameter docs
        endpoint.allPathParameters.forEach((pathParam) => {
            if (pathParam.docs) {
                paramDocs.push({
                    name: pathParam.name.snakeCase.safeName,
                    description: pathParam.docs
                });
            }
        });

        // Add query parameter docs
        endpoint.queryParameters.forEach((queryParam) => {
            if (queryParam.docs) {
                paramDocs.push({
                    name: queryParam.name.name.snakeCase.safeName,
                    description: queryParam.docs
                });
            }
        });

        // Add request body docs
        if (endpoint.requestBody?.docs) {
            paramDocs.push({
                name: "request",
                description: endpoint.requestBody.docs
            });
        }

        // Always document the options parameter
        paramDocs.push({
            name: "options",
            description: "Additional request options such as headers, timeout, etc."
        });

        return paramDocs;
    }

    private getReturnTypeDescription(endpoint: HttpEndpoint): string {
        if (endpoint.response?.body) {
            return endpoint.response.body._visit({
                json: () => "JSON response from the API",
                fileDownload: () => "Streaming file download (use .into_bytes() to collect or stream chunks)",
                text: () => "Text response",
                bytes: () => "Streaming byte response (use .into_bytes() to collect or stream chunks)",
                streaming: (streaming) => {
                    return streaming._visit({
                        json: () => "Newline-delimited JSON stream (use futures::StreamExt to iterate)",
                        sse: () => "Server-Sent Events stream (use futures::StreamExt to iterate)",
                        text: () => "Text streaming response",
                        _other: () => "Streaming response"
                    });
                },
                streamParameter: () => "Stream parameter response",
                _other: () => "API response"
            });
        }
        return "Empty response";
    }
}
