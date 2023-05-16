import { PrimitiveSchemaValue, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/ir";
import { isEqual } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { getGeneratedTypeName } from "../utils/getSchemaName";
import { isReferenceObject } from "../utils/isReferenceObject";
import { convertAdditionalProperties, wrapMap } from "./schema/convertAdditionalProperties";
import { convertArray } from "./schema/convertArray";
import { convertDiscriminatedOneOf } from "./schema/convertDiscriminatedOneOf";
import { convertEnum } from "./schema/convertEnum";
import { convertNumber } from "./schema/convertNumber";
import { convertObject } from "./schema/convertObject";
import { convertUndiscriminatedOneOf } from "./schema/convertUndiscriminatedOneOf";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsOptional: boolean,
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[],
    referencedAsRequest = false
): Schema {
    if (isReferenceObject(schema)) {
        if (!referencedAsRequest) {
            context.markSchemaAsReferencedByNonRequest(getSchemaIdFromReference(schema));
        } else {
            context.markSchemaAsReferencedByRequest(getSchemaIdFromReference(schema));
        }
        return convertReferenceObject(schema, wrapAsOptional, breadcrumbs);
    } else {
        return convertSchemaObject(schema, wrapAsOptional, context, breadcrumbs);
    }
}

export function convertReferenceObject(
    schema: OpenAPIV3.ReferenceObject,
    wrapAsOptional: boolean,
    breadcrumbs: string[]
): Schema {
    const referenceSchema = Schema.reference(convertToReferencedSchema(schema, breadcrumbs));
    if (wrapAsOptional) {
        return Schema.optional({
            value: referenceSchema,
            description: undefined,
        });
    } else {
        return referenceSchema;
    }
}

function convertSchemaObject(
    schema: OpenAPIV3.SchemaObject,
    wrapAsOptionalParam: boolean,
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[]
): Schema {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nameOverride = (schema as any)["x-fern-type-name"] as string | undefined;
    const generatedName = getGeneratedTypeName(breadcrumbs);
    const description = schema.description;

    // nullable parameters should be optional
    const wrapAsOptional = wrapAsOptionalParam || schema.nullable === true;

    // enums
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            // If enum is not a list of strings, just type as a string.
            // TODO(dsinghvi): Emit a warning we are doing this.
            return wrapPrimitive({
                primitive: PrimitiveSchemaValue.string(),
                wrapAsOptional,
                description,
            });
        }
        return convertEnum({
            nameOverride,
            generatedName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enumNames: (schema as any)["x-enum-names"] as Record<string, string> | undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enumVarNames: (schema as any)["x-enum-varnames"] as string[] | undefined,
            enumValues: schema.enum,
            description,
            wrapAsOptional,
        });
    }

    // primitive types
    if (schema === "boolean" || schema.type === "boolean") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.boolean(),
            wrapAsOptional,
            description,
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({ format: schema.format, description, wrapAsOptional });
    }
    if (schema === "integer" || schema.type === "integer") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int(),
            wrapAsOptional,
            description,
        });
    }
    if (schema === "string" || schema.type === "string") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.string(),
            wrapAsOptional,
            description,
        });
    }

    // arrays
    if (schema.type === "array") {
        return convertArray({ breadcrumbs, item: schema.items, description, wrapAsOptional, context });
    }

    // maps
    if (schema.additionalProperties != null && schema.additionalProperties !== false && hasNoProperties(schema)) {
        return convertAdditionalProperties({
            breadcrumbs,
            additionalProperties: schema.additionalProperties,
            description,
            wrapAsOptional,
            context,
        });
    }

    // handle object with discriminant
    if (schema.type === "object" && schema.discriminator != null && schema.discriminator.mapping != null) {
        return convertDiscriminatedOneOf({
            nameOverride,
            generatedName,
            breadcrumbs,
            description,
            discriminator: schema.discriminator,
            properties: schema.properties ?? {},
            required: schema.required,
            wrapAsOptional,
            context,
        });
    }

    // handle oneOf
    if (schema.oneOf != null && schema.oneOf.length > 0) {
        if (
            schema.discriminator != null &&
            schema.discriminator.mapping != null &&
            Object.keys(schema.discriminator.mapping).length > 0
        ) {
            return convertDiscriminatedOneOf({
                nameOverride,
                generatedName,
                breadcrumbs,
                description,
                discriminator: schema.discriminator,
                properties: schema.properties ?? {},
                required: schema.required,
                wrapAsOptional,
                context,
            });
        } else if (schema.oneOf.length === 1 && schema.oneOf[0] != null) {
            const convertedSchema = convertSchema(schema.oneOf[0], wrapAsOptional, context, breadcrumbs);
            return maybeInjectDescription(convertedSchema, description);
        } else if (schema.oneOf.length > 1) {
            return convertUndiscriminatedOneOf({
                nameOverride,
                generatedName,
                breadcrumbs,
                description,
                wrapAsOptional,
                context,
                subtypes: schema.oneOf,
            });
        }
    }

    // treat anyOf as undiscrminated unions
    if (schema.anyOf != null && schema.anyOf.length > 0) {
        return convertUndiscriminatedOneOf({
            nameOverride,
            generatedName,
            breadcrumbs,
            description,
            wrapAsOptional,
            context,
            subtypes: schema.anyOf,
        });
    }

    // handle objects
    if (schema.allOf != null || schema.properties != null) {
        // convert a singular allOf as a reference or inlined schema
        if (schema.allOf != null) {
            const maybeSingularAllOf = getSingularAllOf({ properties: schema.properties ?? {}, allOf: schema.allOf });
            if (maybeSingularAllOf != null) {
                const convertedSchema = convertSchema(maybeSingularAllOf, wrapAsOptional, context, breadcrumbs);
                return maybeInjectDescription(convertedSchema, description);
            }
        }

        // otherwise convert as an object
        return convertObject({
            nameOverride,
            generatedName,
            breadcrumbs,
            properties: schema.properties ?? {},
            description,
            required: schema.required,
            wrapAsOptional,
            allOf: schema.allOf ?? [],
            context,
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            description,
            wrapAsOptional,
            keySchema: PrimitiveSchemaValue.string(),
            valueSchema: Schema.unknown(),
        });
    }

    if (schema.type == null) {
        return Schema.unknown();
    }

    throw new Error(
        `Failed to convert schema breadcrumbs=${JSON.stringify(breadcrumbs)} value=${JSON.stringify(schema)}`
    );
}

