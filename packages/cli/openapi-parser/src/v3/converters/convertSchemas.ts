import { LiteralSchemaValue, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { isEqual } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getExtension } from "../extensions/getExtension";
import { getFernEnum } from "../extensions/getFernEnum";
import { getGeneratedTypeName } from "../utils/getSchemaName";
import { isReferenceObject } from "../utils/isReferenceObject";
import { getExampleAsBoolean, getExampleAsNumber, getExamplesString } from "./example/getExample";
import { convertAdditionalProperties, wrapMap } from "./schema/convertAdditionalProperties";
import { convertArray } from "./schema/convertArray";
import { convertDiscriminatedOneOf, convertDiscriminatedOneOfWithVariants } from "./schema/convertDiscriminatedOneOf";
import { convertEnum } from "./schema/convertEnum";
import { convertLiteral } from "./schema/convertLiteral";
import { convertNumber } from "./schema/convertNumber";
import { convertObject } from "./schema/convertObject";
import { convertUndiscriminatedOneOf } from "./schema/convertUndiscriminatedOneOf";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsNullable: boolean,
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[],
    referencedAsRequest = false,
    propertiesToExclude: Set<string> = new Set()
): SchemaWithExample {
    if (isReferenceObject(schema)) {
        if (!referencedAsRequest) {
            context.markSchemaAsReferencedByNonRequest(getSchemaIdFromReference(schema));
        } else {
            context.markSchemaAsReferencedByRequest(getSchemaIdFromReference(schema));
        }
        return convertReferenceObject(schema, wrapAsNullable, context, breadcrumbs);
    } else {
        return convertSchemaObject(schema, wrapAsNullable, context, breadcrumbs, propertiesToExclude);
    }
}

export function convertReferenceObject(
    schema: OpenAPIV3.ReferenceObject,
    wrapAsNullable: boolean,
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[]
): SchemaWithExample {
    const referenceSchema = schema.$ref.includes("properties")
        ? convertSchemaObject(context.resolveSchemaReference(schema), wrapAsNullable, context, breadcrumbs, new Set())
        : SchemaWithExample.reference(convertToReferencedSchema(schema, breadcrumbs));
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: referenceSchema,
            description: undefined,
        });
    } else {
        return referenceSchema;
    }
}

