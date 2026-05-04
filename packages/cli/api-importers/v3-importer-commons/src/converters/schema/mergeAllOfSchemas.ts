import { OpenAPIV3_1 } from "openapi-types";

const OUTER_WINS_KEYS = [
    "description",
    "title",
    "format",
    "type",
    "discriminator",
    "xml",
    "externalDocs",
    "extensions"
];

/**
 * Keys whose values should be deep-merged when both sides are objects
 * (e.g., allOf composing examples from multiple parents), with the
 * outer schema winning if present.
 */
const DEEP_MERGE_KEYS = ["example", "default"];

const OR_KEYS = ["deprecated", "readOnly", "writeOnly", "uniqueItems", "nullable"];

const MAX_OF_MINS_KEYS = ["minimum", "exclusiveMinimum", "minLength", "minItems", "minProperties"];

const MIN_OF_MAXS_KEYS = ["maximum", "exclusiveMaximum", "maxLength", "maxItems", "maxProperties"];

const SKIP_FROM_CHILDREN = ["allOf", "oneOf", "anyOf"];

export function mergeAllOfSchemas(
    outerSchema: OpenAPIV3_1.SchemaObject,
    elements: OpenAPIV3_1.SchemaObject[]
): OpenAPIV3_1.SchemaObject {
    const flatElements = flattenNestedAllOf(elements);

    let result: Record<string, unknown> = {};
    for (const element of flatElements) {
        result = mergeSchemaElement(result, element);
    }

    applyOuterSchema(result, outerSchema);

    return result as OpenAPIV3_1.SchemaObject;
}

function flattenNestedAllOf(elements: OpenAPIV3_1.SchemaObject[]): OpenAPIV3_1.SchemaObject[] {
    const flat: OpenAPIV3_1.SchemaObject[] = [];
    for (const element of elements) {
        if (Array.isArray(element.allOf) && element.allOf.length > 0) {
            const { allOf, ...sibling } = element;
            // Filter out ReferenceObjects — only include resolved SchemaObjects.
            // Unresolved $ref entries would corrupt the merged result with a
            // spurious top-level $ref key.
            const schemaChildren = allOf.filter((child): child is OpenAPIV3_1.SchemaObject => !("$ref" in child));
            // Recursively flatten in case extracted children also contain allOf
            flat.push(...flattenNestedAllOf(schemaChildren));
            if (Object.keys(sibling).length > 0) {
                flat.push(sibling as OpenAPIV3_1.SchemaObject);
            }
        } else {
            flat.push(element);
        }
    }
    return flat;
}

function mergeSchemaElement(
    target: Record<string, unknown>,
    source: OpenAPIV3_1.SchemaObject
): Record<string, unknown> {
    const result = { ...target };

    for (const [key, sourceValue] of Object.entries(source)) {
        if (sourceValue === undefined) {
            continue;
        }

        if (SKIP_FROM_CHILDREN.includes(key)) {
            continue;
        }

        const targetValue = result[key];

        if (key === "required") {
            const targetArr = Array.isArray(targetValue) ? (targetValue as string[]) : [];
            const sourceArr = Array.isArray(sourceValue) ? (sourceValue as string[]) : [];
            result[key] = [...new Set([...targetArr, ...sourceArr])];
            continue;
        }

        if (key === "properties") {
            result[key] = mergeProperties(
                (targetValue as Record<string, unknown>) ?? {},
                sourceValue as Record<string, unknown>
            );
            continue;
        }

        if (key === "items") {
            if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
                result[key] = mergeSchemaElement(
                    targetValue as Record<string, unknown>,
                    sourceValue as OpenAPIV3_1.SchemaObject
                );
            } else {
                result[key] = sourceValue;
            }
            continue;
        }

        if (DEEP_MERGE_KEYS.includes(key)) {
            // Deep-merge when both sides are objects (e.g., examples from
            // multiple allOf parents). Otherwise last writer wins.
            if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
                result[key] = deepMergeObjects(
                    targetValue as Record<string, unknown>,
                    sourceValue as Record<string, unknown>
                );
            } else {
                result[key] = sourceValue;
            }
            continue;
        }

        if (OR_KEYS.includes(key)) {
            result[key] = Boolean(targetValue) || Boolean(sourceValue);
            continue;
        }

        if (MAX_OF_MINS_KEYS.includes(key)) {
            if (typeof targetValue === "number" && typeof sourceValue === "number") {
                result[key] = Math.max(targetValue, sourceValue);
            } else {
                result[key] = sourceValue;
            }
            continue;
        }

        if (MIN_OF_MAXS_KEYS.includes(key)) {
            if (typeof targetValue === "number" && typeof sourceValue === "number") {
                result[key] = Math.min(targetValue, sourceValue);
            } else {
                result[key] = sourceValue;
            }
            continue;
        }

        result[key] = sourceValue;
    }

    return result;
}

function mergeProperties(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const [key, sourceValue] of Object.entries(source)) {
        const targetValue = result[key];
        if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
            result[key] = mergeSchemaElement(
                targetValue as Record<string, unknown>,
                sourceValue as OpenAPIV3_1.SchemaObject
            );
        } else {
            result[key] = sourceValue;
        }
    }
    return result;
}

/**
 * Deep-merges two plain objects. For same-named keys, if both are objects,
 * recurses; otherwise source wins. Used for `example` and `default`.
 */
function deepMergeObjects(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const [key, sourceValue] of Object.entries(source)) {
        const targetValue = result[key];
        if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
            result[key] = deepMergeObjects(
                targetValue as Record<string, unknown>,
                sourceValue as Record<string, unknown>
            );
        } else {
            result[key] = sourceValue;
        }
    }
    return result;
}

function applyOuterSchema(result: Record<string, unknown>, outerSchema: OpenAPIV3_1.SchemaObject): void {
    for (const key of OUTER_WINS_KEYS) {
        const outerValue = outerSchema[key as keyof typeof outerSchema];
        if (outerValue != null) {
            result[key] = outerValue;
        }
    }
    for (const key of DEEP_MERGE_KEYS) {
        const outerValue = outerSchema[key as keyof typeof outerSchema];
        if (outerValue != null) {
            result[key] = outerValue;
        }
    }
    for (const key of OR_KEYS) {
        const outerValue = outerSchema[key as keyof typeof outerSchema];
        if (outerValue === true) {
            result[key] = true;
        }
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
