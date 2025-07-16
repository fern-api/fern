import { assertNever } from "@fern-api/core-utils"
import { FernIr } from "@fern-api/dynamic-ir-sdk"
import { ts } from "@fern-api/typescript-ast"

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext"

export interface FilePropertyInfo {
    fileFields: ts.ObjectField[]
    bodyPropertyFields: ts.ObjectField[]
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
    }): ts.TypeLiteral {
        const fileValue = this.context.getSingleFileValue({ property, record })
        if (fileValue == null) {
            return ts.TypeLiteral.nop()
        }
        return ts.TypeLiteral.blob(fileValue)
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray
        record: Record<string, unknown>
    }): ts.TypeLiteral {
        const fileValues = this.context.getFileArrayValues({ property, record })
        if (fileValues == null) {
            return ts.TypeLiteral.nop()
        }
        return ts.TypeLiteral.array({ values: fileValues.map((value) => ts.TypeLiteral.blob(value)) })
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter
        record: Record<string, unknown>
    }): ts.TypeLiteral {
        const bodyPropertyValue = record[property.name.wireValue]
        if (bodyPropertyValue == null) {
            return ts.TypeLiteral.nop()
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        })
    }
}