export function getSchemaIdFromReference(ref: OpenAPIV3.ReferenceObject): string {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Cannot get schema id from reference: ${ref.$ref}`);
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}

export function convertToReferencedSchema(schema: OpenAPIV3.ReferenceObject, breadcrumbs: string[]): ReferencedSchema {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nameOverride = (schema as any)["x-fern-type-name"] as string | undefined;
    const generatedName = getGeneratedTypeName(breadcrumbs);
    return Schema.reference({
        // TODO(dsinghvi): references may contain files
        generatedName,
        nameOverride,
        file: undefined,
        schema: getSchemaIdFromReference(schema),
        description: undefined,
    });
}

function hasNoOneOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.oneOf == null || schema.oneOf.length === 0;
}

function hasNoAllOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.allOf == null || schema.allOf.length === 0;
}

function hasNoProperties(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.properties == null || Object.keys(schema.properties).length === 0;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}

function maybeInjectDescription(schema: Schema, description: string | undefined): Schema {
    if (schema.type === "reference") {
        return Schema.reference({
            ...schema,
            description,
        });
    } else if (schema.type === "optional" && schema.value.type === "reference") {
        return Schema.optional({
            value: Schema.reference({
                ...schema.value,
            }),
            description,
        });
    }
    return schema;
}

function getSingularAllOf({
    properties,
    allOf,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
}): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    if (hasNoProperties({ properties }) && allOf.length === 1 && allOf[0] != null) {
        return allOf[0];
    } else if (hasNoProperties({ properties }) && allOf.length === 2 && allOf[0] != null && allOf[1] != null) {
        const allOfZero = allOf[0];
        const allOfOne = allOf[1];
        if (isAllOfElementEmpty(allOfZero)) {
            return allOfOne;
        } else if (isAllOfElementEmpty(allOfOne)) {
            return allOfZero;
        }
    }
    return undefined;
}

// make sure these const sare sorted alphabetically
const DEFAULT_KEY = ["default"];
const DEFAULT_DESCRIPTION_KEYS = ["default", "description"];
const DESCRIPTION_KEY = ["description"];

function isAllOfElementEmpty(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): boolean {
    const keys = Object.keys(schema).sort();
    return isEqual(keys, DEFAULT_KEY) || isEqual(keys, DESCRIPTION_KEY) || isEqual(keys, DEFAULT_DESCRIPTION_KEYS);
}

export function wrapPrimitive({
    primitive,
    wrapAsOptional,
    description,
}: {
    primitive: PrimitiveSchemaValue;
    wrapAsOptional: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.primitive({
                schema: primitive,
                description: undefined,
            }),
            description,
        });
    }
    return Schema.primitive({
        schema: primitive,
        description,
    });
}
