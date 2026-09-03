import { getOriginalName, NameInput } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

/**
 * Utility functions to check primitive types without repeating the visitor pattern
 */

export function isDateTimeType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => true,
        dateTime: () => true,
        dateTimeRfc2822: () => true,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isDateType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => true,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isDateTimeOnlyType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => true,
        dateTimeRfc2822: () => true,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isUuidType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        base64: () => false,
        uuid: () => true,
        _other: () => false
    });
}

export function isBase64Type(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        base64: () => true,
        uuid: () => false,
        _other: () => false
    });
}

export function isBigIntType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => true,
        date: () => false,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isChronoType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => true,
        dateTime: () => true,
        dateTimeRfc2822: () => true,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isCollectionType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type === "container") {
        return typeRef.container._visit({
            map: () => true,
            set: () => true,
            list: () => false,
            optional: (innerType) => isCollectionType(innerType),
            nullable: (innerType) => isCollectionType(innerType),
            literal: () => false,
            _other: () => false
        });
    }
    return false;
}

export function isUnknownType(typeRef: FernIr.TypeReference): boolean {
    return typeRef.type === "unknown";
}

export interface DefaultImplOptions {
    /**
     * Whether `unknown` (`serde_json::Value`) counts as implementing Default.
     *
     * `Value` really does implement Default (it yields `Value::Null`), so this is
     * true by default and derive analysis should leave it alone. The one caller
     * that passes false is the `#[serde(default)]` decision: emitting that attribute
     * for a required `unknown` field would drop serde's missing-field error and let
     * an absent key deserialize to `Value::Null`, which also makes an untagged union
     * member match objects it should have rejected.
     */
    unknownHasDefault?: boolean;
}

/**
 * Whether a type supports `Default`, tracked once for each interpretation of
 * `unknown` so a single pass over the IR can answer both callers.
 */
export interface DefaultSupport {
    readonly withUnknown: boolean;
    readonly withoutUnknown: boolean;
}

const SUPPORTS_DEFAULT: DefaultSupport = { withUnknown: true, withoutUnknown: true };
const NO_DEFAULT: DefaultSupport = { withUnknown: false, withoutUnknown: false };
/** `serde_json::Value` implements Default, but see {@link DefaultImplOptions.unknownHasDefault}. */
const DEFAULT_ONLY_IF_UNKNOWN_COUNTS: DefaultSupport = { withUnknown: true, withoutUnknown: false };

function bothSupport(a: DefaultSupport, b: DefaultSupport): DefaultSupport {
    return {
        withUnknown: a.withUnknown && b.withUnknown,
        withoutUnknown: a.withoutUnknown && b.withoutUnknown
    };
}

function isMaximal(support: DefaultSupport): boolean {
    return support.withUnknown && support.withoutUnknown;
}

function sameSupport(a: DefaultSupport, b: DefaultSupport): boolean {
    return a.withUnknown === b.withUnknown && a.withoutUnknown === b.withoutUnknown;
}

function readSupport(support: DefaultSupport, options: DefaultImplOptions): boolean {
    return (options.unknownHasDefault ?? true) ? support.withUnknown : support.withoutUnknown;
}

/**
 * Check if a type has a natural Default implementation in Rust.
 * Primitives (String, bool, i64, f64, etc.) and containers (Vec, HashMap, HashSet)
 * all implement Default. Named types (enums, structs) may not.
 *
 * This is the single source of truth for Default analysis in the Rust model generator:
 * it decides both which types can carry a `Default` derive and which fields get
 * `#[serde(default)]` so missing values deserialize to zero-values.
 */
export function hasDefaultImpl(
    typeRef: FernIr.TypeReference,
    context?: ModelGeneratorContext,
    options: DefaultImplOptions = {}
): boolean {
    return readSupport(typeReferenceSupport(typeRef, context), options);
}

/**
 * Check if a named type supports Default by its type id, for callers that hold a
 * `DeclaredTypeName` (e.g. an object's `extends`) rather than a `TypeReference`.
 */
export function namedTypeHasDefaultImpl(
    typeId: string,
    context: ModelGeneratorContext,
    options: DefaultImplOptions = {}
): boolean {
    return readSupport(getDefaultSupportTable(context).get(typeId) ?? NO_DEFAULT, options);
}

