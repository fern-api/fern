import { allVariantsMatchSseSpecShape, type NormalizedVariantProperty } from "@fern-api/core-utils";
import { OpenAPIV3 } from "openapi-types";

import { SchemaParserContext } from "./SchemaParserContext.js";
import { isReferenceObject } from "./utils/isReferenceObject.js";

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
 * Normalizes an OpenAPI variant schema into a list of NormalizedVariantProperty
 * for consumption by the shared SSE spec shape matcher.
 */
function normalizeVariantProperties(
    schema: OpenAPIV3.SchemaObject,
    context: SchemaParserContext
): NormalizedVariantProperty[] {
    const allProperties = collectAllProperties(schema, context);
    return Object.entries(allProperties).map(([name, propSchema]) => {
        const resolved = resolvePropertySchema(propSchema, context);
        return { name, type: resolved.type ?? "unknown" };
    });
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

    const variants: NormalizedVariantProperty[][] = [];
    for (const schema of Object.values(mapping)) {
        try {
            const resolved = context.resolveSchemaReference({ $ref: schema });
            variants.push(normalizeVariantProperties(resolved, context));
        } catch {
            return "data";
        }
    }

    return allVariantsMatchSseSpecShape(variants) ? "protocol" : "data";
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

    const normalizedVariants: NormalizedVariantProperty[][] = [];
    for (const variantSchema of variantEntries) {
        try {
            const resolved = isReferenceObject(variantSchema)
                ? context.resolveSchemaReference(variantSchema)
                : variantSchema;
            normalizedVariants.push(normalizeVariantProperties(resolved, context));
        } catch {
            return "data";
        }
    }

    return allVariantsMatchSseSpecShape(normalizedVariants) ? "protocol" : "data";
}
