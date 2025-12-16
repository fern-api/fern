import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    fileFields: go.StructField[];
    bodyPropertyFields: go.StructField[];
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
                        name: this.context.getFieldName(property.name),
                        value: this.getSingleFileProperty({ property, record })
                    });
                    break;
                case "fileArray":
                    result.fileFields.push({
                        name: this.context.getFieldName(property.name),
                        value: this.getArrayFileProperty({ property, record })
                    });
                    break;
                case "bodyProperty":
                    result.bodyPropertyFields.push({
                        name: this.context.getFieldName(property.name.name),
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
    }): go.TypeInstantiation {
        // fix(williammcadams): always return a string reader even if no example was provided
        const fileValue = this.context.getSingleFileValue({ property, record }) || "";
        return go.TypeInstantiation.reference(this.context.getNewStringsReaderFunctionInvocation(fileValue));
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): go.TypeInstantiation {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (fileValues == null) {
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.slice({
            valueType: go.Type.reference(this.context.getIoReaderTypeReference()),
            values: fileValues.map((value) =>
                go.TypeInstantiation.reference(this.context.getNewStringsReaderFunctionInvocation(value))
            )
        });
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): go.TypeInstantiation {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return go.TypeInstantiation.nop();
        }
        return this.context.dynamicTypeInstantiationMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
