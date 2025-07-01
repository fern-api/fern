import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";
import { GoValueFormatter } from "@fern-api/go-ast/src/context/GoValueFormatter";

import {
    FileProperty,
    FileUploadBodyProperty,
    FileUploadRequest,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpService,
    Name,
    SdkRequest,
    SdkRequestWrapper,
    ServiceId
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo";
import { EndpointRequest } from "./EndpointRequest";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, service, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, service, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getRequestParameterType(): go.Type {
        return go.Type.pointer(
            go.Type.reference(this.context.getRequestWrapperTypeReference(this.serviceId, this.wrapper.wrapperName))
        );
    }

    public getRequestReference(): go.AstNode | undefined {
        const requestBody = this.endpoint.requestBody;
        if (requestBody != null) {
            switch (requestBody.type) {
                case "fileUpload":
                    return go.codeblock("writer.Buffer()");
                case "inlinedRequestBody":
                case "reference":
                case "bytes":
                    break;
                default:
                    assertNever(requestBody);
            }
        }
        if (this.context.shouldSkipWrappedRequest({ endpoint: this.endpoint, wrapper: this.wrapper })) {
            return undefined;
        }
        return super.getRequestReference();
    }

    public getRequestBodyBlock(): go.AstNode | undefined {
        const requestBody = this.endpoint.requestBody;
        if (requestBody == null) {
            return undefined;
        }
        switch (requestBody.type) {
            case "fileUpload":
                return this.getRequestBodyBlockForFileUpload(requestBody);
            case "inlinedRequestBody":
            case "reference":
            case "bytes":
                return undefined;
            default:
                assertNever(requestBody);
        }
    }

    private getRequestBodyBlockForFileUpload(fileUploadRequest: FileUploadRequest): go.AstNode {
        return go.codeblock((writer) => {
            writer.write(`writer := `);
            writer.writeNode(this.context.callNewMultipartWriter([]));
            writer.newLine();
            fileUploadRequest.properties.forEach((property, idx) => {
                if (idx > 0) {
                    writer.writeNewLineIfLastLineNot();
                }
                this.writeFileUploadProperty({ writer, property });
            });
            writer.writeLine(`if err := writer.Close(); err != nil {`);
            writer.indent();
            writer.writeLine(`return nil, err`);
            writer.dedent();
            writer.writeLine(`}`);
            writer.writeLine(`headers.Set("Content-Type", writer.ContentType())`);
        });
    }

    private writeFileUploadProperty({
        writer,
        property
    }: {
        writer: go.Writer;
        property: FileUploadRequestProperty;
    }): void {
        switch (property.type) {
            case "file":
                this.writeFileProperty({ writer, fileProperty: property.value });
                break;
            case "bodyProperty":
                this.writeBodyProperty({ writer, bodyProperty: property });
                break;
            default:
                assertNever(property);
        }
    }

    private writeFileProperty({ writer, fileProperty }: { writer: go.Writer; fileProperty: FileProperty }): void {
        switch (fileProperty.type) {
            case "file":
                this.writeFileUploadField({
                    writer,
                    key: fileProperty.key.wireValue,
                    value: go.codeblock(
                        this.getRequestPropertyReference({ fieldName: fileProperty.key.name, isFile: true })
                    ),
                    format: "file"
                });
                break;
            case "fileArray":
                writer.writeLine(
                    `for _, f := range ${this.getRequestPropertyReference({ fieldName: fileProperty.key.name, isFile: true })} {`
                );
                writer.indent();
                this.writeFileUploadField({
                    writer,
                    key: fileProperty.key.wireValue,
                    value: go.codeblock("f"),
                    format: "file"
                });
                writer.dedent();
                writer.writeLine(`}`);
                break;
            default:
                assertNever(fileProperty);
        }
    }

    private writeBodyProperty({
        writer,
        bodyProperty
    }: {
        writer: go.Writer;
        bodyProperty: FileUploadBodyProperty;
    }): void {
        const literal = this.context.maybeLiteral(bodyProperty.valueType);
        if (literal != null) {
            this.writeFileUploadField({
                writer,
                key: bodyProperty.name.wireValue,
                value: go.codeblock(this.context.getLiteralAsString(literal)),
                format: "field"
            });
            return;
        }
        const field = this.getRequestPropertyReference({ fieldName: bodyProperty.name.name });
        const format = this.context.goValueFormatter.convert({
            reference: bodyProperty.valueType,
            value: go.codeblock(field)
        });
        const formatType = format.isPrimitive ? "field" : "json";
        if (format.isIterable) {
            writer.writeLine(`for _, part := range ${field} {`);
            writer.indent();
            this.writeFileUploadField({
                writer,
                key: bodyProperty.name.wireValue,
                value: go.codeblock("part"),
                format: formatType
            });
            writer.dedent();
            writer.writeLine(`}`);
            return;
        }
        if (format.isOptional) {
            writer.writeNewLineIfLastLineNot();
            writer.writeLine(`if ${field} != nil {`);
            writer.indent();
            this.writeFileUploadField({
                writer,
                key: bodyProperty.name.wireValue,
                value: format.formatted,
                format: formatType
            });
            writer.dedent();
            writer.writeLine("}");
            return;
        }
        this.writeFileUploadField({
            writer,
            key: bodyProperty.name.wireValue,
            value: format.formatted,
            format: formatType
        });
    }

    private getRequestPropertyReference({ fieldName, isFile }: { fieldName: Name; isFile?: boolean }): string {
        if (isFile && !this.context.customConfig.inlineFileProperties) {
            return this.context.getParameterName(fieldName);
        }
        return `${this.getRequestParameterName()}.${this.context.getFieldName(fieldName)}`;
    }

    private writeFileUploadField({
        writer,
        key,
        value,
        format
    }: {
        writer: go.Writer;
        key: string;
        value: go.AstNode;
        format: "file" | "field" | "json";
    }): void {
        const method = format === "file" ? "WriteFile" : format === "field" ? "WriteField" : "WriteJSON";
        writer.write(`if err := writer.${method}("${key}", `);
        writer.writeNode(value);
        writer.writeLine(`); err != nil {`);
        writer.indent();
        writer.writeLine(`return nil, err`);
        writer.dedent();
        writer.writeLine(`}`);
    }
}
