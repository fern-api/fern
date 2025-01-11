import { csharp } from "@fern-api/csharp-codegen";

import {
    HttpEndpoint,
    HttpHeader,
    HttpService,
    Name,
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

const QUERY_PARAMETER_BAG_NAME = "_query";
const HEADER_BAG_NAME = "_headers";

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getParameterType(): csharp.Type {
        return csharp.Type.reference(this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName));
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        if (this.endpoint.queryParameters.length === 0) {
            return undefined;
        }
        const requiredQueryParameters: QueryParameter[] = [];
        const optionalQueryParameters: QueryParameter[] = [];
        for (const queryParameter of this.endpoint.queryParameters) {
            if (!queryParameter.allowMultiple && this.context.isOptional(queryParameter.valueType)) {
                optionalQueryParameters.push(queryParameter);
            } else {
                requiredQueryParameters.push(queryParameter);
            }
        }

        return {
            code: csharp.codeblock((writer) => {
                writer.write(`var ${QUERY_PARAMETER_BAG_NAME} = `);
                writer.writeNodeStatement(
                    csharp.dictionary({
                        keyType: csharp.Type.string(),
                        valueType: csharp.Type.object(),
                        values: undefined
                    })
                );
                for (const query of requiredQueryParameters) {
                    this.writeQueryParameter(writer, query);
                }
                for (const query of optionalQueryParameters) {
                    const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
                    writer.controlFlow("if", csharp.codeblock(`${queryParameterReference} != null`));
                    this.writeQueryParameter(writer, query);
                    writer.endControlFlow();
                }
            }),
            queryParameterBagReference: QUERY_PARAMETER_BAG_NAME
        };
    }

    private writeQueryParameter(writer: csharp.Writer, query: QueryParameter): void {
        writer.write(`${QUERY_PARAMETER_BAG_NAME}["${query.name.wireValue}"] = `);
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
            code: csharp.codeblock((writer) => {
                writer.write(`var ${HEADER_BAG_NAME} = `);
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: this.context.getHeadersClassReference(),
                        arguments_: [
                            csharp.dictionary({
                                keyType: csharp.Type.string(),
                                valueType: csharp.Type.string(),
                                values: {
                                    type: "entries",
                                    entries: requiredHeaders.map((header) => {
                                        return {
                                            key: csharp.codeblock(`"${header.name.wireValue}"`),
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
                    writer.controlFlow("if", csharp.codeblock(`${headerReference} != null`));
                    writer.write(`${HEADER_BAG_NAME}["${header.name.wireValue}"] = `);
                    writer.writeNodeStatement(this.stringify({ reference: header.valueType, name: header.name.name }));
                    writer.endControlFlow();
                }
            }),
            headerParameterBagReference: HEADER_BAG_NAME
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
                return "json";
        }
        return undefined;
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
    }): csharp.CodeBlock {
        const parameter = parameterOverride ?? `${this.getParameterName()}.${name.pascalCase.safeName}`;
        const maybeDotValue = this.isOptional({ typeReference: reference }) && (allowOptionals ?? true) ? ".Value" : "";
        if (this.isString(reference)) {
            return csharp.codeblock(`${parameter}`);
        } else if (this.isDateOrDateTime({ type: "datetime", typeReference: reference })) {
            return csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.context.getConstantsClassReference());
                writer.write(".DateTimeFormat)");
            });
        } else if (this.isDateOrDateTime({ type: "date", typeReference: reference })) {
            return csharp.codeblock((writer) => {
                writer.write(`${parameter}${maybeDotValue}.ToString(`);
                writer.writeNode(this.context.getConstantsClassReference());
                writer.write(".DateFormat)");
            });
        } else if (this.isEnum({ typeReference: reference })) {
            return csharp.codeblock((writer) => {
                // Stringify is an extension method that we wrote in the core namespace, so need to add here
                writer.addNamespace(this.context.getCoreNamespace());
                writer.write(`${parameter}${maybeDotValue}.Stringify()`);
            });
        } else {
            return csharp.codeblock(`${parameter}.ToString()`);
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
            inlinedRequestBody: (inlinedRequestBody) => {
                if (this.endpoint.queryParameters.length === 0 && this.endpoint.headers.length === 0) {
                    return {
                        requestBodyReference: `${this.getParameterName()}`
                    };
                }
                const allProperties = [
                    ...inlinedRequestBody.properties,
                    ...(inlinedRequestBody.extendedProperties ?? [])
                ];
                const requestBody = csharp.dictionary({
                    keyType: csharp.Type.string(),
                    valueType: csharp.Type.object(),
                    values: {
                        type: "entries",
                        entries: allProperties.map((property) => ({
                            key: csharp.codeblock(`"${property.name.wireValue}"`),
                            value: csharp.codeblock(
                                `${this.getParameterName()}.${property.name.name.pascalCase.safeName}`
                            )
                        }))
                    }
                });
                return {
                    requestBodyReference: this.getRequestBodyVariableName(),
                    code: csharp.codeblock((writer) => {
                        writer.write(`var ${this.getRequestBodyVariableName()} = `);
                        writer.writeNodeStatement(requestBody);
                    })
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
                return false;
            case "named": {
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.isString(declaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive": {
                return typeReference.primitive.v1 === "STRING";
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
                return false;
            case "named": {
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
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
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
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
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
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
}
