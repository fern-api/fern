import { ts } from "@fern-api/typescript-ast";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { assertNever } from "@fern-api/core-utils";
import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { type } from "os";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    type ConvertedAs = "key";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): ts.TypeLiteral {
        if (args.value == null) {
            return ts.TypeLiteral.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference, value: args.value });
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return ts.TypeLiteral.nop();
                }
                return this.convertNamed({ named, value: args.value });
            }
            case "optional":
                return ts.TypeLiteral.nop();
            case "unknown":
                return ts.TypeLiteral.nop();
            default:
                return ts.TypeLiteral.nop();
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): ts.TypeLiteral {
        switch (literal.type) {
            case "boolean":
                return ts.TypeLiteral.boolean(literal.value);
            case "string":
                return ts.TypeLiteral.string(literal.value);
        }
    }

    private convertNamed({ named, value }: { named: FernIr.dynamic.NamedType; value: unknown }): ts.TypeLiteral {
        switch (named.type) {
            case "object":
                return this.convertObject({ object_: named, value });
            default:
                return ts.TypeLiteral.nop();
        }
    }

    private convertObject({ object_, value }: { object_: FernIr.dynamic.ObjectType; value: unknown }): ts.TypeLiteral {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        });
        const fields: Record<string, ts.TypeLiteral> = {};
        properties.forEach((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                fields[this.context.getTypeName(property.name.name)] = this.convert(property);
            } finally {
                this.context.errors.unscope();
            }
        });
        return ts.TypeLiteral.object(fields);
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference.List; value: unknown }): ts.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.array({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): ts.TypeLiteral {
        return ts.TypeLiteral.nop();
        // TODO: Implement this
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): ts.TypeLiteral {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.number(num);
            case "BOOLEAN":
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.boolean(bool);
            case "STRING":
            case "DATE":
            case "DATE_TIME":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                const str = this.getValueAsString({ value });
                if (str == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.string(str);

            // const bigInt = this.getValueAsBigInt({ value });
            // if (bigInt == null) {
            //     return ts.TypeLiteral.nop();
            // }
            // return ts.TypeLiteral.bigint(bigInt);
            default:
                assertNever(primitive);
        }
    }

    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
        if (typeof num !== "number") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "number", value }).message
            });
            return undefined;
        }
        return num;
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "key" ? (typeof value === "string" ? value === "true" : value === "false" ? false : value) : value;
        if (typeof bool !== "boolean") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "boolean", value }).message
            });
            return undefined;
        }
        return bool;
    }

    private getValueAsString({ value }: { value: unknown }): string | undefined {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "string", value }).message
            });
            return undefined;
        }
        return value;
    }

    // private getValueAsBigInt({ value }: { value: unknown }): bigint | undefined {
    //     if (typeof value !== "bigint") {
    //         this.context.errors.add({
    //             severity: Severity.Critical,
    //             message: this.newTypeMismatchError({ expected: "bigint", value }).message
    //         });
    //         return undefined;
    //     }
    //     return value;
    // }

    private newTypeMismatchError({ expected, value }: { expected: string; value: unknown }): Error {
        return new Error(`Expected ${expected} but got ${typeof value}`);
    }
}
