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
import { fail } from "assert";
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
        return this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }

        // Use QueryStringBuilder.Builder fluent API for cleaner generated code
        const queryStringVar = "_queryString";

        // Categorize query parameters by their optionality
        const requiredQueryParameters: QueryParameter[] = [];
        const optionalQueryParameters: QueryParameter[] = [];

        for (const queryParameter of this.endpoint.queryParameters) {
            const isOptional =
                (!queryParameter.allowMultiple && this.context.isOptional(queryParameter.valueType)) ||
                this.context.isNullable(queryParameter.valueType);

            if (isOptional) {
                optionalQueryParameters.push(queryParameter);
            } else {
                requiredQueryParameters.push(queryParameter);
            }
        }

        return {
            code: this.csharp.codeblock((writer) => {
                // Start building the query string with QueryStringBuilder.Builder
                writer.write(
                    `var ${queryStringVar} = new ${this.namespaces.core}.QueryStringBuilder.Builder(capacity: ${this.endpoint.queryParameters.length})`
                );

                // Add required parameters directly in the fluent chain
                for (const query of requiredQueryParameters) {
                    this.writeQueryParameterBuilderCall(writer, query);
                }

                // Close the initial builder chain with semicolon
                writer.writeLine(";");

                // Add optional parameters with null checks
                for (const query of optionalQueryParameters) {
                    const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
                    const isOptionalAndNullable =
                        this.context.generation.settings.enableExplicitNullableOptional &&
                        !query.allowMultiple &&
                        this.context.isOptional(query.valueType) &&
                        this.context.isNullable(query.valueType);

                    if (isOptionalAndNullable) {
                        writer.controlFlow("if", this.csharp.codeblock(`${queryParameterReference}.IsDefined`));
                    } else {
                        writer.controlFlow("if", this.csharp.codeblock(`${queryParameterReference} != null`));
                    }
                    writer.write(`${queryStringVar}`);
                    this.writeQueryParameterBuilderCall(writer, query);
                    writer.writeLine(";");
                    writer.endControlFlow();
                }

                // Build the final query string
                writer.writeTextStatement(`${queryStringVar} = ${queryStringVar}.Build()`);
            }),
            queryStringReference: queryStringVar
        };
    }

    /**
     * Writes a fluent builder method call for a query parameter.
     * Uses Add() for primitives and AddDeepObject() for complex types.
     */
    private writeQueryParameterBuilderCall(writer: Writer, query: QueryParameter): void {
        const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
        const isComplexType = this.isComplexType(query.valueType);

        if (isComplexType) {
            writer.write(`\n    .AddDeepObject("${query.name.wireValue}", ${queryParameterReference})`);
        } else {
            writer.write(`\n    .Add("${query.name.wireValue}", ${queryParameterReference})`);
        }
    }

    /**
     * Determines if a type reference represents a complex type (object/named type)
     * that should use AddDeepObject for query string serialization.
     */
    private isComplexType(typeReference: TypeReference): boolean {
        return typeReference._visit({
            container: (container) => {
                // For optional types, check the inner type
                if (container.type === "optional") {
                    return this.isComplexType(container.optional);
                }
                if (container.type === "nullable") {
                    return this.isComplexType(container.nullable);
                }
                // Lists, maps, sets are not deep objects
                return false;
            },
            named: () => true,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        const service =
            this.context.getHttpService(this.serviceId) ?? fail(`Service with id ${this.serviceId} not found`);
        const headers = [...service.headers, ...this.endpoint.headers];
        if (headers.length === 0) {
            return undefined;
        }

        // Use experimental explicit nullable/optional handling if enabled
        if (this.context.generation.settings.enableExplicitNullableOptional) {
            const requiredHeaders: HttpHeader[] = [];
            const optionalAndNullableHeaders: HttpHeader[] = [];
            const optionalOnlyHeaders: HttpHeader[] = [];
            const nullableOnlyHeaders: HttpHeader[] = [];

            for (const header of headers) {
                const isOptional = this.context.isOptional(header.valueType);
                const isNullable = this.context.isNullable(header.valueType);

                if (isOptional && isNullable) {
                    // optional + nullable => Optional<T?> - check IsDefined, can be value or null
                    optionalAndNullableHeaders.push(header);
                } else if (isOptional) {
                    // optional only => T? - check != null
                    optionalOnlyHeaders.push(header);
                } else if (isNullable) {
                    // nullable only => T? - always include (can be value or null)
                    nullableOnlyHeaders.push(header);
                } else {
                    // required => T - always include
                    requiredHeaders.push(header);
                }
            }

            return {
                code: this.csharp.codeblock((writer) => {
                    writer.write(`var ${this.names.variables.headers} = `);
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.Types.Headers,
                            arguments_: [
                                this.csharp.dictionary({
                                    keyType: this.Primitive.string,
                                    valueType: this.Primitive.string,
                                    values: {
                                        type: "entries",
                                        entries: [
                                            ...requiredHeaders.map((header) => {
                                                return {
                                                    key: this.csharp.codeblock(
                                                        this.csharp.string_({ string: header.name.wireValue })
                                                    ),
                                                    value: this.stringify({
                                                        reference: header.valueType,
                                                        name: header.name.name
                                                    })
                                                };
                                            }),
                                            ...nullableOnlyHeaders.map((header) => {
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
                                        ]
                                    }
                                })
                            ]
                        })
                    );
                    // Optional-only headers - include only if not null
                    for (const header of optionalOnlyHeaders) {
                        const headerReference = `${this.getParameterName()}.${header.name.name.pascalCase.safeName}`;
                        writer.controlFlow("if", this.csharp.codeblock(`${headerReference} != null`));
                        writer.write(`${this.names.variables.headers}["${header.name.wireValue}"] = `);
                        writer.writeNodeStatement(
                            this.stringify({
                                reference: header.valueType,
                                name: header.name.name
                            })
                        );
                        writer.endControlFlow();
                    }
                    // Optional + Nullable headers - include if IsDefined (can be value or null)
                    for (const header of optionalAndNullableHeaders) {
                        const headerReference = `${this.getParameterName()}.${header.name.name.pascalCase.safeName}`;
                        writer.controlFlow("if", this.csharp.codeblock(`${headerReference}.IsDefined`));
                        writer.write(`${this.names.variables.headers}["${header.name.wireValue}"] = `);
                        writer.writeNodeStatement(
                            this.stringify({
                                reference: header.valueType,
                                name: header.name.name
                            })
                        );
                        writer.endControlFlow();
                    }
                }),
                headerParameterBagReference: this.names.variables.headers
            };
        } else {
            // Legacy behavior: simple optional check
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
                            classReference: this.Types.Headers,
                            arguments_: [
                                this.csharp.dictionary({
                                    keyType: this.Primitive.string,
                                    valueType: this.Primitive.string,
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
                        writer.writeNodeStatement(
                            this.stringify({
                                reference: header.valueType,
                                name: header.name.name
                            })
                        );
                        writer.endControlFlow();
                    }
                }),
                headerParameterBagReference: this.names.variables.headers
            };
        }
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
        const isOptional = this.isOptional({ typeReference: reference });
        const isNullable = this.isNullable({ typeReference: reference });
        const isStruct = this.isStruct({ typeReference: reference });

        // Add .Value for nullable structs that need method calls like .ToString(format)
        // - When experimental flag is enabled: add .Value for Optional<T?> or nullable structs
        // - When experimental flag is disabled (legacy): add .Value for optional structs (which become T?)
        // Note: strings are reference types and don't need .Value (string? doesn't have .Value)
        const needsDotValue =
            (allowOptionals ?? true) &&
            isStruct &&
            (this.context.generation.settings.enableExplicitNullableOptional
                ? (isOptional && isNullable) || isNullable
                : isOptional);
        const maybeDotValue = needsDotValue ? ".Value" : "";

        if (this.isString(reference)) {
            // When using experimental explicit nullable/optional, Optional<string?> needs .Value to unwrap
            const needsOptionalValue =
                (allowOptionals ?? true) &&
                this.context.generation.settings.enableExplicitNullableOptional &&
                isOptional &&
                isNullable;
            const optionalValue = needsOptionalValue ? ".Value" : "";
            return this.csharp.codeblock(`${parameter}${optionalValue}`);
        }

        if (this.isDateOrDateTime({ type: "datetime", typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.Types.Constants);
                writer.write(".DateTimeFormat)");
            });
        } else if (this.isDateOrDateTime({ type: "date", typeReference: reference })) {
            return this.csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.Types.Constants);
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
                        on: this.Types.JsonUtils,
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
                const csharpType = this.context.csharpTypeMapper.convert({
                    reference: typeReference
                });
                return is.Primitive.string(csharpType);
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
                    return this.isOptional({
                        typeReference: typeReference.container.nullable
                    });
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
                    return this.isNullable({
                        typeReference: typeReference.container.optional
                    });
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
                    return this.isDateOrDateTime({
                        type,
                        typeReference: typeReference.container.optional
                    });
                }
                return false;
            case "named": {
                const declaration = this.model.dereferenceType(typeReference.typeId).typeDeclaration;
                if (declaration.shape.type === "alias") {
                    return this.isDateOrDateTime({
                        type,
                        typeReference: declaration.shape.aliasOf
                    });
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
                    return this.isEnum({
                        typeReference: typeReference.container.optional
                    });
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
