import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { ExampleEndpointSuccessResponse, ExampleRequestBody } from "@fern-fern/ir-model/services/http";
import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ExampleObjectProperty,
    ExampleType,
    PrimitiveType,
    Type,
    TypeDeclaration,
    TypeReference,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
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
    const openApiSchema = Type._visit(shape, {
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
                            return example.wireKey === property.nameV2.wireValue;
                        });
                    } else if (exampleTypeFromEndpointRequest != null) {
                        if (
                            exampleTypeFromEndpointRequest.type === "reference" &&
                            exampleTypeFromEndpointRequest.shape.type === "named" &&
                            exampleTypeFromEndpointRequest.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointRequest.shape.shape.properties.find((example) => {
                                return example.wireKey === property.nameV2.wireValue;
                            });
                        }
                    } else if (exampleTypeFromEndpointResponse != null) {
                        if (
                            exampleTypeFromEndpointResponse.body?.shape.type === "named" &&
                            exampleTypeFromEndpointResponse.body?.shape.shape.type === "object"
                        ) {
                            exampleProperty = exampleTypeFromEndpointResponse.body.shape.shape.properties.find(
                                (example) => {
                                    return example.wireKey === property.nameV2.wireValue;
                                }
                            );
                        }
                    }
                    return {
                        docs: property.docs ?? undefined,
                        name: property.nameV2,
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
        _unknown: () => {
            throw new Error("Encountered unknown type: " + shape._type);
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
            return enumValue.value;
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
        const valueType = singleUnionType.valueType;
        const convertedValueType = convertTypeReference(valueType);
        if (valueType._type === "named") {
            const properties = {};
            properties[unionTypeDeclaration.discriminant] = {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue],
            };
            return {
                type: "object",
                allOf: [
                    {
                        $ref: getReferenceFromDeclaredTypeName(valueType),
                    },
                    {
                        type: "object",
                        properties,
                    },
                ],
            };
        } else {
            const properties = {};
            properties[unionTypeDeclaration.discriminant] = {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue],
            };
            properties[unionTypeDeclaration.discriminant] = convertedValueType;
            return {
                type: "object",
                properties,
            };
        }
    });
    return {
        oneOf: oneOfTypes,
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
        void: () => {
            return {};
        },
        _unknown: () => {
            throw new Error("Encountered unknown typeReference: " + typeReference._type);
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
        _unknown: () => {
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
            return {
                type: "object",
                additionalProperties: convertTypeReference(mapType.valueType),
            };
        },
        optional: (optionalType) => {
            return convertTypeReference(optionalType);
        },
        literal: () => {
            throw new Error("Literals are not supported");
        },
        _unknown: () => {
            throw new Error("Encountered unknown containerType: " + containerType._type);
        },
    });
}

export function getReferenceFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return `#/components/schemas/${getNameFromDeclaredTypeName(declaredTypeName)}`;
}

export function getNameFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    const pascalCaseFolders = declaredTypeName.fernFilepath
        .filter((_part, idx) => {
            return idx !== declaredTypeName.fernFilepath.length - 1;
        })
        .map((part) => part.pascalCase);
    return [...pascalCaseFolders, declaredTypeName.name].join("");
}

function getExampleFromEndpointRequest(
    ir: IntermediateRepresentation,
    declaredTypeName: DeclaredTypeName
): ExampleRequestBody | undefined {
    for (const service of ir.services.http) {
        for (const endpoint of service.endpoints) {
            if (endpoint.examples.length <= 0) {
                continue;
            }
            if (
                endpoint.requestBody?.type === "reference" &&
                endpoint.requestBody.requestBodyType._type === "named" &&
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
    for (const service of ir.services.http) {
        for (const endpoint of service.endpoints) {
            if (endpoint.examples.length <= 0) {
                continue;
            }
            if (
                endpoint.response.typeV2?._type === "named" &&
                areDeclaredTypeNamesEqual(endpoint.response.typeV2, declaredTypeName)
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
    return isEqual(one.fernFilepathV2, two.fernFilepathV2) && isEqual(one.nameV3, two.nameV3);
}