export function convertSchemaObject(
    schema: OpenAPIV3.SchemaObject,
    wrapAsNullable: boolean,
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[],
    propertiesToExclude: Set<string> = new Set()
): SchemaWithExample {
    const nameOverride = getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME);
    const generatedName = getGeneratedTypeName(breadcrumbs);
    const description = schema.description;

    // if a schema is null then we should wrap it as nullable
    if (!wrapAsNullable && schema.nullable === true) {
        return convertSchemaObject(schema, true, context, breadcrumbs);
    }

    // enums
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            // If enum is not a list of strings, just type as a string.
            // TODO(dsinghvi): Emit a warning we are doing this.
            return wrapPrimitive({
                primitive: PrimitiveSchemaValueWithExample.string({
                    minLength: undefined,
                    maxLength: undefined,
                    example: getExamplesString(schema),
                }),
                wrapAsNullable,
                description,
            });
        }

        if (schema.enum.length === 1 && schema.enum[0] != null) {
            return convertLiteral({
                wrapAsNullable,
                value: schema.enum[0],
                description,
            });
        }

        return convertEnum({
            nameOverride,
            generatedName,
            fernEnum: getFernEnum(schema),
            enumVarNames: getExtension<string[]>(schema, [OpenAPIExtension.ENUM_VAR_NAMES]),
            enumValues: schema.enum,
            description,
            wrapAsNullable,
        });
    }

    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (isListOfStrings(schema.type) && schema.type[1] != null && schema.type[0] != null) {
        const firstElement = schema.type[0];
        const secondElement = schema.type[1];
        if (firstElement === "null") {
            return SchemaWithExample.nullable({
                value: convertSchemaObject(
                    {
                        ...schema,
                        type: secondElement as OpenAPIV3.NonArraySchemaObjectType,
                    },
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    propertiesToExclude
                ),
                description: schema.description,
            });
        } else if (secondElement === "null") {
            return SchemaWithExample.nullable({
                value: convertSchemaObject(
                    {
                        ...schema,
                        type: firstElement as OpenAPIV3.NonArraySchemaObjectType,
                    },
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    propertiesToExclude
                ),
                description: schema.description,
            });
        }
    }

    // primitive types
    if (schema === "boolean" || schema.type === "boolean") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.boolean({
                example: getExampleAsBoolean(schema),
            }),
            wrapAsNullable,
            description,
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({
            format: schema.format,
            description,
            wrapAsNullable,
            example: getExampleAsNumber(schema),
        });
    }
    if (schema === "integer" || schema.type === "integer") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.int({
                example: getExampleAsNumber(schema),
            }),
            wrapAsNullable,
            description,
        });
    }
    if (schema === "string" || schema.type === "string") {
        if (schema.format === "date-time") {
            return wrapPrimitive({
                primitive: PrimitiveSchemaValueWithExample.datetime({
                    example: getExamplesString(schema),
                }),
                wrapAsNullable,
                description,
            });
        }

        const maybeConstValue = getProperty<string>(schema, "const");
        if (maybeConstValue != null) {
            return wrapLiteral({
                literal: maybeConstValue,
                wrapAsNullable,
                description,
            });
        }

        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.string({
                maxLength: schema.maxLength,
                minLength: schema.minLength,
                example: getExamplesString(schema),
            }),
            wrapAsNullable,
            description,
        });
    }

    // arrays
    if (schema.type === "array") {
        return convertArray({ breadcrumbs, item: schema.items, description, wrapAsNullable, context });
    }

    // maps
    if (schema.additionalProperties != null && schema.additionalProperties !== false && hasNoProperties(schema)) {
        return convertAdditionalProperties({
            breadcrumbs,
            additionalProperties: schema.additionalProperties,
            description,
            wrapAsNullable,
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
            wrapAsNullable,
            context,
        });
    }

    // handle oneOf
    if (schema.oneOf != null && schema.oneOf.length > 0) {
        // TODO(dsinghvi): handle type: 'null'
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
                wrapAsNullable,
                context,
            });
        } else if (schema.oneOf.length === 1 && schema.oneOf[0] != null) {
            const convertedSchema = convertSchema(schema.oneOf[0], wrapAsNullable, context, breadcrumbs);
            return maybeInjectDescription(convertedSchema, description);
        } else if (schema.oneOf.length > 1) {
            if (schema.oneOf.length === 2 && schema.oneOf[0] != null && schema.oneOf[1] != null) {
                const firstSchema = schema.oneOf[0];
                const secondSchema = schema.oneOf[1];
                if (!isReferenceObject(firstSchema) && (firstSchema.type as string) === "null") {
                    return convertSchema(secondSchema, true, context, breadcrumbs);
                } else if (!isReferenceObject(secondSchema) && (secondSchema.type as string) === "null") {
                    return convertSchema(firstSchema, true, context, breadcrumbs);
                }
            }

            const maybeAllEnumValues = getMaybeAllEnumValues({ schemas: schema.oneOf });
            if (maybeAllEnumValues != null) {
                return convertEnum({
                    nameOverride,
                    generatedName,
                    fernEnum: undefined,
                    enumVarNames: undefined,
                    enumValues: maybeAllEnumValues,
                    description,
                    wrapAsNullable,
                });
            }

            const maybeDiscriminant = getDiscriminant({ schemas: schema.oneOf, context });
            if (maybeDiscriminant != null) {
                return convertDiscriminatedOneOfWithVariants({
                    nameOverride,
                    generatedName,
                    breadcrumbs,
                    properties: schema.properties ?? {},
                    required: schema.required,
                    description,
                    wrapAsNullable,
                    discriminant: maybeDiscriminant.discriminant,
                    variants: maybeDiscriminant.schemas,
                    context,
                });
            }
            return convertUndiscriminatedOneOf({
                nameOverride,
                generatedName,
                breadcrumbs,
                description,
                wrapAsNullable,
                context,
                subtypes: schema.oneOf,
            });
        }
    }

    // treat anyOf as undiscrminated unions
    if (schema.anyOf != null && schema.anyOf.length > 0) {
        if (schema.anyOf.length === 1 && schema.anyOf[0] != null) {
            const convertedSchema = convertSchema(schema.anyOf[0], wrapAsNullable, context, breadcrumbs);
            return maybeInjectDescription(convertedSchema, description);
        }

        if (schema.anyOf.length === 2 && schema.anyOf[0] != null && schema.anyOf[1] != null) {
            if (!isReferenceObject(schema.anyOf[0]) && (schema.anyOf[0].type as unknown) === "null") {
                return convertSchema(schema.anyOf[1], true, context, breadcrumbs);
            } else if (!isReferenceObject(schema.anyOf[1]) && (schema.anyOf[1].type as unknown) === "null") {
                return convertSchema(schema.anyOf[0], true, context, breadcrumbs);
            }
        }

        const maybeDiscriminant = getDiscriminant({ schemas: schema.anyOf, context });
        if (maybeDiscriminant != null) {
            return convertDiscriminatedOneOfWithVariants({
                nameOverride,
                generatedName,
                breadcrumbs,
                properties: schema.properties ?? {},
                required: schema.required,
                description,
                wrapAsNullable,
                discriminant: maybeDiscriminant.discriminant,
                variants: maybeDiscriminant.schemas,
                context,
            });
        }

        return convertUndiscriminatedOneOf({
            nameOverride,
            generatedName,
            breadcrumbs,
            description,
            wrapAsNullable,
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
                const convertedSchema = convertSchema(maybeSingularAllOf, wrapAsNullable, context, breadcrumbs);
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
            wrapAsNullable,
            allOf: schema.allOf ?? [],
            context,
            propertiesToExclude,
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            description,
            wrapAsNullable,
            keySchema: {
                description: undefined,
                schema: PrimitiveSchemaValueWithExample.string({
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined,
                }),
            },
            valueSchema: SchemaWithExample.unknown({ description: undefined, example: undefined }),
        });
    }

    if (schema.type == null) {
        return SchemaWithExample.unknown({
            description,
            example: undefined,
        });
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
    const nameOverride = getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME);
    const generatedName = getGeneratedTypeName(breadcrumbs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (schema as any).description;
    return Schema.reference({
        // TODO(dsinghvi): references may contain files
        generatedName,
        nameOverride,
        schema: getSchemaIdFromReference(schema),
        description: description ?? undefined,
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

function maybeInjectDescription(schema: SchemaWithExample, description: string | undefined): SchemaWithExample {
    if (schema.type === "reference") {
        return Schema.reference({
            ...schema,
            description,
        });
    } else if (schema.type === "optional" && schema.value.type === "reference") {
        return SchemaWithExample.optional({
            value: Schema.reference({
                ...schema.value,
            }),
            description,
        });
    } else if (schema.type === "nullable" && schema.value.type === "reference") {
        return SchemaWithExample.nullable({
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

export function wrapLiteral({
    literal,
    wrapAsNullable,
    description,
}: {
    literal: string;
    wrapAsNullable: boolean;
    description: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.literal({
                value: LiteralSchemaValue.string(literal),
                description,
            }),
            description,
        });
    }
    return SchemaWithExample.literal({
        value: LiteralSchemaValue.string(literal),
        description,
    });
}

export function wrapPrimitive({
    primitive,
    wrapAsNullable,
    description,
}: {
    primitive: PrimitiveSchemaValueWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.primitive({
                schema: primitive,
                description,
            }),
            description,
        });
    }
    return SchemaWithExample.primitive({
        schema: primitive,
        description,
    });
}

interface DiscriminantProperty {
    discriminant: string;
    schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
}

function getMaybeAllEnumValues({
    schemas,
}: {
    schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
}): undefined | string[] {
    const enumValues = new Set<string>();
    for (const schema of schemas) {
        if (isReferenceObject(schema)) {
            return undefined;
        }
        if (schema.enum != null && isListOfStrings(schema.enum)) {
            schema.enum.forEach((val) => enumValues.add(val));
        } else {
            return undefined;
        }
    }
    return Array.from(enumValues);
}

function getDiscriminant({
    schemas,
    context,
}: {
    schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: AbstractOpenAPIV3ParserContext;
}): undefined | DiscriminantProperty {
    const discriminantToVariants: Record<
        string,
        Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>
    > = {};
    for (const schema of schemas) {
        const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;
        const possibleDiscriminants = getPossibleDiscriminants({ schema: resolvedSchema, context });
        for (const [property, value] of Object.entries(possibleDiscriminants)) {
            const variants = discriminantToVariants[property];
            if (variants != null) {
                variants[value] = schema;
            } else {
                discriminantToVariants[property] = {
                    [value]: schema,
                };
            }
        }
    }
    for (const [discriminant, variants] of Object.entries(discriminantToVariants)) {
        if (Object.keys(variants).length === schemas.length) {
            return {
                discriminant,
                schemas: variants,
            };
        }
    }
    return undefined;
}

function getPossibleDiscriminants({
    schema,
    context,
}: {
    schema: OpenAPIV3.SchemaObject;
    context: AbstractOpenAPIV3ParserContext;
}): Record<string, string> {
    const possibleDiscrimimants: Record<string, string> = {};
    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
        const resolvedPropertySchema = isReferenceObject(propertySchema)
            ? context.resolveSchemaReference(propertySchema)
            : propertySchema;
        if (
            resolvedPropertySchema.type === "string" &&
            resolvedPropertySchema.enum != null &&
            isListOfStrings(resolvedPropertySchema.enum) &&
            resolvedPropertySchema.enum.length === 1 &&
            resolvedPropertySchema.enum[0] != null
        ) {
            possibleDiscrimimants[propertyName] = resolvedPropertySchema.enum[0];
        }

        const maybeConstValue = getProperty<string>(resolvedPropertySchema, "const");
        if (resolvedPropertySchema.type === "string" && maybeConstValue != null) {
            possibleDiscrimimants[propertyName] = maybeConstValue;
        }
    }
    return possibleDiscrimimants;
}

export function getProperty<T>(object: object, property: string): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extensionValue = (object as any)[property];
    if (extensionValue != null) {
        return extensionValue as T;
    }
    return undefined;
}
