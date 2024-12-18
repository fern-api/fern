import { ts } from "@fern-api/typescript-ast";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { assertNever } from "@fern-api/core-utils";
import { TypeReference } from "../../../../../packages/cli/fern-definition/schema/node_modules/@fern-api/ir-sdk/src";

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

    public convert(args: DynamicTypeMapper.Args): ts.Type {
        let named;
        switch (args.typeReference.type) {
            case "named":
                named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return ts.Types.noOp();
                }
                return this.convertNamed({ named });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "list":
                return ts.Types.array(this.convert({ typeReference: args.typeReference }));
            case "map":
                return ts.Types.noOp();
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
        }
        return ts.Types.noOp();
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): ts.Type {
        switch (primitive) {
            case "INTEGER":
                return ts.Types.number();
            case "LONG":
                return ts.Types.number();
            case "UINT":
                return ts.Types.number();
            case "UINT_64":
                return ts.Types.number();
            case "FLOAT":
                return ts.Types.number();
            case "DOUBLE":
                return ts.Types.number();
            case "BOOLEAN":
                return ts.Types.boolean();
            case "STRING":
                return ts.Types.string();
            case "DATE":
                return ts.Types.string();
            case "DATE_TIME":
                return ts.Types.string();
            case "UUID":
                return ts.Types.string();
            case "BASE_64":
                return ts.Types.string();
            case "BIG_INTEGER":
                return ts.Types.noOp();
            default:
                assertNever(primitive);
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): ts.Type {
        switch (literal.type) {
            case "boolean":
                return ts.Type.boolean();
            case "string":
                return ts.Type.string();
            default:
                assertNever(literal);
        }
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): ts.Type {
        switch (named.type) {
            case "alias":
                return this.convertAlias({ alias: named });
            case "enum":
                return ts.Types.noOp();
            case "object":
                return this.convertObject({ obj: named });
            case "discriminatedUnion":
                return ts.Types.noOp();
            case "undiscriminatedUnion":
                return ts.Types.noOp();
            default:
                assertNever(named);
        }
    }

    private convertAlias({ alias }: { alias: FernIr.dynamic.AliasType }): ts.Type {
        return ts.Types.noOp();
    }

    private convertEnum({ enum: enumType }: { enum: FernIr.dynamic.EnumType }): ts.Type {
        return ts.Types.noOp();
    }

    private convertObject({ obj }: { obj: FernIr.dynamic.ObjectType }): ts.Type {
        const properties: Record<string, ts.Type> = {};
        for (const field of obj.properties) {
            properties[field.name.wireValue] = this.convert({ typeReference: field.typeReference });
        }
        return ts.Types.object(properties);
    }
}
