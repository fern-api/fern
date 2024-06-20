import { csharp } from "@fern-api/csharp-codegen";
import {
    HttpEndpoint,
    HttpHeader,
    QueryParameter,
    SdkRequest,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
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
            if (this.context.isOptional(queryParameter.valueType)) {
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
                        entries: requiredQueryParameters.map((queryParameter) => {
                            if (this.isString(queryParameter.valueType)) {
                                return {
                                    key: csharp.codeblock(`"${queryParameter.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${queryParameter.name.name.pascalCase.safeName}`
                                    )
                                };
                            } else if (this.isDatetime(queryParameter.valueType)) {
                                return {
                                    key: csharp.codeblock(`"${queryParameter.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${
                                            queryParameter.name.name.pascalCase.safeName
                                        }.ToString("o0")`
                                    )
                                };
                            } else {
                                return {
                                    key: csharp.codeblock(`"${queryParameter.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${
                                            queryParameter.name.name.pascalCase.safeName
                                        }.ToString()`
                                    )
                                };
                            }
                        })
                    })
                );
                for (const query of optionalQueryParameters) {
                    const queryParameterReference = `${this.getParameterName()}.${query.name.name.pascalCase.safeName}`;
                    writer.controlFlow("if", `${queryParameterReference} != null`);
                    writer.writeTextStatement(
                        `${QUERY_PARAMETER_BAG_NAME}["${query.name.wireValue}"] = ${queryParameterReference}`
                    );
                    writer.endControlFlow();
                }
            }),
            queryParameterBagReference: QUERY_PARAMETER_BAG_NAME
        };
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        if (this.endpoint.headers.length === 0) {
            return undefined;
        }
        const requiredHeaders: HttpHeader[] = [];
        const optionalHeaders: HttpHeader[] = [];
        for (const header of this.endpoint.headers) {
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
                    csharp.dictionary({
                        keyType: csharp.Type.string(),
                        valueType: csharp.Type.string(),
                        entries: requiredHeaders.map((header) => {
                            if (this.isString(header.valueType)) {
                                return {
                                    key: csharp.codeblock(`"${header.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${header.name.name.pascalCase.safeName}`
                                    )
                                };
                            } else if (this.isDatetime(header.valueType)) {
                                return {
                                    key: csharp.codeblock(`"${header.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${
                                            header.name.name.pascalCase.safeName
                                        }.ToString("o0")`
                                    )
                                };
                            } else {
                                return {
                                    key: csharp.codeblock(`"${header.name.wireValue}"`),
                                    value: csharp.codeblock(
                                        `${this.getParameterName()}.${header.name.name.pascalCase.safeName}.ToString()`
                                    )
                                };
                            }
                        })
                    })
                );
                for (const header of optionalHeaders) {
                    const headerReference = `${this.getParameterName()}.${header.name.name.pascalCase.safeName}`;
                    writer.controlFlow("if", `${headerReference} != null`);
                    writer.writeTextStatement(`${HEADER_BAG_NAME}["${header.name.wireValue}"] = ${headerReference}`);
                    writer.endControlFlow();
                }
            }),
            headerParameterBagReference: HEADER_BAG_NAME
        };
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
                if (this.endpoint.queryParameters.length === 0 && this.endpoint.headers.length === 0) {
                    return {
                        requestBodyReference: `${this.getParameterName()}`
                    };
                }
                return undefined;
            },
            fileUpload: () => undefined,
            bytes: () => undefined,
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
                return typeReference.primitive === "STRING";
            }
            case "unknown": {
                return false;
            }
        }
    }

    private isDatetime(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isDatetime(typeReference.container.optional);
                }
                return false;
            case "named": {
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.isDatetime(declaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive": {
                return typeReference.primitive === "DATE_TIME";
            }
            case "unknown": {
                return false;
            }
        }
    }
}
