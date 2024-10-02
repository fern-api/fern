import { php } from "@fern-api/php-codegen";
import {
    HttpEndpoint,
    HttpHeader,
    Name,
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
import { FernIr } from "@fern-fern/ir-sdk";
import { throwNewBaseException } from "../utils/generate";
import { tryCatch } from "../utils/writer";
import { Arguments } from "@fern-api/generator-commons";

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
        if (this.endpoint.requestBody == null) {
            return undefined;
        }

        const bodyArgument = this.getRequestBodyArgument();
        const requestBodyRef = bodyArgument ? this.serializeJsonRequest({ bodyArgument }) : undefined;

        if (!requestBodyRef) {
            return undefined;
        }

        const code = this.getRequestBodyCodeBlockHelp();

        return {
            code,
            requestBodyReference: requestBodyRef
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
            fileUpload: (_uploadRequestBody) => {
                return php.codeblock(`${this.getRequestParameterName()}`);
            },
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    private getRequestBodyCodeBlockHelp(): php.CodeBlock | undefined {
        return this.endpoint.requestBody?._visit({
            reference: () => undefined,
            inlinedRequestBody: () => undefined,
            fileUpload: (request: FernIr.FileUploadRequest) => {
                const tryBlock = this.genRequestToMultipartFormBody(request);
                const catchBlock = throwNewBaseException({
                    context: this.context,
                    message: php.codeblock("$e->getMessage()")
                });
                return tryCatch(tryBlock, catchBlock, this.context.getBaseExceptionClassReference());
            },
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    private genRequestToMultipartFormBody(request: FernIr.FileUploadRequest): php.CodeBlock {
        const requestParamName = this.getRequestParameterName();

        const formVarName = "$body";
        const dataParts = request.properties
            .map((prop) => this.genDataPartFromProperty(requestParamName, formVarName, prop))
            .filter((maybeAst) => maybeAst)
            .map((ast) => ast as php.AstNode);

        return php.codeblock((writer) => {
            writer.write("$body = ");
            writer.writeNodeStatement(
                php.instantiateClass({
                    classReference: this.context.getCoreMultipartClassReference("MultipartFormData"),
                    arguments_: []
                })
            );

            dataParts.forEach((dataPart) => {
                writer.writeNode(dataPart);
            });
        });
    }

    private genDataPartFromProperty(
        requestVarName: string,
        formVarName: string,
        property: FernIr.FileUploadRequestProperty
    ): php.CodeBlock | undefined {
        return property._visit<php.CodeBlock | undefined>({
            file: (fileProp) => {
                return fileProp._visit<php.CodeBlock | undefined>({
                    file: (filePropSingle: FernIr.FilePropertySingle) => {
                        return this.genDataPartFromFileProperty({
                            requestVarName,
                            formVarName,
                            propWireName: filePropSingle.key.wireValue,
                            propSnakeName: this.context.getPropertyName(filePropSingle.key.name),
                            //contentType: filePropSingle.contentType,
                            isSequence: false,
                            isOptional: filePropSingle.isOptional
                        });
                    },
                    fileArray: (filePropArray: FernIr.FilePropertyArray) => {
                        return this.genDataPartFromFileProperty({
                            requestVarName,
                            formVarName,
                            propWireName: filePropArray.key.wireValue,
                            propSnakeName: this.context.getPropertyName(filePropArray.key.name),
                            //contentType: filePropArray.contentType,
                            isSequence: true,
                            isOptional: filePropArray.isOptional
                        });
                    },
                    _other: () => undefined
                });
            },
            bodyProperty: (bodyProp: FernIr.InlinedRequestBodyProperty) => {
                return this.genDataPartFromBodyProperty({
                    bodyProp,
                    requestVarName,
                    formVarName
                });
            },
            _other: () => undefined
        });
    }

    private genDataPartFromFileProperty({
        requestVarName,
        formVarName,
        propWireName,
        propSnakeName,
        contentType,
        isSequence = false,
        isOptional = false
    }: {
        requestVarName: string;
        formVarName: string;
        propWireName: string;
        propSnakeName: string;
        contentType?: string;
        isSequence?: boolean;
        isOptional?: boolean;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            const toMultipartArgs: Arguments = [
                {
                    name: "name",
                    assignment: php.codeblock(`'${propWireName}'`)
                }
            ];

            if (contentType) {
                toMultipartArgs.push({
                    name: "contentType",
                    assignment: php.codeblock("TODO")
                });
            }

            if (isOptional) {
                writer.controlFlow("if", php.codeblock(`${requestVarName}->${propWireName} != null`));
            }
            if (isSequence) {
                writer.controlFlow("foreach", php.codeblock(`${requestVarName}->${propWireName} as $file`));
            }
            writer.writeNodeStatement(
                php.invokeMethod({
                    method: "addPart",
                    on: php.codeblock(formVarName),
                    multiline: true,
                    arguments_: [
                        php.invokeMethod({
                            method: "toMultipartFormDataPart",
                            on: php.codeblock(isSequence ? "$file" : `${requestVarName}->${propWireName}`),
                            arguments_: toMultipartArgs
                        })
                    ]
                })
            );
            if (isSequence) {
                writer.endControlFlow();
            }
            if (isOptional) {
                writer.endControlFlow();
            }
        });
    }

    private genDataPartFromBodyProperty({
        bodyProp,
        requestVarName,
        formVarName
    }: {
        bodyProp: FernIr.InlinedRequestBodyProperty;
        requestVarName: string;
        formVarName: string;
    }): php.CodeBlock | undefined {
        // TODO: Define how maps should be encoded in multi-part form uploads (prob wrap in json_encode(...))
        if (this.context.isMap(bodyProp.valueType)) {
            return undefined;
        }

        const propName = this.context.getPropertyName(bodyProp.name.name);
        const isOptional = this.context.isOptional(bodyProp.valueType);
        const isSequence = this.context.isSequence(bodyProp.valueType);

        let valueBlock = isSequence ? "$item" : `${requestVarName}->${propName}`;
        if (this.context.isEnum(bodyProp.valueType)) {
            valueBlock += "->value";
        } else if (this.context.isObject(bodyProp.valueType)) {
            valueBlock += "->toJson()";
        } else if (this.context.isUnknown(bodyProp.valueType)) {
            valueBlock = `json_encode(${valueBlock})`;
        }

        const addArgs: Arguments = [
            {
                name: "name",
                assignment: php.codeblock(`'${bodyProp.name.wireValue}'`)
            },
            {
                name: "value",
                assignment: php.codeblock(valueBlock)
            }
        ];

        // if (bodyProp.contentType) {
        //     addArgs.push({
        //         name: "contentType",
        //         assignment: php.codeblock(contentType)
        //     });
        // }

        return php.codeblock((writer) => {
            if (isOptional) {
                writer.controlFlow("if", php.codeblock(`${requestVarName}->${propName} != null`));
            }

            if (isSequence) {
                writer.controlFlow("foreach", php.codeblock(`${requestVarName}->${propName} as $item`));
            }

            writer.writeNodeStatement(
                php.invokeMethod({
                    method: "add",
                    on: php.codeblock(formVarName),
                    arguments_: addArgs
                })
            );

            if (isSequence) {
                writer.endControlFlow();
            }

            if (isOptional) {
                writer.endControlFlow();
            }
        });
    }
}
