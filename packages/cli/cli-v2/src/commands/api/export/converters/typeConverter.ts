import {
    type AliasTypeDeclaration,
    ContainerType,
    type DeclaredTypeName,
    type EnumTypeDeclaration,
    type ExampleEndpointSuccessResponse,
    type ExampleObjectProperty,
    type ExampleRequestBody,
    type ExampleType,
    type PrimitiveType,
    SingleUnionTypeProperties,
    Type,
    type TypeDeclaration,
    TypeReference,
    type UndiscriminatedUnionTypeDeclaration,
    type UnionTypeDeclaration
} from "@fern-api/ir-sdk";
import type { OpenAPIV3 } from "openapi-types";

import { convertObject } from "./convertObject.js";

export interface ConvertedType {
    openApiSchema: OpenApiComponentSchema;
    schemaName: string;
}

export type OpenApiComponentSchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

export interface ExampleLookupMaps {
    requestExamplesByTypeId: Map<string, ExampleRequestBody>;
    responseExamplesByTypeId: Map<string, ExampleEndpointSuccessResponse>;
}

export function convertType(typeDeclaration: TypeDeclaration, exampleLookup: ExampleLookupMaps): ConvertedType {
    const shape = typeDeclaration.shape;
    const docs = typeDeclaration.docs ?? undefined;
    const openApiSchema = Type._visit<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>(shape, {
        alias: (aliasTypeDeclaration) => {
            return convertAlias({ aliasTypeDeclaration, docs });
        },
        enum: (enumTypeDeclaration) => {
            return convertEnum({ enumTypeDeclaration, docs });
        },
        object: (objectTypeDeclaration) => {
            const exampleType: ExampleType | undefined = typeDeclaration.userProvidedExamples[0];
            const exampleTypeFromEndpointRequest =
                exampleType == null
                    ? exampleLookup.requestExamplesByTypeId.get(typeDeclaration.name.typeId)
                    : undefined;
            const exampleTypeFromEndpointResponse =
                exampleType == null && exampleTypeFromEndpointRequest == null
                    ? exampleLookup.responseExamplesByTypeId.get(typeDeclaration.name.typeId)
                    : undefined;

            return convertObject({
                properties: objectTypeDeclaration.properties.map((property) => {
                    let exampleProperty: ExampleObjectProperty | undefined = undefined;
                    if (exampleType != null && exampleType.shape.type === "object") {
                        exampleProperty = exampleType.shape.properties.find((example) => {
                            return example.name.wireValue === property.name.wireValue;
                        });
                    } else if (exampleTypeFromEndpointRequest != null) {
                        if (
                            exampleTypeFromEndpointRequest.type === "reference" &&
                            exampleTypeFromEndpointRequest.shape.type === "named" &&
                            exampleTypeFromEndpointRequest.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointRequest.shape.shape.properties.find((example) => {
                                return example.name.wireValue === property.name.wireValue;
                            });
                        }
                    } else if (
                        exampleTypeFromEndpointResponse != null &&
                        exampleTypeFromEndpointResponse.type === "body"
                    ) {
                        if (
                            exampleTypeFromEndpointResponse.value?.shape.type === "named" &&
                            exampleTypeFromEndpointResponse.value.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointResponse.value.shape.shape.properties.find(
                                (example) => {
                                    return example.name.wireValue === property.name.wireValue;
                                }
                            );
                        }
                    }
                    return {
                        docs: property.docs ?? undefined,
                        name: property.name,
                        valueType: property.valueType,
                        example: exampleProperty
                    };
                }),
                extensions: objectTypeDeclaration.extends,
                docs
            });
        },
        union: (unionTypeDeclaration) => {
            return convertUnion({ unionTypeDeclaration, docs });
        },
        undiscriminatedUnion: (undiscriminatedUnionDeclaration) => {
            return convertUndiscriminatedUnion({ undiscriminatedUnionDeclaration, docs });
        },
        _other: () => {
            throw new Error("Encountered unknown type: " + shape.type);
        }
    });
    return {
        openApiSchema,
        schemaName: getNameFromDeclaredTypeName(typeDeclaration.name)
    };
}

export function convertAlias({
    aliasTypeDeclaration,
    docs
}: {
    aliasTypeDeclaration: AliasTypeDeclaration;
    docs: string | undefined;
}): OpenApiComponentSchema {
    const convertedAliasOf = convertTypeReference(aliasTypeDeclaration.aliasOf);
    return {
        ...convertedAliasOf,
        description: docs
    };
}

