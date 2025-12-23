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
            // Use inline test data instead of reading from a non-existent file
            return rust.Expression.raw('b"test file content".to_vec()');
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
            // Use inline test data instead of reading from non-existent files
            return rust.Expression.vec([
                rust.Expression.raw('b"test file 1".to_vec()'),
                rust.Expression.raw('b"test file 2".to_vec()')
            ]);
        }
        return rust.Expression.vec(fileValues.map((value) => this.createFileExpression(value)));
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
            // Check if it's an optional type
            if (property.typeReference.type === "optional" || property.typeReference.type === "nullable") {
                return rust.Expression.raw("None");
            }
            // For required fields, use Default::default() to avoid compilation errors
            return rust.Expression.raw("Default::default()");
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }

    private createFileExpression(fileContent: string): rust.Expression {
        // For Rust, files are represented as Vec<u8> (byte arrays)
        // Convert the file content string to a byte vector
        return rust.Expression.methodCall({
            target: rust.Expression.methodCall({
                target: rust.Expression.stringLiteral(fileContent),
                method: "as_bytes",
                args: []
            }),
            method: "to_vec",
            args: []
        });
    }
}
