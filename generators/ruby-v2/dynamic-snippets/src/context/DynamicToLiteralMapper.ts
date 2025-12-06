import { Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ruby } from "@fern-api/ruby-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): ruby.AstNode {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return ruby.TypeLiteral.nil();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return ruby.TypeLiteral.nop();
        }
        if (args.value === undefined) {
            return ruby.TypeLiteral.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal":
                return this.convertLiteral({ literalType: args.typeReference.value, value: args.value });
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return ruby.TypeLiteral.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "optional":
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as });
            case "nullable":
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return this.convertSet({ set: args.typeReference.value, value: args.value });
            case "unknown":
                return ruby.TypeLiteral.nop();
            default:
                assertNever(args.typeReference);
        }
    }

    private convertLiteral({
        literalType,
        value
    }: {
        literalType: FernIr.dynamic.LiteralType;
        value: unknown;
    }): ruby.AstNode {
        switch (literalType.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.boolean(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            default:
                assertNever(literalType);
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): ruby.AstNode {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.list(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        );
    }

    private convertSet({ set, value }: { set: FernIr.dynamic.TypeReference; value: unknown }): ruby.AstNode {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.set(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        );
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): ruby.AstNode {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.hash(
            Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: "key" }),
                        value: this.convert({ typeReference: map.value, value })
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        );
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): ruby.AstNode {
        switch (named.type) {
            case "alias": {
                return this.convert({ typeReference: named.typeReference, value, as });
            }
            case "discriminatedUnion":
                // Not implemented
                return ruby.TypeLiteral.nop();
            case "object":
                // Not implemented
                return this.convertObject({ object: named, value });
            case "enum":
                // Not implemented
                return ruby.TypeLiteral.nop();
            case "undiscriminatedUnion":
                // Not implemented
                return ruby.TypeLiteral.nop();
            default:
                assertNever(named);
        }
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): ruby.AstNode {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.integer(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value });
                if (num == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.float(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.boolean(bool);
            }
            case "BASE_64":
            case "BIG_INTEGER":
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "UUID": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "DATE": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "DATE_TIME": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            default:
                assertNever(primitive);
        }
    }

    private convertObject({ object, value }: { object: FernIr.dynamic.ObjectType; value: unknown }): ruby.AstNode {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }

        return ruby.TypeLiteral.hash(
            Object.entries(value as Record<string, unknown>).map(([key, val]) => {
                this.context.errors.scope(key);
                const property = object.properties.find((p) => p.name.wireValue === key);
                const typeReference = property?.typeReference ?? { type: "unknown" };
                // Use snake_case property name for Ruby, falling back to wire value if not found
                const propertyName = property?.name.name.snakeCase.safeName ?? key;
                const astNode = {
                    key: ruby.TypeLiteral.string(propertyName),
                    value: this.convert({ typeReference, value: val })
                };
                this.context.errors.unscope();
                return astNode;
            })
        );
    }

    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool = as === "key" ? (typeof value === "string" ? value === "true" : Boolean(value)) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
