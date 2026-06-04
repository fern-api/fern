import {
    Availability,
    CommonPropertyWithExample,
    Encoding,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension.js";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions.js";
import { getAllProperties } from "./convertObject.js";
import { convertReferenceObject, convertSchema, convertSchemaObject } from "./convertSchemas.js";
import { inferDiscriminatorContextFromVariants, resolveDiscriminatorContext } from "./inferDiscriminatorContext.js";
import { SchemaParserContext } from "./SchemaParserContext.js";
import { isReferenceObject } from "./utils/isReferenceObject.js";
import { isSchemaWithExampleEqual } from "./utils/isSchemaWithExampleEqual.js";

export function convertDiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsOptional,
    wrapAsNullable,
    discriminator,
    context,
    namespace,
    groupName,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const discriminant = discriminator.propertyName;
    const discriminantNameOverride = getExtension<string>(discriminator, FernOpenAPIExtension.FERN_PROPERTY_NAME);
    const discriminatorContext = resolveDiscriminatorContext({ discriminator, context });
    const unionSubTypes = Object.fromEntries(
        Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema]) => {
            const subtypeReference = convertReferenceObject(
                {
                    $ref: schema
                },
                false,
                false,
                context,
                [schema],
                encoding,
                source,
                namespace
            );
            context.markReferencedByDiscriminatedUnion(
                {
                    $ref: schema
                },
                discriminant,
                1
            );
            return [discriminantValue, subtypeReference];
        })
    );
    const convertedProperties = Object.entries(properties)
        .filter(([propertyName]) => {
            return propertyName !== discriminant;
        })
        .map(([propertyName, propertySchema]) => {
            const isRequired = required != null && required.includes(propertyName);
            const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                ? [false, !isRequired]
                : [!isRequired, false];
            const schema = convertSchema(
                propertySchema,
                isOptional,
                isNullable,
                context,
                [...breadcrumbs, propertyName],
                source,
                namespace
            );
            return {
                key: propertyName,
                schema
            };
        });
    if (context.options.shouldInferDiscriminatedUnionBaseProperties) {
        const variantSchemas: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = Object.values(
            discriminator.mapping ?? {}
        ).map(($ref) => ({ $ref }));
        const inferredCommonProperties = inferCommonPropertiesFromVariants({
            variants: variantSchemas,
            discriminant,
            existingPropertyNames: new Set(convertedProperties.map((p) => p.key)),
            context,
            breadcrumbs,
            source,
            namespace
        });
        convertedProperties.push(...inferredCommonProperties);
    }
    return wrapDiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        discriminantNameOverride,
        discriminatorContext,
        subtypes: unionSubTypes,
        defaultDiscriminantValue: undefined,
        namespace,
        groupName,
        source
    });
}

export function convertDiscriminatedOneOfWithVariants({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsOptional,
    wrapAsNullable,
    discriminant,
    variants,
    defaultDiscriminantValue,
    context,
    namespace,
    groupName,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    discriminant: string;
    variants: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
    defaultDiscriminantValue: string | undefined;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const unionSubTypes = Object.fromEntries(
        Object.entries(variants).map(([discriminantValue, schema]) => {
            if (isReferenceObject(schema)) {
                const subtypeReference = convertReferenceObject(
                    schema,
                    false,
                    false,
                    context,
                    [schema.$ref],
                    encoding,
                    source,
                    namespace
                );
                context.markReferencedByDiscriminatedUnion(schema, discriminant, 1);
                return [discriminantValue, subtypeReference];
            } else {
                const variantSchema = convertSchemaObject(
                    schema,
                    false,
                    false,
                    context,
                    [...breadcrumbs, discriminantValue],
                    encoding,
                    source,
                    namespace,
                    new Set([discriminant])
                );
                return [discriminantValue, variantSchema];
            }
        })
    );
    const convertedProperties = Object.entries(properties)
        .filter(([propertyName]) => {
            return propertyName !== discriminant;
        })
        .map(([propertyName, propertySchema]) => {
            const isRequired = required != null && required.includes(propertyName);
            const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                ? [false, !isRequired]
                : [!isRequired, false];
            const schema = convertSchema(
                propertySchema,
                isOptional,
                isNullable,
                context,
                [...breadcrumbs, propertyName],
                source,
                namespace
            );
            return {
                key: propertyName,
                schema
            };
        });
    if (context.options.shouldInferDiscriminatedUnionBaseProperties) {
        const inferredCommonProperties = inferCommonPropertiesFromVariants({
            variants: Object.values(variants),
            discriminant,
            existingPropertyNames: new Set(convertedProperties.map((p) => p.key)),
            context,
            breadcrumbs,
            source,
            namespace
        });
        convertedProperties.push(...inferredCommonProperties);
    }
    return wrapDiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        discriminantNameOverride: undefined,
        discriminatorContext: inferDiscriminatorContextFromVariants({ variants, context }),
        subtypes: unionSubTypes,
        defaultDiscriminantValue,
        namespace,
        groupName,
        source
    });
}

