import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

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

    public convert(args: DynamicTypeMapper.Args): java.Type {
        switch (args.typeReference.type) {
            case "list":
                return java.Type.list(this.convert({ typeReference: args.typeReference }));
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value });
            case "map": {
                return java.Type.map(
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
                return this.convertOptional({ optional: args.typeReference });
            case "nullable":
                return this.convertNullable({ nullable: args.typeReference });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value });
            case "set":
                return java.Type.set(this.convert({ typeReference: args.typeReference }));
            case "unknown":
                return this.convertUnknown();
            default:
                assertNever(args.typeReference);
        }
    }

    private usesOptionalNullable(): boolean {
        return this.context.customConfig?.["collapse-optional-nullable"] === true;
    }

    private shouldUseNullableAnnotation(): boolean {
        return this.context.customConfig?.["use-nullable-annotation"] === true;
    }

    private optionalNullableOf(inner: FernIr.dynamic.TypeReference): java.Type {
        return java.Type.generic(this.context.getOptionalNullableClassReference(), [
            this.convert({ typeReference: inner })
        ]);
    }

    private convertNullable({ nullable }: { nullable: FernIr.dynamic.TypeReference.Nullable }): java.Type {
        const inner = nullable.value;
        if (this.usesOptionalNullable()) {
            // nullable<optional<U>> collapses into OptionalNullable<U>.
            if (inner.type === "optional") {
                return this.optionalNullableOf(inner.value);
            }
            return this.optionalNullableOf(inner);
        }
        if (this.shouldUseNullableAnnotation()) {
            // nullable<T> is represented as a bare (possibly @Nullable-annotated) T.
            return this.convert({ typeReference: inner });
        }
        return java.Type.optional(this.convert({ typeReference: inner }));
    }

    private convertOptional({ optional }: { optional: FernIr.dynamic.TypeReference.Optional }): java.Type {
        const inner = optional.value;
        // optional<nullable<U>> collapses into OptionalNullable<U>.
        if (this.usesOptionalNullable() && inner.type === "nullable") {
            return this.optionalNullableOf(inner.value);
        }
        return java.Type.optional(this.convert({ typeReference: inner }));
    }

    private convertNamed({ named }: { named: FernIr.dynamic.NamedType }): java.Type {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference });
            case "enum":
            case "discriminatedUnion":
            case "object":
            case "undiscriminatedUnion":
                return java.Type.reference(
                    java.classReference({
                        name: this.context.getClassName(named.declaration.name),
                        packageName: this.context.getTypesPackageName(named.declaration.fernFilepath)
                    })
                );
            default:
                assertNever(named);
        }
    }

    private convertLiteral({ literal }: { literal: FernIr.dynamic.LiteralType }): java.Type {
        switch (literal.type) {
            case "boolean":
                return java.Type.boolean();
            case "string":
                return java.Type.string();
        }
    }

    private convertUnknown(): java.Type {
        if (this.context.customConfig?.["generate-unknown-as-json-node"] === true) {
            return java.Type.reference(
                java.classReference({
                    name: "JsonNode",
                    packageName: "com.fasterxml.jackson.databind"
                })
            );
        }
        return java.Type.object();
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.dynamic.PrimitiveTypeV1 }): java.Type {
        switch (primitive) {
            case "INTEGER":
                return java.Type.integer();
            case "UINT":
                return java.Type.integer();
            case "LONG":
                return java.Type.long();
            case "UINT_64":
                return java.Type.long();
            case "FLOAT":
                return java.Type.float();
            case "DOUBLE":
                return java.Type.double();
            case "BOOLEAN":
                return java.Type.boolean();
            case "STRING":
                return java.Type.string();
            case "DATE":
                return java.Type.date();
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return java.Type.dateTime();
            case "UUID":
                return java.Type.uuid();
            case "BASE_64":
                return java.Type.bytes();
            case "BIG_INTEGER":
                return java.Type.bigInteger();
            default:
                assertNever(primitive);
        }
    }
}
