import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    fileFields: Array<{ name: string; value: rust.Expression }>;
    bodyPropertyFields: Array<{ name: string; value: rust.Expression }>;
}

export class FilePropertyMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public getFilePropertyInfo({
        body,
        value
    }: {
        body: FernIr.dynamic.FileUploadRequestBody;
        value: unknown;
    }): FilePropertyInfo {
        const result: FilePropertyInfo = {
            fileFields: [],
            bodyPropertyFields: []
        };
        const record = this.context.getRecord(value) ?? {};
        for (const property of body.properties) {
            switch (property.type) {
                case "file":
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getSingleFileProperty({ property, record })
                    });
                    break;
                case "fileArray":
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getArrayFileProperty({ property, record })
                    });
                    break;
                case "bodyProperty":
                    result.bodyPropertyFields.push({
                        name: this.context.getPropertyName(property.name.name),
                        value: this.getBodyProperty({ property, record })
                    });
                    break;
                default:
                    assertNever(property);
            }
        }
        return result;
    }

    private getSingleFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File_;
        record: Record<string, unknown>;
    }): rust.Expression {
        const fileValue = this.context.getSingleFileValue({ property, record });
        if (fileValue == null) {
            return rust.Expression.raw("todo!(\"Missing file value\")");
        }
        return this.createFileExpression(fileValue);
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): rust.Expression {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (fileValues == null) {
            return rust.Expression.vec([]);
        }
        return rust.Expression.vec(
            fileValues.map((value) => this.createFileExpression(value))
        );
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): rust.Expression {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return rust.Expression.raw("todo!(\"Missing body property value\")");
        }
        return this.context.dynamicTypeInstantiationMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }

    private createFileExpression(fileContent: string): rust.Expression {
        // For Rust, create a multipart part expression
        return rust.Expression.methodChain(
            rust.Expression.reference("multipart::Part"),
            [
                {
                    method: "text",
                    args: [rust.Expression.stringLiteral(fileContent)]
                },
                {
                    method: "file_name", 
                    args: [rust.Expression.stringLiteral("file.txt")]
                },
                {
                    method: "mime_str",
                    args: [rust.Expression.stringLiteral("text/plain")]
                }
            ]
        );
    }

    private getMimeType(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "json":
                return "application/json";
            case "pdf":
                return "application/pdf";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "txt":
                return "text/plain";
            case "csv":
                return "text/csv";
            case "xml":
                return "application/xml";
            default:
                return "application/octet-stream";
        }
    }
}