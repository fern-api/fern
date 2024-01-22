import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ExampleEndpointSuccessResponse,
    ExampleObjectProperty,
    ExampleRequestBody,
    ExampleType,
    IntermediateRepresentation,
    PrimitiveType,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration,
} from "@fern-fern/ir-sdk/api";
import isEqual from "lodash-es/isEqual";
import { OpenAPIV3 } from "openapi-types";
import { convertObject } from "./convertObject";

export interface ConvertedType {
    openApiSchema: OpenApiComponentSchema;
    schemaName: string;
}

export type OpenApiComponentSchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

export function convertType(typeDeclaration: TypeDeclaration, ir: IntermediateRepresentation): ConvertedType {
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
            const exampleType: ExampleType | undefined = typeDeclaration.examples[0];
            const exampleTypeFromEndpointRequest =
                exampleType == null ? getExampleFromEndpointRequest(ir, typeDeclaration.name) : undefined;
            const exampleTypeFromEndpointResponse =
                exampleType == null && exampleTypeFromEndpointRequest == null
                    ? getExampleFromEndpointResponse(ir, typeDeclaration.name)
                    : undefined;

            return convertObject({
                properties: objectTypeDeclaration.properties.map((property) => {
                    let exampleProperty: ExampleObjectProperty | undefined = undefined;
                    if (exampleType != null && exampleType.shape.type === "object") {
                        exampleProperty = exampleType.shape.properties.find((example) => {
                            return example.wireKey === property.name.wireValue;
                        });
                    } else if (exampleTypeFromEndpointRequest != null) {
                        if (
                            exampleTypeFromEndpointRequest.type === "reference" &&
                            exampleTypeFromEndpointRequest.shape.type === "named" &&
                            exampleTypeFromEndpointRequest.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointRequest.shape.shape.properties.find((example) => {
                                return example.wireKey === property.name.wireValue;
                            });
                        }
                    } else if (exampleTypeFromEndpointResponse != null) {
                        if (
                            exampleTypeFromEndpointResponse.body?.shape.type === "named" &&
                            exampleTypeFromEndpointResponse.body.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointResponse.body.shape.shape.properties.find(
                                (example) => {
                                    return example.wireKey === property.name.wireValue;
                                }
                            );
                        }
                    }
                    return {
                        docs: property.docs ?? undefined,
                        name: property.name,
                        valueType: property.valueType,
                        example: exampleProperty,
                    };
                }),
                extensions: objectTypeDeclaration.extends,
                docs,
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
        },
    });
    return {
        openApiSchema,
        schemaName: getNameFromDeclaredTypeName(typeDeclaration.name),
    };
}

export function convertAlias({
    aliasTypeDeclaration,
    docs,
}: {
    aliasTypeDeclaration: AliasTypeDeclaration;
    docs: string | undefined;
}): OpenApiComponentSchema {
    const convertedAliasOf = convertTypeReference(aliasTypeDeclaration.aliasOf);
    return {
        ...convertedAliasOf,
        description: docs,
    };
}

export function convertEnum({
    enumTypeDeclaration,
    docs,
}: {
    enumTypeDeclaration: EnumTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    return {
        type: "string",
        enum: enumTypeDeclaration.values.map((enumValue) => {
            return enumValue.name.wireValue;
        }),
        description: docs,
    };
}

export function convertUnion({
    unionTypeDeclaration,
    docs,
}: {
    unionTypeDeclaration: UnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const oneOfTypes: OpenAPIV3.SchemaObject[] = unionTypeDeclaration.types.map((singleUnionType) => {
        const discriminantProperty: OpenAPIV3.BaseSchemaObject["properties"] = {
            [unionTypeDeclaration.discriminant.wireValue]: {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue],
            },
        };
        return SingleUnionTypeProperties._visit<OpenAPIV3.SchemaObject>(singleUnionType.shape, {
            noProperties: () => ({
                type: "object",
                properties: discriminantProperty,
                required: [unionTypeDeclaration.discriminant.wireValue],
            }),
            singleProperty: (singleProperty) => ({
                type: "object",
                properties: {
                    ...discriminantProperty,
                    [singleProperty.name.wireValue]: convertTypeReference(singleProperty.type),
                },
                required: [unionTypeDeclaration.discriminant.wireValue],
            }),
            samePropertiesAsObject: (typeName) => ({
                type: "object",
                allOf: [
                    {
                        type: "object",
                        properties: discriminantProperty,
                    },
                    {
                        $ref: getReferenceFromDeclaredTypeName(typeName),
                    },
                ],
                required: [unionTypeDeclaration.discriminant.wireValue],
            }),
            _other: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape.propertiesType);
            },
        });
    });

    const schema: OpenAPIV3.SchemaObject = {
        oneOf: oneOfTypes,
        description: docs,
    };

    if (unionTypeDeclaration.baseProperties.length > 0) {
        schema.properties = unionTypeDeclaration.baseProperties.reduce<
            Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>
        >((acc, property) => {
            acc[property.name.wireValue] = {
                description: property.docs ?? undefined,
                ...convertTypeReference(property.valueType),
            };
            if (!(property.valueType.type === "container" && property.valueType.container.type === "optional")) {
                schema.required = [...(schema.required ?? []), property.name.wireValue];
            }
            return acc;
        }, {});
    }

    return schema;
}

