import { assertNever } from '@fern-api/core-utils'
import { csharp } from '@fern-api/csharp-codegen'
import { FernIr } from '@fern-api/dynamic-ir-sdk'

import { DynamicSnippetsGeneratorContext } from './DynamicSnippetsGeneratorContext'

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference
        unboxOptionals?: boolean
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public convert(args: DynamicTypeMapper.Args): csharp.Type {
        switch (args.typeReference.type) {
            case 'list':
                return csharp.Type.list(this.convert({ typeReference: args.typeReference, unboxOptionals: true }))
            case 'literal':
                return this.convertLiteral({ literal: args.typeReference.value })
            case 'map': {
                return csharp.Type.map(
                    this.convert({ typeReference: args.typeReference.key }),
                    this.convert({ typeReference: args.typeReference.value })
                )
            }
            case 'named': {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value })
                if (named == null) {
                    return this.convertUnknown()
                }
                return this.convertNamed({ named })
            }
            case 'optional':
            case 'nullable': {
                const value = this.convert({ typeReference: args.typeReference.value })
                return args.unboxOptionals ? value : csharp.Type.optional(value)
            }
            case 'primitive':
                return this.convertPrimitive({ primitive: args.typeReference.value })
            case 'set':
                return csharp.Type.set(this.convert({ typeReference: args.typeReference, unboxOptionals: true }))
            case 'unknown':
                return this.convertUnknown()
            default:
                assertNever(args.typeReference)
        }
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): csharp.Type {
        switch (named.type) {
            case 'alias':
                return this.convert({ typeReference: named.typeReference })
            case 'enum':
            case 'object':
                return csharp.Type.reference(
                    csharp.classReference({
                        name: this.context.getClassName(named.declaration.name),
                        namespace: this.context.getNamespace(named.declaration.fernFilepath)
                    })
                )
            case 'discriminatedUnion':
                if (!this.context.shouldUseDiscriminatedUnions()) {
                    return csharp.Type.object()
                }
                return csharp.Type.reference(
                    csharp.classReference({
                        name: this.context.getClassName(named.declaration.name),
                        namespace: this.context.getNamespace(named.declaration.fernFilepath)
                    })
                )
            case 'undiscriminatedUnion':
                return csharp.Type.oneOf(
                    named.types.map((typeReference) => {
                        return this.convert({ typeReference })
                    })
                )
            default:
                assertNever(named)
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): csharp.Type {
        switch (literal.type) {
            case 'boolean':
                return csharp.Type.boolean()
            case 'string':
                return csharp.Type.string()
        }
    }

    private convertUnknown(): csharp.Type {
        return csharp.Type.object()
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): csharp.Type {
        switch (primitive) {
            case 'INTEGER':
                return csharp.Type.integer()
            case 'UINT':
                return csharp.Type.uint()
            case 'LONG':
                return csharp.Type.long()
            case 'UINT_64':
                return csharp.Type.ulong()
            case 'FLOAT':
                return csharp.Type.float()
            case 'DOUBLE':
                return csharp.Type.double()
            case 'BOOLEAN':
                return csharp.Type.boolean()
            case 'STRING':
                return csharp.Type.string()
            case 'DATE':
                return csharp.Type.dateOnly()
            case 'DATE_TIME':
                return csharp.Type.dateTime()
            case 'UUID':
                return csharp.Type.string()
            case 'BASE_64':
                return csharp.Type.string()
            case 'BIG_INTEGER':
                return csharp.Type.string()
            default:
                assertNever(primitive)
        }
    }
}
