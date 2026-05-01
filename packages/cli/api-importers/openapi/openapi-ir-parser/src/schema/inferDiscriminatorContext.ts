import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension.js";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions.js";
import { SchemaParserContext } from "./SchemaParserContext.js";
import { isReferenceObject } from "./utils/isReferenceObject.js";

const SSE_SPEC_FIELDS = new Set(["event", "data", "id", "retry"]);

/**
 * Collects all property names from a schema, including those inherited via allOf.
 * Resolves $ref references recursively.
 */
function collectAllProperties(
    schema: OpenAPIV3.SchemaObject,
    context: SchemaParserContext
): Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> {
    let allProperties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {
        ...(schema.properties ?? {})
    };

    for (const allOfElement of schema.allOf ?? []) {
        if (isReferenceObject(allOfElement)) {
            const resolved = context.resolveSchemaReference(allOfElement);
            const inheritedProperties = collectAllProperties(resolved, context);
            allProperties = { ...inheritedProperties, ...allProperties };
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
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    context: SchemaParserContext
): OpenAPIV3.SchemaObject {
    if (isReferenceObject(schema)) {
        return context.resolveSchemaReference(schema);
    }
    return schema;
}

/**
 * Checks if a single variant schema matches the SSE event spec shape.
 * All properties must be in {event, data, id, retry} with correct types.
 */
function variantMatchesSseSpec(schema: OpenAPIV3.SchemaObject, context: SchemaParserContext): boolean {
    const allProperties = collectAllProperties(schema, context);
    const propertyEntries = Object.entries(allProperties);

    if (propertyEntries.length === 0) {
        return false;
    }

    let hasEvent = false;

    for (const [propName, propSchema] of propertyEntries) {
        if (!SSE_SPEC_FIELDS.has(propName)) {
            return false;
        }

        const resolved = resolvePropertySchema(propSchema, context);
        switch (propName) {
            case "event":
                hasEvent = true;
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

    return hasEvent;
}

/**
 * Resolves the discriminator context from an explicit extension value, falling
 * back to inference from variant shapes when no extension is set.
 */
export function resolveDiscriminatorContext({
    discriminator,
    context
}: {
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
}): "data" | "protocol" {
    return (
        getExtension<"data" | "protocol">(discriminator, FernOpenAPIExtension.DISCRIMINATOR_CONTEXT) ??
        inferDiscriminatorContext({ discriminator, context })
    );
}

/**
 * Infers the discriminator context by examining the resolved schema structure
 * of each variant in the discriminated union.
 *
 * Returns "protocol" if every variant's properties are exclusively drawn from
 * the SSE event spec fields {event, data, id, retry} with correct types.
 * Returns "data" otherwise.
 */
export function inferDiscriminatorContext({
    discriminator,
    context
}: {
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
}): "data" | "protocol" {
    const mapping = discriminator.mapping;
    if (mapping == null || Object.keys(mapping).length === 0) {
        return "data";
    }

    for (const schema of Object.values(mapping)) {
        try {
            const resolved = context.resolveSchemaReference({ $ref: schema });
            if (!variantMatchesSseSpec(resolved, context)) {
                return "data";
            }
        } catch {
            return "data";
        }
    }

    return "protocol";
}

/**
 * Infers the discriminator context for variants that are provided directly
 * (not through a discriminator.mapping), by examining each variant schema.
 */
export function inferDiscriminatorContextFromVariants({
    variants,
    context
}: {
    variants: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
    context: SchemaParserContext;
}): "data" | "protocol" {
    const variantEntries = Object.values(variants);
    if (variantEntries.length === 0) {
        return "data";
    }

    for (const variantSchema of variantEntries) {
        try {
            const resolved = isReferenceObject(variantSchema)
                ? context.resolveSchemaReference(variantSchema)
                : variantSchema;
            if (!variantMatchesSseSpec(resolved, context)) {
                return "data";
            }
        } catch {
            return "data";
        }
    }

    return "protocol";
}
