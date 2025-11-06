import { assertNever } from "@fern-api/core-utils";
import { ast, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        unboxOptionals?: boolean;
    }
}

export class DynamicTypeMapper extends WithGeneration {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        super(context);
        this.context = context;
    }

    public convert(args: DynamicTypeMapper.Args): ast.Type {
        switch (args.typeReference.type) {
            case "list":
                return this.csharp.Type.list(this.convert({ typeReference: args.typeReference, unboxOptionals: true }));
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map": {
                return this.csharp.Type.map(
                    this.convert({ typeReference: args.typeReference.key }),
                    this.convert({ typeReference: args.typeReference.value })
                );
            }
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return this.convertUnknown();
                }
                return this.convertNamed({ named });
            }
            case "optional":
            case "nullable": {
                const value = this.convert({ typeReference: args.typeReference.value });
                return args.unboxOptionals ? value.unwrapIfOptional() : this.csharp.Type.optional(value);
            }
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "set":
                return this.csharp.Type.set(this.convert({ typeReference: args.typeReference, unboxOptionals: true }));
            case "unknown":
                return this.convertUnknown();
            default:
                assertNever(args.typeReference);
        }
    }

    convertToClassReference(named: FernIr.dynamic.NamedType): ast.ClassReference {
        return this.csharp.classReference({
            origin: named.declaration,
            namespace: this.context.getNamespace(named.declaration.fernFilepath)
        });
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): ast.Type {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference });
            case "enum":
            case "object":
                return this.csharp.Type.reference(
                    this.csharp.classReference({
                        origin: named.declaration,
                        namespace: this.context.getNamespace(named.declaration.fernFilepath)
                    })
                );
            case "discriminatedUnion":
                if (!this.settings.shouldGeneratedDiscriminatedUnions) {
                    return this.csharp.Type.object;
                }
                return this.csharp.Type.reference(
                    this.csharp.classReference({
                        origin: named.declaration,
                        namespace: this.context.getNamespace(named.declaration.fernFilepath)
                    })
                );
            case "undiscriminatedUnion":
                return this.csharp.Type.oneOf(
                    named.types.map((typeReference) => {
                        return this.convert({ typeReference });
                    })
                );
            default:
                assertNever(named);
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): ast.Type {
        switch (literal.type) {
            case "boolean":
                return this.csharp.Type.boolean;
            case "string":
                return this.csharp.Type.string;
        }
    }

    private convertUnknown(): ast.Type {
        return this.csharp.Type.object;
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.dynamic.PrimitiveTypeV1 }): ast.Type {
        switch (primitive) {
            case "INTEGER":
                return this.csharp.Type.integer;
            case "UINT":
                return this.csharp.Type.uint;
            case "LONG":
                return this.csharp.Type.long;
            case "UINT_64":
                return this.csharp.Type.ulong;
            case "FLOAT":
                return this.csharp.Type.float;
            case "DOUBLE":
                return this.csharp.Type.double;
            case "BOOLEAN":
                return this.csharp.Type.boolean;
            case "STRING":
                return this.csharp.Type.string;
            case "DATE":
                return this.csharp.Type.dateOnly;
            case "DATE_TIME":
                return this.csharp.Type.dateTime;
            case "UUID":
                return this.csharp.Type.string;
            case "BASE_64":
                return this.csharp.Type.string;
            case "BIG_INTEGER":
                return this.csharp.Type.string;
            default:
                assertNever(primitive);
        }
    }
}
