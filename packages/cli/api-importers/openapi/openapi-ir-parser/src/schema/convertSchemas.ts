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
import { size } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension";
import { OpenAPIExtension } from "../openapi/v3/extensions/extensions";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { getExamples } from "../openapi/v3/extensions/getExamples";
import { getFernEncoding } from "../openapi/v3/extensions/getFernEncoding";
import { getFernEnum } from "../openapi/v3/extensions/getFernEnum";
import { getFernTypeExtension } from "../openapi/v3/extensions/getFernTypeExtension";
import { getSourceExtension } from "../openapi/v3/extensions/getSourceExtension";
import { getValueIfBoolean } from "../utils/getValue";
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
import { SchemaParserContext } from "./SchemaParserContext";
import { getBreadcrumbsFromReference } from "./utils/getBreadcrumbsFromReference";
import { getGeneratedTypeName } from "./utils/getSchemaName";
import { isReferenceObject } from "./utils/isReferenceObject";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";
export const SCHEMA_INLINE_REFERENCE_PREFIX = "#/components/responses/";

function isInlinable(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    context: SchemaParserContext
): boolean {
    const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;

    // Attempt to inline what are effectively primitives, or boxed primitive types
    switch (resolvedSchema.type) {
        case "boolean":
        case "number":
        case "string":
        case "integer":
            return true;
        case "array":
            return isInlinable(resolvedSchema.items, context);
        case "object":
            return false;
        case undefined:
            return false;
        default:
            // TODO(thomas): Handle null literal and type array that is not a SchemaObject and return to the promised land of assertNever
            // return assertNever(resolvedSchema);
            context.logger.warn("Unhandled schema type. Will not inline this schema", JSON.stringify(resolvedSchema));
            return false;
    }
}

