import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

export declare namespace DynamicTypeInstantiationMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeInstantiationMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeInstantiationMapper.Args): go.TypeInstantiation {
        // eslint-disable-next-line eqeqeq
        if (args.value === null && !this.context.isNullable(args.typeReference)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
        }
        if (args.value == null) {
            return go.TypeInstantiation.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal":
                return go.TypeInstantiation.nop();
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return go.TypeInstantiation.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "nullable": {
                const inner = args.typeReference.value;
                // Special case: nullable + alias-of-collection
                // For fields like `Services *ServicesUs50` where `type ServicesUs50 = []*ServiceUs50`,
                // we generate `&ServicesUs50{...}` using the alias name in the composite literal.
                // This is more idiomatic and matches the exported API type users see.
                if (inner.type === "named") {
                    const named = this.context.resolveNamedType({ typeId: inner.value });
                    if (named?.type === "alias" && ["list", "set", "map"].includes(named.typeReference.type)) {
                        // Build the underlying collection literal
                        const collectionLiteral = this.convert({
                            typeReference: named.typeReference,
                            value: args.value,
                            as: args.as
                        });

                        // Get the alias type reference
                        const aliasName = this.context.getTypeName(named.declaration.name);
                        const aliasImportPath = this.context.getImportPath(named.declaration.fernFilepath);

                        // Reconstruct the composite literal using the alias name
                        return this.reconstructAliasCollectionLiteral({
                            collectionLiteral,
                            aliasName,
                            aliasImportPath
                        });
                    }
                    // Special case: nullable + alias-of-literal
                    // For fields like `SortField *SortField` where `type SortField = string` with literal value,
                    // we use the primitive's pointer helper (e.g., fern.String("DEFAULT")) instead of
                    // trying to take the address of a type conversion which is invalid Go.
                    if (named?.type === "alias" && named.typeReference.type === "literal") {
                        return this.convertLiteralToOptionalPrimitive(named.typeReference.value);
                    }
                }
                // Default behavior for all other nullables
                return go.TypeInstantiation.optional(
                    this.convert({ typeReference: inner, value: args.value, as: args.as })
                );
            }
            case "optional": {
                const inner = args.typeReference.value;
                // Special case: optional + alias-of-collection
                // For fields like `Services *ServicesUs50` where `type ServicesUs50 = []*ServiceUs50`,
                // we generate `&ServicesUs50{...}` using the alias name in the composite literal.
                // This is more idiomatic and matches the exported API type users see.
                if (inner.type === "named") {
                    const named = this.context.resolveNamedType({ typeId: inner.value });
                    if (named?.type === "alias" && ["list", "set", "map"].includes(named.typeReference.type)) {
                        // Build the underlying collection literal
                        const collectionLiteral = this.convert({
                            typeReference: named.typeReference,
                            value: args.value,
                            as: args.as
                        });

                        // Get the alias type reference
                        const aliasName = this.context.getTypeName(named.declaration.name);
                        const aliasImportPath = this.context.getImportPath(named.declaration.fernFilepath);

                        // Reconstruct the composite literal using the alias name
                        return this.reconstructAliasCollectionLiteral({
                            collectionLiteral,
                            aliasName,
                            aliasImportPath
                        });
                    }
                    // Special case: optional + alias-of-literal
                    // For fields like `SortField *SortField` where `type SortField = string` with literal value,
                    // we use the primitive's pointer helper (e.g., fern.String("DEFAULT")) instead of
                    // trying to take the address of a type conversion which is invalid Go.
                    if (named?.type === "alias" && named.typeReference.type === "literal") {
                        return this.convertLiteralToOptionalPrimitive(named.typeReference.value);
                    }
                }
                // Default behavior for all other optionals
                return go.TypeInstantiation.optional(
                    this.convert({ typeReference: inner, value: args.value, as: args.as })
                );
            }
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            default:
                assertNever(args.typeReference);
        }
    }

    public convertToPointerIfPossible(args: DynamicTypeInstantiationMapper.Args): go.TypeInstantiation {
        const converted = this.convert(args);
        switch (args.typeReference.type) {
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named?.type === "enum") {
                    return go.TypeInstantiation.reference(
                        go.invokeMethod({
                            on: converted,
                            method: "Ptr",
                            arguments_: []
                        })
                    );
                }
                return converted;
            }
            default:
                return converted;
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): go.TypeInstantiation {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.slice({
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

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): go.TypeInstantiation {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.map({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value)
                .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0))
                .map(([key, value]) => {
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
        });
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (named.type) {
            case "alias":
                return this.convertAlias({
                    aliasType: named,
                    value,
                    as
                });
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value
                });
            case "enum":
                return this.convertEnum({ enum_: named, value });
            case "object":
                return this.convertObject({ object_: named, value });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value });
            default:
                assertNever(named);
        }
    }

    private convertAlias({
        aliasType,
        value,
        as
    }: {
        aliasType: FernIr.dynamic.NamedType.Alias;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (aliasType.typeReference.type) {
            case "literal":
                return go.TypeInstantiation.reference(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: this.context.getTypeName(aliasType.declaration.name),
                            importPath: this.context.getImportPath(aliasType.declaration.fernFilepath)
                        }),
                        arguments_: [this.convertLiteralValue(aliasType.typeReference.value)]
                    })
                );
            default:
                return this.convert({ typeReference: aliasType.typeReference, value, as });
        }
    }

    private reconstructAliasCollectionLiteral({
        collectionLiteral,
        aliasName,
        aliasImportPath
    }: {
        collectionLiteral: go.TypeInstantiation;
        aliasName: string;
        aliasImportPath: string;
    }): go.TypeInstantiation {
        // Reconstruct the composite literal using the alias name
        const internal = collectionLiteral.internalType;
        // Note: sets are converted to slices via convertList, so they're handled by the slice case
        if (internal.type === "slice") {
            return go.TypeInstantiation.reference(
                go.codeblock((writer) => {
                    writer.write("&");
                    writer.writeNode(
                        go.typeReference({
                            name: aliasName,
                            importPath: aliasImportPath
                        })
                    );

                    const values = internal.values;
                    if (values.length === 0) {
                        writer.write("{}");
                        return;
                    }

                    writer.writeLine("{");
                    writer.indent();
                    for (const v of values) {
                        writer.writeNode(v);
                        writer.writeLine(",");
                    }
                    writer.dedent();
                    writer.write("}");
                })
            );
        }
        if (internal.type === "map") {
            return go.TypeInstantiation.reference(
                go.codeblock((writer) => {
                    writer.write("&");
                    writer.writeNode(
                        go.typeReference({
                            name: aliasName,
                            importPath: aliasImportPath
                        })
                    );

                    const entries = internal.entries;
                    if (entries.length === 0) {
                        writer.write("{}");
                        return;
                    }

                    writer.writeLine("{");
                    writer.indent();
                    for (const entry of entries) {
                        writer.writeNode(entry.key);
                        writer.write(": ");
                        writer.writeNode(entry.value);
                        writer.writeLine(",");
                    }
                    writer.dedent();
                    writer.write("}");
                })
            );
        }
        // Fallback: if not a slice or map, use the underlying type approach
        return go.TypeInstantiation.reference(
            go.codeblock((writer) => {
                writer.write("&");
                writer.writeNode(collectionLiteral);
            })
        );
    }

    // Materializes a literal value (e.g. a literal path parameter), as opposed to
    // convert(), which treats literals as a no-op since they are usually omitted.
    public convertLiteral(literal: FernIr.dynamic.LiteralType): go.TypeInstantiation {
        return this.convertLiteralValue(literal);
    }

    private convertLiteralValue(literal: FernIr.dynamic.LiteralType): go.TypeInstantiation {
        switch (literal.type) {
            case "boolean":
                return go.TypeInstantiation.bool(literal.value);
            case "string":
                return go.TypeInstantiation.string(literal.value);
            default:
                assertNever(literal);
        }
    }

    private convertLiteralToOptionalPrimitive(literal: FernIr.dynamic.LiteralType): go.TypeInstantiation {
        switch (literal.type) {
            case "boolean":
                return go.TypeInstantiation.optional(go.TypeInstantiation.bool(literal.value));
            case "string":
                return go.TypeInstantiation.optional(go.TypeInstantiation.string(literal.value));
            default:
                assertNever(literal);
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const structTypeReference = this.context.getGoTypeReferenceFromDeclaration({
            declaration: discriminatedUnion.declaration
        });
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return go.TypeInstantiation.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const baseFields = this.getBaseFields({
            discriminatedUnionTypeInstance,
            singleDiscriminatedUnionType: unionVariant,
            // When `dedupeUnionBaseProperties` removes a base property from the union's top-level
            // fields (exposing it through a discriminant-switching getter instead), that field no
            // longer exists on the struct, so setting it at the union root would fail to compile.
            // Those base properties are always carried by the variant's own object, so the value is
            // still present in the snippet. See getDedupedBasePropertyWireValues.
            excludeWireValues: this.getDedupedBasePropertyWireValues(discriminatedUnion)
        });
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            name: this.context.getFieldName(unionVariant.discriminantValue.name),
                            value: this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })
                        },
                        ...baseFields
                    ]
                });
            }
            case "singleProperty": {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return go.TypeInstantiation.nop();
                }
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    return go.TypeInstantiation.structPointer({
                        typeReference: structTypeReference,
                        fields: [
                            {
                                name: this.context.getFieldName(unionVariant.discriminantValue.name),
                                value: this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: record[unionVariant.discriminantValue.wireValue]
                                })
                            },
                            ...baseFields
                        ]
                    });
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            // Unions with no properties require the discriminant property to be set.
                            name: this.context.getFieldName(discriminatedUnionTypeInstance.discriminantValue.name),
                            value: go.TypeInstantiation.string(unionVariant.discriminantValue.wireValue)
                        },
                        ...baseFields
                    ]
                });
            default:
                assertNever(unionVariant);
        }
    }

    private getBaseFields({
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType,
        excludeWireValues
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType;
        // Base properties whose top-level struct field has been removed by
        // `dedupeUnionBaseProperties`; setting them at the union root would not compile.
        excludeWireValues?: Set<string>;
    }): go.StructField[] {
        const properties = this.context
            .associateByWireValue({
                parameters: singleDiscriminatedUnionType.properties ?? [],
                values: this.context.getRecord(discriminatedUnionTypeInstance.value) ?? {},

                // We're only selecting the base properties here. The rest of the properties
                // are handled by the union variant.
                ignoreMissingParameters: true
            })
            .filter((property) => !(excludeWireValues?.has(property.name.wireValue) ?? false));
        return properties.map((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                return {
                    name: this.context.getFieldName(property.name.name),
                    value: this.convert(property)
                };
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    /**
     * Returns the wire values of the union base properties that the Go model generator drops as
     * top-level struct fields when `dedupeUnionBaseProperties` is enabled — mirroring the model's
     * `unionInheritedBasePropertyNames` so the snippet and the generated model dedupe an identical
     * set.
     *
     * The decision has a language-agnostic core and a thin Go-specific widening, exactly as in the
     * model:
     *   - Core: the IR marks (in `DiscriminatedUnionType.inheritedBaseProperties`, the dynamic-IR
     *     mirror of `UnionTypeDeclaration.inheritedBaseProperties`) the base properties every
     *     `samePropertiesAsObject` variant redeclares with a structurally-equal type. This is the
     *     shared source of truth, so the decision is not re-derived per language.
     *   - Go-render widening: Go additionally dedupes a base property that every variant redeclares
     *     with a Go-RENDER-equivalent type (e.g. `list`/`set` both render `[]T`, `optional`/`nullable`
     *     both `*T`) even though the IR's conservative structural equality left it unmarked; the
     *     delegating getter still compiles, so the top-level field is safe to drop.
     *
     * Literal base properties are always kept at the union root (they render as `<Name>()` methods,
     * not delegatable fields), matching the model. Base properties that a variant does not carry, or
     * that a variant redeclares with a different Go getter type, keep their top-level field and must
     * still be set at the union root, so they are excluded here.
     *
     * To stay in lockstep with the model, base<->variant properties are matched by Go field name (not
     * wire value) via {@link getObjectExportedProperties}, and compared through
     * {@link getGoGetterTypeString} — the single comparison primitive that renders a getter's Go type
     * including the `getters-pass-by-value` `*`-stripping the model applies. Both the structural-core
     * and the widening path route through it, so the two generators cannot drift.
     */
    private getDedupedBasePropertyWireValues(discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType): Set<string> {
        if (!this.context.customConfig?.dedupeUnionBaseProperties) {
            return new Set();
        }
        const variants = Object.values(discriminatedUnion.types);
        // The IR only marks inheritedBaseProperties when every variant is `samePropertiesAsObject`,
        // and the delegating getter is only valid in that case, so bail otherwise.
        if (variants.length === 0 || !variants.every((variant) => variant.type === "samePropertiesAsObject")) {
            return new Set();
        }
        // A `samePropertiesAsObject` variant's `properties` are, per the dynamic IR, "the base and/or
        // extended properties from the union" — the union's base-property set projected onto every
        // variant, so it is identical across variants. Take it from the first variant; this mirrors
        // the model iterating `union.BaseProperties`.
        const baseProperties = variants[0]?.properties ?? [];
        if (baseProperties.length === 0) {
            return new Set();
        }
        // Wire values the IR marked as structurally inherited (the language-agnostic core).
        const structurallyInherited = new Set(
            (discriminatedUnion.inheritedBaseProperties ?? []).map((property) => property.wireValue)
        );
        // Resolving each variant's object and rendering property types below is a read-only probe
        // used only to decide which fields to drop — not snippet emission. `resolveNamedType`
        // reports a Critical error when a type id is missing, so discard any errors this probe
        // produces to avoid failing an otherwise-valid snippet.
        const errorsBefore = this.context.errors.size();
        try {
            // Each variant's exported properties (following `extends`), keyed by Go field name — the
            // same key `variant.Get<FieldName>()` uses — matching the model's objectExportedProperties.
            const variantPropertiesByField = variants.map((variant) => this.getObjectExportedProperties(variant.typeId));
            const everyVariantExposesNonLiteralProperty = (fieldName: string): boolean =>
                variantPropertiesByField.every((declared) => {
                    const variantProperty = declared.get(fieldName);
                    return variantProperty != null && variantProperty.typeReference.type !== "literal";
                });
            const deduped = new Set<string>();
            for (const baseProperty of baseProperties) {
                // Local Go rendering policy: literals render as methods, not delegatable fields, so
                // they are never deduped (kept at the union root), even if the IR marked them.
                if (baseProperty.typeReference.type === "literal") {
                    continue;
                }
                const fieldName = this.context.getFieldName(baseProperty.name.name);
                if (structurallyInherited.has(baseProperty.name.wireValue)) {
                    // The IR proved every variant redeclares this wire value with a structurally-equal
                    // type, so the getter's return type matches by construction; only confirm every
                    // variant exposes it under the same Go field name as a non-literal (a wire-value
                    // match can survive a name-casing override that leaves variant.Get<FieldName>()
                    // undefined). Keeps the deduped set a subset of what the widening accepts.
                    if (everyVariantExposesNonLiteralProperty(fieldName)) {
                        deduped.add(baseProperty.name.wireValue);
                    }
                    continue;
                }
                // Go-render widening: dedupe when every variant carries a Go-render-equivalent
                // property, even though the IR's conservative structural equality did not mark it.
                const baseGetterType = this.getGoGetterTypeString(baseProperty.typeReference);
                const carriedByEveryVariant = variantPropertiesByField.every((declared) => {
                    const variantProperty = declared.get(fieldName);
                    return (
                        variantProperty != null &&
                        variantProperty.typeReference.type !== "literal" &&
                        this.getGoGetterTypeString(variantProperty.typeReference) === baseGetterType
                    );
                });
                if (carriedByEveryVariant) {
                    deduped.add(baseProperty.name.wireValue);
                }
            }
            return deduped;
        } finally {
            this.context.errors.truncate(errorsBefore);
        }
    }

    /**
     * Collects the properties an object exports, keyed by Go field name, following its `extends` chain
     * (matching the model's `objectExportedProperties`). Extended properties are collected first so a
     * property declared directly on the object overrides one inherited via `extends`, exactly as the
     * model does. Empty for anything that does not resolve to an object.
     */
    private getObjectExportedProperties(typeId: FernIr.dynamic.TypeId): Map<string, FernIr.dynamic.NamedParameter> {
        const properties = new Map<string, FernIr.dynamic.NamedParameter>();
        const visited = new Set<string>();
        const collect = (id: FernIr.dynamic.TypeId): void => {
            if (visited.has(id)) {
                return;
            }
            visited.add(id);
            const named = this.context.resolveNamedType({ typeId: id });
            if (named?.type !== "object") {
                return;
            }
            for (const extended of named.extends ?? []) {
                collect(extended);
            }
            for (const property of named.properties) {
                properties.set(this.context.getFieldName(property.name.name), property);
            }
        };
        collect(typeId);
        return properties;
    }

    /**
     * Renders the Go type a getter for `typeReference` would return, so two references can be compared
     * for Go-getter-type equality. This is the single comparison primitive the dedupe decision uses,
     * mirroring the model's `processTypeFieldForOptional`:
     *   - the type mapper collapses Go-render-equivalent shapes (`list`/`set` -> `[]T`,
     *     `optional`/`nullable` -> `*T`), and
     *   - when `getters-pass-by-value` is enabled the model returns the DEREFERENCED type for an
     *     optional/nullable field, so we render the unwrapped type here to match. Without this the
     *     snippet would keep a base field the model dropped under that config, re-introducing drift.
     *
     * `packageName`/`importPath` are arbitrary: the result is only ever compared against another
     * string produced by this same method, so any consistent values work, and rendering against a
     * throwaway file means it never registers imports on real output.
     */
    private getGoGetterTypeString(typeReference: FernIr.dynamic.TypeReference): string {
        // Mirror the model: a `getters-pass-by-value` getter returns the value (dereferenced) type for
        // an optional/nullable field. Unwrap the optional/nullable wrapper(s) before rendering so the
        // comparison sees `string` (not `*string`), exactly as the model's dereferenced getter type
        // does. `optional`/`nullable` collapse to a single Go pointer, so unwrapping every level here
        // matches the model stripping that one pointer.
        let effectiveTypeReference = typeReference;
        if (this.context.customConfig?.gettersPassByValue) {
            while (effectiveTypeReference.type === "optional" || effectiveTypeReference.type === "nullable") {
                effectiveTypeReference = effectiveTypeReference.value;
            }
        }
        return this.context.dynamicTypeMapper.convert({ typeReference: effectiveTypeReference }).toString({
            packageName: "example",
            importPath: "fern",
            rootImportPath: this.context.rootImportPath,
            customConfig: this.context.customConfig ?? {}
        });
    }

    private convertObject({
        object_,
        value
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
    }): go.TypeInstantiation {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        });
        return go.TypeInstantiation.structPointer({
            typeReference: go.typeReference({
                name: this.context.getTypeName(object_.declaration.name),
                importPath: this.context.getImportPath(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue);
                try {
                    return {
                        name: this.context.getFieldName(property.name.name),
                        value: this.convert(property)
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): go.TypeInstantiation {
        const name = this.getEnumValueName({ enum_, value });
        if (name == null) {
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.enum(
            go.typeReference({
                name,
                importPath: this.context.getImportPath(enum_.declaration.fernFilepath)
            })
        );
    }

    private getEnumValueName({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): string | undefined {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected enum value string, got: ${typeof value}`
            });
            return undefined;
        }
        const enumValue = enum_.values.find((v) => v.wireValue === value);
        if (enumValue == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `An enum value named "${value}" does not exist in this context`
            });
            return undefined;
        }
        return `${this.context.getTypeName(enum_.declaration.name)}${this.context.getTypeName(enumValue.name)}`;
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return go.TypeInstantiation.nop();
        }
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: result.valueTypeReference });
        if (fieldName == null) {
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.structPointer({
            typeReference: this.context.getGoTypeReferenceFromDeclaration({
                declaration: undiscriminatedUnion.declaration
            }),
            fields: [
                {
                    name: fieldName,
                    value: result.typeInstantiation
                }
            ]
        });
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeInstantiation: go.TypeInstantiation } | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            const errorsBefore = this.context.errors.size();
            try {
                const typeInstantiation = this.convert({ typeReference, value });
                if (go.TypeInstantiation.isNop(typeInstantiation) || this.context.errors.size() > errorsBefore) {
                    this.context.errors.truncate(errorsBefore);
                    continue;
                }
                return { valueTypeReference: typeReference, typeInstantiation };
            } catch (e) {
                this.context.errors.truncate(errorsBefore);
                continue;
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    private getUndiscriminatedUnionFieldName({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference;
    }): string | undefined {
        switch (typeReference.type) {
            case "list":
                return this.getUndiscriminatedUnionFieldNameForList({ list: typeReference });
            case "literal":
                return this.getUndiscriminatedUnionFieldNameForLiteral({ literal: typeReference.value });
            case "map":
                return this.getUndiscriminatedUnionFieldNameForMap({ map: typeReference });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return undefined;
                }
                return this.context.getTypeName(named.declaration.name);
            }
            case "optional":
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference });
            case "nullable":
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference });
            case "primitive":
                return this.getUndiscriminatedUnionFieldNameForPrimitive({ primitive: typeReference.value });
            case "set":
                return this.getUndiscriminatedUnionFieldNameForSet({ set: typeReference });
            case "unknown":
                return "Unknown";
            default:
                assertNever(typeReference);
        }
    }

    private getUndiscriminatedUnionFieldNameForList({
        list
    }: {
        list: FernIr.dynamic.TypeReference.List;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: list.value });
        if (fieldName == null) {
            return undefined;
        }
        return `${fieldName}List`;
    }

    private getUndiscriminatedUnionFieldNameForMap({ map }: { map: FernIr.dynamic.MapType }): string | undefined {
        const keyFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.key });
        if (keyFieldName == null) {
            return undefined;
        }
        const valueFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.value });
        if (valueFieldName == null) {
            return undefined;
        }
        return `${keyFieldName}${valueFieldName}Map`;
    }

    private getUndiscriminatedUnionFieldNameForOptional({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: typeReference.value });
        if (fieldName == null) {
            return undefined;
        }
        return `${fieldName}Optional`;
    }

    private getUndiscriminatedUnionFieldNameForSet({
        set
    }: {
        set: FernIr.dynamic.TypeReference.Set;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: set.value });
        if (fieldName == null) {
            return undefined;
        }
        return `${fieldName}Set`;
    }

    private getUndiscriminatedUnionFieldNameForLiteral({
        literal
    }: {
        literal: FernIr.dynamic.LiteralType;
    }): string | undefined {
        switch (literal.type) {
            case "boolean":
                if (literal.value) {
                    return "TrueLiteral";
                }
                return "FalseLiteral";
            case "string":
                return `${literal.value}StringLiteral`;
            default:
                assertNever(literal);
        }
    }

    private getUndiscriminatedUnionFieldNameForPrimitive({
        primitive
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
    }): string {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
                return "Integer";
            case "LONG":
            case "UINT_64":
                return "Long";
            case "FLOAT":
            case "DOUBLE":
                return "Double";
            case "BOOLEAN":
                return "Boolean";
            case "BIG_INTEGER":
            case "STRING":
                return "String";
            case "UUID":
                return "Uuid";
            case "DATE":
                return "Date";
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return "DateTime";
            case "BASE_64":
                return "Base64";
            default:
                assertNever(primitive);
        }
    }

    private convertUnknown({ value }: { value: unknown }): go.TypeInstantiation {
        return go.TypeInstantiation.any(value);
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (primitive) {
            case "INTEGER":
            case "UINT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.int(num);
            }
            case "LONG":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.int64(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.float64(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.bool(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.string(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.date(date);
            }
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return go.TypeInstantiation.nop();
                }
                const normalizedDateTime = this.normalizeDateTimeString(dateTime);
                return go.TypeInstantiation.dateTime(normalizedDateTime);
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.uuid(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.bytes(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.string(bigInt);
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
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "key" ? (typeof value === "string" ? value === "true" : value === "false" ? false : value) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }

    private normalizeDateTimeString(dateTime: string): string {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
            return `${dateTime}T00:00:00Z`;
        }
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateTime)) {
            return `${dateTime}Z`;
        }
        return dateTime;
    }
}
