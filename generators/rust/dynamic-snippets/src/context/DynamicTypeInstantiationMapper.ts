import { Severity } from "@fern-api/browser-compatible-base-generator";
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
            case "named":
                return this.convertNamed({ typeReference: args.typeReference, value: args.value });
            case "optional":
            case "nullable":
                return this.convertOptional({ typeReference: args.typeReference, value: args.value });
            case "list":
                return this.convertList({ typeReference: args.typeReference, value: args.value });
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
            return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
        }

        return rust.Expression.stringLiteral("");
    }

    private convertNamed({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        // For now, use JSON for named types - this removes the todo!() error
        // TODO: Implement proper struct instantiation in the future
        if (typeof value === "object" && value != null) {
            return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
        }

        return rust.Expression.stringLiteral(String(value));
    }

    private convertOptional({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        if (value == null) {
            return rust.Expression.none();
        }
        // For optional/nullable, use the inner type's value structure
        const innerTypeRef = (typeReference as any).value || ({ type: "unknown" } as FernIr.dynamic.TypeReference);
        const innerValue = this.convert({ typeReference: innerTypeRef, value });
        return rust.Expression.functionCall("Some", [innerValue]);
    }

    private convertList({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        if (!Array.isArray(value)) {
            return rust.Expression.vec([]);
        }
        // For lists, use the inner type's value structure
        const innerTypeRef = (typeReference as any).value || ({ type: "unknown" } as FernIr.dynamic.TypeReference);
        const elements = value.map((item) => this.convert({ typeReference: innerTypeRef, value: item }));
        return rust.Expression.vec(elements);
    }
}
