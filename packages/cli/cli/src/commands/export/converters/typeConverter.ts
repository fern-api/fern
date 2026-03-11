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
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import isEqual from "lodash-es/isEqual";
import { OpenAPIV3 } from "openapi-types";
import { convertObject } from "./convertObject.js";

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
            const exampleType: ExampleType | undefined = typeDeclaration.userProvidedExamples[0];
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
                            return getWireValue(example.name) === getWireValue(property.name);
                        });
                    } else if (exampleTypeFromEndpointRequest != null) {
                        if (
                            exampleTypeFromEndpointRequest.type === "reference" &&
                            exampleTypeFromEndpointRequest.shape.type === "named" &&
                            exampleTypeFromEndpointRequest.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointRequest.shape.shape.properties.find((example) => {
                                return getWireValue(example.name) === getWireValue(property.name);
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
                                    return getWireValue(example.name) === getWireValue(property.name);
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
            return getWireValue(enumValue.name);
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
            [getWireValue(unionTypeDeclaration.discriminant)]: {
                type: "string",
                enum: [getWireValue(singleUnionType.discriminantValue)]
            }
        };
        return SingleUnionTypeProperties._visit<OpenAPIV3.SchemaObject>(singleUnionType.shape, {
            noProperties: () => ({
                type: "object",
                properties: discriminantProperty,
                required: [getWireValue(unionTypeDeclaration.discriminant)]
            }),
            singleProperty: (singleProperty) => ({
                type: "object",
                properties: {
                    ...discriminantProperty,
                    [getWireValue(singleProperty.name)]: convertTypeReference(singleProperty.type)
                },
                required: [getWireValue(unionTypeDeclaration.discriminant)]
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
                required: [getWireValue(unionTypeDeclaration.discriminant)]
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
            acc[getWireValue(property.name)] = {
                description: property.docs ?? undefined,
                ...convertTypeReference(property.valueType)
            };
            if (!(property.valueType.type === "container" && property.valueType.container.type === "optional")) {
                schema.required = [...(schema.required ?? []), getWireValue(property.name)];
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

function convertPrimitiveType(primitiveType: PrimitiveType): OpenAPIV3.NonArraySchemaObject {
    if (primitiveType.v2 == null) {
        return (
            PrimitiveTypeV1._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType.v1, {
                boolean: () => {
                    return { type: "boolean" };
                },
                dateTime: () => {
                    return {
                        type: "string",
                        format: "date-time"
                    };
                },
                double: () => {
                    return {
                        type: "number",
                        format: "double"
                    };
                },
                integer: () => {
                    return {
                        type: "integer"
                    };
                },
                long: () => {
                    return {
                        type: "integer",
                        format: "int64"
                    };
                },
                string: () => {
                    return { type: "string" };
                },
                uuid: () => {
                    return {
                        type: "string",
                        format: "uuid"
                    };
                },
                date: () => {
                    return {
                        type: "string",
                        format: "date"
                    };
                },
                base64: () => {
                    return {
                        type: "string",
                        format: "byte"
                    };
                },
                uint: () => {
                    return {
                        type: "integer",
                        format: "int64"
                    };
                },
                uint64: () => {
                    return {
                        type: "integer",
                        format: "int64"
                    };
                },
                float: () => {
                    return {
                        type: "number",
                        format: "float"
                    };
                },
                bigInteger: () => {
                    return {
                        type: "integer",
                        format: "bigint"
                    };
                },
                dateTimeRfc2822: () => {
                    return {
                        type: "string",
                        format: "date-time-rfc-2822"
                    };
                },
                _other: () => {
                    throw new Error("Encountered unknown primitiveType: " + primitiveType.v1);
                }
            }) ?? {}
        );
    }
    return PrimitiveTypeV2._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType.v2, {
        boolean: () => {
            return { type: "boolean" };
        },
        dateTime: () => {
            return {
                type: "string",
                format: "date-time"
            };
        },
        double: () => {
            return {
                type: "number",
                format: "double"
            };
        },
        integer: () => {
            return {
                type: "integer"
            };
        },
        long: () => {
            return {
                type: "integer",
                format: "int64"
            };
        },
        string: (val) => {
            const type: OpenAPIV3.NonArraySchemaObject = { type: "string" };
            if (val.validation?.format != null) {
                type.format = val.validation.format;
            }
            if (val.validation?.pattern != null) {
                type.pattern = val.validation.pattern;
            }
            return type;
        },
        uuid: () => {
            return {
                type: "string",
                format: "uuid"
            };
        },
        date: () => {
            return {
                type: "string",
                format: "date"
            };
        },
        base64: () => {
            return {
                type: "string",
                format: "byte"
            };
        },
        uint: () => {
            return {
                type: "integer",
                format: "int64"
            };
        },
        uint64: () => {
            return {
                type: "integer",
                format: "int64"
            };
        },
        float: () => {
            return {
                type: "number",
                format: "float"
            };
        },
        bigInteger: () => {
            return {
                type: "integer",
                format: "bigint"
            };
        },
        dateTimeRfc2822: () => {
            return {
                type: "string",
                format: "date-time-rfc-2822"
            };
        },
        _other: () => {
            throw new Error("Encountered unknown primitiveType: " + primitiveType.v2);
        }
    });
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
        ...declaredTypeName.fernFilepath.packagePath.map((part) => getOriginalName(part)),
        getOriginalName(declaredTypeName.name)
    ].join("");
}

function getExampleFromEndpointRequest(
    ir: IntermediateRepresentation,
    declaredTypeName: DeclaredTypeName
): ExampleRequestBody | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.userSpecifiedExamples.length <= 0) {
                continue;
            }
            if (
                endpoint.requestBody?.type === "reference" &&
                endpoint.requestBody.requestBodyType.type === "named" &&
                areDeclaredTypeNamesEqual(endpoint.requestBody.requestBodyType, declaredTypeName)
            ) {
                return endpoint.userSpecifiedExamples[0]?.example?.request ?? undefined;
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
            if (endpoint.userSpecifiedExamples.length <= 0 || endpoint.response?.body?.type !== "json") {
                continue;
            }
            if (
                endpoint.response.body.value.responseBodyType.type === "named" &&
                endpoint.response.body.value.responseBodyType.typeId === declaredTypeName.typeId
            ) {
                const okResponseExample = endpoint.userSpecifiedExamples.find((exampleEndpoint) => {
                    return exampleEndpoint.example?.response.type === "ok";
                });
                if (okResponseExample != null && okResponseExample.example?.response.type === "ok") {
                    return okResponseExample.example.response.value;
                }
            }
        }
    }
    return undefined;
}

function areDeclaredTypeNamesEqual(one: DeclaredTypeName, two: DeclaredTypeName): boolean {
    return isEqual(one.fernFilepath, two.fernFilepath) && isEqual(one.name, two.name);
}
