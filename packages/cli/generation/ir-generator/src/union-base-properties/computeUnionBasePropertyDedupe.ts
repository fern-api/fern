import {
    IntermediateRepresentation,
    NameAndWireValue,
    NameAndWireValueOrString,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";

/**
 * The language-agnostic facts about discriminated-union base-property redundancy, computed once from
 * the fully-assembled IR `types` map. The two views correspond to the two directions a generator can
 * dedupe in (see the union-base-property-dedupe ADR):
 *
 * - {@link inheritedBasePropertiesByUnion} (View A, for envelope-droppers such as Go): per union, the
 *   base properties that *every* `samePropertiesAsObject` variant redeclares with a structurally-equal
 *   type (resolving `extends` and alias chains).
 * - {@link deferredUnionBasePropertiesByObject} (View B, for leaf-droppers such as C#): per object used
 *   *exclusively* as a union variant, the properties it declares that every owning union also declares
 *   as a base property with a structurally-equal type.
 *
 * This is the single source of truth: generators read these facts off the IR instead of re-deriving
 * them. Callers must run this *after* the `types` map is fully built and `extendedProperties` have been
 * populated (View A/B both read `object.extendedProperties`).
 */
export interface UnionBasePropertyDedupe {
    inheritedBasePropertiesByUnion: Map<TypeId, NameAndWireValue[]>;
    deferredUnionBasePropertiesByObject: Map<TypeId, NameAndWireValue[]>;
}

/**
 * The outgoing references of a single type declaration, categorized by how each reference is used.
 * Mirrors the reference implementation lifted from the C# `GeneratorContext` so that both views are
 * built from one traversal of the IR shape.
 *
 * - `variantEdges`: typeIds referenced as a discriminated-union `samePropertiesAsObject` variant.
 * - `nonVariantEdges`: named typeIds referenced in any other position — a property/base-property/
 *   single-union-property value type, an undiscriminated-union member, an `extends` parent, or an
 *   alias target (alias chains followed). A type reached only through these keeps all of its fields.
 */
interface OutgoingTypeReferences {
    variantEdges: TypeId[];
    nonVariantEdges: TypeId[];
}

/**
 * Extracts all named TypeIds referenced from a TypeReference, recursing into containers
 * (list, set, map, optional, nullable) and following alias chains. A visited set guards against
 * infinite recursion on circular aliases.
 */
function extractNamedTypeIds(
    typeReference: TypeReference,
    types: Record<TypeId, TypeDeclaration>,
    visited: Set<TypeId>
): TypeId[] {
    switch (typeReference.type) {
        case "named": {
            const ids: TypeId[] = [typeReference.typeId];
            const declaration = types[typeReference.typeId];
            if (declaration?.shape.type === "alias" && !visited.has(typeReference.typeId)) {
                visited.add(typeReference.typeId);
                ids.push(...extractNamedTypeIds(declaration.shape.aliasOf, types, visited));
            }
            return ids;
        }
        case "container":
            switch (typeReference.container.type) {
                case "list":
                    return extractNamedTypeIds(typeReference.container.list, types, visited);
                case "set":
                    return extractNamedTypeIds(typeReference.container.set, types, visited);
                case "map":
                    return [
                        ...extractNamedTypeIds(typeReference.container.keyType, types, visited),
                        ...extractNamedTypeIds(typeReference.container.valueType, types, visited)
                    ];
                case "optional":
                    return extractNamedTypeIds(typeReference.container.optional, types, visited);
                case "nullable":
                    return extractNamedTypeIds(typeReference.container.nullable, types, visited);
                case "literal":
                    return [];
                default:
                    return [];
            }
        case "primitive":
        case "unknown":
            return [];
        default:
            return [];
    }
}

function getOutgoingTypeReferences(
    typeDeclaration: TypeDeclaration,
    types: Record<TypeId, TypeDeclaration>
): OutgoingTypeReferences {
    const variantEdges: TypeId[] = [];
    const nonVariantEdges: TypeId[] = [];
    const addNonVariant = (typeReference: TypeReference): void => {
        nonVariantEdges.push(...extractNamedTypeIds(typeReference, types, new Set()));
    };
    typeDeclaration.shape._visit({
        alias: (alias) => {
            addNonVariant(alias.aliasOf);
        },
        enum: () => undefined,
        object: (object) => {
            for (const extended of object.extends) {
                nonVariantEdges.push(extended.typeId);
            }
            for (const property of [...object.properties, ...(object.extendedProperties ?? [])]) {
                addNonVariant(property.valueType);
            }
        },
        union: (union) => {
            for (const extended of union.extends) {
                nonVariantEdges.push(extended.typeId);
            }
            for (const baseProperty of union.baseProperties) {
                addNonVariant(baseProperty.valueType);
            }
            for (const unionType of union.types) {
                unionType.shape._visit({
                    samePropertiesAsObject: (declaredTypeName) => {
                        variantEdges.push(declaredTypeName.typeId);
                    },
                    singleProperty: (singleProperty) => {
                        addNonVariant(singleProperty.type);
                    },
                    noProperties: () => undefined,
                    _other: () => undefined
                });
            }
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            for (const member of undiscriminatedUnion.members) {
                addNonVariant(member.type);
            }
        },
        _other: () => undefined
    });
    return { variantEdges, nonVariantEdges };
}

/**
 * Scans every type declaration once, recording for each typeId which unions reference it as a
 * `samePropertiesAsObject` variant, and whether it is referenced in any non-variant position.
 */
function buildTypeReferenceInfo(types: Record<TypeId, TypeDeclaration>): {
    variantReferrers: Map<TypeId, Set<TypeId>>;
    nonVariantReferenced: Set<TypeId>;
} {
    const variantReferrers = new Map<TypeId, Set<TypeId>>();
    const nonVariantReferenced = new Set<TypeId>();
    for (const [typeId, typeDeclaration] of Object.entries(types)) {
        const { variantEdges, nonVariantEdges } = getOutgoingTypeReferences(typeDeclaration, types);
        for (const variantTypeId of variantEdges) {
            const referrers = variantReferrers.get(variantTypeId) ?? new Set<TypeId>();
            referrers.add(typeId);
            variantReferrers.set(variantTypeId, referrers);
        }
        for (const referencedTypeId of nonVariantEdges) {
            nonVariantReferenced.add(referencedTypeId);
        }
    }
    return { variantReferrers, nonVariantReferenced };
}

/**
 * Resolves a typeId through its alias chain to the object declaration it ultimately points at, or
 * `undefined` if it does not resolve to an object. Aliases carry a fully-resolved `resolvedType`, so
 * a single hop reaches the underlying named type.
 */
function resolveToObjectTypeId(typeId: TypeId, types: Record<TypeId, TypeDeclaration>): TypeId | undefined {
    const declaration = types[typeId];
    if (declaration == null) {
        return undefined;
    }
    switch (declaration.shape.type) {
        case "object":
            return typeId;
        case "alias": {
            const resolved = declaration.shape.resolvedType;
            if (resolved.type === "named" && resolved.shape === "OBJECT") {
                return resolved.name.typeId;
            }
            return undefined;
        }
        default:
            return undefined;
    }
}

/**
 * The properties an object declares directly or via `extends`, keyed by wire value. Resolves the
 * typeId through alias chains first (so an alias-of-object variant is treated as the object it aliases
 * — the gap that produced a bug in the Go dynamic-snippet re-derivation). Empty for anything that does
 * not resolve to an object.
 */
function getDeclaredProperties(
    typeId: TypeId,
    types: Record<TypeId, TypeDeclaration>
): Map<string, { valueType: TypeReference; name: NameAndWireValue }> {
    const result = new Map<string, { valueType: TypeReference; name: NameAndWireValue }>();
    const objectTypeId = resolveToObjectTypeId(typeId, types);
    if (objectTypeId == null) {
        return result;
    }
    const declaration = types[objectTypeId];
    if (declaration == null || declaration.shape.type !== "object") {
        return result;
    }
    for (const property of [...declaration.shape.properties, ...(declaration.shape.extendedProperties ?? [])]) {
        result.set(getWireValue(property.name), {
            valueType: property.valueType,
            name: toNameAndWireValue(property.name)
        });
    }
    return result;
}

/**
 * Structural equality for two type references. A same-named-but-differently-typed property is a
 * distinct property and must not be treated as a duplicate. Uses a plain `JSON.stringify` compare,
 * matching the reference `typeReferencesEqual`; both operands are produced by the same IR builder, so
 * their key order is stable.
 */
function typeReferencesEqual(a: TypeReference, b: TypeReference): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Normalizes a property name (which may be a bare wire string) into a full `NameAndWireValue`.
 * `NameAndWireValue.name` accepts a `NameOrString`, so a bare string round-trips without a casings
 * generator.
 */
function toNameAndWireValue(name: NameAndWireValueOrString): NameAndWireValue {
    if (typeof name === "string") {
        return { wireValue: name, name };
    }
    return name;
}

/**
 * Computes both dedupe views from the fully-assembled `types` map. Pure over its input — it reads the
 * IR and returns the facts; the caller writes them onto the declarations. These facts are computed
 * regardless of any generator flag; the opt-in gating lives in each generator.
 */
export function computeUnionBasePropertyDedupe(types: Record<TypeId, TypeDeclaration>): UnionBasePropertyDedupe {
    const inheritedBasePropertiesByUnion = new Map<TypeId, NameAndWireValue[]>();
    const deferredUnionBasePropertiesByObject = new Map<TypeId, NameAndWireValue[]>();

    // Base properties keyed by wire value, for every union that declares any. Reused by View B.
    const unionBaseProperties = new Map<TypeId, Map<string, TypeReference>>();

    // View A — per union: base properties every variant compatibly redeclares.
    for (const [typeId, typeDeclaration] of Object.entries(types)) {
        if (typeDeclaration.shape.type !== "union") {
            continue;
        }
        const union = typeDeclaration.shape;
        if (union.baseProperties.length === 0) {
            continue;
        }
        const baseByWireValue = new Map<string, TypeReference>();
        for (const baseProperty of union.baseProperties) {
            baseByWireValue.set(getWireValue(baseProperty.name), baseProperty.valueType);
        }
        unionBaseProperties.set(typeId, baseByWireValue);

        // View A requires *every* variant to be a `samePropertiesAsObject` object (Go emits one getter
        // on the envelope that must compile for every discriminant case). A single-property or
        // no-properties variant means the union carries no inherited base properties.
        const everyVariantIsObject = union.types.every(
            (variant) => variant.shape.propertiesType === "samePropertiesAsObject"
        );
        if (!everyVariantIsObject) {
            inheritedBasePropertiesByUnion.set(typeId, []);
            continue;
        }
        const variantProperties = union.types.map((variant) =>
            variant.shape.propertiesType === "samePropertiesAsObject"
                ? getDeclaredProperties(variant.shape.typeId, types)
                : new Map<string, { valueType: TypeReference; name: NameAndWireValue }>()
        );
        const inherited: NameAndWireValue[] = [];
        for (const baseProperty of union.baseProperties) {
            const wireValue = getWireValue(baseProperty.name);
            const carriedByEveryVariant = variantProperties.every((declared) => {
                const match = declared.get(wireValue);
                return match != null && typeReferencesEqual(match.valueType, baseProperty.valueType);
            });
            if (carriedByEveryVariant) {
                inherited.push(toNameAndWireValue(baseProperty.name));
            }
        }
        inheritedBasePropertiesByUnion.set(typeId, inherited);
    }

    // View B — per variant object: properties every owning union defers to the envelope. Keyed on the
    // object typeId. Alias-of-object variants are intentionally excluded: guard (b) disqualifies any
    // object that is an alias target (`nonVariantReferenced` records the alias's target), matching the
    // C# reference implementation.
    const { variantReferrers, nonVariantReferenced } = buildTypeReferenceInfo(types);
    for (const [variantTypeId, owningUnionTypeIds] of variantReferrers) {
        const declaration = types[variantTypeId];
        // Only a directly-declared object can defer its own leaf fields.
        if (declaration == null || declaration.shape.type !== "object") {
            continue;
        }
        // Guard (b): never touch an object also used outside a union variant (standalone, an `extends`
        // parent, an alias target, an undiscriminated-union member, or a plain property type).
        if (nonVariantReferenced.has(variantTypeId)) {
            continue;
        }
        const declaredProperties = getDeclaredProperties(variantTypeId, types);
        if (declaredProperties.size === 0) {
            continue;
        }
        const deferred: NameAndWireValue[] = [];
        for (const [wireValue, declared] of declaredProperties) {
            const deferredToEveryUnion = [...owningUnionTypeIds].every((unionTypeId) => {
                const baseType = unionBaseProperties.get(unionTypeId)?.get(wireValue);
                return baseType != null && typeReferencesEqual(baseType, declared.valueType);
            });
            if (deferredToEveryUnion) {
                deferred.push(declared.name);
            }
        }
        if (deferred.length > 0) {
            deferredUnionBasePropertiesByObject.set(variantTypeId, deferred);
        }
    }

    return { inheritedBasePropertiesByUnion, deferredUnionBasePropertiesByObject };
}

/**
 * Runs {@link computeUnionBasePropertyDedupe} over the IR and writes the results back onto the union
 * and object declarations. Intended as a post-build pass over the fully-assembled IR.
 */
export function addUnionBasePropertyDedupeToIr(ir: Pick<IntermediateRepresentation, "types">): void {
    const { inheritedBasePropertiesByUnion, deferredUnionBasePropertiesByObject } = computeUnionBasePropertyDedupe(
        ir.types
    );
    ir.types = Object.fromEntries(
        Object.entries(ir.types).map(([typeId, typeDeclaration]) => {
            switch (typeDeclaration.shape.type) {
                case "union":
                    return [
                        typeId,
                        {
                            ...typeDeclaration,
                            shape: {
                                ...typeDeclaration.shape,
                                inheritedBaseProperties: inheritedBasePropertiesByUnion.get(typeId) ?? []
                            }
                        }
                    ];
                case "object": {
                    const deferred = deferredUnionBasePropertiesByObject.get(typeId);
                    return [
                        typeId,
                        {
                            ...typeDeclaration,
                            shape: {
                                ...typeDeclaration.shape,
                                deferredUnionBaseProperties: deferred
                            }
                        }
                    ];
                }
                default:
                    return [typeId, typeDeclaration];
            }
        })
    );
}