export function wrapDiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    wrapAsOptional,
    wrapAsNullable,
    properties,
    description,
    availability,
    discriminant,
    discriminantNameOverride,
    discriminatorContext,
    subtypes,
    defaultDiscriminantValue,
    namespace,
    groupName,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    properties: CommonPropertyWithExample[];
    description: string | undefined;
    availability: Availability | undefined;
    discriminant: string;
    discriminantNameOverride: string | undefined;
    discriminatorContext: "data" | "protocol";
    subtypes: Record<string, SchemaWithExample>;
    defaultDiscriminantValue: string | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    source: Source;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.oneOf(
        OneOfSchemaWithExample.discriminated({
            description,
            availability,
            discriminantProperty: discriminant,
            discriminantPropertyNameOverride: discriminantNameOverride,
            discriminatorContext,
            defaultDiscriminantValue,
            nameOverride,
            generatedName,
            title,
            schemas: subtypes,
            commonProperties: properties,
            namespace,
            groupName,
            encoding: undefined,
            source,
            inline: undefined
        })
    );
    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: result,
            namespace,
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            namespace,
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    return result;
}

/**
 * Compute properties that are present in every variant of a discriminated union
 * (after `allOf`/`$ref` flattening) and whose schemas are structurally equal across
 * all variants. The discriminant property and any properties already declared at the
 * union's top level are excluded. This lets SDKs expose shared fields directly on
 * the union type instead of forcing a cast to a concrete variant.
 *
 * Properties that every variant already inherits through a shared `allOf $ref` parent
 * are also excluded: the parent schema is the single source of truth, and re-emitting
 * those properties on the union forces some generators (e.g. TypeScript) to declare a
 * synthesized base interface alongside the real parent, which can collide when the two
 * disagree on optionality.
 */
function inferCommonPropertiesFromVariants({
    variants,
    discriminant,
    existingPropertyNames,
    context,
    breadcrumbs,
    source,
    namespace
}: {
    variants: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    discriminant: string;
    existingPropertyNames: Set<string>;
    context: SchemaParserContext;
    breadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
}): CommonPropertyWithExample[] {
    if (variants.length === 0) {
        return [];
    }
    const variantPropertyMaps = variants.map((variant) =>
        getAllProperties({ schema: variant, context, breadcrumbs, source, namespace })
    );
    const firstVariantProps = variantPropertyMaps[0];
    if (firstVariantProps == null) {
        return [];
    }
    const inheritedFromSharedParent = getPropertyNamesInheritedFromSharedAllOfRefParents({
        variants,
        context,
        breadcrumbs,
        source,
        namespace
    });
    const variantRequiredSets = variants.map((variant) =>
        getAllRequiredPropertyNames({ schema: variant, context, visited: new Set() })
    );
    const result: CommonPropertyWithExample[] = [];
    for (const [propertyName, firstSchema] of Object.entries(firstVariantProps)) {
        if (propertyName === discriminant) {
            continue;
        }
        if (existingPropertyNames.has(propertyName)) {
            continue;
        }
        if (inheritedFromSharedParent.has(propertyName)) {
            continue;
        }
        let presentInAll = true;
        for (let i = 1; i < variantPropertyMaps.length; i++) {
            const map = variantPropertyMaps[i];
            const otherSchema = map?.[propertyName];
            if (otherSchema == null || !isSchemaWithExampleEqual(firstSchema, otherSchema)) {
                presentInAll = false;
                break;
            }
        }
        if (!presentInAll) {
            continue;
        }
        const requiredInEveryVariant = variantRequiredSets.every((set) => set.has(propertyName));
        const schemaToLift =
            requiredInEveryVariant || firstSchema.type === "optional" || firstSchema.type === "nullable"
                ? firstSchema
                : SchemaWithExample.optional({
                      nameOverride: undefined,
                      generatedName: "",
                      title: undefined,
                      value: firstSchema,
                      description: undefined,
                      availability: undefined,
                      namespace: undefined,
                      groupName: undefined,
                      inline: undefined
                  });
        result.push({ key: propertyName, schema: schemaToLift });
    }
    return result;
}

