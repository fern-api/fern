import { php } from "@fern-api/php-codegen";
import {
    BytesRequest,
    ContainerType,
    FileProperty,
    FilePropertyArray,
    FilePropertySingle,
    FileUploadRequest,
    HttpEndpoint,
    HttpHeader,
    HttpRequestBodyReference,
    HttpService,
    InlinedRequestBody,
    InlinedRequestBodyProperty,
    Literal,
    MapType,
    Name,
    NamedType,
    PrimitiveType,
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
import { CodeBlock } from "@fern-api/generator-commons";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        endpoint: HttpEndpoint;
    }
}

const QUERY_PARAMETER_BAG_NAME = "$query";
const HEADER_BAG_NAME = "$headers";

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getRequestParameterType(): php.Type {
        return php.Type.reference(this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName));
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
            code: php.codeblock((writer) => {
                writer.writeTextStatement(`${QUERY_PARAMETER_BAG_NAME} = []`);
                for (const query of requiredQueryParameters) {
                    this.writeQueryParameter(writer, query);
                }
                for (const query of optionalQueryParameters) {
                    const queryPropertyName = this.context.getPropertyName(query.name.name);
                    const queryParameterReference = `${this.getRequestParameterName()}->${queryPropertyName}`;
                    writer.controlFlow("if", php.codeblock(`${queryParameterReference} != null`));
                    this.writeQueryParameter(writer, query);
                    writer.endControlFlow();
                }
            }),
            queryParameterBagReference: QUERY_PARAMETER_BAG_NAME
        };
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
            code: php.codeblock((writer) => {
                writer.writeTextStatement(`${HEADER_BAG_NAME} = []`);
                for (const header of requiredHeaders) {
                    this.writeHeader(writer, header);
                }
                for (const header of optionalHeaders) {
                    const headerPropertyName = this.context.getPropertyName(header.name.name);
                    const headerParameterReference = `${this.getRequestParameterName()}->${headerPropertyName}`;
                    writer.controlFlow("if", php.codeblock(`${headerParameterReference} != null`));
                    this.writeHeader(writer, header);
                    writer.endControlFlow();
                }
            }),
            headerParameterBagReference: HEADER_BAG_NAME
        };
    }

    private writeQueryParameter(writer: php.Writer, query: QueryParameter): void {
        writer.write(`${QUERY_PARAMETER_BAG_NAME}['${query.name.wireValue}'] = `);
        writer.writeNodeStatement(this.stringify({ reference: query.valueType, name: query.name.name }));
    }

    private writeHeader(writer: php.Writer, header: HttpHeader): void {
        writer.write(`${HEADER_BAG_NAME}['${header.name.wireValue}'] = `);
        writer.writeNodeStatement(this.stringify({ reference: header.valueType, name: header.name.name }));
    }

    private writeBodyParameter(writer: php.Writer, valueAssignment: php.AstNode, propertyName: string): void {
        writer.writeNodeStatement(
            php.invokeMethod({
                method: "add",
                arguments_: [
                    {
                        name: "name",
                        assignment: php.codeblock(`'${propertyName}'`)
                    },
                    {
                        name: "value",
                        assignment: valueAssignment
                    }
                ],
                on: this.getRequestBodyArgument()
            })
        );
    }

    private writeBodyParameterArray(writer: php.Writer, propertyName: string): void {
        const paramRef = `${this.getRequestParameterName()}->${propertyName}`;
        writer.controlFlow("foreach", php.codeblock(`${paramRef} as $element`));
        this.writeBodyParameter(writer, php.codeblock("$element"), propertyName);
        writer.endControlFlow();
    }

    private writeMultipartPart(writer: php.Writer, paramRef: string, propertyName: string): void {
        writer.writeNodeStatement(
            php.invokeMethod({
                method: "addPart",
                arguments_: [
                    php.invokeMethod({
                        method: "toMultipartFormDataPart",
                        arguments_: [php.codeblock(`'${propertyName}'`)],
                        on: php.codeblock(paramRef)
                    })
                ],
                on: this.getRequestBodyArgument()
            })
        );
    }

    private writeMultipartPartArray(writer: php.Writer, propertyName: string): void {
        const paramRef = `${this.getRequestParameterName()}->${propertyName}`;
        writer.controlFlow("foreach", php.codeblock(`${paramRef} as $file`));
        this.writeMultipartPart(writer, "$file", propertyName);
        writer.endControlFlow();
    }

    private stringify({ reference, name }: { reference: TypeReference; name: Name }): php.CodeBlock {
        const parameter = `${this.getRequestParameterName()}->${this.context.getPropertyName(name)}`;
        if (this.context.isDateTime(reference)) {
            return php.codeblock((writer) => {
                writer.write(`${parameter}->format(`);
                writer.writeNode(this.context.getDateTimeFormat());
                writer.write(")");
            });
        }
        if (this.context.isDate(reference)) {
            return php.codeblock((writer) => {
                writer.write(`${parameter}->format(`);
                writer.writeNode(this.context.getDateFormat());
                writer.write(")");
            });
        }
        const maybeLiteral = this.context.maybeLiteral(reference);
        if (maybeLiteral != null) {
            return php.codeblock(this.context.getLiteralAsString(maybeLiteral));
        }
        const type = this.context.phpTypeMapper.convert({ reference });
        const underlyingInternalType = type.underlyingType().internalType;
        if (underlyingInternalType.type === "union") {
            return this.serializeJsonForUnion({
                bodyArgument: php.codeblock(parameter),
                types: underlyingInternalType.types,
                isOptional: false
            });
        }
        return php.codeblock(parameter);
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        const bodyArgument = this.getRequestBodyArgument();
        if (bodyArgument == null) {
            return undefined;
        }

        return {
            code: this.getRequestBodyCode(),
            requestBodyReference: this.serializeJsonRequest({ bodyArgument })
        };
    }

    private getRequestBodyArgument(): php.CodeBlock | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        return this.endpoint.requestBody._visit({
            reference: () => {
                return php.codeblock(
                    `${this.getRequestParameterName()}->${this.context.getPropertyName(this.wrapper.bodyKey)}`
                );
            },
            inlinedRequestBody: (_inlinedRequestBody) => {
                return php.codeblock(`${this.getRequestParameterName()}`);
            },
            fileUpload: () => {
                return php.codeblock(`$${this.context.getPropertyName(this.wrapper.bodyKey)}`);
            },
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    private getRequestBodyCode(): php.CodeBlock | undefined {
        return this.endpoint.requestBody?._visit({
            inlinedRequestBody: () => undefined,
            reference: () => undefined,
            fileUpload: (fileUpload) => this.getFileUploadRequestBodyCode(fileUpload),
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    private getFileUploadRequestBodyCode(fileUpload: FileUploadRequest): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write(`$${this.context.getPropertyName(this.wrapper.bodyKey)} = `);
            writer.writeNodeStatement(
                php.instantiateClass({
                    classReference: this.context.getMultipartFormDataClassReference(),
                    arguments_: []
                })
            );

            for (const property of fileUpload.properties) {
                property._visit({
                    file: (file) =>
                        file._visit({
                            file: (file) => {
                                const ref = `${this.getRequestParameterName()}->${this.context.getPropertyName(
                                    file.key.name
                                )}`;
                                if (file.isOptional) {
                                    writer.controlFlow("if", php.codeblock(`${ref} != null`));
                                    this.writeMultipartPart(
                                        writer,
                                        ref,
                                        `${this.context.getPropertyName(file.key.name)}`
                                    );
                                    writer.endControlFlow();
                                } else {
                                    this.writeMultipartPart(
                                        writer,
                                        ref,
                                        `${this.context.getPropertyName(file.key.name)}`
                                    );
                                }
                            },
                            fileArray: (fileArray) => {
                                if (fileArray.isOptional) {
                                    const ref = `${this.getRequestParameterName()}->${this.context.getPropertyName(
                                        file.key.name
                                    )}`;
                                    writer.controlFlow("if", php.codeblock(`${ref} != null`));
                                    this.writeMultipartPartArray(
                                        writer,
                                        `${this.context.getPropertyName(file.key.name)}`
                                    );
                                    writer.endControlFlow();
                                } else {
                                    this.writeMultipartPartArray(
                                        writer,
                                        `${this.context.getPropertyName(file.key.name)}`
                                    );
                                }
                            },
                            _other: () => undefined
                        }),
                    bodyProperty: (bodyProperty) => {
                        const ref = `${this.getRequestParameterName()}->${this.context.getPropertyName(
                            bodyProperty.name.name
                        )}`;
                        let propType = bodyProperty.valueType;
                        const isOptional = this.context.isOptional(propType);

                        if (isOptional) {
                            writer.controlFlow("if", php.codeblock(`${ref} != null`));
                            propType = this.context.dereferenceOptional(propType);
                        }

                        const isIterable = propType.type === "container" && propType.container.type === "list";
                        const isEncodable =
                            (propType.type === "container" && propType.container.type === "map") ||
                            propType.type === "unknown";
                        const isObject = propType.type === "named";

                        if (isIterable) {
                            this.writeBodyParameterArray(writer, this.context.getPropertyName(bodyProperty.name.name));
                        } else if (isEncodable) {
                            this.writeBodyParameter(
                                writer,
                                php.codeblock(ref),
                                this.context.getPropertyName(bodyProperty.name.name)
                            );
                        } else if (isObject) {
                            this.writeBodyParameter(
                                writer,
                                php.codeblock(ref),
                                this.context.getPropertyName(bodyProperty.name.name)
                            );
                        } else {
                            this.writeBodyParameter(
                                writer,
                                php.codeblock(ref),
                                this.context.getPropertyName(bodyProperty.name.name)
                            );
                        }

                        if (isOptional) {
                            writer.endControlFlow();
                        }
                    },
                    _other: () => undefined
                });
            }
        });
    }
}
