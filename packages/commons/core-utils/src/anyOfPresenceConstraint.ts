/**
 * A schema may declare `properties` alongside an `anyOf` whose branches only
 * re-declare some of those same properties as required:
 *
 *     type: object
 *     properties: { a: {...}, b: {...} }
 *     anyOf:
 *       - { properties: { a: {} }, required: [a] }
 *       - { properties: { b: {} }, required: [b] }
 *
 * Per JSON Schema an instance must satisfy `properties` *and* at least one
 * branch, so this spells "at least one of a, b" over an object that may carry
 * both. It is a presence constraint, not a set of variants: converting it to a
 * union discards the sibling `properties` and makes the branches mutually
 * exclusive, so a body carrying several of them silently loses all but one.
 *
 * A branch that *constrains* a property is a genuine variant and must not be
 * collapsed. In particular this is a union, not a presence constraint, because
 * the branches narrow `kind` to different literals:
 *
 *     properties: { kind: { type: string }, value: { type: string } }
 *     anyOf:
 *       - { properties: { kind: { const: "a" } }, required: [kind] }
 *       - { properties: { kind: { const: "b" } }, required: [kind] }
 *
 * Shared by the openapi-ir-parser and v3-importer-commons converters so both
 * classify the same schema identically. Deliberately structural rather than
 * typed against OpenAPIV3 / OpenAPIV3_1, which model `type` differently.
 */

/** The subset of JSON Schema keywords this predicate inspects. */
export interface AnyOfConstraintSchemaLike {
    type?: unknown;
    properties?: unknown;
    required?: unknown;
    allOf?: unknown;
    oneOf?: unknown;
    anyOf?: unknown;
    additionalProperties?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

/** True when `type` is absent, the string "object", or the array form ["object"]. */
function isObjectTypeOrAbsent(type: unknown): boolean {
    if (type == null) {
        return true;
    }
    if (typeof type === "string") {
        return type === "object";
    }
    if (Array.isArray(type)) {
        const nonNull = type.filter((entry) => entry !== "null");
        return nonNull.length === 1 && nonNull[0] === "object";
    }
    return false;
}

/**
 * JSON Schema annotation keywords. They describe a value but do not restrict which
 * values are allowed, so a branch that omits them is still restating the sibling.
 * `default` is included: dropping the `anyOf` leaves the sibling's `default` in
 * force, so a branch that repeats or omits it narrows nothing.
 */
const ANNOTATION_KEYWORDS = new Set([
    "title",
    "description",
    "default",
    "deprecated",
    "example",
    "examples",
    "readOnly",
    "writeOnly",
    "externalDocs",
    "xml",
    "$comment"
]);

/**
 * The only constraint keywords a presence branch may state. Anything else (`not`,
 * `if`/`then`, `dependentRequired`, `minProperties`, `patternProperties`, ...)
 * would be lost when the enclosing `anyOf`/`oneOf` is dropped.
 */
const PRESENCE_BRANCH_KEYWORDS = new Set(["type", "properties", "required"]);

function isExtensionKeyword(keyword: string): boolean {
    return keyword.startsWith("x-");
}

/**
 * True when the branch subschema adds no constraint of its own relative to the
 * sibling's: every constraint keyword it states must appear on the sibling with an
 * equal value. Annotations are ignored, and keywords the sibling states but the
 * branch omits are fine -- both schemas apply, so the sibling's still binds.
 *
 * This is what separates naming a property from constraining it. A branch
 * `{ type: boolean }` against a sibling
 * `{ type: boolean, description: "...", example: true }` merely names it. A branch
 * `{ const: "a" }` against a sibling `{ type: string }` introduces `const`, which
 * the sibling does not have, and so is a variant.
 */
function restatesSiblingSubschema(branchSubschema: unknown, siblingSubschema: unknown): boolean {
    if (branchSubschema === true) {
        return true;
    }
    if (!isRecord(branchSubschema)) {
        return false;
    }
    const sibling = isRecord(siblingSubschema) ? siblingSubschema : undefined;
    for (const [keyword, value] of Object.entries(branchSubschema)) {
        if (ANNOTATION_KEYWORDS.has(keyword)) {
            continue;
        }
        if (sibling == null || !(keyword in sibling) || !deepEquals(value, sibling[keyword])) {
            return false;
        }
    }
    return true;
}

function deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((entry, index) => deepEquals(entry, b[index]));
    }
    if (isRecord(a) && isRecord(b)) {
        const aKeys = Object.keys(a).sort();
        const bKeys = Object.keys(b).sort();
        return (
            aKeys.length === bKeys.length &&
            aKeys.every((key, index) => key === bKeys[index]) &&
            aKeys.every((key) => deepEquals(a[key], b[key]))
        );
    }
    return false;
}

