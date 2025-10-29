import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { swift } from "@fern-api/swift-codegen";

import { pascalCase } from "../util/pascal-case";
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

    public convert(args: DynamicTypeMapper.Args): swift.Type {
        switch (args.typeReference.type) {
            case "list":
                return swift.Type.array(this.convert({ typeReference: args.typeReference.value }));
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map": {
                return swift.Type.dictionary(
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
                return swift.Type.optional(this.convert({ typeReference: args.typeReference.value }));
            case "nullable":
                return swift.Type.nullable(this.convert({ typeReference: args.typeReference.value }));
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "set":
                return swift.Type.jsonValue();
            case "unknown":
                return this.convertUnknown();
            default:
                assertNever(args.typeReference);
        }
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): swift.Type {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference });
            case "enum":
            case "discriminatedUnion":
            case "object":
            case "undiscriminatedUnion":
                return swift.Type.custom(named.declaration.name.pascalCase.unsafeName);
            default:
                assertNever(named);
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): swift.Type {
        switch (literal.type) {
            case "boolean":
                return swift.Type.bool();
            case "string":
                return swift.Type.custom(pascalCase(literal.value));
        }
    }

    private convertUnknown(): swift.Type {
        return swift.Type.jsonValue();
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): swift.Type {
        switch (primitive) {
            case "INTEGER":
                return swift.Type.int();
            case "UINT":
                return swift.Type.int();
            case "LONG":
                return swift.Type.int64();
            case "UINT_64":
                return swift.Type.uint64();
            case "FLOAT":
                return swift.Type.float();
            case "DOUBLE":
                return swift.Type.double();
            case "BOOLEAN":
                return swift.Type.bool();
            case "STRING":
                return swift.Type.string();
            case "DATE":
                return swift.Type.date();
            case "DATE_TIME":
                return swift.Type.date();
            case "UUID":
                return swift.Type.uuid();
            case "BASE_64":
                return swift.Type.string();
            case "BIG_INTEGER":
                return swift.Type.string();
            default:
                assertNever(primitive);
        }
    }
}
