import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeMapper.Args): go.Type {
        switch (args.typeReference.type) {
            case "list":
                return go.Type.slice(this.convert({ typeReference: args.typeReference }));
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map":
                return go.Type.map(
                    this.convert({ typeReference: args.typeReference.key }),
                    this.convert({ typeReference: args.typeReference.value })
                );
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return this.convertUnknown();
                }
                return this.convertNamed({ named });
            }
            case "optional":
                return go.Type.optional(this.convert({ typeReference: args.typeReference.value }));
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "set":
                return go.Type.slice(this.convert({ typeReference: args.typeReference }));
            case "unknown":
                return this.convertUnknown();
            default:
                assertNever(args.typeReference);
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): go.Type {
        switch (literal.type) {
            case "boolean":
                return go.Type.bool();
            case "string":
                return go.Type.string();
        }
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): go.Type {
        const goTypeReference = go.Type.reference(
            go.typeReference({
                name: this.context.getTypeName(named.declaration.name),
                importPath: this.context.getImportPath(named.declaration.fernFilepath)
            })
        );
        switch (named.type) {
            case "alias":
            case "enum":
                return goTypeReference;
            case "discriminatedUnion":
            case "object":
            case "undiscriminatedUnion":
                return go.Type.pointer(goTypeReference);
            default:
                assertNever(named);
        }
    }

    private convertUnknown(): go.Type {
        return go.Type.any();
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): go.Type {
        switch (primitive) {
            case "INTEGER":
                return go.Type.int();
            case "UINT":
                return go.Type.int();
            case "LONG":
                return go.Type.int64();
            case "UINT_64":
                return go.Type.int64();
            case "FLOAT":
                return go.Type.float64();
            case "DOUBLE":
                return go.Type.float64();
            case "BOOLEAN":
                return go.Type.bool();
            case "STRING":
                return go.Type.string();
            case "DATE":
                return go.Type.date();
            case "DATE_TIME":
                return go.Type.dateTime();
            case "UUID":
                return go.Type.uuid();
            case "BASE_64":
                return go.Type.bytes();
            case "BIG_INTEGER":
                return go.Type.string();
            default:
                assertNever(primitive);
        }
    }
}