function typeReferenceSupport(
    typeRef: FernIr.TypeReference,
    context: ModelGeneratorContext | undefined
): DefaultSupport {
    if (typeRef.type === "named") {
        if (context == null) {
            return NO_DEFAULT;
        }
        return getDefaultSupportTable(context).get(typeRef.typeId) ?? NO_DEFAULT;
    }
    return unnamedTypeSupport(typeRef);
}

/**
 * Support for everything that doesn't point at a declared type, i.e. the part of a
 * property's contribution that can be decided without consulting the rest of the IR.
 */
function unnamedTypeSupport(typeRef: FernIr.TypeReference): DefaultSupport {
    if (typeRef.type === "primitive") {
        return SUPPORTS_DEFAULT;
    }
    if (typeRef.type === "container") {
        return typeRef.container._visit({
            list: () => SUPPORTS_DEFAULT,
            map: () => SUPPORTS_DEFAULT,
            set: () => SUPPORTS_DEFAULT,
            optional: () => SUPPORTS_DEFAULT,
            nullable: () => SUPPORTS_DEFAULT,
            literal: () => NO_DEFAULT,
            _other: () => NO_DEFAULT
        });
    }
    if (typeRef.type === "unknown") {
        return DEFAULT_ONLY_IF_UNKNOWN_COUNTS;
    }
    return NO_DEFAULT;
}

/**
 * Whether a declared type supports Default, expressed as everything decidable from
 * the declaration alone plus the declared types it defers to.
 */
interface DefaultSupportRule {
    local: DefaultSupport;
    readonly dependsOn: string[];
}

function ruleForDeclaration(typeDecl: FernIr.TypeDeclaration): DefaultSupportRule {
    // Containers stop the walk -- Vec<T>/Option<T> implement Default whatever T is --
    // so the only dependencies are directly named properties, alias targets, and extends.
    if (typeDecl.shape.type === "object") {
        const rule: DefaultSupportRule = { local: SUPPORTS_DEFAULT, dependsOn: [] };
        for (const property of typeDecl.shape.properties) {
            addTypeReferenceToRule(rule, property.valueType);
        }
        for (const parentType of typeDecl.shape.extends) {
            rule.dependsOn.push(parentType.typeId);
        }
        return rule;
    }
    if (typeDecl.shape.type === "alias") {
        const rule: DefaultSupportRule = { local: SUPPORTS_DEFAULT, dependsOn: [] };
        addTypeReferenceToRule(rule, typeDecl.shape.aliasOf);
        return rule;
    }
    // Enums and unions never derive Default.
    return { local: NO_DEFAULT, dependsOn: [] };
}

function addTypeReferenceToRule(rule: DefaultSupportRule, typeRef: FernIr.TypeReference): void {
    if (typeRef.type === "named") {
        rule.dependsOn.push(typeRef.typeId);
        return;
    }
    rule.local = bothSupport(rule.local, unnamedTypeSupport(typeRef));
}

/**
 * Default support for every declared type in an IR, solved in one pass.
 *
 * Each rule is a conjunction, so this is a least fixed point: every type starts at
 * "no Default" and is raised only once all of its dependencies already support
 * Default. Types on a dependency cycle are therefore never raised, matching the
 * conservative `false` the previous depth-first walk returned on revisiting a type --
 * but without a per-query `visited` set, so the answer no longer depends on which
 * type a caller happened to ask about first.
 */
export function computeDefaultSupport(types: Record<string, FernIr.TypeDeclaration>): Map<string, DefaultSupport> {
    const rules = new Map<string, DefaultSupportRule>();
    const dependents = new Map<string, string[]>();
    const support = new Map<string, DefaultSupport>();

    for (const [typeId, typeDecl] of Object.entries(types)) {
        rules.set(typeId, ruleForDeclaration(typeDecl));
        support.set(typeId, NO_DEFAULT);
    }
    for (const [typeId, rule] of rules) {
        for (const dependency of rule.dependsOn) {
            const existing = dependents.get(dependency);
            if (existing == null) {
                dependents.set(dependency, [typeId]);
            } else {
                existing.push(typeId);
            }
        }
    }

    // Support only ever increases, and each type can increase at most twice, so
    // revisiting dependents on every change stays linear in the size of the graph.
    const pending = [...rules.keys()];
    while (pending.length > 0) {
        const typeId = pending.pop() as string;
        const rule = rules.get(typeId);
        const previous = support.get(typeId) ?? NO_DEFAULT;
        if (rule == null || isMaximal(previous)) {
            continue;
        }
        let next = rule.local;
        for (const dependency of rule.dependsOn) {
            next = bothSupport(next, support.get(dependency) ?? NO_DEFAULT);
        }
        if (sameSupport(next, previous)) {
            continue;
        }
        support.set(typeId, next);
        for (const dependent of dependents.get(typeId) ?? []) {
            pending.push(dependent);
        }
    }

    return support;
}

