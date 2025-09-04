import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    fileFields: swift.FunctionArgument[];
    bodyPropertyFields: swift.FunctionArgument[];
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
                case "file": {
                    const arg = swift.functionArgument({
                        label: property.name.camelCase.unsafeName,
                        value: this.getSingleFileProperty({ property, record })
                    });
                    if (!arg.value.isNop()) {
                        result.fileFields.push(arg);
                    }
                    break;
                }
                case "fileArray": {
                    const arg = swift.functionArgument({
                        label: property.name.camelCase.unsafeName,
                        value: this.getArrayFileProperty({ property, record })
                    });
                    if (!arg.value.isNop()) {
                        result.fileFields.push(arg);
                    }
                    break;
                }
                case "bodyProperty": {
                    const arg = swift.functionArgument({
                        label: property.name.name.camelCase.unsafeName,
                        value: this.getBodyProperty({ property, record })
                    });
                    if (!arg.value.isNop()) {
                        result.bodyPropertyFields.push(arg);
                    }
                    break;
                }
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
    }): swift.Expression {
        const fileValue = this.context.getSingleFileValue({ property, record });
        if (fileValue == null) {
            return swift.Expression.nop();
        }
        return swift.Expression.dataLiteral(fileValue);
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): swift.Expression {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (fileValues == null) {
            return swift.Expression.nop();
        }
        return swift.Expression.arrayLiteral({
            elements: fileValues.map((value) => swift.Expression.dataLiteral(value)),
            multiline: true
        });
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): swift.Expression {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return swift.Expression.nop();
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
