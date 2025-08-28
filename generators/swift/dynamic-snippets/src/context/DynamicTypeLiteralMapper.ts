import { Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "mapKey" | "mapValue";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): swift.Expression {
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return swift.Expression.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "nullable":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "optional":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "unknown":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            default:
                assertNever(args.typeReference);
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): swift.Expression {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return swift.Expression.nop();
        }
        return swift.Expression.arrayLiteral({
            elements: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): swift.Expression {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return swift.Expression.nop();
        }
        return swift.Expression.dictionaryLiteral({
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return [
                        this.convert({ typeReference: map.key, value: key, as: "mapKey" }),
                        this.convert({ typeReference: map.value, value, as: "mapValue" })
                    ];
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference, value, as });
            case "discriminatedUnion":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "enum":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            case "object":
                return this.convertObject({ object_: named, value, as });
            case "undiscriminatedUnion":
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            default:
                assertNever(named);
        }
    }

    private convertObject({
        object_,
        value,
        as
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        });
        return swift.Expression.structInitialization({
            unsafeName: object_.declaration.name.pascalCase.unsafeName,
            arguments_: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue);
                try {
                    return swift.functionArgument({
                        label: property.name.name.camelCase.unsafeName,
                        value: this.convert({ typeReference: property.typeReference, value: property.value, as })
                    });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
            case "LONG":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.numberLiteral(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.boolLiteral(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.stringLiteral(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return swift.Expression.nop();
                }
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            }
            case "DATE_TIME": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return swift.Expression.nop();
                }
                // TODO(kafkas): Implement
                return swift.Expression.nop();
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.uuidLiteral(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.stringLiteral(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return swift.Expression.nop();
                }
                // TODO(kafkas): Bigints are not supported yet
                return swift.Expression.nop();
            }
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
        const num = as === "mapKey" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "mapKey"
                ? typeof value === "string"
                    ? value === "true"
                    : value === "false"
                      ? false
                      : value
                : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