/**
 * Default support tables keyed by context, so a table lives exactly as long as the
 * IR it was computed from and is built at most once per generator run.
 */
const defaultSupportTables = new WeakMap<ModelGeneratorContext, Map<string, DefaultSupport>>();

function getDefaultSupportTable(context: ModelGeneratorContext): Map<string, DefaultSupport> {
    let table = defaultSupportTables.get(context);
    if (table == null) {
        table = computeDefaultSupport(context.ir.types);
        defaultSupportTables.set(context, table);
    }
    return table;
}

export function isOptionalType(typeReference: FernIr.TypeReference): boolean {
    return typeReference._visit<boolean>({
        container: (container) => {
            return container._visit<boolean>({
                optional: () => true,
                nullable: () => true,
                list: () => false,
                map: () => false,
                set: () => false,
                literal: () => false,
                _other: () => false
            });
        },
        primitive: () => false,
        named: () => false,
        unknown: () => false,
        _other: () => false
    });
}

export function getInnerTypeFromOptional(typeReference: FernIr.TypeReference): FernIr.TypeReference {
    return typeReference._visit<FernIr.TypeReference>({
        container: (container) => {
            return container._visit<FernIr.TypeReference>({
                optional: (optional) => optional,
                nullable: (nullable) => nullable,
                list: () => {
                    throw new Error("Type is not optional");
                },
                map: () => {
                    throw new Error("Type is not optional");
                },
                set: () => {
                    throw new Error("Type is not optional");
                },
                literal: () => {
                    throw new Error("Type is not optional");
                },
                _other: () => {
                    throw new Error("Type is not optional");
                }
            });
        },
        primitive: () => {
            throw new Error("Type is not optional");
        },
        named: () => {
            throw new Error("Type is not optional");
        },
        unknown: () => {
            throw new Error("Type is not optional");
        },
        _other: () => {
            throw new Error("Type is not optional");
        }
    });
}

/**
 * Check if a TypeReference resolves to a string primitive or string literal.
 * Used to decide whether a builder setter should use `impl Into<String>`.
 */
export function isStringType(typeReference: FernIr.TypeReference): boolean {
    return typeReference._visit<boolean>({
        container: (container) => {
            return container._visit<boolean>({
                literal: (literal) => literal.type === "string",
                optional: () => false,
                nullable: () => false,
                list: () => false,
                map: () => false,
                set: () => false,
                _other: () => false
            });
        },
        primitive: (primitive) => {
            return FernIr.PrimitiveTypeV1._visit(primitive.v1, {
                string: () => true,
                boolean: () => false,
                integer: () => false,
                uint: () => false,
                uint64: () => false,
                long: () => false,
                float: () => false,
                double: () => false,
                bigInteger: () => false,
                date: () => false,
                dateTime: () => false,
                dateTimeRfc2822: () => false,
                base64: () => false,
                uuid: () => false,
                _other: () => false
            });
        },
        named: () => false,
        unknown: () => false,
        _other: () => false
    });
}

/**
 * Check if a primitive type supports PartialEq trait in Rust
 */
export function primitiveSupportsPartialEq(primitive: FernIr.PrimitiveTypeV1): boolean {
    return FernIr.PrimitiveTypeV1._visit(primitive, {
        string: () => true,
        boolean: () => true,
        integer: () => true,
        uint: () => true,
        uint64: () => true,
        long: () => true,
        float: () => true, // f32 DOES implement PartialEq (but not Eq/Hash)
        double: () => true, // f64 DOES implement PartialEq (but not Eq/Hash)
        bigInteger: () => true,
        date: () => true,
        dateTime: () => true,
        dateTimeRfc2822: () => true,
        base64: () => true,
        uuid: () => true,
        _other: () => true // Be more permissive for PartialEq
    });
}

