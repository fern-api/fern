import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

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

    public convert(args: DynamicTypeMapper.Args): go.Type {
        switch (args.typeReference.type) {
            case "list":
                return go.Type.slice(this.convert({ typeReference: args.typeReference.value }));
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
                return this.convertOptionalOrNullable(args.typeReference.value);
            case "nullable":
                return this.convertOptionalOrNullable(args.typeReference.value);
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

    private convertOptionalOrNullable(innerReference: FernIr.dynamic.TypeReference): go.Type {
        if (this.isPointerAliasReference(innerReference)) {
            return this.convert({ typeReference: innerReference });
        }
        return go.Type.optional(this.convert({ typeReference: innerReference }));
    }

    /**
     * Returns true if the type reference resolves to a named alias that already
     * generates as a pointer type in Go. Also handles the collapse case where
     * optional(nullable(named(alias))) should not produce a double pointer.
     */
    private isPointerAliasReference(reference: FernIr.dynamic.TypeReference): boolean {
        if (reference.type === "named") {
            return this.omitsPointerForAlias(reference.value);
        }
        if (reference.type === "optional" || reference.type === "nullable") {
            const inner = reference.value;
            if (inner.type === "named") {
                return this.omitsPointerForAlias(inner.value);
            }
        }
        return false;
    }

    /**
     * Checks if a named type is an alias that already generates as a pointer in Go
     * (e.g. a nullable primitive like *time.Time). Traverses alias chains.
     */
    public isAliasToPointerType(typeId: FernIr.dynamic.TypeId): boolean {
        return this.resolvePointerAliasTarget(typeId) != null;
    }

    /**
     * Returns true if an optional reference to the alias should not add another pointer because
     * the alias already generates as a pointer. With `legacyNullableAliasPointers`, only date and
     * datetime aliases omit the pointer because their fields are marshaled through *time.Time.
     */
    public omitsPointerForAlias(typeId: FernIr.dynamic.TypeId): boolean {
        const target = this.resolvePointerAliasTarget(typeId);
        if (target == null) {
            return false;
        }
        if (this.context.customConfig?.legacyNullableAliasPointers !== true) {
            return true;
        }
        return target.type === "primitive" && (target.value === "DATE" || target.value === "DATE_TIME");
    }

    private resolvePointerAliasTarget(typeId: FernIr.dynamic.TypeId): FernIr.dynamic.TypeReference | undefined {
        const seen = new Set<FernIr.dynamic.TypeId>();
        let currentTypeId = typeId;
        while (true) {
            if (seen.has(currentTypeId)) {
                return undefined;
            }
            seen.add(currentTypeId);
            const namedType = this.context.resolveNamedType({ typeId: currentTypeId });
            if (namedType == null || namedType.type !== "alias") {
                return undefined;
            }
            const aliasOf = namedType.typeReference;
            if (aliasOf.type === "optional" || aliasOf.type === "nullable") {
                let inner = aliasOf.value;
                while (inner.type === "optional" || inner.type === "nullable") {
                    inner = inner.value;
                }
                return this.isPointerRequiredForOptionalInner(inner) ? inner : undefined;
            }
            if (aliasOf.type === "named") {
                currentTypeId = aliasOf.value;
                continue;
            }
            return undefined;
        }
    }

    /**
     * Lists, maps, sets, and unknown values are already nil-able, so an optional/nullable
     * wrapper around them renders without a pointer.
     */
    private isPointerRequiredForOptionalInner(inner: FernIr.dynamic.TypeReference): boolean {
        return inner.type !== "list" && inner.type !== "map" && inner.type !== "set" && inner.type !== "unknown";
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

    private convertPrimitive({ primitive }: { primitive: FernIr.dynamic.PrimitiveTypeV1 }): go.Type {
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
            case "DATE_TIME_RFC_2822":
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