function shouldResolveAlias(
    schemaId: string,
    schema: OpenAPIV3.ReferenceObject,
    context: SchemaParserContext
): boolean {
    if (context.options.resolveAliases) {
        // If resolveAliases is an object or true, we should check further
        if (
            typeof context.options.resolveAliases === "object" &&
            context.options.resolveAliases.except?.includes(schemaId)
        ) {
            // If the schema is in the except list, we should not resolve it
            return false;
        }

        return isInlinable(schema, context);
    }
    return false;
}

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsOptional: boolean,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    fileSource: Source,
    namespace: string | undefined,
    referencedAsRequest = false,
    propertiesToExclude: Set<string> = new Set(),
    fallback?: string | number | boolean | unknown[]
): SchemaWithExample {
    const source = getSourceExtension(schema) ?? fileSource;
    const encoding = getEncoding({ schema, logger: context.logger });
    if (isReferenceObject(schema)) {
        const schemaId = getSchemaIdFromReference(schema);
        if (schemaId != null) {
            if (shouldResolveAlias(schemaId, schema, context)) {
                // If the schema is an alias we are configured to inline, we should do that and return immediately.
                // This prevents reference registration which happens below.
                return convertSchemaObject(
                    context.resolveSchemaReference(schema),
                    wrapAsOptional,
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

            if (!referencedAsRequest) {
                context.markSchemaAsReferencedByNonRequest(schemaId);
            } else {
                context.markSchemaAsReferencedByRequest(schemaId);
            }
            return convertReferenceObject(
                schema,
                wrapAsOptional,
                wrapAsNullable,
                context,
                breadcrumbs,
                encoding,
                source,
                namespace
            );
        }
        // if the schema id is null, we should convert the entire schema and inline it
        // in the OpenAPI IR
        return convertSchemaObject(
            context.resolveSchemaReference(schema),
            wrapAsOptional,
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
        wrapAsOptional,
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
    wrapAsOptional: boolean,
    wrapAsNullable: boolean,
    context: SchemaParserContext,
    breadcrumbs: string[],
    encoding: Encoding | undefined,
    source: Source,
    namespace: string | undefined
): SchemaWithExample {
    let result: SchemaWithExample = schema.$ref.includes("properties")
        ? convertSchemaObject(
              context.resolveSchemaReference(schema),
              wrapAsOptional,
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

    // if referenced schema would be found nullable in convertSchemaObject(),
    // wrap it as nullable here
    if (wrapAsNullable === false) {
        const referencedSchema = context.resolveSchemaReference(schema);
        if (
            referencedSchema.nullable === true ||
            (Array.isArray(referencedSchema.type) &&
                referencedSchema.type.length >= 2 &&
                referencedSchema.type.includes("null"))
        ) {
            wrapAsNullable = true;
        }
    }

    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            title: undefined,
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(breadcrumbs, context.options.preserveSchemaIds),
            value: result,
            description: undefined,
            availability: undefined,
            namespace: undefined,
            groupName: undefined,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            title: undefined,
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(breadcrumbs, context.options.preserveSchemaIds),
            value: result,
            description: undefined,
            availability: undefined,
            namespace: undefined,
            groupName: undefined,
            inline: undefined
        });
    }

    return result;
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
    wrapAsOptional: boolean,
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
        let result: SchemaWithExample = fernSchema;
        // we're wrapping optional/nullable here for backwards compat, but ideally, users should include optional/nullable in their `x-fern-type` extension
        // we can add a flag when a customer wants to override this behavior
        if (wrapAsNullable) {
            result = SchemaWithExample.nullable({
                availability,
                namespace,
                groupName,
                description,
                generatedName,
                inline: undefined,
                nameOverride,
                title,
                value: result
            });
        }
        if (wrapAsOptional) {
            result = SchemaWithExample.optional({
                availability,
                namespace,
                groupName,
                description,
                generatedName,
                inline: undefined,
                nameOverride,
                title,
                value: result
            });
        }
        return result;
    }
    try {
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
                    schema.oneOf = [...new Set(schema.type)];
                } else {
                    const uniqueTypes = new Set([...schema.oneOf, ...schema.type]);
                    schema.oneOf = [...uniqueTypes];
                }
            }
        }

        wrapAsNullable = wrapAsNullable || schema.nullable === true;

        // const
        // NOTE(patrickthornton): This is an attribute of OpenAPIV3_1.SchemaObject;
        // at some point we should probably migrate to that object altogether.
        if ("const" in schema) {
            schema.enum = [schema.const];
        }

        // enums
        if (
            schema.enum != null &&
            (schema.type === "string" || schema.type == null || (schema.type as string) === "enum")
        ) {
            // Cut 'null' from enum since functionality is achieved by 'nullable'
            schema.enum = schema.enum.filter((value) => value !== null);

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
                    namespace,
                    groupName,
                    wrapAsOptional,
                    wrapAsNullable,
                    description,
                    availability
                });
            }

            const fernEnum = getFernEnum(schema);

            if (
                context.options.coerceEnumsToLiterals &&
                schema.enum.length === 1 &&
                schema.enum[0] != null &&
                fernEnum == null
            ) {
                return convertLiteral({
                    nameOverride,
                    generatedName,
                    title,
                    wrapAsOptional,
                    wrapAsNullable,
                    value: schema.enum[0],
                    description,
                    availability,
                    namespace,
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
                wrapAsOptional,
                wrapAsNullable,
                namespace,
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
                        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
                wrapAsOptional,
                wrapAsNullable,
                context,
                subtypes,
                namespace,
                groupName,
                encoding,
                source
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
                    wrapAsOptional,
                    wrapAsNullable,
                    description,
                    availability,
                    namespace,
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
                wrapAsOptional,
                wrapAsNullable,
                description,
                availability,
                namespace,
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
                wrapAsOptional,
                wrapAsNullable,
                example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
                namespace,
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
                wrapAsOptional,
                wrapAsNullable,
                example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
                namespace,
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
                wrapAsOptional,
                wrapAsNullable,
                example: getExampleAsNumber({ schema, logger: context.logger, fallback }),
                namespace,
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
                    wrapAsOptional,
                    wrapAsNullable,
                    description,
                    availability,
                    namespace,
                    groupName
                });
            }

            if (schema.format === "date" && context.options.typeDatesAsStrings === false) {
                return wrapPrimitive({
                    nameOverride,
                    generatedName,
                    title,
                    primitive: PrimitiveSchemaValueWithExample.date({
                        example: getExamplesString({ schema, logger: context.logger, fallback })
                    }),
                    wrapAsOptional,
                    wrapAsNullable,
                    description,
                    availability,
                    namespace,
                    groupName
                });
            }

            if (schema.format === "json-string") {
                let result: SchemaWithExample = SchemaWithExample.unknown({
                    nameOverride,
                    generatedName,
                    title,
                    description,
                    availability,
                    namespace,
                    groupName,
                    example: undefined
                });
                if (wrapAsNullable) {
                    result = SchemaWithExample.nullable({
                        availability,
                        namespace,
                        groupName,
                        description,
                        generatedName,
                        inline: undefined,
                        nameOverride,
                        title,
                        value: result
                    });
                }
                if (wrapAsOptional) {
                    result = SchemaWithExample.optional({
                        availability,
                        namespace,
                        groupName,
                        description,
                        generatedName,
                        inline: undefined,
                        nameOverride,
                        title,
                        value: result
                    });
                }
                return result;
            }

            const maybeConstValue = getProperty<string>(schema, "const");
            if (maybeConstValue != null) {
                return wrapLiteral({
                    nameOverride,
                    generatedName,
                    title,
                    literal: LiteralSchemaValue.string(maybeConstValue),
                    wrapAsOptional,
                    wrapAsNullable,
                    description,
                    availability,
                    namespace,
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
                namespace,
                groupName,
                wrapAsOptional,
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
                wrapAsOptional,
                wrapAsNullable,
                context,
                namespace,
                groupName,
                example: getExampleAsArray({ schema, logger: context.logger, fallback }),
                source
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
                wrapAsOptional,
                wrapAsNullable,
                context,
                namespace,
                groupName,
                encoding,
                example: schema.example,
                source
            });
        }

        // handle oneOf with IS_DISCRIMINATED extension
        if (schema.oneOf != null && schema.oneOf.length > 0) {
            const isDiscriminated = getExtension<boolean>(schema, FernOpenAPIExtension.IS_DISCRIMINATED);
            if (isDiscriminated === false) {
                return convertUndiscriminatedOneOf({
                    nameOverride,
                    generatedName,
                    title,
                    breadcrumbs,
                    description,
                    availability,
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    subtypes: schema.oneOf,
                    namespace,
                    groupName,
                    encoding,
                    source
                });
            }
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
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    namespace,
                    groupName,
                    encoding,
                    source
                });
            } else {
                return convertUndiscriminatedOneOfWithDiscriminant({
                    nameOverride,
                    generatedName,
                    title,
                    description,
                    availability,
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    namespace,
                    groupName,
                    discriminator: schema.discriminator,
                    encoding,
                    source
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
                        wrapAsOptional,
                        wrapAsNullable,
                        context,
                        namespace,
                        groupName,
                        discriminator: schema.discriminator,
                        encoding,
                        source
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
                        wrapAsOptional,
                        wrapAsNullable,
                        context,
                        namespace,
                        groupName,
                        encoding,
                        source
                    });
                }
            } else if (schema.oneOf.length === 1 && schema.oneOf[0] != null) {
                if (context.options.preserveSingleSchemaOneOf) {
                    return convertUndiscriminatedOneOf({
                        nameOverride,
                        generatedName,
                        title,
                        breadcrumbs,
                        description,
                        availability,
                        wrapAsOptional,
                        wrapAsNullable,
                        context,
                        subtypes: schema.oneOf.filter((schema) => {
                            return isReferenceObject(schema) || (schema.type as string) !== "null";
                        }),
                        encoding,
                        namespace,
                        groupName,
                        source
                    });
                }
                const convertedSchema = convertSchema(
                    schema.oneOf[0],
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    source,
                    namespace,
                    referencedAsRequest
                );
                return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
            } else if (schema.oneOf.length > 1) {
                if (schema.oneOf.length === 2 && schema.oneOf[0] != null && schema.oneOf[1] != null) {
                    const firstSchema = schema.oneOf[0];
                    const secondSchema = schema.oneOf[1];
                    if (!isReferenceObject(firstSchema) && (firstSchema.type as string) === "null") {
                        const convertedSchema = convertSchema(
                            secondSchema,
                            wrapAsOptional,
                            true,
                            context,
                            breadcrumbs,
                            source,
                            namespace
                        );
                        return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
                    } else if (!isReferenceObject(secondSchema) && (secondSchema.type as string) === "null") {
                        const convertedSchema = convertSchema(
                            firstSchema,
                            wrapAsOptional,
                            true,
                            context,
                            breadcrumbs,
                            source,
                            namespace
                        );
                        return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
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
                        wrapAsOptional,
                        wrapAsNullable,
                        namespace,
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
                        wrapAsOptional,
                        wrapAsNullable,
                        discriminant: maybeDiscriminant.discriminant,
                        variants: maybeDiscriminant.schemas,
                        context,
                        namespace,
                        groupName,
                        encoding,
                        source
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
                    wrapAsOptional: wrapAsOptional,
                    wrapAsNullable: wrapAsNullable || hasNullValue,
                    context,
                    subtypes: schema.oneOf.filter((schema) => {
                        return isReferenceObject(schema) || (schema.type as string) !== "null";
                    }),
                    encoding,
                    namespace,
                    groupName,
                    source
                });
            }
        }

        // treat anyOf as undiscriminated unions
        if (schema.anyOf != null && schema.anyOf.length > 0) {
            if (schema.anyOf.length === 1 && schema.anyOf[0] != null) {
                const convertedSchema = convertSchema(
                    schema.anyOf[0],
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    source,
                    namespace,
                    referencedAsRequest
                );
                return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
            }

            if (schema.anyOf.length === 2) {
                const [firstSchema, secondSchema] = schema.anyOf;
                if (firstSchema != null && secondSchema != null) {
                    if (!isReferenceObject(firstSchema) && (firstSchema.type as unknown) === "null") {
                        const convertedSchema = convertSchema(
                            secondSchema,
                            wrapAsOptional,
                            true,
                            context,
                            breadcrumbs,
                            source,
                            namespace
                        );
                        return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
                    } else if (!isReferenceObject(secondSchema) && (secondSchema.type as unknown) === "null") {
                        const convertedSchema = convertSchema(
                            firstSchema,
                            wrapAsOptional,
                            true,
                            context,
                            breadcrumbs,
                            source,
                            namespace
                        );
                        return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
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
                    wrapAsOptional,
                    wrapAsNullable,
                    discriminant: maybeDiscriminant.discriminant,
                    variants: maybeDiscriminant.schemas,
                    context,
                    namespace,
                    groupName,
                    encoding,
                    source
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
                wrapAsOptional,
                wrapAsNullable: wrapAsNullable || hasNullValue,
                context,
                subtypes: schema.anyOf.filter((schema) => {
                    return isReferenceObject(schema) || (schema.type as string) !== "null";
                }),
                encoding,
                namespace,
                groupName,
                source
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
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    source,
                    namespace,
                    referencedAsRequest
                );
                return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
            }

            // Now that we've handled the single-element allOf case, filter the
            // allOfs down to just the objects.
            const filteredAllOfObjects = filteredAllOfs.filter((allOf) => {
                const valid = isValidAllOfObject(allOf);
                if (!valid) {
                    context.logger.debug(`Skipping non-object allOf element: ${JSON.stringify(allOf)}`);
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
                    wrapAsOptional,
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    source,
                    namespace,
                    referencedAsRequest
                );
                return maybeInjectDescriptionOrGroupName(convertedSchema, description, namespace, groupName);
            }

            return convertObject({
                nameOverride,
                generatedName,
                title,
                breadcrumbs,
                properties: schema.properties ?? {},
                description,
                required: schema.required,
                wrapAsOptional,
                wrapAsNullable,
                allOf: filteredAllOfObjects,
                context,
                propertiesToExclude,
                namespace,
                groupName,
                fullExamples,
                additionalProperties: schema.additionalProperties,
                availability,
                encoding,
                source
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
                wrapAsOptional,
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
                    namespace,
                    groupName
                },
                valueSchema: SchemaWithExample.unknown({
                    nameOverride: undefined,
                    generatedName: `${generatedName}Value`,
                    title: undefined,
                    description: undefined,
                    availability: undefined,
                    example: undefined,
                    namespace,
                    groupName
                }),
                namespace,
                groupName,
                encoding,
                example: schema.example
            });
        }

        if (schema.type != null) {
            context.logger.warn(
                `Failed to parse an OpenAPI schema at the following location: ${breadcrumbs.join("->")}. Coercing to unknown.`
            );
        }

        const inferredValue = schema.example ?? schema.default;
        let result: SchemaWithExample = SchemaWithExample.unknown({
            nameOverride,
            generatedName,
            title,
            description,
            availability,
            namespace,
            groupName,
            example: inferredValue
        });
        if (wrapAsNullable) {
            result = SchemaWithExample.nullable({
                availability,
                namespace,
                groupName,
                description,
                generatedName,
                inline: undefined,
                nameOverride,
                title,
                value: result
            });
        }
        if (wrapAsOptional) {
            result = SchemaWithExample.optional({
                availability,
                namespace,
                groupName,
                description,
                generatedName,
                inline: undefined,
                nameOverride,
                title,
                value: result
            });
        }
        return result;
    } catch (error) {
        context.logger.debug(
            `Error converting schema: ${(error as Error).message}\n Location: ${breadcrumbs.join("-> ")}`
        );
        return SchemaWithExample.unknown({
            nameOverride,
            generatedName,
            title,
            description,
            availability,
            namespace,
            groupName,
            example: undefined
        });
    }
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
        namespace: undefined,
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
    namespace: string | undefined,
    groupName: SdkGroupName | undefined
): SchemaWithExample {
    if (schema.type === "reference") {
        return SchemaWithExample.reference({
            ...schema,
            description,
            availability: schema.availability,
            namespace,
            groupName
        });
    } else if (schema.type === "optional") {
        const innerValue = maybeInjectDescriptionOrGroupName(schema.value, description, namespace, groupName);
        return SchemaWithExample.optional({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            title: schema.title,
            value: innerValue,
            description,
            availability: schema.availability,
            namespace,
            groupName,
            inline: undefined
        });
    } else if (schema.type === "nullable") {
        const innerValue = maybeInjectDescriptionOrGroupName(schema.value, description, namespace, groupName);
        return SchemaWithExample.nullable({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            title: schema.title,
            value: innerValue,
            description,
            availability: schema.availability,
            namespace,
            groupName,
            inline: undefined
        });
    } else if (schema.type === "primitive" && description != null && schema.description == null) {
        return SchemaWithExample.primitive({
            ...schema,
            description
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
    wrapAsOptional,
    wrapAsNullable,
    namespace,
    groupName,
    description,
    availability,
    nameOverride,
    generatedName,
    title
}: {
    literal: LiteralSchemaValue;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.literal({
        nameOverride,
        generatedName,
        title,
        value: literal,
        namespace,
        groupName,
        description,
        availability
    });
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

export function wrapPrimitive({
    primitive,
    wrapAsOptional,
    wrapAsNullable,
    namespace,
    groupName,
    description,
    availability,
    generatedName,
    nameOverride,
    title
}: {
    primitive: PrimitiveSchemaValueWithExample;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
}): SchemaWithExample {
    groupName = typeof groupName === "string" ? [groupName] : groupName;
    let result: SchemaWithExample = SchemaWithExample.primitive({
        nameOverride,
        generatedName,
        title,
        schema: primitive,
        description,
        availability,
        namespace,
        groupName
    });
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
// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
function getEnumSet(enums: any[] | undefined): any[] {
    if (!enums) {
        return [];
    }

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const set = new Set<any>();

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
