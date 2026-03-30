import { UnionDiscriminatorContext } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverterContext } from "../AbstractConverterContext.js";

const SSE_SPEC_FIELDS = new Set(["event", "data", "id", "retry"]);

/**
 * Collects all property names from a schema, including those inherited via allOf.
 * Resolves $ref references recursively.
 */
function collectAllProperties(
    schema: OpenAPIV3_1.SchemaObject,
    context: AbstractConverterContext<object>
): Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> {
    let allProperties: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> = {
        ...(schema.properties ?? {})
    };

    for (const allOfElement of schema.allOf ?? []) {
        if (context.isReferenceObject(allOfElement)) {
            const resolved = context.resolveReference<OpenAPIV3_1.SchemaObject>({
                reference: allOfElement,
                skipErrorCollector: true
            });
            if (resolved.resolved) {
                const inheritedProperties = collectAllProperties(resolved.value, context);
                allProperties = { ...inheritedProperties, ...allProperties };
            }
        } else {
            const inheritedProperties = collectAllProperties(allOfElement, context);
            allProperties = { ...inheritedProperties, ...allProperties };
        }
    }

    return allProperties;
}

/**
 * Resolves a property schema to its underlying SchemaObject, following $ref.
 */
function resolvePropertySchema(
    schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    context: AbstractConverterContext<object>
): OpenAPIV3_1.SchemaObject | undefined {
    if (context.isReferenceObject(schema)) {
        const resolved = context.resolveReference<OpenAPIV3_1.SchemaObject>({
            reference: schema,
            skipErrorCollector: true
        });
        return resolved.resolved ? resolved.value : undefined;
    }
    return schema;
}

/**
 * Checks if a single variant schema matches the SSE event spec shape.
 * All properties must be in {event, data, id, retry} with correct types.
 */
function variantMatchesSseSpec(schema: OpenAPIV3_1.SchemaObject, context: AbstractConverterContext<object>): boolean {
    const allProperties = collectAllProperties(schema, context);
    const propertyNames = Object.keys(allProperties);

    // Must have at least the "event" field to be considered SSE spec
    if (!allProperties["event"]) {
        return false;
    }

    // Check that every property name is in the SSE spec set
    for (const propName of propertyNames) {
        if (!SSE_SPEC_FIELDS.has(propName)) {
            return false;
        }
    }

    // Check types for known SSE spec fields
    for (const [propName, propSchema] of Object.entries(allProperties)) {
        const resolved = resolvePropertySchema(propSchema, context);
        if (resolved == null) {
            return false;
        }
        switch (propName) {
            case "event":
                if (resolved.type !== "string") {
                    return false;
                }
                break;
            case "id":
                if (resolved.type !== "string") {
                    return false;
                }
                break;
            case "retry":
                if (resolved.type !== "integer") {
                    return false;
                }
                break;
            case "data":
                // data can be any type
                break;
        }
    }

    return true;
}

/**
 * Infers the discriminator context by examining the resolved schema structure
 * of each variant in the discriminated union.
 *
 * Returns UnionDiscriminatorContext.Protocol if every variant's properties are
 * exclusively drawn from the SSE event spec fields {event, data, id, retry}
 * with correct types.
 * Returns undefined otherwise (which means generators default to "data").
 */
export function inferDiscriminatorContextV3({
    discriminator,
    context
}: {
    discriminator: OpenAPIV3_1.DiscriminatorObject;
    context: AbstractConverterContext<object>;
}): UnionDiscriminatorContext | undefined {
    const mapping = discriminator.mapping;
    if (mapping == null || Object.keys(mapping).length === 0) {
        return undefined;
    }

    for (const reference of Object.values(mapping)) {
        const resolved = context.resolveReference<OpenAPIV3_1.SchemaObject>({
            reference: { $ref: reference },
            skipErrorCollector: true
        });
        if (!resolved.resolved) {
            return undefined;
        }
        if (!variantMatchesSseSpec(resolved.value, context)) {
            return undefined;
        }
    }

    return UnionDiscriminatorContext.Protocol;
}
