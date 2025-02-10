import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { php } from "@fern-api/php-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    fileFields: php.ConstructorField[];
    bodyPropertyFields: php.ConstructorField[];
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
    }): php.TypeLiteral {
        const fileValue = this.context.getSingleFileValue({ property, record });
        if (fileValue == null) {
            return php.TypeLiteral.nop();
        }
        return php.TypeLiteral.file(fileValue);
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): php.TypeLiteral {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (fileValues == null) {
            return php.TypeLiteral.nop();
        }
        return php.TypeLiteral.list({ values: fileValues.map((value) => php.TypeLiteral.file(value)) });
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): php.TypeLiteral {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return php.TypeLiteral.nop();
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
