import { assertNever } from '@fern-api/core-utils'
import { FernIr } from '@fern-api/dynamic-ir-sdk'
import { python } from '@fern-api/python-ast'

import { DynamicSnippetsGeneratorContext } from './DynamicSnippetsGeneratorContext'

export interface FilePropertyInfo {
    fileFields: python.NamedValue[]
    bodyPropertyFields: python.NamedValue[]
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
                case 'file': {
                    const value = this.getSingleFileProperty({ property, record })
                    if (python.TypeInstantiation.isNop(value)) {
                        break
                    }
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value
                    })
                    break
                }
                case 'fileArray': {
                    const value = this.getArrayFileProperty({ property, record })
                    if (python.TypeInstantiation.isNop(value)) {
                        break
                    }
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value
                    })
                    break
                }
                case 'bodyProperty': {
                    const value = this.getBodyProperty({ property, record })
                    if (python.TypeInstantiation.isNop(value)) {
                        break
                    }
                    result.bodyPropertyFields.push({
                        name: this.context.getPropertyName(property.name.name),
                        value
                    })
                    break
                }
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
    }): python.TypeInstantiation {
        const fileValue = this.context.getSingleFileValue({ property, record })
        if (fileValue == null) {
            return python.TypeInstantiation.nop()
        }
        return this.context.getFileFromString(fileValue)
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray
        record: Record<string, unknown>
    }): python.TypeInstantiation {
        const fileValues = this.context.getFileArrayValues({ property, record })
        if (fileValues == null) {
            return python.TypeInstantiation.nop()
        }
        return python.TypeInstantiation.list(fileValues.map((value) => this.context.getFileFromString(value)))
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter
        record: Record<string, unknown>
    }): python.TypeInstantiation {
        const bodyPropertyValue = record[property.name.wireValue]
        if (bodyPropertyValue == null) {
            return python.TypeInstantiation.nop()
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        })
    }
}