/**
 * Returns the set of property names that the given schema (and any schemas reachable via
 * `allOf`) declares as required. A property is required for the variant if any link in the
 * `allOf` chain places it in a `required` array; otherwise it's optional. Used by the
 * inference path to decide whether a lifted common property should be wrapped as optional.
 */
function getAllRequiredPropertyNames({
    schema,
    context,
    visited
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: SchemaParserContext;
    visited: Set<string>;
}): Set<string> {
    const result = new Set<string>();
    let resolved: OpenAPIV3.SchemaObject;
    if (isReferenceObject(schema)) {
        if (visited.has(schema.$ref)) {
            return result;
        }
        visited.add(schema.$ref);
        resolved = context.resolveSchemaReference(schema);
    } else {
        resolved = schema;
    }
    for (const name of resolved.required ?? []) {
        result.add(name);
    }
    for (const allOfElement of resolved.allOf ?? []) {
        const childRequired = getAllRequiredPropertyNames({ schema: allOfElement, context, visited });
        for (const name of childRequired) {
            result.add(name);
        }
    }
    return result;
}

/**
 * Walks each variant's `allOf` chain (following `$ref`s transitively) and returns the set
 * of property names that come from `$ref` parents shared by *every* variant. These are the
 * properties each variant already inherits from a common ancestor — re-declaring them on
 * the union would cause the structural duplication described above.
 */
function getPropertyNamesInheritedFromSharedAllOfRefParents({
    variants,
    context,
    breadcrumbs,
    source,
    namespace
}: {
    variants: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    context: SchemaParserContext;
    breadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
}): Set<string> {
    if (variants.length === 0) {
        return new Set();
    }
    const refsPerVariant = variants.map((variant) =>
        collectTransitiveAllOfRefs({ schema: variant, context, visited: new Set() })
    );
    const firstSet = refsPerVariant[0];
    if (firstSet == null || firstSet.size === 0) {
        return new Set();
    }
    const inherited = new Set<string>();
    for (const [refKey, refObject] of firstSet) {
        const sharedAcrossAllVariants = refsPerVariant.every((s) => s.has(refKey));
        if (!sharedAcrossAllVariants) {
            continue;
        }
        const parentProperties = getAllProperties({
            schema: refObject,
            context,
            breadcrumbs,
            source,
            namespace
        });
        for (const propertyName of Object.keys(parentProperties)) {
            inherited.add(propertyName);
        }
    }
    return inherited;
}

/**
 * Returns a map of `$ref` URI -> the `ReferenceObject` that points to it, for every
 * `$ref` reachable via `allOf` from the given schema (transitively). Inline `allOf`
 * elements are recursed into so a deeply-nested `$ref` still surfaces.
 */
function collectTransitiveAllOfRefs({
    schema,
    context,
    visited
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: SchemaParserContext;
    visited: Set<string>;
}): Map<string, OpenAPIV3.ReferenceObject> {
    const result = new Map<string, OpenAPIV3.ReferenceObject>();
    let resolved: OpenAPIV3.SchemaObject;
    if (isReferenceObject(schema)) {
        if (visited.has(schema.$ref)) {
            return result;
        }
        visited.add(schema.$ref);
        resolved = context.resolveSchemaReference(schema);
    } else {
        resolved = schema;
    }
    for (const allOfElement of resolved.allOf ?? []) {
        if (isReferenceObject(allOfElement)) {
            if (!result.has(allOfElement.$ref)) {
                result.set(allOfElement.$ref, allOfElement);
            }
            const nested = collectTransitiveAllOfRefs({ schema: allOfElement, context, visited });
            for (const [k, v] of nested) {
                if (!result.has(k)) {
                    result.set(k, v);
                }
            }
        } else {
            const nested = collectTransitiveAllOfRefs({ schema: allOfElement, context, visited });
            for (const [k, v] of nested) {
                if (!result.has(k)) {
                    result.set(k, v);
                }
            }
        }
    }
    return result;
}
