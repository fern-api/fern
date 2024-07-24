import {
    Availability,
    LiteralSchemaValue,
    NamedFullExample,
    PrimitiveSchemaValueWithExample,
    ReferencedSchema,
    Schema,
    SchemaWithExample
} from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../getExtension";
import { OpenAPIExtension } from "../openapi/v3/extensions/extensions";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { getFernEnum } from "../openapi/v3/extensions/getFernEnum";
import { getFernTypeExtension } from "../openapi/v3/extensions/getFernTypeExtension";
import { getValueIfBoolean } from "../utils/getValue";
import { convertAdditionalProperties, wrapMap } from "./convertAdditionalProperties";
import { convertArray } from "./convertArray";
import { convertAvailability } from "./convertAvailability";
import { convertDiscriminatedOneOf, convertDiscriminatedOneOfWithVariants } from "./convertDiscriminatedOneOf";
import { convertEnum } from "./convertEnum";
import { convertInteger } from "./convertInteger";
import { convertLiteral } from "./convertLiteral";
import { convertNumber } from "./convertNumber";
import { convertObject } from "./convertObject";
import {
    convertUndiscriminatedOneOf,
    convertUndiscriminatedOneOfWithDiscriminant
} from "./convertUndiscriminatedOneOf";
import { getDefaultAsString } from "./defaults/getDefault";
import { getExampleAsArray, getExampleAsBoolean, getExampleAsNumber, getExamplesString } from "./examples/getExample";
import { SchemaParserContext } from "./SchemaParserContext";
import { getBreadcrumbsFromReference } from "./utils/getBreadcrumbsFromReference";
import { getGeneratedTypeName } from "./utils/getSchemaName";
import { isReferenceObject } from "./utils/isReferenceObject";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";
export const SCHEMA_INLINE_REFERENCE_PREFIX = "#/components/responses/";

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    referencedAsRequest = false,
    propertiesToExclude: Set<string> = new Set(),
    fallback?: string | number | boolean | unknown[]
): SchemaWithExample {
    if (isReferenceObject(schema)) {
        const schemaId = getSchemaIdFromReference(schema);
        if (schemaId != null) {
            if (!referencedAsRequest) {
                context.markSchemaAsReferencedByNonRequest(schemaId);
            } else {
                context.markSchemaAsReferencedByRequest(schemaId);
            }
            return convertReferenceObject(schema, wrapAsNullable, context, breadcrumbs);
        }
        // if the schema id is null, we should convert the entire schema and inline it
        // in the OpenAPI IR
        return convertSchemaObject(
            context.resolveSchemaReference(schema),
            wrapAsNullable,
            context,
            getBreadcrumbsFromReference(schema.$ref),
            propertiesToExclude,
            referencedAsRequest,
            fallback
        );
    } else {
        return convertSchemaObject(
            schema,
            wrapAsNullable,
            context,
            breadcrumbs,
            propertiesToExclude,
            referencedAsRequest,
            fallback
        );
    }
}

export function convertReferenceObject(
    schema: OpenAPIV3.ReferenceObject,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[]
): SchemaWithExample {
    const referenceSchema = schema.$ref.includes("properties")
        ? convertSchemaObject(context.resolveSchemaReference(schema), wrapAsNullable, context, breadcrumbs, new Set())
        : SchemaWithExample.reference(convertToReferencedSchema(schema, breadcrumbs));
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(breadcrumbs),
            value: referenceSchema,
            description: undefined,
            availability: undefined,
            groupName: undefined
        });
    } else {
        return referenceSchema;
    }
}

// Returns a Schema Title if it's suitable as a code generated name
function getTitleAsName(title: string | undefined): string | undefined {
    if (title == null) {
        return undefined;
    }
    if (title.includes(" ")) {
        return undefined;
    }
    if (!/^[a-zA-Z]+$/.test(title)) {
        return undefined;
    }
    return title;
}

