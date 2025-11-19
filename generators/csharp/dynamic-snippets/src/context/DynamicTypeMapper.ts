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
        super(context.generation);
        this.context = context;
    }

    public convert(args: DynamicTypeMapper.Args): ast.Type {
        switch (args.typeReference.type) {
            case "list":
                return this.Collection.list(this.convert({ typeReference: args.typeReference, unboxOptionals: true }));
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map": {
                return this.Collection.map(
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
                return args.unboxOptionals ? value.asNonOptional() : value.asOptional();
            }
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "set":
                return this.Collection.set(this.convert({ typeReference: args.typeReference, unboxOptionals: true }));
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
                return this.csharp.classReference({
                    origin: named.declaration,
                    namespace: this.context.getNamespace(named.declaration.fernFilepath)
                });

            case "discriminatedUnion":
                if (!this.settings.shouldGeneratedDiscriminatedUnions) {
                    return this.Primitive.object;
                }
                return this.csharp.classReference({
                    origin: named.declaration,
                    namespace: this.context.getNamespace(named.declaration.fernFilepath)
                });

            case "undiscriminatedUnion":
                return this.OneOf.OneOf(
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
                return this.Primitive.boolean;
            case "string":
                return this.Primitive.string;
        }
    }

    private convertUnknown(): ast.Type {
        return this.Primitive.object;
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.dynamic.PrimitiveTypeV1 }): ast.Type {
        switch (primitive) {
            case "INTEGER":
                return this.Primitive.integer;
            case "UINT":
                return this.Primitive.uint;
            case "LONG":
                return this.Primitive.long;
            case "UINT_64":
                return this.Primitive.ulong;
            case "FLOAT":
                return this.Primitive.float;
            case "DOUBLE":
                return this.Primitive.double;
            case "BOOLEAN":
                return this.Primitive.boolean;
            case "STRING":
                return this.Primitive.string;
            case "DATE":
                return this.Value.dateOnly;
            case "DATE_TIME":
                return this.Value.dateTime;
            case "UUID":
                return this.Primitive.string;
            case "BASE_64":
                return this.Primitive.string;
            case "BIG_INTEGER":
                return this.Primitive.string;
            default:
                assertNever(primitive);
        }
    }
}
