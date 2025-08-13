import { Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeInstantiationMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    type ConvertedAs = "key";
}

export class DynamicTypeInstantiationMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeInstantiationMapper.Args): rust.Expression {
        if (args.value == null && !this.context.isNullable(args.typeReference)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
        }
        if (args.value == null) {
            return rust.Expression.none();
        }

        switch (args.typeReference.type) {
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value });
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value, value: args.value });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            default:
                return rust.Expression.raw('todo!("Unhandled type reference")');
        }
    }

    private convertPrimitive({
        primitive,
        value
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
    }): rust.Expression {
        switch (primitive) {
            case "STRING":
                return rust.Expression.stringLiteral(value as string);
            case "INTEGER":
                return rust.Expression.numberLiteral(value as number);
            case "BOOLEAN":
                return rust.Expression.booleanLiteral(value as boolean);
            default:
                return rust.Expression.raw(`todo!("Unhandled primitive: ${primitive}")`);
        }
    }

    private convertLiteral({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
    }): rust.Expression {
        if (typeof literal?.value === "boolean") {
            return rust.Expression.booleanLiteral(literal.value);
        } else if (typeof literal?.value === "string") {
            return rust.Expression.stringLiteral(literal.value);
        }
        return rust.Expression.raw('todo!("Unknown literal type")');
    }

    private convertUnknown({ value }: { value: unknown }): rust.Expression {
        if (value == null) {
            return rust.Expression.reference("None");
        }

        if (typeof value === "string") {
            return rust.Expression.stringLiteral(value);
        }

        if (typeof value === "number") {
            return rust.Expression.numberLiteral(value);
        }

        if (typeof value === "boolean") {
            return rust.Expression.booleanLiteral(value);
        }

        if (Array.isArray(value)) {
            const elements = value.map((v) => this.convertUnknown({ value: v }));
            return rust.Expression.vec(elements);
        }

        if (typeof value === "object") {
            // Use serde_json for complex objects
            return rust.Expression.raw(`serde_json::json!(${JSON.stringify(JSON.stringify(value))})`);
        }

        return rust.Expression.stringLiteral("");
    }
}
