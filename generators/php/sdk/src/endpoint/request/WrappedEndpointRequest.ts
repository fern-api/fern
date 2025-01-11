import { CodeBlock } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { php } from "@fern-api/php-codegen";

import {
    BytesRequest,
    ContainerType,
    FileProperty,
    FilePropertyArray,
    FilePropertySingle,
    FileUploadRequest,
    FileUploadRequestProperty,
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
import { FileUploadBodyProperty } from "@fern-fern/ir-sdk/serialization";

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

    private writeMultipartBodyParameter({
        writer,
        property
    }: {
        writer: php.Writer;
        property: FileUploadRequestProperty;
    }): void {
        if (property.type !== "bodyProperty") {
            return;
        }
        const propertyName = this.context.getPropertyName(property.name.name);
        let paramRef = `${this.getRequestParameterName()}->${propertyName}`;
        let propType = property.valueType;
        const isOptional = this.context.isOptional(propType);

        if (isOptional) {
            writer.controlFlow("if", php.codeblock(`${paramRef} != null`));
            propType = this.context.dereferenceOptional(propType);
        }

        const isCollection = this.context.isCollection(propType);
        if (isCollection) {
            writer.controlFlow("foreach", php.codeblock(`${paramRef} as $element`));
            paramRef = "$element";
            propType = this.context.dereferenceCollection(propType);
        }

        const arguments_ = [
            {
                name: "name",
                assignment: php.codeblock(`'${property.name.wireValue}'`)
            },
            {
                name: "value",
                assignment: this.getMultipartBodyParameterValueAssignment(paramRef, propType)
            }
        ];

        if (property.contentType != null) {
            arguments_.push({
                name: "contentType",
                assignment: php.codeblock(`'${property.contentType}'`)
            });
        }

        writer.writeNodeStatement(
            php.invokeMethod({
                method: "add",
                arguments_,
                on: this.getRequestBodyArgument(),
                multiline: arguments_.length > 2
            })
        );

        if (isCollection) {
            writer.endControlFlow();
        }

        if (isOptional) {
            writer.endControlFlow();
        }
    }

    private getMultipartBodyParameterValueAssignment(paramRef: string, typeReference: TypeReference): php.AstNode {
        if (this.context.isJsonEncodable(typeReference)) {
            return php.invokeMethod({
                method: "encode",
                arguments_: [php.codeblock(paramRef)],
                on: this.context.getJsonEncoderClassReference(),
                static_: true
            });
        } else if (this.context.hasToJsonMethod(typeReference)) {
            return php.invokeMethod({
                method: "toJson",
                arguments_: [],
                on: php.codeblock(paramRef)
            });
        } else {
            return php.codeblock(paramRef);
        }
    }

    private writeMultipartPart({
        writer,
        paramRef,
        property
    }: {
        writer: php.Writer;
        paramRef: string;
        property: FileProperty;
    }): void {
        const arguments_ =
            property.contentType != null
                ? [
                      {
                          name: "name",
                          assignment: php.codeblock(`'${property.key.wireValue}'`)
                      },
                      {
                          name: "contentType",
                          assignment: php.codeblock(`'${property.contentType}'`)
                      }
                  ]
                : [php.codeblock(`'${property.key.wireValue}'`)];
        writer.writeNodeStatement(
            php.invokeMethod({
                method: "addPart",
                arguments_: [
                    php.invokeMethod({
                        method: "toMultipartFormDataPart",
                        arguments_,
                        on: php.codeblock(paramRef),
                        multiline: arguments_.length > 1
                    })
                ],
                on: this.getRequestBodyArgument(),
                multiline: arguments_.length > 1
            })
        );
    }

    private writeMultipartPartFileArray({
        writer,
        property
    }: {
        writer: php.Writer;
        property: FilePropertyArray;
    }): void {
        const paramRef = `${this.getRequestParameterName()}->${this.context.getPropertyName(property.key.name)}`;
        writer.controlFlow("foreach", php.codeblock(`${paramRef} as $file`));
        this.writeMultipartPart({ writer, paramRef: "$file", property: FileProperty.fileArray(property) });
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
        if (this.endpoint.requestBody == null || bodyArgument == null) {
            return undefined;
        }

        const requestBodyReference =
            this.endpoint.requestBody.type === "fileUpload"
                ? bodyArgument
                : this.serializeJsonRequest({ bodyArgument });

        return {
            code: this.getRequestBodyCode(),
            requestBodyReference
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
                switch (property.type) {
                    case "file": {
                        this.writeFile(writer, property.value);
                        break;
                    }
                    case "bodyProperty": {
                        this.writeMultipartBodyParameter({ writer, property });
                        break;
                    }
                    default: {
                        assertNever(property);
                    }
                }
            }
        });
    }

    private writeFile(writer: php.Writer, file: FileProperty): void {
        switch (file.type) {
            case "file": {
                this.writeSingleFile(writer, file);
                break;
            }
            case "fileArray": {
                this.writeFileArray(writer, file);
                break;
            }
            default: {
                assertNever(file);
            }
        }
    }

    private writeSingleFile(writer: php.Writer, file: FilePropertySingle): void {
        const paramRef = `${this.getRequestParameterName()}->${this.context.getPropertyName(file.key.name)}`;
        if (file.isOptional) {
            writer.controlFlow("if", php.codeblock(`${paramRef} != null`));
            this.writeMultipartPart({ writer, paramRef, property: FileProperty.file(file) });
            writer.endControlFlow();
        } else {
            this.writeMultipartPart({ writer, paramRef, property: FileProperty.file(file) });
        }
    }

    private writeFileArray(writer: php.Writer, fileArray: FilePropertyArray): void {
        if (fileArray.isOptional) {
            const ref = `${this.getRequestParameterName()}->${this.context.getPropertyName(fileArray.key.name)}`;
            writer.controlFlow("if", php.codeblock(`${ref} != null`));
            this.writeMultipartPartFileArray({ writer, property: fileArray });
            writer.endControlFlow();
        } else {
            this.writeMultipartPartFileArray({ writer, property: fileArray });
        }
    }
}
