import { assertNever } from '@fern-api/core-utils'

import { FernIr } from '@fern-fern/ir-sdk'

export function convertExampleTypeReferenceToTypeReference(
    exampleTypeReference: FernIr.ExampleTypeReference
): FernIr.TypeReference {
    switch (exampleTypeReference.shape.type) {
        case 'named':
            return convertExampleNamedTypeToTypeReference(exampleTypeReference.shape)
        case 'primitive':
            return convertExamplePrimitiveTypeToTypeReference(exampleTypeReference.shape)
        case 'container':
            return convertExampleContainerTypeToTypeReference(exampleTypeReference.shape)
        case 'unknown':
            return FernIr.TypeReference.unknown()
        default:
            assertNever(exampleTypeReference.shape)
    }
}

function convertExampleNamedTypeToTypeReference(
    exampleNamedType: FernIr.ExampleTypeReferenceShape.Named
): FernIr.TypeReference.Named {
    return FernIr.TypeReference.named({
        ...exampleNamedType.typeName,
        inline: false,
        default: undefined
    })
}

function convertExampleContainerTypeToTypeReference(
    exampleContainerType: FernIr.ExampleTypeReferenceShape.Container
): FernIr.TypeReference.Container {
    switch (exampleContainerType.container.type) {
        case 'list':
            return FernIr.TypeReference.container(FernIr.ContainerType.list(exampleContainerType.container.itemType))
        case 'set':
            return FernIr.TypeReference.container(FernIr.ContainerType.set(exampleContainerType.container.itemType))
        case 'optional':
            return FernIr.TypeReference.container(
                FernIr.ContainerType.optional(exampleContainerType.container.valueType)
            )
        case 'nullable':
            return FernIr.TypeReference.container(
                FernIr.ContainerType.nullable(exampleContainerType.container.valueType)
            )
        case 'map':
            return FernIr.TypeReference.container(
                FernIr.ContainerType.map({
                    keyType: exampleContainerType.container.keyType,
                    valueType: exampleContainerType.container.valueType
                })
            )
        case 'literal':
            return FernIr.TypeReference.container(
                FernIr.ContainerType.literal(convertExampleLiteralToLiteral(exampleContainerType.container))
            )
        default:
            assertNever(exampleContainerType.container)
    }
}

function convertExampleLiteralToLiteral(literalContainer: FernIr.ExampleLiteralContainer): FernIr.Literal {
    switch (literalContainer.literal.type) {
        case 'string':
            return FernIr.Literal.string(literalContainer.literal.string.original)
        case 'boolean':
            return FernIr.Literal.boolean(literalContainer.literal.boolean)
        case 'integer':
        case 'long':
        case 'uint':
        case 'uint64':
        case 'float':
        case 'double':
        case 'date':
        case 'datetime':
        case 'uuid':
        case 'base64':
        case 'bigInteger':
            throw new Error('Internal error; only boolean and string literals are permitted')
        default:
            assertNever(literalContainer.literal)
    }
}

function convertExamplePrimitiveTypeToTypeReference(
    examplePrimitiveType: FernIr.ExampleTypeReferenceShape.Primitive
): FernIr.TypeReference.Primitive {
    return FernIr.TypeReference.primitive({
        v1: convertExamplePrimitiveToV1Primitive(examplePrimitiveType),
        v2: convertExamplePrimitiveToV2Primitive(examplePrimitiveType)
    })
}

function convertExamplePrimitiveToV1Primitive(
    examplePrimitiveType: FernIr.ExampleTypeReferenceShape.Primitive
): FernIr.PrimitiveTypeV1 {
    switch (examplePrimitiveType.primitive.type) {
        case 'string':
            return FernIr.PrimitiveTypeV1.String
        case 'boolean':
            return FernIr.PrimitiveTypeV1.Boolean
        case 'integer':
            return FernIr.PrimitiveTypeV1.Integer
        case 'long':
            return FernIr.PrimitiveTypeV1.Long
        case 'uint':
            return FernIr.PrimitiveTypeV1.Uint
        case 'uint64':
            return FernIr.PrimitiveTypeV1.Uint64
        case 'float':
            return FernIr.PrimitiveTypeV1.Float
        case 'double':
            return FernIr.PrimitiveTypeV1.Double
        case 'date':
            return FernIr.PrimitiveTypeV1.Date
        case 'datetime':
            return FernIr.PrimitiveTypeV1.DateTime
        case 'uuid':
            return FernIr.PrimitiveTypeV1.Uuid
        case 'base64':
            return FernIr.PrimitiveTypeV1.Base64
        case 'bigInteger':
            return FernIr.PrimitiveTypeV1.BigInteger
        default:
            assertNever(examplePrimitiveType.primitive)
    }
}

function convertExamplePrimitiveToV2Primitive(
    examplePrimitiveType: FernIr.ExampleTypeReferenceShape.Primitive
): FernIr.PrimitiveTypeV2 {
    switch (examplePrimitiveType.primitive.type) {
        case 'string':
            return FernIr.PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        case 'boolean':
            return FernIr.PrimitiveTypeV2.boolean({
                default: undefined
            })
        case 'integer':
            return FernIr.PrimitiveTypeV2.integer({
                default: undefined,
                validation: undefined
            })
        case 'long':
            return FernIr.PrimitiveTypeV2.long({
                default: undefined
            })
        case 'uint':
            return FernIr.PrimitiveTypeV2.uint({
                default: undefined,
                validation: undefined
            })
        case 'uint64':
            return FernIr.PrimitiveTypeV2.uint64({
                default: undefined,
                validation: undefined
            })
        case 'float':
            return FernIr.PrimitiveTypeV2.float({
                default: undefined,
                validation: undefined
            })
        case 'double':
            return FernIr.PrimitiveTypeV2.double({
                default: undefined,
                validation: undefined
            })
        case 'date':
            return FernIr.PrimitiveTypeV2.date({
                default: undefined,
                validation: undefined
            })
        case 'datetime':
            return FernIr.PrimitiveTypeV2.dateTime({
                default: undefined,
                validation: undefined
            })
        case 'uuid':
            return FernIr.PrimitiveTypeV2.uuid({
                default: undefined,
                validation: undefined
            })
        case 'base64':
            return FernIr.PrimitiveTypeV2.base64({
                default: undefined,
                validation: undefined
            })
        case 'bigInteger':
            return FernIr.PrimitiveTypeV2.bigInteger({
                default: undefined
            })
        default:
            assertNever(examplePrimitiveType.primitive)
    }
}
