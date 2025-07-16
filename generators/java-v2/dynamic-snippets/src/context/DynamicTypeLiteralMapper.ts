import { DiscriminatedUnionTypeInstance, Severity, TypeInstance } from '@fern-api/browser-compatible-base-generator'
import { assertNever } from '@fern-api/core-utils'
import { FernIr } from '@fern-api/dynamic-ir-sdk'
import { java } from '@fern-api/java-ast'

import { DynamicSnippetsGeneratorContext } from './DynamicSnippetsGeneratorContext'

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference
        value: unknown
        as?: ConvertedAs
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = 'mapKey' | 'mapValue'
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public convert(args: DynamicTypeLiteralMapper.Args): java.TypeLiteral {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return this.context.getNullableOfNull()
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: 'Expected non-null value, but got null'
            })
            return java.TypeLiteral.nop()
        }
        if (args.value === undefined) {
            return java.TypeLiteral.nop()
        }
        switch (args.typeReference.type) {
            case 'list':
                return this.convertList({ list: args.typeReference.value, value: args.value })
            case 'literal':
                return this.convertLiteral({ literal: args.typeReference.value, value: args.value })
            case 'map':
                return this.convertMap({ map: args.typeReference, value: args.value })
            case 'named': {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value })
                if (named == null) {
                    return java.TypeLiteral.nop()
                }
                return this.convertNamed({ named, value: args.value, as: args.as })
            }
            case 'nullable':
            case 'optional':
                return java.TypeLiteral.optional({
                    value: this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as }),

                    // TODO(amckinney): The Java generator produces Map<T, Optional<U>> whenever the value is an optional.
                    //
                    // This is difficult to use in practice - we should update this to unbox the map values and remove this
                    // flag.
                    useOf: args.as === 'mapValue'
                })
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

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): java.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            })
            return java.TypeLiteral.nop()
        }
        return java.TypeLiteral.list({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list }),
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

    private convertLiteral({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType
        value: unknown
    }): java.TypeLiteral {
        switch (literal.type) {
            case 'boolean': {
                const bool = this.context.getValueAsBoolean({ value })
                if (bool == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.boolean(bool)
            }
            case 'string': {
                const str = this.context.getValueAsString({ value })
                if (str == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.string(str)
            }
            default:
                assertNever(literal)
        }
    }

    private convertSet({ set, value }: { set: FernIr.dynamic.TypeReference; value: unknown }): java.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            })
            return java.TypeLiteral.nop()
        }
        return java.TypeLiteral.set({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: set }),
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

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): java.TypeLiteral {
        if (typeof value !== 'object' || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? 'null' : typeof value}`
            })
            return java.TypeLiteral.nop()
        }
        return java.TypeLiteral.map({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key)
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: 'mapKey' }),
                        value: this.convert({ typeReference: map.value, value, as: 'mapValue' })
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
    }): java.TypeLiteral {
        switch (named.type) {
            case 'alias':
                return this.convert({ typeReference: named.typeReference, value, as })
            case 'discriminatedUnion':
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value
                })
            case 'enum':
                return this.convertEnum({ enum_: named, value })
            case 'object':
                return this.convertObject({ object_: named, value, as })
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
    }): java.TypeLiteral {
        const classReference = this.context.getJavaClassReferenceFromDeclaration({
            declaration: discriminatedUnion.declaration
        })
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        })
        if (discriminatedUnionTypeInstance == null) {
            return java.TypeLiteral.nop()
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType
        switch (unionVariant.type) {
            case 'samePropertiesAsObject': {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                })
                if (named == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.reference(
                    java.invokeMethod({
                        on: classReference,
                        method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                        arguments_: [this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })]
                    })
                )
            }
            case 'singleProperty': {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value)
                if (record == null) {
                    return java.TypeLiteral.nop()
                }
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue)
                    return java.TypeLiteral.reference(
                        java.invokeMethod({
                            on: classReference,
                            method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                            arguments_: [
                                this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: record[unionVariant.discriminantValue.wireValue]
                                })
                            ]
                        })
                    )
                } finally {
                    this.context.errors.unscope()
                }
            }
            case 'noProperties':
                return java.TypeLiteral.reference(
                    java.invokeMethod({
                        on: classReference,
                        method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                        arguments_: []
                    })
                )
            default:
                assertNever(unionVariant)
        }
    }

    private convertObject({
        object_,
        value,
        as
    }: {
        object_: FernIr.dynamic.ObjectType
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): java.TypeLiteral {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        })
        return java.TypeLiteral.builder({
            classReference: this.context.getJavaClassReferenceFromDeclaration({
                declaration: object_.declaration
            }),
            parameters: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue)
                try {
                    return {
                        name: this.context.getMethodName(property.name.name),
                        value: this.convert({ typeReference: property.typeReference, value: property.value, as })
                    }
                } finally {
                    this.context.errors.unscope()
                }
            })
        })
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): java.TypeLiteral {
        const name = this.getEnumValueName({ enum_, value })
        if (name == null) {
            return java.TypeLiteral.nop()
        }
        return java.TypeLiteral.enum_({
            classReference: this.context.getJavaClassReferenceFromDeclaration({
                declaration: enum_.declaration
            }),
            value: name
        })
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
        return this.context.getEnumName(enumValue.name)
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType
        value: unknown
    }): java.TypeLiteral {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        })
        if (result == null) {
            return java.TypeLiteral.nop()
        }
        if (this.context.isPrimitive(result.valueTypeReference)) {
            // Primitive types overload the 'of' method rather than
            // defining a separate method from the type.
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: this.context.getJavaClassReferenceFromDeclaration({
                        declaration: undiscriminatedUnion.declaration
                    }),
                    method: 'of',
                    arguments_: [result.typeInstantiation]
                })
            )
        }
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: result.valueTypeReference })
        if (fieldName == null) {
            return java.TypeLiteral.nop()
        }
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.context.getJavaClassReferenceFromDeclaration({
                    declaration: undiscriminatedUnion.declaration
                }),
                method: `of${fieldName}`,
                arguments_: [result.typeInstantiation]
            })
        )
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType
        value: unknown
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeInstantiation: java.TypeLiteral } | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            try {
                const typeInstantiation = this.convert({ typeReference, value })
                return { valueTypeReference: typeReference, typeInstantiation }
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

    private getUndiscriminatedUnionFieldName({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference
    }): string | undefined {
        switch (typeReference.type) {
            case 'list':
                return this.getUndiscriminatedUnionFieldNameForList({ list: typeReference })
            case 'literal':
                return this.getUndiscriminatedUnionFieldNameForLiteral({ literal: typeReference.value })
            case 'map':
                return this.getUndiscriminatedUnionFieldNameForMap({ map: typeReference })
            case 'named': {
                const named = this.context.resolveNamedType({ typeId: typeReference.value })
                if (named == null) {
                    return undefined
                }
                return this.context.getClassName(named.declaration.name)
            }
            case 'optional':
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference })
            case 'nullable':
                return this.getUndiscriminatedUnionFieldNameForNullable({ typeReference })
            case 'primitive':
                return this.getUndiscriminatedUnionFieldNameForPrimitive({ primitive: typeReference.value })
            case 'set':
                return this.getUndiscriminatedUnionFieldNameForSet({ set: typeReference })
            case 'unknown':
                return 'Unknown'
            default:
                assertNever(typeReference)
        }
    }

    private getUndiscriminatedUnionFieldNameForList({
        list
    }: {
        list: FernIr.dynamic.TypeReference.List
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: list })
        if (fieldName == null) {
            return undefined
        }
        return `ListOf${fieldName}`
    }

    private getUndiscriminatedUnionFieldNameForMap({ map }: { map: FernIr.dynamic.MapType }): string | undefined {
        const keyFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.key })
        if (keyFieldName == null) {
            return undefined
        }
        const valueFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.value })
        if (valueFieldName == null) {
            return undefined
        }
        return `MapOf${keyFieldName}To${valueFieldName}`
    }

    private getUndiscriminatedUnionFieldNameForOptional({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference })
        if (fieldName == null) {
            return undefined
        }
        return `Optional${fieldName}`
    }

    private getUndiscriminatedUnionFieldNameForNullable({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference })
        if (fieldName == null) {
            return undefined
        }
        return `Nullable${fieldName}`
    }

    private getUndiscriminatedUnionFieldNameForSet({
        set
    }: {
        set: FernIr.dynamic.TypeReference.Set
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: set })
        if (fieldName == null) {
            return undefined
        }
        return `SetOf${fieldName}`
    }

    private getUndiscriminatedUnionFieldNameForLiteral({
        literal
    }: {
        literal: FernIr.dynamic.LiteralType
    }): string | undefined {
        // The Java SDK doesn't support literal types here.
        return undefined
    }

    private getUndiscriminatedUnionFieldNameForPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): string {
        switch (primitive) {
            case 'INTEGER':
            case 'UINT':
                return 'Integer'
            case 'LONG':
            case 'UINT_64':
                return 'Long'
            case 'FLOAT':
                return 'Float'
            case 'DOUBLE':
                return 'Double'
            case 'BOOLEAN':
                return 'Boolean'
            case 'BIG_INTEGER':
                return 'BigInteger'
            case 'STRING':
                return 'String'
            case 'UUID':
                return 'Uuid'
            case 'DATE':
                return 'Date'
            case 'DATE_TIME':
                return 'DateTime'
            case 'BASE_64':
                return 'Base64'
            default:
                assertNever(primitive)
        }
    }

    private convertUnknown({ value }: { value: unknown }): java.TypeLiteral {
        return java.TypeLiteral.unknown(value)
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.PrimitiveTypeV1
        value: unknown
        as?: DynamicTypeLiteralMapper.ConvertedAs
    }): java.TypeLiteral {
        switch (primitive) {
            case 'INTEGER':
            case 'UINT': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.integer(num)
            }
            case 'LONG':
            case 'UINT_64': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.long(num)
            }
            case 'FLOAT': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.float(num)
            }
            case 'DOUBLE': {
                const num = this.getValueAsNumber({ value, as })
                if (num == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.double(num)
            }
            case 'BOOLEAN': {
                const bool = this.getValueAsBoolean({ value, as })
                if (bool == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.boolean(bool)
            }
            case 'STRING': {
                const str = this.context.getValueAsString({ value })
                if (str == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.string(str)
            }
            case 'DATE': {
                const date = this.context.getValueAsString({ value })
                if (date == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.string(date)
            }
            case 'DATE_TIME': {
                const dateTime = this.context.getValueAsString({ value })
                if (dateTime == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.dateTime(dateTime)
            }
            case 'UUID': {
                const uuid = this.context.getValueAsString({ value })
                if (uuid == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.uuid(uuid)
            }
            case 'BASE_64': {
                const base64 = this.context.getValueAsString({ value })
                if (base64 == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.bytes(base64)
            }
            case 'BIG_INTEGER': {
                const bigInt = this.context.getValueAsString({ value })
                if (bigInt == null) {
                    return java.TypeLiteral.nop()
                }
                return java.TypeLiteral.bigInteger(bigInt)
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
        const num = as === 'mapKey' ? (typeof value === 'string' ? Number(value) : value) : value
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
            as === 'mapKey' ? (typeof value === 'string' ? value === 'true' : value === 'false' ? false : value) : value
        return this.context.getValueAsBoolean({ value: bool })
    }
}