export function convertSchemaObject(
    schema: OpenAPIV3.SchemaObject,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    propertiesToExclude: Set<string> = new Set(),
    referencedAsRequest = false,
    fallback?: string | number | boolean | unknown[]
): SchemaWithExample {
    const nameOverride =
        getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME) ??
        (context.options.useTitlesAsName ? getTitleAsName(schema.title) : undefined);
    const mixedGroupName =
        getExtension(schema, FernOpenAPIExtension.SDK_GROUP_NAME) ??
        getExtension<string[]>(schema, OpenAPIExtension.TAGS)?.[0];
    const groupName = typeof mixedGroupName === "string" ? [mixedGroupName] : mixedGroupName;
    const generatedName = getGeneratedTypeName(breadcrumbs);
    const description = schema.description;
    const availability = convertAvailability(schema);

    const examples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(schema, OpenAPIExtension.EXAMPLES);

    const fullExamples: NamedFullExample[] = [];
    if (schema.example != null) {
        fullExamples.push({ name: undefined, value: schema.example, description: undefined });
    }
    if (examples != null && Object.keys(examples).length > 0) {
        fullExamples.push(
            ...Object.entries(examples).map(([name, value]) => {
                return { name: value.summary ?? name, value: value.value, description: value.description };
            })
        );
    }

    const fernSchema = getFernTypeExtension({ schema, description, nameOverride, generatedName, availability });
    if (fernSchema != null) {
        return fernSchema;
    }

    // if a schema is null then we should wrap it as nullable
    if (!wrapAsNullable && schema.nullable === true) {
        return convertSchemaObject(
            schema,
            true,
            context,
            breadcrumbs,
            propertiesToExclude,
            referencedAsRequest,
            fallback
        );
    }

    // enums
    if (schema.enum != null && (schema.type === "string" || schema.type == null)) {
        if (!isListOfStrings(schema.enum)) {
            // If enum is not a list of strings, just type as a string.
            // TODO(dsinghvi): Emit a warning we are doing this.
            return wrapPrimitive({
                nameOverride,
                generatedName,
                primitive: PrimitiveSchemaValueWithExample.string({
                    default: getDefaultAsString(schema),
                    minLength: schema.minLength,
                    maxLength: schema.maxLength,
                    pattern: schema.pattern,
                    format: schema.format,
                    example: getExamplesString({ schema, logger: context.logger, fallback })
                }),
                groupName,
                wrapAsNullable,
                description,
                availability
            });
        }

        const fernEnum = getFernEnum(schema);

        if (schema.enum.length === 1 && schema.enum[0] != null && fernEnum == null) {
            return convertLiteral({
                nameOverride,
                generatedName,
                wrapAsNullable,
                value: schema.enum[0],
                description,
                availability,
                groupName
            });
        }

        return convertEnum({
            nameOverride,
            generatedName,
            fernEnum,
            enumVarNames: getExtension<string[]>(schema, [OpenAPIExtension.ENUM_VAR_NAMES]),
            enumValues: schema.enum,
            _default: schema.default,
            description,
            availability,
            wrapAsNullable,
            groupName,
            context
        });
    }

    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (isListOfStrings(schema.type) && schema.type[1] != null && schema.type[0] != null) {
        const firstElement = schema.type[0];
        const secondElement = schema.type[1];
        if (firstElement === "null") {
            return SchemaWithExample.nullable({
                nameOverride,
                generatedName,
                value: convertSchemaObject(
                    {
                        ...schema,
                        type: secondElement as OpenAPIV3.NonArraySchemaObjectType
                    },
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    propertiesToExclude,
                    referencedAsRequest,
                    fallback
                ),
                groupName,
                description: schema.description,
                availability
            });
        } else if (secondElement === "null") {
            return SchemaWithExample.nullable({
                nameOverride,
                generatedName,
                value: convertSchemaObject(
                    {
                        ...schema,
                        type: firstElement as OpenAPIV3.NonArraySchemaObjectType
                    },
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    propertiesToExclude,
                    referencedAsRequest,
                    fallback
                ),
                groupName,
                description: schema.description,
                availability
            });
        }
    }

    // List of types that is undiscriminated union
    if (isListOfStrings(schema.type) && schema.type.length > 1) {
        const wrapVariantAsNullable = schema.type.includes("null");
        const subtypes: OpenAPIV3.SchemaObject[] = schema.type
            .filter((val) => val !== "null")
            .map((type) => {
                return {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    type: type as any,
                    nullable: wrapVariantAsNullable
                };
            });
        return convertUndiscriminatedOneOf({
            nameOverride,
            generatedName,
            breadcrumbs,
            description,
            availability,
            wrapAsNullable,
            context,
            subtypes,
            groupName
        });
    }

    // primitive types
    if (schema === "boolean" || schema.type === "boolean") {
        const literalValue = getExtension<boolean>(schema, FernOpenAPIExtension.BOOLEAN_LITERAL);
        if (literalValue != null) {
            return wrapLiteral({
                nameOverride,
                generatedName,
                literal: LiteralSchemaValue.boolean(literalValue),
                wrapAsNullable,
                description,
                availability,
                groupName
            });
        }
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.boolean({
                default: schema.default,
                example: getExampleAsBoolean({ schema, logger: context.logger, fallback })
            }),
            wrapAsNullable,
            description,
            availability,
            groupName
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({
            nameOverride,
            generatedName,
            format: schema.format,
            _default: schema.default,
            minimum: schema.minimum,
            maximum: schema.maximum,
            exclusiveMinimum: getValueIfBoolean(schema.exclusiveMinimum),
            exclusiveMaximum: getValueIfBoolean(schema.exclusiveMaximum),
            multipleOf: schema.multipleOf,
            description,
            availability,
            wrapAsNullable,
            example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
            groupName
        });
    }
    if (schema === "integer" || schema.type === "integer") {
        return convertInteger({
            nameOverride,
            generatedName,
            format: schema.format,
            _default: schema.default,
            minimum: schema.minimum,
            maximum: schema.maximum,
            exclusiveMinimum: getValueIfBoolean(schema.exclusiveMinimum),
            exclusiveMaximum: getValueIfBoolean(schema.exclusiveMaximum),
            multipleOf: schema.multipleOf,
            description,
            availability,
            wrapAsNullable,
            example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
            groupName
        });
    }
    if (schema === "float") {
        return convertNumber({
            nameOverride,
            generatedName,
            format: "float",
            _default: schema.default,
            minimum: schema.minimum,
            maximum: schema.maximum,
            exclusiveMinimum: getValueIfBoolean(schema.exclusiveMinimum),
            exclusiveMaximum: getValueIfBoolean(schema.exclusiveMaximum),
            multipleOf: schema.multipleOf,
            description,
            availability,
            wrapAsNullable,
            example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
            groupName
        });
    }
    if (schema === "string" || schema.type === "string") {
        if (schema.format === "date-time") {
            return wrapPrimitive({
                nameOverride,
                generatedName,
                primitive: PrimitiveSchemaValueWithExample.datetime({
                    example: getExamplesString({ schema, logger: context.logger, fallback })
                }),
                wrapAsNullable,
                description,
                availability,
                groupName
            });
        } else if (schema.format === "json-string") {
            return SchemaWithExample.unknown({
                nameOverride,
                generatedName,
                description,
                availability,
                groupName,
                example: undefined
            });
        }

        const maybeConstValue = getProperty<string>(schema, "const");
        if (maybeConstValue != null) {
            return wrapLiteral({
                nameOverride,
                generatedName,
                literal: LiteralSchemaValue.string(maybeConstValue),
                wrapAsNullable,
                description,
                availability,
                groupName
            });
        }

        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.string({
                default: getDefaultAsString(schema),
                pattern: schema.pattern,
                format: schema.format,
                minLength: schema.minLength,
                maxLength: schema.maxLength,
                example: getExamplesString({ schema, logger: context.logger, fallback })
            }),
            groupName,
            wrapAsNullable,
            description,
            availability
        });
    }

    // arrays
    if (schema.type === "array") {
        return convertArray({
            nameOverride,
            generatedName,
            breadcrumbs,
            item: schema.items,
            description,
            availability,
            wrapAsNullable,
            context,
            groupName,
            example: getExampleAsArray({ schema, logger: context.logger, fallback })
        });
    }

    // maps
    if (schema.additionalProperties != null && schema.additionalProperties !== false && hasNoProperties(schema)) {
        return convertAdditionalProperties({
            nameOverride,
            generatedName,
            breadcrumbs,
            additionalProperties: schema.additionalProperties,
            description,
            availability,
            wrapAsNullable,
            context,
            groupName,
            example: schema.example
        });
    }

    if (schema.type === "object" && schema.discriminator != null && schema.discriminator.mapping != null) {
        if (!context.options.discriminatedUnionV2) {
            return convertDiscriminatedOneOf({
                nameOverride,
                generatedName,
                breadcrumbs,
                description,
                availability,
                discriminator: schema.discriminator,
                properties: schema.properties ?? {},
                required: schema.required,
                wrapAsNullable,
                context,
                groupName
            });
        } else {
            return convertUndiscriminatedOneOfWithDiscriminant({
                nameOverride,
                generatedName,
                description,
                availability,
                wrapAsNullable,
                context,
                groupName,
                discriminator: schema.discriminator
            });
        }
    }

    // handle oneOf
    if (schema.oneOf != null && schema.oneOf.length > 0) {
        const isUndiscriminated = getExtension(schema, FernOpenAPIExtension.IS_UNDISCRIMINATED);
        if (
            schema.discriminator != null &&
            schema.discriminator.mapping != null &&
            Object.keys(schema.discriminator.mapping).length > 0
        ) {
            if (context.options.discriminatedUnionV2 || isUndiscriminated) {
                return convertUndiscriminatedOneOfWithDiscriminant({
                    nameOverride,
                    generatedName,
                    description,
                    availability,
                    wrapAsNullable,
                    context,
                    groupName,
                    discriminator: schema.discriminator
                });
            } else {
                return convertDiscriminatedOneOf({
                    nameOverride,
                    generatedName,
                    breadcrumbs,
                    description,
                    availability,
                    discriminator: schema.discriminator,
                    properties: schema.properties ?? {},
                    required: schema.required,
                    wrapAsNullable,
                    context,
                    groupName
                });
            }
        } else if (schema.oneOf.length === 1 && schema.oneOf[0] != null) {
            const convertedSchema = convertSchema(
                schema.oneOf[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
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
                    _default: schema.default,
                    description,
                    availability,
                    wrapAsNullable,
                    groupName,
                    context
                });
            }

            const maybeDiscriminant = getDiscriminant({ schemas: schema.oneOf, context });
            if (maybeDiscriminant != null && !context.options.discriminatedUnionV2 && !isUndiscriminated) {
                return convertDiscriminatedOneOfWithVariants({
                    nameOverride,
                    generatedName,
                    breadcrumbs,
                    properties: schema.properties ?? {},
                    required: schema.required,
                    description,
                    availability,
                    wrapAsNullable,
                    discriminant: maybeDiscriminant.discriminant,
                    variants: maybeDiscriminant.schemas,
                    context,
                    groupName
                });
            }

            const hasNullValue =
                schema.oneOf.filter((schema) => {
                    return !isReferenceObject(schema) && (schema.type as string) === "null";
                }).length > 0;
            return convertUndiscriminatedOneOf({
                nameOverride,
                generatedName,
                breadcrumbs,
                description,
                availability,
                wrapAsNullable: wrapAsNullable || hasNullValue,
                context,
                subtypes: schema.oneOf.filter((schema) => {
                    return isReferenceObject(schema) || (schema.type as string) !== "null";
                }),
                groupName
            });
        }
    }

    // treat anyOf as undiscrminated unions
    if (schema.anyOf != null && schema.anyOf.length > 0) {
        if (schema.anyOf.length === 1 && schema.anyOf[0] != null) {
            const convertedSchema = convertSchema(
                schema.anyOf[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        }

        if (schema.anyOf.length === 2) {
            const [firstSchema, secondSchema] = schema.anyOf;
            if (firstSchema != null && secondSchema != null) {
                if (!isReferenceObject(firstSchema) && (firstSchema.type as unknown) === "null") {
                    const convertedSchema = convertSchema(secondSchema, true, context, breadcrumbs);
                    return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
                } else if (!isReferenceObject(secondSchema) && (secondSchema.type as unknown) === "null") {
                    const convertedSchema = convertSchema(firstSchema, true, context, breadcrumbs);
                    return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
                }
            }
        }

        const maybeDiscriminant = getDiscriminant({
            schemas: schema.anyOf,
            context
        });
        if (maybeDiscriminant != null && !context.options.discriminatedUnionV2) {
            return convertDiscriminatedOneOfWithVariants({
                nameOverride,
                generatedName,
                breadcrumbs,
                properties: schema.properties ?? {},
                required: schema.required,
                description,
                availability,
                wrapAsNullable,
                discriminant: maybeDiscriminant.discriminant,
                variants: maybeDiscriminant.schemas,
                context,
                groupName
            });
        }

        const hasNullValue =
            schema.anyOf.filter((schema) => {
                return !isReferenceObject(schema) && (schema.type as string) === "null";
            }).length > 0;
        return convertUndiscriminatedOneOf({
            nameOverride,
            generatedName,
            breadcrumbs,
            description,
            availability,
            wrapAsNullable: wrapAsNullable || hasNullValue,
            context,
            subtypes: schema.anyOf.filter((schema) => {
                return isReferenceObject(schema) || (schema.type as string) !== "null";
            }),
            groupName
        });
    }

    // handle objects
    if (schema.allOf != null || schema.properties != null) {
        const filteredAllOfs: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [];
        for (const allOf of schema.allOf ?? []) {
            if (isReferenceObject(allOf) || Object.keys(allOf).length > 0) {
                filteredAllOfs.push(allOf);
            }
        }
        if (
            (schema.properties == null || schema.properties.length === 0) &&
            filteredAllOfs.length === 1 &&
            filteredAllOfs[0] != null
        ) {
            // If we end up with a single element, we short-circuit and convert it directly.
            // Note that this handles any schema type, not just objects (e.g. arrays).
            const convertedSchema = convertSchema(
                filteredAllOfs[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        }

        // Now that we've handled the single-element allOf case, filter the
        // allOfs down to just the objects.
        const filteredAllOfObjects = filteredAllOfs.filter((allOf) => {
            const valid = isValidAllOfObject(allOf);
            if (!valid) {
                context.logger.warn(`Skipping non-object allOf element: ${JSON.stringify(allOf)}`);
            }
            return valid;
        });

        if (
            (schema.properties == null || schema.properties.length === 0) &&
            filteredAllOfObjects.length === 1 &&
            filteredAllOfObjects[0] != null
        ) {
            // Try to short-circuit again.
            const convertedSchema = convertSchema(
                filteredAllOfObjects[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        }

        return convertObject({
            nameOverride,
            generatedName,
            breadcrumbs,
            properties: schema.properties ?? {},
            description,
            required: schema.required,
            wrapAsNullable,
            allOf: filteredAllOfObjects,
            context,
            propertiesToExclude,
            groupName,
            fullExamples,
            additionalProperties: schema.additionalProperties,
            availability
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            nameOverride,
            generatedName,
            description,
            availability,
            wrapAsNullable,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                description: undefined,
                availability: undefined,
                schema: PrimitiveSchemaValueWithExample.string({
                    default: getDefaultAsString(schema),
                    pattern: schema.pattern,
                    format: schema.format,
                    minLength: schema.minLength,
                    maxLength: schema.maxLength,
                    example: getExamplesString({ schema, logger: context.logger, fallback })
                }),
                groupName
            },
            valueSchema: SchemaWithExample.unknown({
                nameOverride: undefined,
                generatedName: `${generatedName}Value`,
                description: undefined,
                availability: undefined,
                example: undefined,
                groupName
            }),
            groupName,
            example: schema.example
        });
    }

    if (schema.type == null) {
        const inferredValue = schema.example ?? schema.default;
        return SchemaWithExample.unknown({
            nameOverride,
            generatedName,
            description,
            availability,
            groupName,
            example: inferredValue
        });
    }

    throw new Error(
        `Failed to convert schema breadcrumbs=${JSON.stringify(breadcrumbs)} value=${JSON.stringify(schema)}`
    );
}

export function getSchemaIdFromReference(ref: OpenAPIV3.ReferenceObject): string | undefined {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        return undefined;
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}

export function convertToReferencedSchema(schema: OpenAPIV3.ReferenceObject, breadcrumbs: string[]): ReferencedSchema {
    const nameOverride = getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME);
    const generatedName = getGeneratedTypeName(breadcrumbs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (schema as any).description;
    const availability = convertAvailability(schema);

    const schemaId = getSchemaIdFromReference(schema);
    if (schemaId == null) {
        throw new Error(`Invalid schema reference ${JSON.stringify(schema)}`);
    }

    return Schema.reference({
        // TODO(dsinghvi): references may contain files
        generatedName,
        nameOverride,
        schema: schemaId,
        description: description ?? undefined,
        availability,
        groupName: undefined
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

function maybeInjectDescriptionOrGroupName(
    schema: SchemaWithExample,
    description: string | undefined,
    groupName: string[] | undefined
): SchemaWithExample {
    if (schema.type === "reference") {
        return SchemaWithExample.reference({
            ...schema,
            description,
            groupName
        });
    } else if (schema.type === "optional") {
        return SchemaWithExample.optional({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            value: schema.value,
            description,
            availability: schema.availability,
            groupName
        });
    } else if (schema.type === "nullable") {
        return SchemaWithExample.nullable({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            value: schema.value,
            description,
            availability: schema.availability,
            groupName
        });
    }
    return schema;
}

// isValidAllOfObject returns true if the given allOf is a valid object according to the following:
//  (1): The allOf is a reference object
//  (2): The allOf specifies 'type: object'
//  (3): The allOf specifies 'properties'
//  (4): All nested allOf, oneOf, or anyOf types satisfy (1), (2), or (3)
function isValidAllOfObject(allOf: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): boolean {
    if (isReferenceObject(allOf) || allOf.type === "object" || allOf.properties != null) {
        return true;
    }
    if (allOf.allOf != null) {
        return allOf.allOf.every((elem) => isValidAllOfObject(elem));
    }
    if (allOf.oneOf != null) {
        return allOf.oneOf.every((elem) => isValidAllOfObject(elem));
    }
    if (allOf.anyOf != null) {
        return allOf.anyOf.every((elem) => isValidAllOfObject(elem));
    }
    return false;
}

export function wrapLiteral({
    literal,
    wrapAsNullable,
    groupName,
    description,
    availability,
    nameOverride,
    generatedName
}: {
    literal: LiteralSchemaValue;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: string[] | undefined;
    nameOverride: string | undefined;
    generatedName: string;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.literal({
                nameOverride,
                generatedName,
                value: literal,
                description,
                availability,
                groupName
            }),
            groupName,
            description,
            availability
        });
    }
    return SchemaWithExample.literal({
        nameOverride,
        generatedName,
        value: literal,
        groupName,
        description,
        availability
    });
}

export function wrapPrimitive({
    primitive,
    wrapAsNullable,
    groupName,
    description,
    availability,
    generatedName,
    nameOverride
}: {
    primitive: PrimitiveSchemaValueWithExample;
    wrapAsNullable: boolean;
    groupName: string[] | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    nameOverride: string | undefined;
    generatedName: string;
}): SchemaWithExample {
    groupName = typeof groupName === "string" ? [groupName] : groupName;
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.primitive({
                nameOverride,
                generatedName,
                schema: primitive,
                description,
                availability,
                groupName
            }),
            groupName,
            description,
            availability
        });
    }
    return SchemaWithExample.primitive({
        nameOverride,
        generatedName,
        schema: primitive,
        description,
        availability,
        groupName
    });
}

interface DiscriminantProperty {
    discriminant: string;
    schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
}

function getMaybeAllEnumValues({
    schemas
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
    context
}: {
    schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: SchemaParserContext;
}): undefined | DiscriminantProperty {
    const discriminantToVariants: Record<
        string,
        Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>
    > = {};
    for (const schema of schemas) {
        const possibleDiscriminants = getPossibleDiscriminants({ schema, context });
        for (const [property, value] of Object.entries(possibleDiscriminants)) {
            const variants = discriminantToVariants[property];
            if (variants != null) {
                variants[value] = schema;
            } else {
                discriminantToVariants[property] = {
                    [value]: schema
                };
            }
        }
    }
    for (const [discriminant, variants] of Object.entries(discriminantToVariants)) {
        if (Object.keys(variants).length === schemas.length) {
            return {
                discriminant,
                schemas: variants
            };
        }
    }
    return undefined;
}

function getPossibleDiscriminants({
    schema,
    context
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: SchemaParserContext;
}): Record<string, string> {
    const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;
    return getPossibleDiscriminantsForSchemaObject({ schema: resolvedSchema, context });
}

function getPossibleDiscriminantsForSchemaObject({
    schema,
    context
}: {
    schema: OpenAPIV3.SchemaObject;
    context: SchemaParserContext;
}): Record<string, string> {
    const possibleDiscrimimants: Record<string, string> = {};
    if (schema.anyOf != null) {
        for (const elem of schema.anyOf) {
            const possibleDiscriminantsForVariant = getPossibleDiscriminants({
                schema: elem,
                context
            });
            for (const [key, value] of Object.entries(possibleDiscriminantsForVariant ?? {})) {
                possibleDiscrimimants[key] = value;
            }
        }
        return possibleDiscrimimants;
    }
    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
        const resolvedPropertySchema = isReferenceObject(propertySchema)
            ? context.resolveSchemaReference(propertySchema)
            : propertySchema;
        if (
            resolvedPropertySchema.type === "string" &&
            resolvedPropertySchema.enum != null &&
            isListOfStrings(resolvedPropertySchema.enum) &&
            getEnumSet(resolvedPropertySchema.enum).length === 1 &&
            resolvedPropertySchema.enum[0] != null
        ) {
            possibleDiscrimimants[propertyName] = resolvedPropertySchema.enum[0];
        }

        const maybeConstValue = getProperty<string>(resolvedPropertySchema, "const");
        if (resolvedPropertySchema.type === "string" && maybeConstValue != null) {
            possibleDiscrimimants[propertyName] = maybeConstValue;
        }

        // assuming that if a type property on the object exists and has an example then it could be the discriminant
        if (propertyName === "type" && resolvedPropertySchema.example != null) {
            possibleDiscrimimants[propertyName] = resolvedPropertySchema.example;
        }
    }
    return possibleDiscrimimants;
}

// getEnumSet reduces the list of enums values into a set and
// removes duplicate variants (e.g. "foo" and "FOO"). This helps
// to generate a discriminated union, where an undiscriminated
// union would otherwise be required.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEnumSet(enums: any[] | undefined): any[] {
    if (!enums) {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const set = new Set<any>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enums.forEach((item: any) => {
        if (typeof item === "string") {
            set.add(item.toLowerCase());
        } else {
            set.add(item);
        }
    });

    return Array.from(set);
}

export function getProperty<T>(object: object, property: string): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extensionValue = (object as any)[property];
    if (extensionValue != null) {
        return extensionValue as T;
    }
    return undefined;
}
