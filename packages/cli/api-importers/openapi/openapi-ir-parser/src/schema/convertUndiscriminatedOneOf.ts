import {
    Availability,
    convertNumberToSnakeCase,
    Encoding,
    isSchemaEqual,
    LiteralSchemaValue,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";
import { difference } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { convertEnum } from "./convertEnum";
import { convertReferenceObject, convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
import { getGeneratedTypeName } from "./utils/getSchemaName";
import { isReferenceObject } from "./utils/isReferenceObject";

export interface UndiscriminatedOneOfSuffixNotFound {
    type: "notFound";
}

export interface UndiscriminatedOneOfSuffixName {
    type: "name";
    name: string;
}

export type UndiscriminatedOneOfSuffix = UndiscriminatedOneOfSuffixName | UndiscriminatedOneOfSuffixNotFound;

export function constructUndiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
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
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    subtypes: SchemaWithExample[];
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
    subtypeSuffixOverrides?: UndiscriminatedOneOfSuffix[];
}): SchemaWithExample {
    const uniqueSubtypes = deduplicateSubtypes(subtypes);
    return processSubtypes({
        uniqueSubtypes,
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        namespace,
        groupName,
        context,
        encoding,
        source
    });
}

export function convertUndiscriminatedOneOf({
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
    source,
    subtypeSuffixOverrides
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
    subtypeSuffixOverrides?: UndiscriminatedOneOfSuffix[];
}): SchemaWithExample {
    const derivedSubtypeSuffixes = getUniqueSubTypeNames({ schemas: subtypes });

    const convertedSubtypes = subtypes.flatMap((schema, index) => {
        if (
            !isReferenceObject(schema) &&
            schema.enum != null &&
            context.options.coerceEnumsToLiterals &&
            schema.type === "string"
        ) {
            return schema.enum.map((enumValue) => {
                return SchemaWithExample.literal({
                    nameOverride: undefined,
                    generatedName: getGeneratedTypeName([generatedName, enumValue], context.options.preserveSchemaIds),
                    title: undefined,
                    value: LiteralSchemaValue.string(String(enumValue)),
                    namespace,
                    groupName: undefined,
                    description: undefined,
                    availability: enumValue.availability
                });
            });
        }
        let subtypeSuffix = derivedSubtypeSuffixes[index];
        if (subtypeSuffixOverrides != null) {
            const override = subtypeSuffixOverrides[index];
            if (override != null && "name" in override) {
                subtypeSuffix = override.name;
            }
        }
        return [
            convertSchema(
                schema,
                false,
                false,
                context,
                [...breadcrumbs, subtypeSuffix ?? `${index}`],
                source,
                namespace
            )
        ];
    });

    const uniqueSubtypes = deduplicateSubtypes(convertedSubtypes);
    return processSubtypes({
        uniqueSubtypes,
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        namespace,
        groupName,
        context,
        encoding,
        source
    });
}

function deduplicateSubtypes(subtypes: SchemaWithExample[]): SchemaWithExample[] {
    const uniqueSubtypes: SchemaWithExample[] = [];
    for (let i = 0; i < subtypes.length; ++i) {
        const a = subtypes[i];
        let isDuplicate = false;
        for (let j = i + 1; j < subtypes.length; ++j) {
            const b = subtypes[j];
            if (a != null && b != null && isSchemaEqual(a, b)) {
                isDuplicate = true;
                break;
            }
        }
        if (a != null && !isDuplicate) {
            uniqueSubtypes.push(a);
        }
    }
    return uniqueSubtypes;
}

function processSubtypes({
    uniqueSubtypes,
    nameOverride,
    generatedName,
    title,
    wrapAsOptional,
    wrapAsNullable,
    description,
    availability,
    namespace,
    groupName,
    context,
    encoding,
    source
}: {
    uniqueSubtypes: SchemaWithExample[];
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    context: SchemaParserContext;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const everySubTypeIsLiteral = Object.entries(uniqueSubtypes).every(([_, schema]) => {
        return schema.type === "literal";
    });
    if (everySubTypeIsLiteral) {
        const enumDescriptions: Record<string, { description: string }> = {};
        const enumValues: string[] = [];
        Object.entries(uniqueSubtypes).forEach(([_, schema]) => {
            if (schema.type === "literal" && schema.value.type === "string") {
                enumValues.push(schema.value.value);
                if (schema.description != null) {
                    enumDescriptions[schema.value.value] = {
                        description: schema.description
                    };
                }
            }
        });
        return convertEnum({
            nameOverride,
            generatedName,
            title,
            wrapAsOptional,
            wrapAsNullable,
            description,
            availability,
            fernEnum: enumDescriptions,
            enumVarNames: undefined,
            enumValues,
            _default: undefined,
            namespace,
            groupName,
            context,
            source,
            inline: undefined
        });
    }

    if (uniqueSubtypes.length === 1 && uniqueSubtypes[0] != null && !context.options.preserveSingleSchemaOneOf) {
        let result = uniqueSubtypes[0];
        if (wrapAsNullable) {
            result = SchemaWithExample.nullable({
                nameOverride,
                generatedName,
                title,
                value: result,
                description,
                availability,
                namespace,
                groupName,
                inline: undefined
            });
        }
        if (wrapAsOptional) {
            result = SchemaWithExample.optional({
                nameOverride,
                generatedName,
                title,
                value: result,
                description,
                availability,
                namespace,
                groupName,
                inline: undefined
            });
        }
        return result;
    }

    return wrapUndiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        subtypes: uniqueSubtypes,
        namespace,
        groupName,
        encoding,
        source
    });
}

