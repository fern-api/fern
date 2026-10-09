import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

export interface FilePropertyInfo {
    fileFields: java.BuilderParameter[];
    bodyPropertyFields: java.BuilderParameter[];
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
                        name: this.context.getMethodName(property.name),
                        value: this.getSingleFileProperty({ property, record })
                    });
                    break;
                case "fileArray":
                    result.fileFields.push({
                        name: this.context.getMethodName(property.name),
                        value: this.getArrayFileProperty({ property, record })
                    });
                    break;
                case "bodyProperty":
                    result.bodyPropertyFields.push({
                        name: this.context.getMethodName(property.name.name),
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
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File;
        record: Record<string, unknown>;
    }): java.TypeLiteral {
        const fileValue = this.context.getSingleFileValue({ property, record });
        if (this.context.shouldInlineFileProperties()) {
            // In inline-file-properties mode the request builder field is typed as `java.io.File`,
            // so render a `java.io.File` literal. A required file is a staged builder step that
            // cannot be omitted, so fall back to a placeholder path when the example has no value.
            return this.context.getJavaIoFileFromString(fileValue ?? "path/to/file");
        }
        if (fileValue == null) {
            return java.TypeLiteral.nop();
        }
        return java.TypeLiteral.reference(this.context.getFileStreamFromString(fileValue));
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): java.TypeLiteral {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (this.context.shouldInlineFileProperties()) {
            // In inline-file-properties mode the request builder field is typed as `java.io.File`,
            // so render a `java.io.File` literal (the Java SDK does not support file arrays, so a
            // single value is emitted) and fall back to a placeholder when no example value exists.
            const fileValue = fileValues?.[0] ?? "path/to/file";
            return this.context.getJavaIoFileFromString(fileValue);
        }
        if (fileValues == null) {
            return java.TypeLiteral.nop();
        }
        for (const fileValue of fileValues) {
            // The Java SDK doesn't support file array properties correctly, so we just
            // return a single file stream.
            return java.TypeLiteral.reference(this.context.getFileStreamFromString(fileValue));
        }
        return java.TypeLiteral.nop();
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): java.TypeLiteral {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return java.TypeLiteral.nop();
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
