import { LiteralSchemaValue, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import {
    NamedFullExample,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
import { isEqual } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getExtension } from "../extensions/getExtension";
import { getFernEnum } from "../extensions/getFernEnum";
import { getFernTypeExtension } from "../extensions/getFernTypeExtension";
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
        return convertSchemaObject(
            schema,
            wrapAsNullable,
            context,
            breadcrumbs,
            propertiesToExclude,
            referencedAsRequest
        );
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
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(breadcrumbs),
            value: referenceSchema,
            description: undefined,
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
    context: AbstractOpenAPIV3ParserContext,
    breadcrumbs: string[],
    propertiesToExclude: Set<string> = new Set(),
    referencedAsRequest = false
): SchemaWithExample {
    const nameOverride = getExtension<string>(schema, FernOpenAPIExtension.TYPE_NAME) ?? getTitleAsName(schema.title);
    const groupName = getExtension<string>(schema, FernOpenAPIExtension.SDK_GROUP_NAME);
    const generatedName = getGeneratedTypeName(breadcrumbs);
    const description = schema.description;

    const examples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(schema, OpenAPIExtension.EXAMPLES);
    const fullExamples: NamedFullExample[] = [];
    if (schema.example != null) {
        fullExamples.push({ name: undefined, value: schema.example });
    }
    if (examples != null && Object.keys(examples).length > 0) {
        fullExamples.push(
            ...Object.entries(examples).map(([name, value]) => {
                return { name: value.summary ?? name, value: value.value };
            })
        );
    }

    const fernSchema = getFernTypeExtension({ schema, description, nameOverride, generatedName });
    if (fernSchema != null) {
        return fernSchema;
    }

    // if a schema is null then we should wrap it as nullable
    if (!wrapAsNullable && schema.nullable === true) {
        return convertSchemaObject(schema, true, context, breadcrumbs);
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
                    minLength: undefined,
                    maxLength: undefined,
                    example: getExamplesString(schema)
                }),
                groupName,
                wrapAsNullable,
                description
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
                groupName
            });
        }

        return convertEnum({
            nameOverride,
            generatedName,
            fernEnum,
            enumVarNames: getExtension<string[]>(schema, [OpenAPIExtension.ENUM_VAR_NAMES]),
            enumValues: schema.enum,
            description,
            wrapAsNullable,
            groupName
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
                    propertiesToExclude
                ),
                groupName,
                description: schema.description
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
                    propertiesToExclude
                ),
                groupName,
                description: schema.description
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
                groupName
            });
        }
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.boolean({
                example: getExampleAsBoolean(schema)
            }),
            wrapAsNullable,
            description,
            groupName
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({
            nameOverride,
            generatedName,
            format: schema.format,
            description,
            wrapAsNullable,
            example: getExampleAsNumber(schema),
            groupName
        });
    }
    if (schema === "integer" || schema.type === "integer") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.int({
                example: getExampleAsNumber(schema)
            }),
            wrapAsNullable,
            description,
            groupName
        });
    }
    if (schema === "string" || schema.type === "string") {
        if (schema.format === "date-time") {
            return wrapPrimitive({
                nameOverride,
                generatedName,
                primitive: PrimitiveSchemaValueWithExample.datetime({
                    example: getExamplesString(schema)
                }),
                wrapAsNullable,
                description,
                groupName
            });
        } else if (schema.format === "json-string") {
            return SchemaWithExample.unknown({
                nameOverride,
                generatedName,
                description,
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
                groupName
            });
        }

        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.string({
                maxLength: schema.maxLength,
                minLength: schema.minLength,
                example: getExamplesString(schema)
            }),
            groupName,
            wrapAsNullable,
            description
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
            wrapAsNullable,
            context,
            groupName
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
            wrapAsNullable,
            context,
            groupName
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
            groupName
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
                wrapAsNullable,
                context,
                groupName
            });
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
                    description,
                    wrapAsNullable,
                    groupName
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
                    return convertSchema(secondSchema, true, context, breadcrumbs);
                } else if (!isReferenceObject(secondSchema) && (secondSchema.type as unknown) === "null") {
                    return convertSchema(firstSchema, true, context, breadcrumbs);
                }
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
        // convert a singular allOf as a reference or inlined schema
        if (schema.allOf != null) {
            const maybeSingularAllOf = getSingularAllOf({ properties: schema.properties ?? {}, allOf: schema.allOf });
            if (maybeSingularAllOf != null) {
                const convertedSchema = convertSchema(
                    maybeSingularAllOf,
                    wrapAsNullable,
                    context,
                    breadcrumbs,
                    referencedAsRequest
                );
                return maybeInjectDescriptionOrGroupName(convertedSchema, description, groupName);
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
            groupName,
            fullExamples
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            nameOverride,
            generatedName,
            description,
            wrapAsNullable,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                description: undefined,
                schema: PrimitiveSchemaValueWithExample.string({
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                }),
                groupName
            },
            valueSchema: SchemaWithExample.unknown({
                nameOverride: undefined,
                generatedName: `${generatedName}Value`,
                description: undefined,
                example: undefined,
                groupName
            }),
            groupName
        });
    }

    if (schema.type == null) {
        const inferredValue = schema.example ?? schema.default;
        return SchemaWithExample.unknown({
            nameOverride,
            generatedName,
            description,
            groupName,
            example: inferredValue
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
    groupName: string | undefined
): SchemaWithExample {
    if (schema.type === "reference") {
        return Schema.reference({
            ...schema,
            description,
            groupName
        });
    } else if (schema.type === "optional" && schema.value.type === "reference") {
        return SchemaWithExample.optional({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            value: Schema.reference({
                ...schema.value
            }),
            description,
            groupName
        });
    } else if (schema.type === "nullable" && schema.value.type === "reference") {
        return SchemaWithExample.nullable({
            nameOverride: schema.nameOverride,
            generatedName: schema.generatedName,
            value: Schema.reference({
                ...schema.value
            }),
            description,
            groupName
        });
    }
    return schema;
}

function getSingularAllOf({
    properties,
    allOf
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
    groupName,
    description,
    nameOverride,
    generatedName
}: {
    literal: LiteralSchemaValue;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: string | undefined;
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
                groupName
            }),
            groupName,
            description
        });
    }
    return SchemaWithExample.literal({
        nameOverride,
        generatedName,
        value: literal,
        groupName,
        description
    });
}

export function wrapPrimitive({
    primitive,
    wrapAsNullable,
    groupName,
    description,
    generatedName,
    nameOverride
}: {
    primitive: PrimitiveSchemaValueWithExample;
    wrapAsNullable: boolean;
    groupName: string | undefined;
    description: string | undefined;
    nameOverride: string | undefined;
    generatedName: string;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.primitive({
                nameOverride,
                generatedName,
                schema: primitive,
                description,
                groupName
            }),
            groupName,
            description
        });
    }
    return SchemaWithExample.primitive({
        nameOverride,
        generatedName,
        schema: primitive,
        description,
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

        // assuming that if a type property on the object exists and has an example then it could be the discriminant
        if (propertyName === "type" && resolvedPropertySchema.example != null) {
            possibleDiscrimimants[propertyName] = resolvedPropertySchema.example;
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