/**
 * True when `branch` only asserts the presence of properties already declared by
 * `siblingProperties`, and so constrains rather than varies the schema.
 */
export function isPresenceConstraintBranch(branch: unknown, siblingProperties: Record<string, unknown>): boolean {
    if (!isRecord(branch)) {
        return false;
    }
    for (const keyword of Object.keys(branch)) {
        if (
            !PRESENCE_BRANCH_KEYWORDS.has(keyword) &&
            !ANNOTATION_KEYWORDS.has(keyword) &&
            !isExtensionKeyword(keyword)
        ) {
            return false;
        }
    }
    if (!isObjectTypeOrAbsent(branch.type)) {
        return false;
    }

    const branchProperties = isRecord(branch.properties) ? branch.properties : {};
    const branchRequired = Array.isArray(branch.required) ? branch.required : [];
    if (Object.keys(branchProperties).length === 0 && branchRequired.length === 0) {
        return false;
    }

    for (const name of branchRequired) {
        if (typeof name !== "string" || !(name in siblingProperties)) {
            return false;
        }
    }
    for (const [name, subschema] of Object.entries(branchProperties)) {
        if (!(name in siblingProperties)) {
            return false;
        }
        if (!restatesSiblingSubschema(subschema, siblingProperties[name])) {
            return false;
        }
    }
    return true;
}

/**
 * True when the schema's `anyOf` is a presence constraint over its own sibling
 * `properties` rather than a set of variants, and so should be dropped and the
 * schema converted as the object it declares.
 *
 * A sibling `oneOf` or `allOf` composes with the `anyOf`; those are left to the
 * union and allOf paths.
 */
export function anyOfIsPresenceConstraint(schema: AnyOfConstraintSchemaLike): boolean {
    if (schema.oneOf != null) {
        return false;
    }
    return isPresenceConstraintOver(schema, schema.anyOf);
}

/**
 * True when the schema's `oneOf` is a presence constraint over its own sibling
 * `properties` rather than a set of variants:
 *
 *     type: object
 *     properties: { domain: {...}, phone: {...} }
 *     oneOf:
 *       - { required: [domain] }
 *       - { required: [phone] }
 *
 * This spells "exactly one of domain, phone" over the declared object. The
 * branches carry no shape of their own, so converting them to a union yields
 * variants that drop every sibling property.
 */
export function oneOfIsPresenceConstraint(schema: AnyOfConstraintSchemaLike): boolean {
    if (schema.anyOf != null) {
        return false;
    }
    return isPresenceConstraintOver(schema, schema.oneOf);
}

/**
 * Property names the schema's `oneOf`/`anyOf` presence constraint requires
 * unconditionally, i.e. those every branch marks as required. Since an instance
 * must satisfy at least one branch, these must survive when the constraint itself
 * is dropped. For a single-branch `oneOf: [{ required: [a] }]` this is `[a]`.
 * Empty when the schema has no presence constraint.
 */
export function requiredByPresenceConstraint(schema: AnyOfConstraintSchemaLike): string[] {
    if (oneOfIsPresenceConstraint(schema)) {
        return requiredInEveryBranch(schema.oneOf);
    }
    if (anyOfIsPresenceConstraint(schema)) {
        return requiredInEveryBranch(schema.anyOf);
    }
    return [];
}

function requiredInEveryBranch(branches: unknown): string[] {
    if (!Array.isArray(branches) || branches.length === 0) {
        return [];
    }
    const requiredPerBranch = branches.map((branch) =>
        isRecord(branch) && Array.isArray(branch.required)
            ? branch.required.filter((name): name is string => typeof name === "string")
            : []
    );
    const [first, ...rest] = requiredPerBranch;
    return (first ?? []).filter((name) => rest.every((required) => required.includes(name)));
}

function isPresenceConstraintOver(schema: AnyOfConstraintSchemaLike, branches: unknown): boolean {
    if (!Array.isArray(branches) || branches.length === 0) {
        return false;
    }
    if (schema.allOf != null) {
        return false;
    }
    if (!isRecord(schema.properties) || Object.keys(schema.properties).length === 0) {
        return false;
    }
    const siblingProperties = schema.properties;
    return branches.every((branch) => isPresenceConstraintBranch(branch, siblingProperties));
}