export function convertUndiscriminatedOneOfWithDiscriminant({
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
    discriminator,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    discriminator: OpenAPIV3.DiscriminatorObject;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const convertedSubtypes = Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema], index) => {
        const subtypeReferenceSchema = {
            $ref: schema
        };
        const subtypeReference = convertReferenceObject(
            subtypeReferenceSchema,
            false,
            false,
            context,
            [schema],
            encoding,
            source,
            namespace
        );
        context.markSchemaWithDiscriminantValue(subtypeReferenceSchema, discriminator.propertyName, discriminantValue);

        // If the reference is an object (which I think it has to be?), add the discriminant value as a property
        if (subtypeReference.type === "object") {
            subtypeReference.properties = {
                [discriminator.propertyName]: SchemaWithExample.literal({
                    nameOverride: undefined,
                    generatedName: getGeneratedTypeName(
                        [generatedName, discriminantValue],
                        context.options.preserveSchemaIds
                    ),
                    title: undefined,
                    value: LiteralSchemaValue.string(discriminantValue),
                    namespace: undefined,
                    groupName: undefined,
                    description: undefined,
                    availability: undefined
                }),
                ...subtypeReference.properties.filter((objectProperty) => {
                    return objectProperty.key !== discriminator.propertyName;
                })
            };
        }

        return subtypeReference;
    });

    const uniqueSubtypes: SchemaWithExample[] = [];
    for (let i = 0; i < convertedSubtypes.length; ++i) {
        const a = convertedSubtypes[i];
        let isDuplicate = false;
        for (let j = i + 1; j < convertedSubtypes.length; ++j) {
            const b = convertedSubtypes[j];
            if (a != null && b != null && isSchemaEqual(a, b)) {
                isDuplicate = true;
                break;
            }
        }
        if (a != null && !isDuplicate) {
            uniqueSubtypes.push(a);
        }
    }

    const everySubTypeIsLiteral = Object.entries(uniqueSubtypes).every(([_, schema]) => {
        return schema.type === "literal";
    });
    if (everySubTypeIsLiteral) {
        const enumDescriptions: Record<string, { description: string }> = {};
        const enumValues: string[] = [];
        Object.entries(uniqueSubtypes).forEach(([_, schema]) => {
            if (schema.type === "literal" && schema.value.type === "string") {
                enumValues.push(schema.value.value);
                if (schema.description != null) {
                    enumDescriptions[schema.value.value] = {
                        description: schema.description
                    };
                }
            }
        });
        return convertEnum({
            nameOverride,
            generatedName,
            title,
            wrapAsOptional,
            wrapAsNullable,
            description,
            availability,
            fernEnum: enumDescriptions,
            enumVarNames: undefined,
            enumValues,
            _default: undefined,
            namespace,
            groupName,
            context,
            source,
            inline: undefined
        });
    }

    if (uniqueSubtypes.length === 1 && uniqueSubtypes[0] != null && !context.options.preserveSingleSchemaOneOf) {
        return uniqueSubtypes[0];
    }

    return wrapUndiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        subtypes: uniqueSubtypes,
        namespace,
        groupName,
        encoding,
        source
    });
}

function getUniqueSubTypeNames({
    schemas
}: {
    schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
}): string[] {
    // computes the unique properties for each object sub type
    let uniquePropertySets: Record<string, string[]> = {};
    let index = 0;
    for (const schema of schemas) {
        if (isReferenceObject(schema)) {
            // pass
        } else if (schema.properties != null && Object.entries(schema.properties).length > 0) {
            const schemaProperties = Object.keys(schema.properties);
            const updatedPropertySets: Record<string, string[]> = {};
            let uniqueSchemaProperties = schemaProperties;
            for (const [key, uniquePropertySet] of Object.entries(uniquePropertySets)) {
                const updatedSet = difference(uniquePropertySet, schemaProperties);
                uniqueSchemaProperties = difference(uniqueSchemaProperties, uniquePropertySet);
                updatedPropertySets[key] = updatedSet;
            }
            updatedPropertySets[index] = uniqueSchemaProperties;
            uniquePropertySets = updatedPropertySets;
        }
        index++;
    }

    // generates prefix for subtype
    const prefixes = schemas.map((_, i) => {
        const propertySet = uniquePropertySets[i];
        if (propertySet != null && propertySet.length > 0) {
            const sortedProperties = propertySet.sort();
            if (sortedProperties[0] != null) {
                return sortedProperties[0];
            }
        }
        return convertNumberToSnakeCase(i) ?? `${i}`;
    });

    return prefixes;
}

export function wrapUndiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    wrapAsOptional,
    wrapAsNullable,
    description,
    availability,
    subtypes,
    namespace,
    groupName,
    encoding,
    source
}: {
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    subtypes: SchemaWithExample[];
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.oneOf(
        OneOfSchemaWithExample.undiscriminated({
            description,
            availability,
            nameOverride,
            generatedName,
            title,
            schemas: subtypes,
            namespace,
            groupName,
            encoding,
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
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    return result;
}
