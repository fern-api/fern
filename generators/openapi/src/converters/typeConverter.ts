import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import isEqual from "lodash-es/isEqual";
import { OpenAPIV3 } from "openapi-types";

import { convertObject } from "./convertObject.js";

export interface ConvertedType {
    openApiSchema: OpenApiComponentSchema;
    schemaName: string;
}

export type OpenApiComponentSchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

export function convertType(
    typeDeclaration: FernIr.TypeDeclaration,
    ir: FernIr.IntermediateRepresentation
): ConvertedType {
    const shape = typeDeclaration.shape;
    const docs = typeDeclaration.docs ?? undefined;
    const openApiSchema = FernIr.Type._visit<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>(shape, {
        alias: (aliasTypeDeclaration) => {
            return convertAlias({ aliasTypeDeclaration, docs });
        },
        enum: (enumTypeDeclaration) => {
            return convertEnum({ enumTypeDeclaration, docs });
        },
        object: (objectTypeDeclaration) => {
            const exampleType: FernIr.ExampleType | undefined = typeDeclaration.userProvidedExamples[0];
            const exampleTypeFromEndpointRequest =
                exampleType == null ? getExampleFromEndpointRequest(ir, typeDeclaration.name) : undefined;
            const exampleTypeFromEndpointResponse =
                exampleType == null && exampleTypeFromEndpointRequest == null
                    ? getExampleFromEndpointResponse(ir, typeDeclaration.name)
                    : undefined;

            return convertObject({
                properties: objectTypeDeclaration.properties.map((property) => {
                    let exampleProperty: FernIr.ExampleObjectProperty | undefined = undefined;
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
                        availability: property.availability ?? undefined,
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
    aliasTypeDeclaration: FernIr.AliasTypeDeclaration;
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
    enumTypeDeclaration: FernIr.EnumTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const values = enumTypeDeclaration.values.map((enumValue) => getWireValue(enumValue.name));
    if (values.length === 1) {
        return { type: "string", const: values[0], description: docs } as unknown as OpenAPIV3.SchemaObject;
    }
    return {
        type: "string",
        enum: values,
        description: docs
    };
}

export function convertUnion({
    unionTypeDeclaration,
    docs
}: {
    unionTypeDeclaration: FernIr.UnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const oneOfTypes: OpenAPIV3.SchemaObject[] = unionTypeDeclaration.types.map((singleUnionType) => {
        const discriminantProperty: OpenAPIV3.BaseSchemaObject["properties"] = {
            [getWireValue(unionTypeDeclaration.discriminant)]: {
                type: "string",
                const: getWireValue(singleUnionType.discriminantValue)
            } as unknown as OpenAPIV3.SchemaObject
        };
        return FernIr.SingleUnionTypeProperties._visit<OpenAPIV3.SchemaObject>(singleUnionType.shape, {
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
    undiscriminatedUnionDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration;
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

export function convertTypeReference(typeReference: FernIr.TypeReference): OpenApiComponentSchema {
    return FernIr.TypeReference._visit(typeReference, {
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

function convertPrimitiveType(primitiveType: FernIr.PrimitiveType): OpenAPIV3.NonArraySchemaObject {
    if (primitiveType.v2 == null) {
        return (
            FernIr.PrimitiveTypeV1._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType.v1, {
                boolean: () => {
                    return { type: "boolean" };
                },
                dateTime: () => {
                    return {
                        type: "string",
                        format: "date-time"
                    };
                },
                dateTimeRfc2822: () => {
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
                        type: "integer",
                        format: "float"
                    };
                },
                bigInteger: () => {
                    return {
                        type: "integer",
                        format: "bigint"
                    };
                },
                _other: () => {
                    throw new Error("Encountered unknown primitiveType: " + primitiveType.v1);
                }
            }) ?? {}
        );
    }
    return FernIr.PrimitiveTypeV2._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType.v2, {
        boolean: () => {
            return { type: "boolean" };
        },
        dateTime: () => {
            return {
                type: "string",
                format: "date-time"
            };
        },
        dateTimeRfc2822: () => {
            return {
                type: "string",
                format: "date-time"
            };
        },
        double: (val) => {
            const type: OpenAPIV3.NonArraySchemaObject = { type: "number", format: "double" };
            applyNumericValidation(type, val.validation);
            return type;
        },
        integer: (val) => {
            const type: OpenAPIV3.NonArraySchemaObject = { type: "integer" };
            applyNumericValidation(type, val.validation);
            return type;
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
            if (val.validation?.minLength != null) {
                type.minLength = val.validation.minLength;
            }
            if (val.validation?.maxLength != null) {
                type.maxLength = val.validation.maxLength;
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
        _other: () => {
            throw new Error("Encountered unknown primitiveType: " + primitiveType.v1);
        }
    });
}

function applyNumericValidation(
    schema: OpenAPIV3.NonArraySchemaObject,
    rules: FernIr.IntegerValidationRules | FernIr.DoubleValidationRules | undefined
): void {
    if (rules == null) {
        return;
    }
    // OAS 3.1 (JSON Schema 2020-12): `exclusiveMinimum`/`exclusiveMaximum` are numbers
    // (the bound itself), not booleans. When the IR says "exclusive", we promote the value
    // to `exclusiveMinimum`/`exclusiveMaximum` and omit `minimum`/`maximum`.
    if (rules.min != null) {
        if (rules.exclusiveMin === true) {
            (schema as Record<string, unknown>).exclusiveMinimum = rules.min;
        } else {
            schema.minimum = rules.min;
        }
    }
    if (rules.max != null) {
        if (rules.exclusiveMax === true) {
            (schema as Record<string, unknown>).exclusiveMaximum = rules.max;
        } else {
            schema.maximum = rules.max;
        }
    }
    if (rules.multipleOf != null) {
        schema.multipleOf = rules.multipleOf;
    }
}

/**
 * Wraps an OpenAPI schema so that `null` is a permitted value, using OpenAPI 3.1 / JSON
 * Schema 2020-12 conventions. OpenAPI 3.1 removed the `nullable` keyword; null is now
 * expressed either by including `"null"` in the `type` array or, for `$ref`s, by wrapping
 * the reference in `anyOf`/`oneOf` alongside `{ "type": "null" }`.
 *
 * Cases:
 *   - schema uses `$ref` → `{ anyOf: [schema, { type: "null" }] }`
 *   - schema.type is a string → merge `"null"` into a `type` array
 *   - schema.type is already an array → add `"null"` if missing
 *   - schema has neither `type` nor `$ref` (e.g., IR `unknown`) → leave untouched;
 *     a constraint-free schema already admits null.
 */
export function makeNullable(schema: OpenApiComponentSchema): OpenApiComponentSchema {
    if (schemaIsReference(schema)) {
        // OpenAPI 3.1: `$ref` alone cannot also be null, so wrap in `anyOf` with a null-typed branch.
        return { anyOf: [schema, { type: "null" }] } as unknown as OpenApiComponentSchema;
    }
    // `OpenAPIV3.SchemaObject` in openapi-types v12 types `type` as a single string, but OAS 3.1
    // allows `type` to be an array including "null". We read it at runtime regardless of the static type.
    const existingType = (schema as { type?: string | string[] }).type;
    if (existingType == null) {
        // Unknown / unconstrained schemas already accept null in JSON Schema 2020-12.
        return schema;
    }
    if (Array.isArray(existingType)) {
        if (existingType.includes("null")) {
            return schema;
        }
        return { ...schema, type: [...existingType, "null"] } as unknown as OpenApiComponentSchema;
    }
    return { ...schema, type: [existingType, "null"] } as unknown as OpenApiComponentSchema;
}

function schemaIsReference(schema: OpenApiComponentSchema): schema is OpenAPIV3.ReferenceObject {
    return typeof (schema as OpenAPIV3.ReferenceObject).$ref === "string";
}

function convertContainerType(containerType: FernIr.ContainerType): OpenApiComponentSchema {
    return FernIr.ContainerType._visit<OpenApiComponentSchema>(containerType, {
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
                // In OAS 3.1 (JSON Schema 2020-12) additionalProperties defaults to true,
                // so an unconstrained map is simply `type: "object"`.
                return {
                    type: "object"
                };
            }
            return {
                type: "object",
                additionalProperties: convertTypeReference(mapType.valueType)
            };
        },
        optional: (optionalType) => {
            return makeNullable(convertTypeReference(optionalType));
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
        nullable: (nullableType) => {
            return makeNullable(convertTypeReference(nullableType));
        },
        _other: () => {
            throw new Error("Encountered unknown containerType: " + containerType.type);
        }
    });
}

export function getReferenceFromDeclaredTypeName(declaredTypeName: FernIr.DeclaredTypeName): string {
    return `#/components/schemas/${getNameFromDeclaredTypeName(declaredTypeName)}`;
}

export function getNameFromDeclaredTypeName(declaredTypeName: FernIr.DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.packagePath.map((part) => getOriginalName(part)),
        getOriginalName(declaredTypeName.name)
    ].join("");
}

function getExampleFromEndpointRequest(
    ir: FernIr.IntermediateRepresentation,
    declaredTypeName: FernIr.DeclaredTypeName
): FernIr.ExampleRequestBody | undefined {
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
    ir: FernIr.IntermediateRepresentation,
    declaredTypeName: FernIr.DeclaredTypeName
): FernIr.ExampleEndpointSuccessResponse | undefined {
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

function areDeclaredTypeNamesEqual(one: FernIr.DeclaredTypeName, two: FernIr.DeclaredTypeName): boolean {
    return isEqual(one.fernFilepath, two.fernFilepath) && isEqual(one.name, two.name);
}