/**
 * Check if a primitive type supports Hash and Eq traits in Rust
 */
export function primitiveSupportsHashAndEq(primitive: FernIr.PrimitiveTypeV1): boolean {
    return FernIr.PrimitiveTypeV1._visit(primitive, {
        string: () => true,
        boolean: () => true,
        integer: () => true,
        uint: () => true,
        uint64: () => true,
        long: () => true,
        float: () => false, // f32 doesn't implement Hash or Eq
        double: () => false, // f64 doesn't implement Hash or Eq
        bigInteger: () => true,
        date: () => true,
        dateTime: () => true,
        dateTimeRfc2822: () => true,
        base64: () => true,
        uuid: () => true,
        _other: () => false
    });
}

export function isFloatingPointType(typeReference: FernIr.TypeReference): boolean {
    if (typeReference.type !== "primitive") {
        return false;
    }
    return FernIr.PrimitiveTypeV1._visit(typeReference.primitive.v1, {
        float: () => true,
        double: () => true,
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

/**
 * Shared utility functions for type analysis across generators
 */

export function typeSupportsHashAndEq(
    typeRef: FernIr.TypeReference,
    context: ModelGeneratorContext,
    analysisStack?: Set<string>
): boolean {
    return FernIr.TypeReference._visit(typeRef, {
        primitive: (primitive) => primitiveSupportsHashAndEq(primitive.v1), // Check each primitive individually
        named: (namedType) => {
            // Check if this named type is likely to support Hash and Eq
            return namedTypeSupportsHashAndEq(namedType, context, analysisStack);
        },
        container: (container) => {
            return container._visit({
                list: (listType) => typeSupportsHashAndEq(listType, context, analysisStack),
                optional: (optionalType) => typeSupportsHashAndEq(optionalType, context, analysisStack),
                nullable: (nullableType) => typeSupportsHashAndEq(nullableType, context, analysisStack),
                map: () => false, // HashMap/BTreeMap don't implement Hash
                set: () => false, // HashSet/BTreeSet don't implement Hash
                literal: () => true, // Literals support Hash and Eq
                _other: () => false
            });
        },
        unknown: () => false, // serde_json::Value doesn't implement Hash
        _other: () => false
    });
}

/**
 * Check if a type supports PartialEq trait in Rust (more permissive than Hash/Eq)
 */
export function typeSupportsPartialEq(
    typeRef: FernIr.TypeReference,
    context: ModelGeneratorContext,
    analysisStack?: Set<string>
): boolean {
    return FernIr.TypeReference._visit(typeRef, {
        primitive: (primitive) => primitiveSupportsPartialEq(primitive.v1),
        named: (namedType) => {
            return namedTypeSupportsPartialEq(namedType, context, analysisStack);
        },
        container: (container) => {
            return container._visit({
                list: (listType) => typeSupportsPartialEq(listType, context, analysisStack),
                optional: (optionalType) => typeSupportsPartialEq(optionalType, context, analysisStack),
                nullable: (nullableType) => typeSupportsPartialEq(nullableType, context, analysisStack),
                map: (mapType) =>
                    typeSupportsPartialEq(mapType.keyType, context, analysisStack) &&
                    typeSupportsPartialEq(mapType.valueType, context, analysisStack), // HashMap supports PartialEq!
                set: (setType) => typeSupportsPartialEq(setType, context, analysisStack), // HashSet supports PartialEq!
                literal: () => true,
                _other: () => false
            });
        },
        unknown: () => true, // serde_json::Value does implement PartialEq
        _other: () => false
    });
}

export function namedTypeSupportsPartialEq(
    namedType: FernIr.NamedType,
    context: ModelGeneratorContext,
    analysisStack: Set<string> = new Set()
): boolean {
    const typeDeclaration = context.ir.types[namedType.typeId];
    if (!typeDeclaration) {
        return true; // Be optimistic for unknown types
    }

    // Prevent infinite recursion
    if (analysisStack.has(namedType.typeId)) {
        return true; // Assume cyclic references support PartialEq
    }
    analysisStack.add(namedType.typeId);

    let result = true;
    if (typeDeclaration.shape.type === "enum") {
        result = true; // Enums always support PartialEq
    } else if (typeDeclaration.shape.type === "undiscriminatedUnion") {
        result = typeDeclaration.shape.members.every((member: FernIr.UndiscriminatedUnionMember) =>
            typeSupportsPartialEq(member.type, context, analysisStack)
        );
    } else if (typeDeclaration.shape.type === "object") {
        // Check both properties and extended types
        const propertiesSupport = typeDeclaration.shape.properties.every((property: FernIr.ObjectProperty) =>
            typeSupportsPartialEq(property.valueType, context, analysisStack)
        );
        const extendsSupport = typeDeclaration.shape.extends.every((parentType) =>
            namedTypeSupportsPartialEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: getOriginalName(parentType.name)
                },
                context,
                analysisStack
            )
        );
        result = propertiesSupport && extendsSupport;
    } else if (typeDeclaration.shape.type === "alias") {
        result = typeSupportsPartialEq(typeDeclaration.shape.aliasOf, context, analysisStack);
    }

    analysisStack.delete(namedType.typeId);
    return result;
}

export function namedTypeSupportsHashAndEq(
    namedType: FernIr.NamedType,
    context: ModelGeneratorContext,
    analysisStack: Set<string> = new Set()
): boolean {
    const typeDeclaration = context.ir.types[namedType.typeId];
    if (!typeDeclaration) {
        return false; // Unknown type, be conservative
    }

    // Check the type's shape to determine if it can support Hash/Eq
    if (typeDeclaration.shape.type === "enum") {
        // Regular enums with string literals support Hash/Eq
        return true;
    } else if (typeDeclaration.shape.type === "undiscriminatedUnion") {
        // Recursively check if all variants support Hash/Eq (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        const result = typeDeclaration.shape.members.every((member: FernIr.UndiscriminatedUnionMember) =>
            typeSupportsHashAndEq(member.type, context, analysisStack)
        );
        analysisStack.delete(namedType.typeId);
        return result;
    } else if (typeDeclaration.shape.type === "object") {
        // Objects with only hashable fields support Hash/Eq (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        // HashMap<String, Value> (extra properties) doesn't implement Hash or Eq
        if (typeDeclaration.shape.extraProperties) {
            analysisStack.delete(namedType.typeId);
            return false;
        }
        // Check both properties and extended types
        const propertiesSupport = typeDeclaration.shape.properties.every((property: FernIr.ObjectProperty) =>
            typeSupportsHashAndEq(property.valueType, context, analysisStack)
        );
        const extendsSupport = typeDeclaration.shape.extends.every((parentType) =>
            namedTypeSupportsHashAndEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: getOriginalName(parentType.name)
                },
                context,
                analysisStack
            )
        );
        const result = propertiesSupport && extendsSupport;
        analysisStack.delete(namedType.typeId);
        return result;
    } else if (typeDeclaration.shape.type === "alias") {
        // Aliases support Hash/Eq if their underlying type does (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        const result = typeSupportsHashAndEq(typeDeclaration.shape.aliasOf, context, analysisStack);
        analysisStack.delete(namedType.typeId);
        return result;
    }

    return false; // Other types (unions, etc.) - be conservative
}

export function extractNamedTypesFromTypeReference(
    typeRef: FernIr.TypeReference,
    typeNames: NameInput[],
    visited: Set<string>
): void {
    if (typeRef.type === "named") {
        const typeName = getOriginalName(typeRef.name);
        if (!visited.has(typeName)) {
            visited.add(typeName);
            typeNames.push(typeRef.name);
        }
    } else if (typeRef.type === "container") {
        typeRef.container._visit({
            list: (listType) => extractNamedTypesFromTypeReference(listType, typeNames, visited),
            set: (setType) => extractNamedTypesFromTypeReference(setType, typeNames, visited),
            optional: (optionalType) => extractNamedTypesFromTypeReference(optionalType, typeNames, visited),
            nullable: (nullableType) => extractNamedTypesFromTypeReference(nullableType, typeNames, visited),
            map: (mapType) => {
                extractNamedTypesFromTypeReference(mapType.keyType, typeNames, visited);
                extractNamedTypesFromTypeReference(mapType.valueType, typeNames, visited);
            },
            literal: () => {
                // No named types in literals
            },
            _other: () => {
                // Unknown container type
            }
        });
    }
}
