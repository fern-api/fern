import {
    Availability,
    LiteralSchemaValue,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName
} from "@fern-api/openapi-ir-sdk";
import { difference } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { convertEnum } from "./convertEnum";
import { convertReferenceObject, convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
import { getGeneratedTypeName } from "./utils/getSchemaName";
import { isReferenceObject } from "./utils/isReferenceObject";
import { isSchemaEqual } from "./utils/isSchemaEqual";
import { convertNumberToSnakeCase } from "./utils/replaceStartingNumber";

export function convertUndiscriminatedOneOf({
    nameOverride,
    generatedName,
    breadcrumbs,
    description,
    availability,
    wrapAsNullable,
    context,
    subtypes,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[];
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    const subtypePrefixes = getUniqueSubTypeNames({ schemas: subtypes });

    const convertedSubtypes = subtypes.flatMap((schema, index) => {
        if (!isReferenceObject(schema) && schema.enum != null) {
            return schema.enum.map((enumValue) => {
                return SchemaWithExample.literal({
                    nameOverride: undefined,
                    generatedName: getGeneratedTypeName([generatedName, enumValue]),
                    value: LiteralSchemaValue.string(enumValue),
                    groupName: undefined,
                    description: undefined,
                    availability: enumValue.availability
                });
            });
        }
        return [convertSchema(schema, false, context, [...breadcrumbs, subtypePrefixes[index] ?? `${index}`])];
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
            wrapAsNullable,
            description,
            availability,
            fernEnum: enumDescriptions,
            enumVarNames: undefined,
            enumValues,
            _default: undefined,
            groupName,
            context
        });
    }

    if (uniqueSubtypes.length === 1 && uniqueSubtypes[0] != null) {
        return uniqueSubtypes[0];
    }

    return wrapUndiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsNullable,
        description,
        availability,
        subtypes: uniqueSubtypes,
        groupName
    });
}

export function convertUndiscriminatedOneOfWithDiscriminant({
    nameOverride,
    generatedName,
    description,
    availability,
    wrapAsNullable,
    context,
    groupName,
    discriminator
}: {
    nameOverride: string | undefined;
    generatedName: string;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    discriminator: OpenAPIV3.DiscriminatorObject;
}): SchemaWithExample {
    const convertedSubtypes = Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema], index) => {
        const subtypeReferenceSchema = {
            $ref: schema
        };
        const subtypeReference = convertReferenceObject(subtypeReferenceSchema, false, context, [schema]);
        context.markSchemaWithDiscriminantValue(subtypeReferenceSchema, discriminator.propertyName, discriminantValue);

        // If the reference is an object (which I think it has to be?), add the discriminant value as a property
        if (subtypeReference.type === "object") {
            subtypeReference.properties = {
                [discriminator.propertyName]: SchemaWithExample.literal({
                    nameOverride: undefined,
                    generatedName: getGeneratedTypeName([generatedName, discriminantValue]),
                    value: LiteralSchemaValue.string(discriminantValue),
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
            wrapAsNullable,
            description,
            availability,
            fernEnum: enumDescriptions,
            enumVarNames: undefined,
            enumValues,
            _default: undefined,
            groupName,
            context
        });
    }

    if (uniqueSubtypes.length === 1 && uniqueSubtypes[0] != null) {
        return uniqueSubtypes[0];
    }

    return wrapUndiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsNullable,
        description,
        availability,
        subtypes: uniqueSubtypes,
        groupName
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
    const prefixes = [];
    let i = 0;
    for (const schema of schemas) {
        const propertySet = uniquePropertySets[i];
        if (propertySet != null && propertySet.length > 0) {
            const sortedProperties = propertySet.sort();
            if (sortedProperties[0] != null) {
                prefixes.push(sortedProperties[0]);
                ++i;
                continue;
            }
        }

        if (isReferenceObject(schema)) {
            prefixes.push(convertNumberToSnakeCase(i) ?? `${i}`);
        } else if (
            schema.type === "array" ||
            schema.type === "boolean" ||
            schema.type === "integer" ||
            schema.type === "number" ||
            schema.type === "string"
        ) {
            prefixes.push("");
        } else {
            prefixes.push(convertNumberToSnakeCase(i) ?? `${i}`);
        }
        ++i;
    }
    return prefixes;
}

export function wrapUndiscriminantedOneOf({
    nameOverride,
    generatedName,
    wrapAsNullable,
    description,
    availability,
    subtypes,
    groupName
}: {
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    description: string | undefined;
    availability: Availability | undefined;
    subtypes: SchemaWithExample[];
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.oneOf(
                OneOfSchemaWithExample.undisciminated({
                    description,
                    availability,
                    nameOverride,
                    generatedName,
                    schemas: subtypes,
                    groupName
                })
            ),
            description,
            availability,
            groupName
        });
    }
    return SchemaWithExample.oneOf(
        OneOfSchemaWithExample.undisciminated({
            description,
            availability,
            nameOverride,
            generatedName,
            schemas: subtypes,
            groupName
        })
    );
}
