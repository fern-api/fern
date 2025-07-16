import { DiscriminatedUnionTypeInstance, NamedArgument, Severity } from '@fern-api/browser-compatible-base-generator'
import { assertNever } from '@fern-api/core-utils'
import { csharp } from '@fern-api/csharp-codegen'
import { FernIr } from '@fern-api/dynamic-ir-sdk'

import { DynamicSnippetsGeneratorContext } from './DynamicSnippetsGeneratorContext'

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference
        value: unknown
        as?: ConvertedAs
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = 'key'
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public convert(args: DynamicTypeLiteralMapper.Args): csharp.TypeLiteral {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return csharp.TypeLiteral.null()
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: 'Expected non-null value, but got null'
            })
            return csharp.TypeLiteral.nop()
        }
        if (args.value === undefined) {
            return csharp.TypeLiteral.nop()
        }
        switch (args.typeReference.type) {
            case 'list':
                return this.convertList({ list: args.typeReference.value, value: args.value })
            case 'literal':
                return csharp.TypeLiteral.nop()
            case 'map':
                return this.convertMap({ map: args.typeReference, value: args.value })
            case 'named': {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value })
                if (named == null) {
                    return csharp.TypeLiteral.nop()
                }
                return this.convertNamed({ named, value: args.value, as: args.as })
            }
            case 'nullable':
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as })
            case 'optional':
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as })
            case 'primitive':
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as })
            case 'set':
                return this.convertSet({ set: args.typeReference.value, value: args.value })
            case 'unknown':
                return this.convertUnknown({ value: args.value })
            default:
                assertNever(args.typeReference)
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): csharp.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            })
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.list({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list, unboxOptionals: true }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index })
                try {
                    return this.convert({ typeReference: list, value: v })
                } finally {
                    this.context.errors.unscope()
                }
            })
        })
    }

    private convertSet({ set, value }: { set: FernIr.dynamic.TypeReference; value: unknown }): csharp.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            })
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.set({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: set, unboxOptionals: true }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index })
                try {
                    return this.convert({ typeReference: set, value: v })
                } finally {
                    this.context.errors.unscope()
                }
            })
        })
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): csharp.TypeLiteral {
        if (typeof value !== 'object' || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? 'null' : typeof value}`
            })
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.dictionary({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key)
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: 'key' }),
                        value: this.convert({ typeReference: map.value, value })
                    }
                } finally {
                    this.context.errors.unscope()
                }
            })
        })
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): csharp.TypeLiteral {
        switch (named.type) {
            case 'alias':
                return this.convert({ typeReference: named.typeReference, value, as })
            case 'discriminatedUnion':
                if (this.context.shouldUseDiscriminatedUnions()) {
                    return this.convertDiscriminatedUnion({ discriminatedUnion: named, value })
                }
                return this.convertUnknown({ value })
            case 'enum':
                return this.convertEnum({ enum_: named, value })
            case 'object':
                return this.convertObject({ object_: named, value })
            case 'undiscriminatedUnion':
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value })
            default:
                assertNever(named)
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType
        value: unknown
    }): csharp.TypeLiteral {
        const classReference = csharp.classReference({
            name: this.context.getClassName(discriminatedUnion.declaration.name),
            namespace: this.context.getNamespace(discriminatedUnion.declaration.fernFilepath)
        })
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        })
        if (discriminatedUnionTypeInstance == null) {
            return csharp.TypeLiteral.nop()
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType
        const baseProperties = this.getBaseProperties({
            discriminatedUnionTypeInstance,
            singleDiscriminatedUnionType: unionVariant
        })
        switch (unionVariant.type) {
            case 'samePropertiesAsObject': {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                })
                if (named == null) {
                    return csharp.TypeLiteral.nop()
                }
                return this.instantiateUnionWithBaseProperties({
                    classReference,
                    baseProperties,
                    arguments_: [this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })]
                })
            }
            case 'singleProperty': {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value)
                if (record == null) {
                    return csharp.TypeLiteral.nop()
                }
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue)
                    return this.instantiateUnionWithBaseProperties({
                        classReference,
                        baseProperties,
                        arguments_: [
                            this.convert({
                                typeReference: unionVariant.typeReference,
                                value: record[unionVariant.discriminantValue.wireValue]
                            })
                        ]
                    })
                } finally {
                    this.context.errors.unscope()
                }
            }
            case 'noProperties':
                return this.instantiateUnionWithBaseProperties({
                    classReference,
                    baseProperties,
                    arguments_: []
                })
            default:
                assertNever(unionVariant)
        }
    }

    private getBaseProperties({
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType
    }): NamedArgument[] {
        const properties = this.context.associateByWireValue({
            parameters: singleDiscriminatedUnionType.properties ?? [],
            values: this.context.getRecord(discriminatedUnionTypeInstance.value) ?? {},

            // We're only selecting the base properties here. The rest of the properties
            // are handled by the union variant.
            ignoreMissingParameters: true
        })
        return properties.map((property) => {
            this.context.errors.scope(property.name.wireValue)
            try {
                return {
                    name: this.context.getPropertyName(property.name.name),
                    assignment: this.convert(property)
                }
            } finally {
                this.context.errors.unscope()
            }
        })
    }

    private instantiateUnionWithBaseProperties({
        classReference,
        arguments_,
        baseProperties
    }: {
        classReference: csharp.ClassReference
        arguments_: csharp.AstNode[]
        baseProperties: NamedArgument[]
    }): csharp.TypeLiteral {
        const instantiation = csharp.instantiateClass({
            classReference,
            arguments_,
            multiline: true
        })
        if (baseProperties.length === 0) {
            return csharp.TypeLiteral.reference(instantiation)
        }
        return csharp.TypeLiteral.reference(
            csharp.codeblock((writer) => {
                writer.writeNode(instantiation)
                writer.writeLine(' {')
                writer.indent()
                for (const baseProperty of baseProperties) {
                    writer.write(baseProperty.name)
                    writer.write(' = ')
                    writer.writeNodeOrString(baseProperty.assignment)
                    writer.writeLine(',')
                }
                writer.dedent()
                writer.write('}')
            })
        )
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): csharp.TypeLiteral {
        const name = this.getEnumValueName({ enum_, value })
        if (name == null) {
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.reference(
            csharp.classReference({
                name,
                namespace: this.context.getNamespace(enum_.declaration.fernFilepath)
            })
        )
    }

    private getEnumValueName({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): string | undefined {
        if (typeof value !== 'string') {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected enum value string, got: ${typeof value}`
            })
            return undefined
        }
        const enumValue = enum_.values.find((v) => v.wireValue === value)
        if (enumValue == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `An enum value named "${value}" does not exist in this context`
            })
            return undefined
        }
        return `${this.context.getClassName(enum_.declaration.name)}.${this.context.getClassName(enumValue.name)}`
    }

    private convertObject({
        object_,
        value
    }: {
        object_: FernIr.dynamic.ObjectType
        value: unknown
    }): csharp.TypeLiteral {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        })
        return csharp.TypeLiteral.class_({
            reference: csharp.classReference({
                name: this.context.getClassName(object_.declaration.name),
                namespace: this.context.getNamespace(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue)
                try {
                    return {
                        name: this.context.getClassName(property.name.name),
                        value: this.convert(property)
                    }
                } finally {
                    this.context.errors.unscope()
                }
            })
        })
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType
        value: unknown
    }): csharp.TypeLiteral {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        })
        if (result == null) {
            return csharp.TypeLiteral.nop()
        }
        return result.typeLiteral
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType
        value: unknown
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeLiteral: csharp.TypeLiteral } | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            try {
                const typeLiteral = this.convert({ typeReference, value })
                return { valueTypeReference: typeReference, typeLiteral }
            } catch (e) {
                continue
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        })
        return undefined
    }

    private convertUnknown({ value }: { value: unknown }): csharp.TypeLiteral {
        return csharp.TypeLiteral.unknown(value)
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.PrimitiveTypeV1
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): csharp.TypeLiteral {
        switch (primitive) {
            case 'INTEGER': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.integer(num)
            }
            case 'LONG': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.long(num)
            }
            case 'UINT': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.uint(num)
            }
            case 'UINT_64': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.ulong(num)
            }
            case 'FLOAT': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.float(num)
            }
            case 'DOUBLE': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.double(num)
            }
            case 'BOOLEAN': {
                const bool = this.getValueAsBoolean({ value, as })
                if (bool == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.boolean(bool)
            }
            case 'STRING': {
                const str = this.context.getValueAsString({ value })
                if (str == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.string(str)
            }
            case 'DATE': {
                const date = this.context.getValueAsString({ value })
                if (date == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.date(date)
            }
            case 'DATE_TIME': {
                const dateTime = this.context.getValueAsString({ value })
                if (dateTime == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.datetime(dateTime)
            }
            case 'UUID': {
                const uuid = this.context.getValueAsString({ value })
                if (uuid == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.string(uuid)
            }
            case 'BASE_64': {
                const base64 = this.context.getValueAsString({ value })
                if (base64 == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.string(base64)
            }
            case 'BIG_INTEGER': {
                const bigInt = this.context.getValueAsString({ value })
                if (bigInt == null) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.string(bigInt)
            }
            default:
                assertNever(primitive)
        }
    }

    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): number | undefined {
        const num = as === 'key' ? (typeof value === 'string' ? Number(value) : value) : value
        return this.context.getValueAsNumber({ value: num })
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): boolean | undefined {
        const bool =
            as === 'key' ? (typeof value === 'string' ? value === 'true' : value === 'false' ? false : value) : value
        return this.context.getValueAsBoolean({ value: bool })
    }
}