export function convertEnum({
    enumTypeDeclaration,
    docs
}: {
    enumTypeDeclaration: EnumTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    return {
        type: "string",
        enum: enumTypeDeclaration.values.map((enumValue) => {
            return enumValue.name.wireValue;
        }),
        description: docs
    };
}

export function convertUnion({
    unionTypeDeclaration,
    docs
}: {
    unionTypeDeclaration: UnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const oneOfTypes: OpenAPIV3.SchemaObject[] = unionTypeDeclaration.types.map((singleUnionType) => {
        const discriminantProperty: OpenAPIV3.BaseSchemaObject["properties"] = {
            [unionTypeDeclaration.discriminant.wireValue]: {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue]
            }
        };
        return SingleUnionTypeProperties._visit<OpenAPIV3.SchemaObject>(singleUnionType.shape, {
            noProperties: () => ({
                type: "object",
                properties: discriminantProperty,
                required: [unionTypeDeclaration.discriminant.wireValue]
            }),
            singleProperty: (singleProperty) => ({
                type: "object",
                properties: {
                    ...discriminantProperty,
                    [singleProperty.name.wireValue]: convertTypeReference(singleProperty.type)
                },
                required: [unionTypeDeclaration.discriminant.wireValue]
            }),
            samePropertiesAsObject: (typeName) => ({
                type: "object",
                allOf: [
                    {
                        type: "object",
                        properties: discriminantProperty
                    },
                    {
                        $ref: getReferenceFromDeclaredTypeName(typeName)
                    }
                ],
                required: [unionTypeDeclaration.discriminant.wireValue]
            }),
            _other: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape.propertiesType);
            }
        });
    });

    const schema: OpenAPIV3.SchemaObject = {
        oneOf: oneOfTypes,
        description: docs
    };

    if (unionTypeDeclaration.baseProperties.length > 0) {
        schema.properties = unionTypeDeclaration.baseProperties.reduce<
            Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>
        >((acc, property) => {
            acc[property.name.wireValue] = {
                description: property.docs ?? undefined,
                ...convertTypeReference(property.valueType)
            };
            if (!(property.valueType.type === "container" && property.valueType.container.type === "optional")) {
                if (schema.required == null) {
                    schema.required = [];
                }
                schema.required.push(property.name.wireValue);
            }
            return acc;
        }, {});
    }

    return schema;
}

export function convertUndiscriminatedUnion({
    undiscriminatedUnionDeclaration,
    docs
}: {
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    return {
        oneOf: undiscriminatedUnionDeclaration.members.map((member) => ({
            description: member.docs ?? undefined,
            ...convertTypeReference(member.type)
        })),
        description: docs
    };
}

export function convertTypeReference(typeReference: TypeReference): OpenApiComponentSchema {
    return TypeReference._visit(typeReference, {
        container: (containerType) => {
            return convertContainerType(containerType);
        },
        named: (declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName)
            };
        },
        primitive: (primitiveType) => {
            return convertPrimitiveType(primitiveType);
        },
        unknown: () => {
            return {};
        },
        _other: () => {
            throw new Error("Encountered unknown typeReference: " + typeReference.type);
        }
    });
}

/** Maps a normalized primitive name to an OpenAPI schema. Accepts both V1 uppercase and V2 lowercase names. */
function basePrimitiveSchema(name: string): OpenAPIV3.NonArraySchemaObject {
    switch (name.toLowerCase()) {
        case "boolean":
            return { type: "boolean" };
        case "date_time":
        case "datetime":
            return { type: "string", format: "date-time" };
        case "double":
            return { type: "number", format: "double" };
        case "integer":
            return { type: "integer" };
        case "long":
            return { type: "integer", format: "int64" };
        case "string":
            return { type: "string" };
        case "uuid":
            return { type: "string", format: "uuid" };
        case "date":
            return { type: "string", format: "date" };
        case "base_64":
        case "base64":
            return { type: "string", format: "byte" };
        case "uint":
        case "uint_64":
        case "uint64":
            return { type: "integer", format: "int64" };
        case "float":
            return { type: "number", format: "float" };
        case "big_integer":
        case "biginteger":
            return { type: "integer", format: "bigint" };
        case "date_time_rfc_2822":
        case "datetimerfc2822":
            return { type: "string", format: "date-time-rfc-2822" };
        default:
            throw new Error("Encountered unknown primitiveType: " + name);
    }
}

function convertPrimitiveType(primitiveType: PrimitiveType): OpenAPIV3.NonArraySchemaObject {
    if (primitiveType.v2 == null) {
        return basePrimitiveSchema(primitiveType.v1);
    }
    const schema = basePrimitiveSchema(primitiveType.v2.type);
    if (primitiveType.v2.type === "string") {
        if (primitiveType.v2.validation?.format != null) {
            schema.format = primitiveType.v2.validation.format;
        }
        if (primitiveType.v2.validation?.pattern != null) {
            schema.pattern = primitiveType.v2.validation.pattern;
        }
    }
    return schema;
}

function convertContainerType(containerType: ContainerType): OpenApiComponentSchema {
    return ContainerType._visit<OpenApiComponentSchema>(containerType, {
        list: (listType) => {
            return {
                type: "array",
                items: convertTypeReference(listType)
            };
        },
        set: (setType) => {
            return {
                type: "array",
                items: convertTypeReference(setType)
            };
        },
        map: (mapType) => {
            if (
                mapType.keyType.type === "primitive" &&
                mapType.keyType.primitive.v1 === "STRING" &&
                mapType.valueType.type === "unknown"
            ) {
                return {
                    type: "object",
                    additionalProperties: true
                };
            }
            return {
                type: "object",
                additionalProperties: convertTypeReference(mapType.valueType)
            };
        },
        optional: (optionalType) => {
            return {
                ...convertTypeReference(optionalType),
                nullable: true
            };
        },
        nullable: (nullableType) => {
            return {
                ...convertTypeReference(nullableType),
                nullable: true
            };
        },
        literal: (literalType) => {
            return literalType._visit({
                boolean: (val) => {
                    return {
                        type: "boolean",
                        const: val
                    };
                },
                string: (val) => {
                    return {
                        type: "string",
                        const: val
                    };
                },
                _other: () => ({})
            });
        },
        _other: () => {
            throw new Error("Encountered unknown containerType: " + containerType.type);
        }
    });
}

export function getReferenceFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return `#/components/schemas/${getNameFromDeclaredTypeName(declaredTypeName)}`;
}

export function getNameFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.packagePath.map((part) => part.originalName),
        declaredTypeName.name.originalName
    ].join("");
}
