import { assertNever } from "@fern-api/core-utils"
import { csharp } from "@fern-api/csharp-codegen"
import { FernIr } from "@fern-api/dynamic-ir-sdk"

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext"

export interface FilePropertyInfo {
    fileFields: csharp.ConstructorField[]
    bodyPropertyFields: csharp.ConstructorField[]
}

export class FilePropertyMapper {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public getFilePropertyInfo({
        body,
        value
    }: {
        body: FernIr.dynamic.FileUploadRequestBody
        value: unknown
    }): FilePropertyInfo {
        const result: FilePropertyInfo = {
            fileFields: [],
            bodyPropertyFields: []
        }
        const record = this.context.getRecord(value) ?? {}
        for (const property of body.properties) {
            switch (property.type) {
                case "file":
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getSingleFileProperty({ property, record })
                    })
                    break
                case "fileArray":
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getArrayFileProperty({ property, record })
                    })
                    break
                case "bodyProperty":
                    result.bodyPropertyFields.push({
                        name: this.context.getPropertyName(property.name.name),
                        value: this.getBodyProperty({ property, record })
                    })
                    break
                default:
                    assertNever(property)
            }
        }
        return result
    }

    private getSingleFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File_
        record: Record<string, unknown>
    }): csharp.TypeLiteral {
        const fileValue = this.context.getSingleFileValue({ property, record })
        if (fileValue == null) {
            return csharp.TypeLiteral.nop()
        }
        return this.context.getFileParameterForString(fileValue)
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray
        record: Record<string, unknown>
    }): csharp.TypeLiteral {
        const fileValues = this.context.getFileArrayValues({ property, record })
        if (fileValues == null) {
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.list({
            valueType: csharp.Type.reference(this.context.getFileParameterClassReference()),
            values: fileValues.map((value) => this.context.getFileParameterForString(value))
        })
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter
        record: Record<string, unknown>
    }): csharp.TypeLiteral {
        const bodyPropertyValue = record[property.name.wireValue]
        if (bodyPropertyValue == null) {
            return csharp.TypeLiteral.nop()
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        })
    }
}
