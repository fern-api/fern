import { size } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

import { Logger } from "@fern-api/logger";
import {
    Availability,
    Encoding,
    LiteralSchemaValue,
    NamedFullExample,
    PrimitiveSchemaValueWithExample,
    ReferencedSchema,
    Schema,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";

import { getExtension } from "../getExtension";
import { OpenAPIExtension } from "../openapi/v3/extensions/extensions";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { getExamples } from "../openapi/v3/extensions/getExamples";
import { getFernEncoding } from "../openapi/v3/extensions/getFernEncoding";
import { getFernEnum } from "../openapi/v3/extensions/getFernEnum";
import { getFernTypeExtension } from "../openapi/v3/extensions/getFernTypeExtension";
import { getValueIfBoolean } from "../utils/getValue";
import { SchemaParserContext } from "./SchemaParserContext";
import { convertAdditionalProperties, wrapMap } from "./convertAdditionalProperties";
import { convertArray } from "./convertArray";
import { convertAvailability } from "./convertAvailability";
import { convertDiscriminatedOneOf, convertDiscriminatedOneOfWithVariants } from "./convertDiscriminatedOneOf";
import { convertEncoding } from "./convertEncoding";
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
    source: Source,
    namespace: string | undefined,
    referencedAsRequest = false,
    propertiesToExclude: Set<string> = new Set(),
    fallback?: string | number | boolean | unknown[]
): SchemaWithExample {
    const encoding = getEncoding({ schema, logger: context.logger });
    if (isReferenceObject(schema)) {
        const schemaId = getSchemaIdFromReference(schema);
        if (schemaId != null) {
            if (!referencedAsRequest) {
                context.markSchemaAsReferencedByNonRequest(schemaId);
            } else {
                context.markSchemaAsReferencedByRequest(schemaId);
            }
            return convertReferenceObject(schema, wrapAsNullable, context, breadcrumbs, encoding, source, namespace);
        }
        // if the schema id is null, we should convert the entire schema and inline it
        // in the OpenAPI IR
        return convertSchemaObject(
            context.resolveSchemaReference(schema),
            wrapAsNullable,
            context,
            getBreadcrumbsFromReference(schema.$ref),
            encoding,
            source,
            namespace,
            propertiesToExclude,
            referencedAsRequest,
            fallback
        );
    }
    return convertSchemaObject(
        schema,
        wrapAsNullable,
        context,
        breadcrumbs,
        encoding,
        source,
        namespace,
        propertiesToExclude,
        referencedAsRequest,
        fallback
    );
}

