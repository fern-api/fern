import { assertNever } from "@fern-api/core-utils"
import { FernIr } from "@fern-api/dynamic-ir-sdk"
import { java } from "@fern-api/java-ast"

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext"

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public convert(args: DynamicTypeMapper.Args): java.Type {
        switch (args.typeReference.type) {
            case "list":
                return java.Type.list(this.convert({ typeReference: args.typeReference }))
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value })
            case "map": {
                return java.Type.map(
                    this.convert({ typeReference: args.typeReference.key }),
                    this.convert({ typeReference: args.typeReference.value })
                )
            }
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value })
                if (named == null) {
                    return this.convertUnknown()
                }
                return this.convertNamed({ named })
            }
            case "optional":
            case "nullable": {
                return java.Type.optional(this.convert({ typeReference: args.typeReference.value }))
            }
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value })
            case "set":
                return java.Type.set(this.convert({ typeReference: args.typeReference }))
            case "unknown":
                return this.convertUnknown()
            default:
                assertNever(args.typeReference)
        }
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): java.Type {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference })
            case "enum":
            case "discriminatedUnion":
            case "object":
            case "undiscriminatedUnion":
                return java.Type.reference(
                    java.classReference({
                        name: this.context.getClassName(named.declaration.name),
                        packageName: this.context.getTypesPackageName(named.declaration.fernFilepath)
                    })
                )
            default:
                assertNever(named)
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): java.Type {
        switch (literal.type) {
            case "boolean":
                return java.Type.boolean()
            case "string":
                return java.Type.string()
        }
    }

    private convertUnknown(): java.Type {
        return java.Type.object()
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): java.Type {
        switch (primitive) {
            case "INTEGER":
                return java.Type.integer()
            case "UINT":
                return java.Type.integer()
            case "LONG":
                return java.Type.long()
            case "UINT_64":
                return java.Type.long()
            case "FLOAT":
                return java.Type.float()
            case "DOUBLE":
                return java.Type.double()
            case "BOOLEAN":
                return java.Type.boolean()
            case "STRING":
                return java.Type.string()
            case "DATE":
                return java.Type.date()
            case "DATE_TIME":
                return java.Type.dateTime()
            case "UUID":
                return java.Type.uuid()
            case "BASE_64":
                return java.Type.bytes()
            case "BIG_INTEGER":
                return java.Type.bigInteger()
            default:
                assertNever(primitive)
        }
    }
}
