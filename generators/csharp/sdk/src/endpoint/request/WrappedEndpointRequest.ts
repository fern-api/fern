import { assertNever } from "@fern-api/core-utils";
import { ast, is, Writer } from "@fern-api/csharp-codegen";

import {
    HttpEndpoint,
    HttpHeader,
    Name,
    PrimitiveTypeV1,
    QueryParameter,
    SdkRequest,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RawClient } from "../http/RawClient";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        endpoint: HttpEndpoint;
    }
}

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getParameterType(): ast.Type {
        return this.csharp.Type.reference(
            this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName)
        );
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }
        const requiredQueryParameters: QueryParameter[] = [];
        const nullableQueryParameters: QueryParameter[] = [];
        for (const queryParameter of this.endpoint.queryParameters) {
            if (
                (!queryParameter.allowMultiple && this.context.isOptional(queryParameter.valueType)) ||
                this.context.isNullable(queryParameter.valueType)
            ) {
                nullableQueryParameters.push(queryParameter);
            } else {
                requiredQueryParameters.push(queryParameter);
            }
        }

        return {
            code: this.csharp.codeblock((writer) => {
                writer.write(`var ${this.names.variables.query} = `);
                writer.writeNodeStatement(
                    this.csharp.dictionary({
                        keyType: this.csharp.Type.string,
                        valueType: this.csharp.Type.object,
                        values: undefined
                    })
                );
                for (const query of requiredQueryParameters) {
                    this.writeQueryParameter(writer, query);
                }
                for (const query of nullableQueryParameters) {
                    const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
                    writer.controlFlow("if", this.csharp.codeblock(`${queryParameterReference} != null`));
                    this.writeQueryParameter(writer, query);
                    writer.endControlFlow();
                }
            }),
            queryParameterBagReference: this.names.variables.query
        };
    }

    private writeQueryParameter(writer: Writer, query: QueryParameter): void {
        writer.write(`${this.names.variables.query}["${query.name.wireValue}"] = `);
        if (!query.allowMultiple) {
            writer.writeNodeStatement(this.stringify({ reference: query.valueType, name: query.name.name }));
            return;
        }
        const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
        if (this.isString(query.valueType)) {
            writer.writeLine(`${queryParameterReference};`);
            return;
        }
        writer.write(`${queryParameterReference}.Select(_value => `);
        writer.writeNode(
            this.stringify({
                reference: query.valueType,
                name: query.name.name,
                parameterOverride: "_value",
                allowOptionals: false // When allow-multiple is set, the query parameter never uses optional types.
            })
        );
        writer.writeLine(").ToList();");
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        const service = this.context.getHttpServiceOrThrow(this.serviceId);
        const headers = [...service.headers, ...this.endpoint.headers];
        if (headers.length === 0) {
            return undefined;
        }
        const requiredHeaders: HttpHeader[] = [];
        const optionalHeaders: HttpHeader[] = [];
        for (const header of headers) {
            if (this.context.isOptional(header.valueType)) {
                optionalHeaders.push(header);
            } else {
                requiredHeaders.push(header);
            }
        }

        return {
            code: this.csharp.codeblock((writer) => {
                writer.write(`var ${this.names.variables.headers} = `);
                writer.writeNodeStatement(
                    this.csharp.instantiateClass({
                        classReference: this.types.Headers,
                        arguments_: [
                            this.csharp.dictionary({
                                keyType: this.csharp.Type.string,
                                valueType: this.csharp.Type.string,
                                values: {
                                    type: "entries",
                                    entries: requiredHeaders.map((header) => {
                                        return {
                                            key: this.csharp.codeblock(
                                                this.csharp.string_({ string: header.name.wireValue })
                                            ),
                                            value: this.stringify({
                                                reference: header.valueType,
                                                name: header.name.name
                                            })
                                        };
                                    })
                                }
                            })
                        ]
                    })
                );
                for (const header of optionalHeaders) {
                    const headerReference = `${this.getParameterName()}.${header.name.name.pascalCase.safeName}`;
                    writer.controlFlow("if", this.csharp.codeblock(`${headerReference} != null`));
                    writer.write(`${this.names.variables.headers}["${header.name.wireValue}"] = `);
                    writer.writeNodeStatement(this.stringify({ reference: header.valueType, name: header.name.name }));
                    writer.endControlFlow();
                }
            }),
            headerParameterBagReference: this.names.variables.headers
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        switch (this.endpoint.requestBody.type) {
            case "bytes":
                return "bytes";
            case "reference":
            case "inlinedRequestBody":
                switch (this.endpoint.requestBody.contentType) {
                    case "application/x-www-form-urlencoded":
                        return "urlencoded";
                    default:
                        return "json";
                }
            case "fileUpload":
                return "multipartform";
            default:
                assertNever(this.endpoint.requestBody);
        }
    }

    private stringify({
        reference,
        name,
        parameterOverride,
        allowOptionals
    }: {
        reference: TypeReference;
        name: Name;
        parameterOverride?: string;
        allowOptionals?: boolean;
    }): ast.CodeBlock {
        const parameter = parameterOverride ?? `${this.getParameterName()}.${name.pascalCase.safeName}`;
        if (this.isString(reference)) {
            return this.csharp.codeblock(`${parameter}`);
        }
        const maybeDotValue =
            (this.isOptional({ typeReference: reference }) || this.isNullable({ typeReference: reference })) &&
            this.isStruct({ typeReference: reference }) &&
            (allowOptionals ?? true)
                ? ".Value"
                : "";

        if (this.isDateOrDateTime({ type: "datetime", typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.types.Constants);
                writer.write(".DateTimeFormat)");
            });
        } else if (this.isDateOrDateTime({ type: "date", typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.types.Constants);
                writer.write(".DateFormat)");
            });
        } else if (this.isEnum({ typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                // Stringify is an extension method that we wrote in the core namespace, so need to add here
                writer.addNamespace(this.namespaces.core);
                writer.write(`${parameter}${maybeDotValue}.Stringify()`);
            });
        } else if (this.shouldJsonSerialize({ typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                writer.writeNode(
                    this.csharp.invokeMethod({
                        on: this.types.JsonUtils,
                        method: "Serialize",
                        arguments_: [this.csharp.codeblock(`${parameter}${maybeDotValue}`)]
                    })
                );
            });
        } else {
            return this.csharp.codeblock(`${parameter}${maybeDotValue}.ToString()`);
        }
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        return this.endpoint.requestBody._visit({
            reference: () => {
                return {
                    requestBodyReference: `${this.getParameterName()}.${this.wrapper.bodyKey.pascalCase.safeName}`
                };
            },
            inlinedRequestBody: () => {
                return {
                    requestBodyReference: this.getParameterName()
                };
            },
            fileUpload: () => undefined,
            bytes: () => {
                return {
                    requestBodyReference: `${this.getParameterName()}.${this.wrapper.bodyKey.pascalCase.safeName}`
                };
            },
            _other: () => undefined
        });
    }

    private isString(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isString(typeReference.container.optional);
                }
                if (typeReference.container.type === "nullable") {
                    return this.isString(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "alias") {
                    return this.isString(declaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive": {
                const csharpType = this.context.csharpTypeMapper.convert({ reference: typeReference });
                return is.Type.string(csharpType);
            }
            case "unknown": {
                return false;
            }
        }
    }

    private isOptional({ typeReference }: { typeReference: TypeReference }): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return true;
                }
                if (typeReference.container.type === "nullable") {
                    return this.isOptional({ typeReference: typeReference.container.nullable });
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "alias") {
                    return this.isOptional({ typeReference: declaration.shape.aliasOf });
                }
                return false;
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return false;
            }
        }
    }

    private isNullable({ typeReference }: { typeReference: TypeReference }): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isNullable({ typeReference: typeReference.container.optional });
                }
                if (typeReference.container.type === "nullable") {
                    return true;
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "alias") {
                    return this.isNullable({ typeReference: declaration.shape.aliasOf });
                }
                return false;
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return false;
            }
        }
    }

    /**
     * Whether is a struct in .NET
     */
    private isStruct({ typeReference }: { typeReference: TypeReference }): boolean {
        return typeReference._visit<boolean>({
            container: (container) => {
                return container._visit<boolean>({
                    list: () => false,
                    map: () => false,
                    set: () => false,
                    literal: (literal) => {
                        return literal._visit({
                            string: () => false,
                            boolean: () => true,
                            _other: () => false
                        });
                    },
                    optional: (optional) => this.isStruct({ typeReference: optional }),
                    nullable: (nullable) => this.isStruct({ typeReference: nullable }),
                    _other: () => false
                });
            },
            named: (named) => {
                const declaration = this.model.dereferenceType(named.typeId).typeDeclaration;
                return declaration.shape._visit<boolean>({
                    alias: (alias) => this.isStruct({ typeReference: alias.aliasOf }),
                    object: () => false,
                    undiscriminatedUnion: () => false,
                    union: () => false,
                    // this won't be true for forward compatible enums
                    enum: () => true,
                    _other: () => false
                });
            },
            primitive: (primitive) => {
                return (
                    primitive.v2?._visit<boolean | undefined>({
                        integer: () => true,
                        long: () => true,
                        uint: () => true,
                        uint64: () => true,
                        float: () => true,
                        double: () => true,
                        boolean: () => true,
                        date: () => true,
                        dateTime: () => true,
                        uuid: () => true,
                        bigInteger: () => true,
                        string: () => false,
                        // if typed as bytes, it's a struct
                        // if typed as a string, it's not
                        base64: () => false,
                        _other: () => undefined
                    }) ??
                    PrimitiveTypeV1._visit<boolean>(primitive.v1, {
                        integer: () => true,
                        long: () => true,
                        uint: () => true,
                        uint64: () => true,
                        float: () => true,
                        double: () => true,
                        boolean: () => true,
                        date: () => true,
                        dateTime: () => true,
                        uuid: () => true,
                        bigInteger: () => true,
                        string: () => false,
                        // if typed as bytes, it's a struct
                        // if typed as a string, it's not
                        base64: () => false,
                        _other: () => false
                    })
                );
            },
            unknown: () => false,
            _other: () => false
        });
    }

    private isDateOrDateTime({
        type,
        typeReference
    }: {
        type: "date" | "datetime";
        typeReference: TypeReference;
    }): boolean {
        const matchingPrimitiveValue = type === "date" ? "DATE" : "DATE_TIME";
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isDateOrDateTime({ type, typeReference: typeReference.container.optional });
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "alias") {
                    return this.isDateOrDateTime({ type, typeReference: declaration.shape.aliasOf });
                }
                return false;
            }
            case "primitive": {
                return typeReference.primitive.v1 === matchingPrimitiveValue;
            }
            case "unknown": {
                return false;
            }
        }
    }

    private isEnum({ typeReference }: { typeReference: TypeReference }): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isEnum({ typeReference: typeReference.container.optional });
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "enum") {
                    return true;
                }
                if (declaration.shape.type === "alias") {
                    return this.isEnum({ typeReference: declaration.shape.aliasOf });
                }
                return false;
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return false;
            }
        }
    }

    private shouldJsonSerialize({ typeReference }: { typeReference: TypeReference }): boolean {
        return typeReference._visit({
            container: (container) => {
                return container._visit({
                    list: () => true,
                    map: () => true,
                    set: () => true,
                    literal: (literal) => {
                        return literal._visit({
                            string: () => false,
                            boolean: () => true,
                            _other: () => false
                        });
                    },
                    optional: (optional) => {
                        return this.shouldJsonSerialize({ typeReference: optional });
                    },
                    nullable: (nullable) => this.shouldJsonSerialize({ typeReference: nullable }),
                    _other: () => false
                });
            },
            named: (named) => {
                const declaration = this.model.dereferenceType(named.typeId).typeDeclaration;
                return declaration.shape._visit({
                    alias: (alias) => this.shouldJsonSerialize({ typeReference: alias.aliasOf }),
                    object: () => true,
                    undiscriminatedUnion: () => true,
                    union: () => true,
                    enum: () => false,
                    _other: () => false
                });
            },
            primitive: (primitive) => {
                const isBoolean = primitive.v2?.type === "boolean" || primitive.v1 === "BOOLEAN";
                if (isBoolean) {
                    return true;
                }
                return false;
            },
            unknown: () => true,
            _other: () => false
        });
    }
}