export function convertReferenceObject(
    schema: OpenAPIV3.ReferenceObject,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    encoding: Encoding | undefined,
    source: Source,
    namespace: string | undefined
): SchemaWithExample {
    const referenceSchema = schema.$ref.includes("properties")
        ? convertSchemaObject(
              context.resolveSchemaReference(schema),
              wrapAsNullable,
              context,
              breadcrumbs,
              encoding,
              source,
              namespace,
              new Set()
          )
        : SchemaWithExample.reference(
              convertToReferencedSchema(schema, breadcrumbs, source, context.options.preserveSchemaIds)
          );
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            title: undefined,
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(breadcrumbs, context.options.preserveSchemaIds),
            value: referenceSchema,
            description: undefined,
            availability: undefined,
            groupName: undefined,
            inline: undefined
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
    schema: OpenAPIV3.SchemaObject | string,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    encoding: Encoding | undefined,
    source: Source,
    namespace: string | undefined,
    propertiesToExclude: Set<string> = new Set(),
    referencedAsRequest = false,
    fallback?: string | number | boolean | unknown[]
): SchemaWithExample {
    if (typeof schema === "string") {
        schema = { type: schema } as OpenAPIV3.SchemaObject;
    }
    const nameOverride =
        getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME) ??
        (context.options.useTitlesAsName ? getTitleAsName(schema.title) : undefined);
    const mixedGroupName =
        getExtension(schema, FernOpenAPIExtension.SDK_GROUP_NAME) ??
        getExtension<string[]>(schema, OpenAPIExtension.TAGS)?.[0];
    let groupName: SdkGroupName = (typeof mixedGroupName === "string" ? [mixedGroupName] : mixedGroupName) ?? [];
    groupName = context.resolveGroupName(groupName);

    const generatedName = getGeneratedTypeName(breadcrumbs, context.options.preserveSchemaIds);
    const title = schema.title;
    const description = schema.description;
    const availability = convertAvailability(schema);

    const fullExamples: NamedFullExample[] = [];
    if (schema.example != null) {
        fullExamples.push({ name: undefined, value: schema.example, description: undefined });
    }

    const xExamples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(schema, OpenAPIExtension.EXAMPLES);
    if (xExamples != null && Object.keys(xExamples).length > 0) {
        fullExamples.push(
            ...Object.entries(xExamples).map(([name, value]) => {
                return { name: value?.summary ?? name, value: value.value, description: value.description };
            })
        );
    }

    const examples = getExamples(schema);
    if (examples != null && Object.keys(examples).length > 0) {
        fullExamples.push(
            ...examples.map((value) => {
                return { name: undefined, value, description: undefined };
            })
        );
    }

    const fernSchema = getFernTypeExtension({ schema, description, title, nameOverride, generatedName, availability });
    if (fernSchema != null) {
        return fernSchema;
    }

    // handle type array
    if (Array.isArray(schema.type)) {
        const nullIndex = schema.type.indexOf("null");
        const hasNull = nullIndex !== -1;
        if (schema.type.length === 1) {
            schema.type = schema.type[0];
        } else if (schema.type.length === 2 && hasNull) {
            schema.type.splice(nullIndex, 1);
            schema.type = schema.type[0];
            schema.nullable = true;
        } else {
            if (hasNull) {
                schema.type.splice(nullIndex, 1);
                schema.nullable = true;
            }
            if (schema.oneOf == null) {
                schema.oneOf = schema.type;
            } else {
                schema.oneOf.push(...schema.type);
            }
        }
    }

    // if a schema is null then we should wrap it as nullable
    if (!wrapAsNullable && schema.nullable === true) {
        return convertSchemaObject(
            schema,
            true,
            context,
            breadcrumbs,
            encoding,
            source,
            namespace,
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
                title,
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
                title,
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
            title,
            fernEnum,
            enumVarNames: getExtension<string[]>(schema, [OpenAPIExtension.ENUM_VAR_NAMES]),
            enumValues: schema.enum,
            _default: schema.default,
            description,
            availability,
            wrapAsNullable,
            groupName,
            context,
            source,
            inline: undefined
        });
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
            title,
            breadcrumbs,
            description,
            availability,
            wrapAsNullable,
            context,
            subtypes,
            groupName,
            encoding,
            source,
            namespace
        });
    }

    // primitive types
    if (schema.type === "boolean") {
        const literalValue = getExtension<boolean>(schema, FernOpenAPIExtension.BOOLEAN_LITERAL);
        if (literalValue != null) {
            return wrapLiteral({
                nameOverride,
                generatedName,
                title,
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
            title,
            primitive: PrimitiveSchemaValueWithExample.boolean({
                default: getBooleanFromDefault(schema.default),
                example: getExampleAsBoolean({ schema, logger: context.logger, fallback })
            }),
            wrapAsNullable,
            description,
            availability,
            groupName
        });
    }

    if (schema.type === "number") {
        return convertNumber({
            nameOverride,
            generatedName,
            title,
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
    if (schema.type === "integer") {
        return convertInteger({
            nameOverride,
            generatedName,
            title,
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
    if ((schema.type as string) === "float") {
        return convertNumber({
            nameOverride,
            generatedName,
            title,
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
    if (schema.type === "string") {
        if (schema.format === "date-time") {
            return wrapPrimitive({
                nameOverride,
                generatedName,
                title,
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
                title,
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
                title,
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
            title,
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
            title,
            breadcrumbs,
            item: schema.items,
            description,
            availability,
            wrapAsNullable,
            context,
            groupName,
            example: getExampleAsArray({ schema, logger: context.logger, fallback }),
            source,
            namespace
        });
    }

    // maps
    if (schema.additionalProperties != null && schema.additionalProperties !== false && hasNoProperties(schema)) {
        return convertAdditionalProperties({
            nameOverride,
            generatedName,
            title,
            breadcrumbs,
            additionalProperties: schema.additionalProperties,
            description,
            availability,
            wrapAsNullable,
            context,
            groupName,
            encoding,
            example: schema.example,
            source,
            namespace
        });
    }

    if (schema.type === "object" && schema.discriminator != null && schema.discriminator.mapping != null) {
        if (!context.options.discriminatedUnionV2) {
            return convertDiscriminatedOneOf({
                nameOverride,
                generatedName,
                title,
                breadcrumbs,
                description,
                availability,
                discriminator: schema.discriminator,
                properties: schema.properties ?? {},
                required: schema.required,
                wrapAsNullable,
                context,
                groupName,
                encoding,
                source,
                namespace
            });
        } else {
            return convertUndiscriminatedOneOfWithDiscriminant({
                nameOverride,
                generatedName,
                title,
                description,
                availability,
                wrapAsNullable,
                context,
                groupName,
                discriminator: schema.discriminator,
                encoding,
                source,
                namespace
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
                    title,
                    description,
                    availability,
                    wrapAsNullable,
                    context,
                    groupName,
                    discriminator: schema.discriminator,
                    encoding,
                    source,
                    namespace
                });
            } else {
                return convertDiscriminatedOneOf({
                    nameOverride,
                    generatedName,
                    title,
                    breadcrumbs,
                    description,
                    availability,
                    discriminator: schema.discriminator,
                    properties: schema.properties ?? {},
                    required: schema.required,
                    wrapAsNullable,
                    context,
                    groupName,
                    encoding,
                    source,
                    namespace
                });
            }
        } else if (schema.oneOf.length === 1 && schema.oneOf[0] != null) {
            const convertedSchema = convertSchema(
                schema.oneOf[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                source,
                namespace,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        } else if (schema.oneOf.length > 1) {
            if (schema.oneOf.length === 2 && schema.oneOf[0] != null && schema.oneOf[1] != null) {
                const firstSchema = schema.oneOf[0];
                const secondSchema = schema.oneOf[1];
                if (!isReferenceObject(firstSchema) && (firstSchema.type as string) === "null") {
                    return convertSchema(secondSchema, true, context, breadcrumbs, source, namespace);
                } else if (!isReferenceObject(secondSchema) && (secondSchema.type as string) === "null") {
                    return convertSchema(firstSchema, true, context, breadcrumbs, source, namespace);
                }
            }

            const maybeAllEnumValues = getMaybeAllEnumValues({ schemas: schema.oneOf });
            if (maybeAllEnumValues != null) {
                return convertEnum({
                    nameOverride,
                    generatedName,
                    title,
                    fernEnum: undefined,
                    enumVarNames: undefined,
                    enumValues: maybeAllEnumValues,
                    _default: schema.default,
                    description,
                    availability,
                    wrapAsNullable,
                    groupName,
                    context,
                    source,
                    inline: undefined
                });
            }

            const maybeDiscriminant = getDiscriminant({ schemas: schema.oneOf, context });
            if (maybeDiscriminant != null && !context.options.discriminatedUnionV2 && !isUndiscriminated) {
                return convertDiscriminatedOneOfWithVariants({
                    nameOverride,
                    generatedName,
                    title,
                    breadcrumbs,
                    properties: schema.properties ?? {},
                    required: schema.required,
                    description,
                    availability,
                    wrapAsNullable,
                    discriminant: maybeDiscriminant.discriminant,
                    variants: maybeDiscriminant.schemas,
                    context,
                    groupName,
                    encoding,
                    source,
                    namespace
                });
            }

            const hasNullValue =
                schema.oneOf.filter((schema) => {
                    return !isReferenceObject(schema) && (schema.type as string) === "null";
                }).length > 0;
            return convertUndiscriminatedOneOf({
                nameOverride,
                generatedName,
                title,
                breadcrumbs,
                description,
                availability,
                wrapAsNullable: wrapAsNullable || hasNullValue,
                context,
                subtypes: schema.oneOf.filter((schema) => {
                    return isReferenceObject(schema) || (schema.type as string) !== "null";
                }),
                encoding,
                groupName,
                source,
                namespace
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
                source,
                namespace,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        }

        if (schema.anyOf.length === 2) {
            const [firstSchema, secondSchema] = schema.anyOf;
            if (firstSchema != null && secondSchema != null) {
                if (!isReferenceObject(firstSchema) && (firstSchema.type as unknown) === "null") {
                    const convertedSchema = convertSchema(secondSchema, true, context, breadcrumbs, source, namespace);
                    return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
                } else if (!isReferenceObject(secondSchema) && (secondSchema.type as unknown) === "null") {
                    const convertedSchema = convertSchema(firstSchema, true, context, breadcrumbs, source, namespace);
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
                title,
                breadcrumbs,
                properties: schema.properties ?? {},
                required: schema.required,
                description,
                availability,
                wrapAsNullable,
                discriminant: maybeDiscriminant.discriminant,
                variants: maybeDiscriminant.schemas,
                context,
                groupName,
                encoding,
                source,
                namespace
            });
        }

        const hasNullValue =
            schema.anyOf.filter((schema) => {
                return !isReferenceObject(schema) && (schema.type as string) === "null";
            }).length > 0;
        return convertUndiscriminatedOneOf({
            nameOverride,
            generatedName,
            title,
            breadcrumbs,
            description,
            availability,
            wrapAsNullable: wrapAsNullable || hasNullValue,
            context,
            subtypes: schema.anyOf.filter((schema) => {
                return isReferenceObject(schema) || (schema.type as string) !== "null";
            }),
            encoding,
            groupName,
            source,
            namespace
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
            (schema.properties == null || hasNoProperties(schema)) &&
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
                source,
                namespace,
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
            (schema.properties == null || hasNoProperties(schema)) &&
            filteredAllOfObjects.length === 1 &&
            filteredAllOfObjects[0] != null
        ) {
            // Try to short-circuit again.
            const convertedSchema = convertSchema(
                filteredAllOfObjects[0],
                wrapAsNullable,
                context,
                breadcrumbs,
                source,
                namespace,
                referencedAsRequest
            );
            return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
        }

        return convertObject({
            nameOverride,
            generatedName,
            title,
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
            availability,
            encoding,
            source,
            namespace
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            nameOverride,
            generatedName,
            title,
            description,
            availability,
            wrapAsNullable,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                title: undefined,
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
                title: undefined,
                description: undefined,
                availability: undefined,
                example: undefined,
                groupName
            }),
            groupName,
            encoding,
            example: schema.example
        });
    }

    if (schema.type == null) {
        const inferredValue = schema.example ?? schema.default;
        return SchemaWithExample.unknown({
            nameOverride,
            generatedName,
            title,
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

function getBooleanFromDefault(defaultValue: unknown): boolean | undefined {
    if (defaultValue == null) {
        return undefined;
    }
    if (typeof defaultValue === "boolean") {
        return defaultValue;
    }
    if (typeof defaultValue === "string") {
        const lowercased = defaultValue.toLowerCase();
        if (lowercased === "true") {
            return true;
        }
        if (lowercased === "false") {
            return false;
        }
    }
    return undefined;
}

export function getSchemaIdFromReference(ref: OpenAPIV3.ReferenceObject): string | undefined {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        return undefined;
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}

export function convertToReferencedSchema(
    schema: OpenAPIV3.ReferenceObject,
    breadcrumbs: string[],
    source: Source,
    preserveSchemaIds: boolean
): ReferencedSchema {
    const nameOverride = getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME);
    const generatedName = getGeneratedTypeName(breadcrumbs, preserveSchemaIds);
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
        title: undefined,
        schema: schemaId,
        description: description ?? undefined,
        availability,
        groupName: undefined,
        source
    });
}

function hasNoOneOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.oneOf == null || schema.oneOf.length === 0;
}

function hasNoAllOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.allOf == null || schema.allOf.length === 0;
}

function hasNoProperties(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.properties == null || size(schema.properties) === 0;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}

function maybeInjectDescriptionOrGroupName(
    schema: SchemaWithExample,
    description: string | undefined,
    groupName: SdkGroupName | undefined
): SchemaWithExample {
    if (schema.type === "reference") {
        return SchemaWithExample.reference({
            ...schema,
            description,
            availability: schema.availability,
            groupName
        });
    } else if (schema.type === "optional") {
        return SchemaWithExample.optional({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            title: schema.title,
            value: schema.value,
            description,
            availability: schema.availability,
            groupName,
            inline: undefined
        });
    } else if (schema.type === "nullable") {
        return SchemaWithExample.nullable({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            title: schema.title,
            value: schema.value,
            description,
            availability: schema.availability,
            groupName,
            inline: undefined
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
    generatedName,
    title
}: {
    literal: LiteralSchemaValue;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: SdkGroupName | undefined;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.literal({
                nameOverride,
                generatedName,
                title,
                value: literal,
                description,
                availability,
                groupName
            }),
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    return SchemaWithExample.literal({
        nameOverride,
        generatedName,
        title,
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
    nameOverride,
    title
}: {
    primitive: PrimitiveSchemaValueWithExample;
    wrapAsNullable: boolean;
    groupName: SdkGroupName | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
}): SchemaWithExample {
    groupName = typeof groupName === "string" ? [groupName] : groupName;
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.primitive({
                nameOverride,
                generatedName,
                title,
                schema: primitive,
                description,
                availability,
                groupName
            }),
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    return SchemaWithExample.primitive({
        nameOverride,
        generatedName,
        title,
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

function getEncoding({
    schema,
    logger
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    logger: Logger;
}): Encoding | undefined {
    const encoding = getFernEncoding({ schema, logger });
    if (encoding == null) {
        return undefined;
    }
    return convertEncoding(encoding);
}
