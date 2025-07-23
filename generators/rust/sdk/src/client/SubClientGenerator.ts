import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";
import { 
    HttpEndpoint, 
    HttpService, 
    Subpackage,
    TypeReference,
    HttpMethod
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertIrTypeToRustTypeString } from "../utils/typeConversion";

export class SubClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly subpackage: Subpackage;
    private readonly service?: HttpService;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
    }

    public generate(): RustFile {
        const filename = `${this.subpackage.name.snakeCase.safeName}.rs`;
        const writer = rust.writer();
        
        // Write imports
        this.writeImports(writer);
        writer.newLine();
        writer.newLine();

        // Generate client struct
        this.generateClientStruct().write(writer);
        writer.newLine();
        writer.newLine();

        // Generate impl block with new method
        this.generateNewMethodImpl().write(writer);
        writer.newLine();
        writer.newLine();

        // Generate methods impl block
        const endpoints = this.service?.endpoints || [];
        if (endpoints.length > 0) {
            this.generateMethodsImpl(endpoints).write(writer);
            writer.newLine();
            writer.newLine();
        }

        // Write Send/Sync impls
        this.writeSendSyncImpls(writer);
        
        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }

    private writeImports(writer: rust.Writer): void {
        // Base imports
        writer.writeLine("use crate::client::{HttpClient, RequestOptions};");
        writer.writeLine("use crate::error::ApiError;");
        writer.writeLine("use serde::{Serialize, Deserialize};");
        
        // Conditional imports based on usage
        if (this.needsHashMapImport()) {
            writer.writeLine("use std::collections::HashMap;");
        }
        if (this.needsChronoImport()) {
            writer.writeLine("use chrono::{DateTime, Utc, NaiveDate};");
        }
        if (this.needsUuidImport()) {
            writer.writeLine("use uuid::Uuid;");
        }
    }

    private generateClientStruct(): rust.Struct {
        const clientName = this.getClientName();
        
        return rust.struct({
            name: clientName,
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug", "Clone"] })
            ],
            fields: [
                rust.field({
                    name: "http_client",
                    type: rust.Type.reference(new rust.Reference({ name: "HttpClient" }))
                })
            ]
        });
    }

    private generateNewMethodImpl(): rust.ImplBlock {
        const clientName = this.getClientName();
        
        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: clientName })),
            methods: [
                rust.method({
                    name: "new",
                    visibility: { type: "public" },
                    parameters: [{
                        name: "http_client",
                        parameterType: rust.Type.reference(new rust.Reference({ name: "HttpClient" }))
                    }],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromExpression(
                        rust.Expression.structLiteral("Self", [
                            { name: "http_client", value: rust.Expression.reference("http_client") }
                        ])
                    )
                }),
                rust.method({
                    name: "apply_options",
                    parameters: [
                        { 
                            name: "self", 
                            parameterType: rust.Type.str(), 
                            isSelf: true, 
                            isRef: true 
                        },
                        { 
                            name: "request",
                            parameterType: rust.Type.reference(new rust.Reference({ 
                                name: "&mut reqwest::RequestBuilder" 
                            }))
                        },
                        { 
                            name: "options", 
                            parameterType: rust.Type.option(rust.Type.reference(new rust.Reference({ 
                                name: "RequestOptions" 
                            })))
                        }
                    ],
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.raw(`if let Some(opts) = options {
            // Apply timeout if specified
            if let Some(timeout) = opts.timeout {
                *request = request.clone().timeout(timeout);
            }
            
            // Apply custom headers
            for (key, value) in opts.headers {
                *request = request.clone().header(key, value);
            }
            
            // Note: max_retries would be handled by retry middleware
        }`)
                    ])
                })
            ]
        });
    }

    private generateMethodsImpl(endpoints: HttpEndpoint[]): rust.ImplBlock {
        const clientName = this.getClientName();
        const methods = endpoints.map(endpoint => this.generateMethodFromIR(endpoint));
        
        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: clientName })),
            methods
        });
    }

    private generateMethodFromIR(endpoint: HttpEndpoint): rust.Method {
        const methodName = endpoint.name.snakeCase.safeName;
        const parameters = this.getMethodParametersFromIR(endpoint);
        const returnType = this.getReturnTypeFromIR(endpoint);
        const body = this.generateMethodBodyFromIR(endpoint);
        
        return rust.method({
            name: methodName,
            visibility: { type: "public" },
            parameters,
            returnType,
            isAsync: true,
            body
        });
    }

    private getMethodParametersFromIR(endpoint: HttpEndpoint): rust.FunctionParameter[] {
        const params: rust.FunctionParameter[] = [{
            name: "self",
            parameterType: rust.Type.str(), // Placeholder, handled by isSelf flag
            isSelf: true,
            isRef: true
        }];

        // Path parameters from IR
        endpoint.fullPath.parts.forEach(pathPart => {
            const pathParamName = pathPart.pathParameter;
            const pathParam = endpoint.allPathParameters.find(p => p.name.originalName === pathParamName);
            if (pathParam) {
                const paramName = pathParam.name.snakeCase.safeName;
                const paramType = this.convertTypeReferenceToRustType(pathParam.valueType);
                params.push({
                    name: paramName,
                    parameterType: paramType,
                    isRef: true
                });
            }
        });

        // Query parameters from IR  
        endpoint.queryParameters.forEach(queryParam => {
            const paramName = queryParam.name.name.snakeCase.safeName;
            const paramType = this.convertTypeReferenceToRustType(queryParam.valueType);
            params.push({
                name: paramName,
                parameterType: paramType,
                isRef: !this.isOwnedType(queryParam.valueType)
            });
        });

        // Request body from IR
        if (endpoint.requestBody) {
            const requestType = this.getRequestBodyTypeFromIR(endpoint.requestBody);
            params.push({
                name: "body",
                parameterType: requestType,
                isRef: true
            });
        }

        // Options (always last)
        params.push({
            name: "options",
            parameterType: rust.Type.option(rust.Type.reference(new rust.Reference({ name: "RequestOptions" }))),
            isRef: false
        });

        return params;
    }

    private generateMethodBodyFromIR(endpoint: HttpEndpoint): rust.CodeBlock {
        const statements: rust.Statement[] = [];
        
        // Build the path with path parameters
        const pathExpr = this.buildPathExpression(endpoint);
        statements.push(rust.Statement.let({ 
            name: "path", 
            value: pathExpr 
        }));

        // Build the initial request
        const httpMethod = this.getHttpMethodName(endpoint.method);
        const requestExpr = rust.Expression.methodCall({
            target: rust.Expression.fieldAccess(rust.Expression.self(), "http_client"),
            method: httpMethod,
            args: [rust.Expression.referenceOf(rust.Expression.reference("path"))]
        });
        statements.push(rust.Statement.let({ 
            name: "request", 
            value: requestExpr, 
            mutable: true 
        }));

        // Add query parameters if any
        if (endpoint.queryParameters.length > 0) {
            statements.push(...this.generateQueryParameterStatements(endpoint));
        }

        // Add headers if any
        if (endpoint.headers.length > 0) {
            statements.push(...this.generateHeaderStatements(endpoint));
        }

        // Apply request options
        statements.push(rust.Statement.expression(
            rust.Expression.methodCall({
                target: rust.Expression.reference("self"),
                method: "apply_options",
                args: [
                    rust.Expression.referenceOf(rust.Expression.reference("request"), true),
                    rust.Expression.reference("options")
                ]
            })
        ));

        // Send the request
        const sendExpr = this.buildSendExpression(endpoint);
        
        return rust.CodeBlock.fromStatementsAndExpression(statements, sendExpr);
    }

    private buildPathExpression(endpoint: HttpEndpoint): rust.Expression {
        let template = "";
        const args: rust.Expression[] = [];
        
        endpoint.fullPath.parts.forEach(part => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find(p => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    template += "{}";
                    args.push(rust.Expression.reference(pathParam.name.snakeCase.safeName));
                }
            } else {
                template += part.tail;
            }
        });
        
        if (args.length > 0) {
            return rust.Expression.formatString(template, args);
        } else {
            return rust.Expression.stringLiteral(template);
        }
    }

    private generateQueryParameterStatements(endpoint: HttpEndpoint): rust.Statement[] {
        return endpoint.queryParameters.map(queryParam => {
            const paramName = queryParam.name.name.snakeCase.safeName;
            const queryName = queryParam.name.name.originalName;
            
            return rust.Statement.assignment(
                rust.Expression.reference("request"),
                rust.Expression.methodCall({
                    target: rust.Expression.reference("request"),
                    method: "query",
                    args: [
                        rust.Expression.referenceOf(rust.Expression.vec([
                            rust.Expression.raw(`("${queryName}", ${paramName})`)
                        ]))
                    ]
                })
            );
        });
    }

    private generateHeaderStatements(endpoint: HttpEndpoint): rust.Statement[] {
        return endpoint.headers.map(header => {
            const headerName = header.name.name.snakeCase.safeName;
            const headerKey = header.name.name.originalName;
            
            return rust.Statement.assignment(
                rust.Expression.reference("request"),
                rust.Expression.methodCall({
                    target: rust.Expression.reference("request"),
                    method: "header",
                    args: [
                        rust.Expression.stringLiteral(headerKey),
                        rust.Expression.reference(headerName)
                    ]
                })
            );
        });
    }

    private buildSendExpression(endpoint: HttpEndpoint): rust.Expression {
        const httpClientExpr = rust.Expression.fieldAccess(rust.Expression.self(), "http_client");
        
        let sendMethod: string;
        let args: rust.Expression[] = [rust.Expression.reference("request")];
        
        if (endpoint.requestBody) {
            sendMethod = "send_json";
            args.push(rust.Expression.reference("body")); // The request body parameter from the method signature
        } else {
            sendMethod = "send";
        }
        
        const sendCall = rust.Expression.methodCall({
            target: httpClientExpr,
            method: sendMethod,
            args,
            isAsync: true
        });
        
        return sendCall;
    }

    private getHttpMethodName(method: HttpMethod): string {
        switch (method) {
            case "GET": return "get";
            case "POST": return "post";
            case "PUT": return "put";
            case "DELETE": return "delete";
            case "PATCH": return "patch";
            default: return "get";
        }
    }

    private convertTypeReferenceToRustType(typeRef: TypeReference): rust.Type {
        // This is a simplified conversion - you'd expand this based on your needs
        const typeString = convertIrTypeToRustTypeString(typeRef);
        return rust.Type.reference(new rust.Reference({ name: typeString }));
    }

    private isOwnedType(typeRef: TypeReference): boolean {
        // Determine if a type should be owned (not borrowed) in parameters
        return typeRef.type === "primitive" && 
               (typeRef.primitive.v1 === "STRING" || 
                typeRef.primitive.v1 === "BOOLEAN" ||
                typeRef.primitive.v1.includes("INT") ||
                typeRef.primitive.v1.includes("FLOAT") ||
                typeRef.primitive.v1.includes("DOUBLE"));
    }

    private getReturnTypeFromIR(endpoint: HttpEndpoint): rust.Type {
        if (!endpoint.response?.body) {
            return rust.Type.result(
                rust.Type.reference(new rust.Reference({ name: "()" })),
                rust.Type.reference(new rust.Reference({ name: "ApiError" }))
            );
        }

        const responseType = this.getResponseBodyTypeFromIR(endpoint.response.body);
        return rust.Type.result(
            rust.Type.reference(new rust.Reference({ name: responseType })),
            rust.Type.reference(new rust.Reference({ name: "ApiError" }))
        );
    }

    private getResponseBodyTypeFromIR(responseBody: any): string {
        switch (responseBody.type) {
            case "json":
                const jsonResponse = responseBody.value;
                if (jsonResponse.type === "response") {
                    return convertIrTypeToRustTypeString(jsonResponse.responseBodyType);
                } else if (jsonResponse.type === "nestedPropertyAsResponse") {
                    return convertIrTypeToRustTypeString(jsonResponse.responseBodyType);
                }
                return "serde_json::Value";
            case "text":
                return "String";
            case "bytes":
                return "Vec<u8>";
            case "fileDownload":
                return "Vec<u8>";
            default:
                return "serde_json::Value";
        }
    }

    private getRequestBodyTypeFromIR(requestBody: any): rust.Type {
        switch (requestBody.type) {
            case "reference":
                return this.convertTypeReferenceToRustType(requestBody.requestBodyType);
            case "inlinedRequestBody":
                return rust.Type.reference(new rust.Reference({ name: requestBody.name.pascalCase.unsafeName }));
            default:
                return rust.Type.reference(new rust.Reference({ name: "serde_json::Value" }));
        }
    }

    private writeSendSyncImpls(writer: rust.Writer): void {
        const clientName = this.getClientName();
        writer.writeLine("// Ensure the client can be safely shared across threads");
        writer.writeLine(`unsafe impl Send for ${clientName} {}`);
        writer.writeLine(`unsafe impl Sync for ${clientName} {}`);
    }

    private needsHashMapImport(): boolean {
        return this.service?.endpoints.some(endpoint => 
            endpoint.queryParameters.length > 0 || 
            endpoint.headers.length > 0
        ) ?? false;
    }

    private needsChronoImport(): boolean {
        return this.service?.endpoints.some(endpoint =>
            this.hasDateTimeTypes(endpoint)
        ) ?? false;
    }

    private needsUuidImport(): boolean {
        return this.service?.endpoints.some(endpoint =>
            this.hasUuidTypes(endpoint)
        ) ?? false;
    }

    private hasDateTimeTypes(endpoint: HttpEndpoint): boolean {
        const allTypes = [
            ...endpoint.allPathParameters.map(p => p.valueType),
            ...endpoint.headers.map(h => h.valueType),
            ...endpoint.queryParameters.map(q => q.valueType)
        ];
        
        return allTypes.some(type => 
            type.type === "primitive" && 
            (type.primitive.v1 === "DATE_TIME" || type.primitive.v1 === "DATE")
        );
    }

    private hasUuidTypes(endpoint: HttpEndpoint): boolean {
        const allTypes = [
            ...endpoint.allPathParameters.map(p => p.valueType),
            ...endpoint.headers.map(h => h.valueType),
            ...endpoint.queryParameters.map(q => q.valueType)
        ];
        
        return allTypes.some(type => 
            type.type === "primitive" && 
            type.primitive.v1 === "UUID"
        );
    }

    private getClientName(): string {
        return `${this.subpackage.name.pascalCase.safeName}Client`;
    }
} 