export function convertUndiscriminatedUnion({
    undiscriminatedUnionDeclaration,
    docs,
}: {
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    return {
        oneOf: undiscriminatedUnionDeclaration.members.map((member) => ({
            description: member.docs ?? undefined,
            ...convertTypeReference(member.type),
        })),
        description: docs,
    };
}

export function convertTypeReference(typeReference: TypeReference): OpenApiComponentSchema {
    return TypeReference._visit(typeReference, {
        container: (containerType) => {
            return convertContainerType(containerType);
        },
        named: (declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName),
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
        },
    });
}

function convertPrimitiveType(primitiveType: PrimitiveType): OpenAPIV3.NonArraySchemaObject {
    return PrimitiveType._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType, {
        boolean: () => {
            return { type: "boolean" };
        },
        dateTime: () => {
            return {
                type: "string",
                format: "date-time",
            };
        },
        double: () => {
            return {
                type: "number",
                format: "double",
            };
        },
        integer: () => {
            return {
                type: "integer",
            };
        },
        long: () => {
            return {
                type: "integer",
                format: "int64",
            };
        },
        string: () => {
            return { type: "string" };
        },
        uuid: () => {
            return {
                type: "string",
                format: "uuid",
            };
        },
        date: () => {
            return {
                type: "string",
                format: "date",
            };
        },
        base64: () => {
            return {
                type: "string",
                format: "byte",
            };
        },
        _other: () => {
            throw new Error("Encountered unknown primitiveType: " + primitiveType);
        },
    });
}

function convertContainerType(containerType: ContainerType): OpenApiComponentSchema {
    return ContainerType._visit<OpenApiComponentSchema>(containerType, {
        list: (listType) => {
            return {
                type: "array",
                items: convertTypeReference(listType),
            };
        },
        set: (setType) => {
            return {
                type: "array",
                items: convertTypeReference(setType),
            };
        },
        map: (mapType) => {
            if (
                mapType.keyType.type === "primitive" &&
                mapType.keyType.primitive === "STRING" &&
                mapType.valueType.type === "unknown"
            ) {
                return {
                    type: "object",
                    additionalProperties: true,
                };
            }
            return {
                type: "object",
                additionalProperties: convertTypeReference(mapType.valueType),
            };
        },
        optional: (optionalType) => {
            return {
                ...convertTypeReference(optionalType),
                nullable: true,
            };
        },
        literal: (literalType) => {
            return {
                type: "string",
                enum: [literalType.string],
            };
        },
        _other: () => {
            throw new Error("Encountered unknown containerType: " + containerType.type);
        },
    });
}

export function getReferenceFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return `#/components/schemas/${getNameFromDeclaredTypeName(declaredTypeName)}`;
}

export function getNameFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.packagePath.map((part) => part.originalName),
        declaredTypeName.name.originalName,
    ].join("");
}

function getExampleFromEndpointRequest(
    ir: IntermediateRepresentation,
    declaredTypeName: DeclaredTypeName
): ExampleRequestBody | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.examples.length <= 0) {
                continue;
            }
            if (
                endpoint.requestBody?.type === "reference" &&
                endpoint.requestBody.requestBodyType.type === "named" &&
                areDeclaredTypeNamesEqual(endpoint.requestBody.requestBodyType, declaredTypeName)
            ) {
                return endpoint.examples[0]?.request ?? undefined;
            }
        }
    }
    return undefined;
}

function getExampleFromEndpointResponse(
    ir: IntermediateRepresentation,
    declaredTypeName: DeclaredTypeName
): ExampleEndpointSuccessResponse | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.examples.length <= 0 || endpoint.response?.type !== "json") {
                continue;
            }
            if (
                endpoint.response.responseBodyType.type === "named" &&
                areDeclaredTypeNamesEqual(endpoint.response.responseBodyType, declaredTypeName)
            ) {
                const okResponseExample = endpoint.examples.find((exampleEndpoint) => {
                    return exampleEndpoint.response.type === "ok";
                });
                if (okResponseExample != null && okResponseExample.response.type === "ok") {
                    return okResponseExample.response;
                }
            }
        }
    }
    return undefined;
}

function areDeclaredTypeNamesEqual(one: DeclaredTypeName, two: DeclaredTypeName): boolean {
    return isEqual(one.fernFilepath, two.fernFilepath) && isEqual(one.name, two.name);
}
