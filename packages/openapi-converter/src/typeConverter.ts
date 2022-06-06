import { RawSchemas } from "@fern-api/syntax-analysis";
import { OpenAPIV3 } from "openapi-types";
import _ from "lodash";

export interface FernTypeConversionResult {
    typeDefinitions: Record<string, RawSchemas.TypeDefinitionSchema | string>;
}

const EMPTY_OBJECT_TYPE_DEFINITION: RawSchemas.ObjectSchema = {
    properties: {},
};

export function convertToFernType(typeName: string, schemaObject: OpenAPIV3.SchemaObject): FernTypeConversionResult {
    const conversionResult: FernTypeConversionResult = {
        typeDefinitions: {},
    };
    if (_.isEmpty(schemaObject)) {
        conversionResult.typeDefinitions[typeName] = EMPTY_OBJECT_TYPE_DEFINITION;
    } else if (schemaObject.oneOf !== undefined) {
        const unionTypeDefinition: RawSchemas.UnionSchema = { union: {} };
        schemaObject.oneOf.forEach((nestedUnionType) => {
            if (isSchemaObject(nestedUnionType)) {
                throw new Error("Don't support converting inlined oneOf types:" + typeName);
            } else {
                const nestedUnionFernType = getTypeNameFromReferenceObject(nestedUnionType);
                unionTypeDefinition.union[_.lowerFirst(nestedUnionFernType)] = nestedUnionFernType;
            }
        });
        conversionResult.typeDefinitions[typeName] = unionTypeDefinition;
    } else if (schemaObject.enum !== undefined) {
        conversionResult.typeDefinitions[typeName] = {
            enum: schemaObject.enum.filter((value) => typeof value === "string"),
        };
    } else if (schemaObject.type !== undefined) {
        if (schemaObject.type === "array") {
            if (schemaObject.items !== undefined) {
                if (isReferenceObject(schemaObject.items)) {
                    conversionResult.typeDefinitions[typeName] =
                        "list<" + getTypeNameFromReferenceObject(schemaObject.items) + ">";
                } else {
                    const nestedConversionResult = convertToFernTypeNested([typeName], "Item", schemaObject);
                    conversionResult.typeDefinitions[typeName] =
                        "list<" + nestedConversionResult.convertedTypeName + ">";
                    if (nestedConversionResult.newTypeDefinitions !== undefined) {
                        for (const [newTypeName, newTypeDefinition] of Object.entries(
                            nestedConversionResult.newTypeDefinitions
                        )) {
                            conversionResult.typeDefinitions[newTypeName] = newTypeDefinition;
                        }
                    }
                }
            }
        } else {
            conversionResult.typeDefinitions[typeName] = convertNonArraySchemaObjectType(schemaObject.type);
        }
    } else if (schemaObject.properties !== undefined) {
        const requiredProperties = new Set();
        if (schemaObject.required !== undefined) {
            schemaObject.required.forEach((requiredProperty) => requiredProperties.add(requiredProperty));
        }
        const objectTypeDefinition: RawSchemas.TypeDefinitionSchema = EMPTY_OBJECT_TYPE_DEFINITION;
        for (const propertyName of Object.keys(schemaObject.properties)) {
            const propertyType = schemaObject.properties[propertyName];
            let fernPropertyType: string;
            if (propertyType === undefined) {
                continue;
            } else if (isReferenceObject(propertyType)) {
                fernPropertyType = getTypeNameFromReferenceObject(propertyType);
            } else {
                const nestedConversionResult = convertToFernTypeNested([typeName], propertyName, propertyType);
                fernPropertyType = nestedConversionResult.convertedTypeName;
                if (nestedConversionResult.newTypeDefinitions !== undefined) {
                    for (const [newTypeName, newTypeDefinition] of Object.entries(
                        nestedConversionResult.newTypeDefinitions
                    )) {
                        conversionResult.typeDefinitions[newTypeName] = newTypeDefinition;
                    }
                }
            }
            if (requiredProperties.has(propertyName)) {
                objectTypeDefinition.properties[propertyName] = fernPropertyType;
            } else {
                objectTypeDefinition.properties[propertyName] = "optional<" + fernPropertyType + ">";
            }
        }
        conversionResult.typeDefinitions[typeName] = objectTypeDefinition;
    }
    return conversionResult;
}

interface NestedFernTypeConversionResult {
    convertedTypeName: string;
    newTypeDefinitions?: Record<string, RawSchemas.TypeDefinitionSchema>;
}

function convertToFernTypeNested(
    typeNameHierarchy: string[],
    schemaObjectTypeName: string,
    schemaObject: OpenAPIV3.SchemaObject
): NestedFernTypeConversionResult {
    if (schemaObject.enum !== undefined) {
        const enumTypeName = getTypeName([...typeNameHierarchy, schemaObjectTypeName]);
        return {
            convertedTypeName: enumTypeName,
            newTypeDefinitions: {
                [enumTypeName]: {
                    enum: schemaObject.enum.filter((value) => typeof value === "string"),
                },
            },
        };
    } else if (schemaObject.type !== undefined) {
        if (schemaObject.type === "array") {
            if (schemaObject.items !== undefined) {
                if (isReferenceObject(schemaObject.items)) {
                    return {
                        convertedTypeName: "list<" + getTypeNameFromReferenceObject(schemaObject.items) + ">",
                    };
                } else {
                    const nestedConversionResult = convertToFernTypeNested(
                        [...typeNameHierarchy, schemaObjectTypeName],
                        "Item",
                        schemaObject.items
                    );
                    return {
                        convertedTypeName: "list<" + nestedConversionResult.convertedTypeName + ">",
                        newTypeDefinitions: {
                            ...nestedConversionResult.newTypeDefinitions,
                        },
                    };
                }
            }
        } else if (schemaObject.type == "boolean") {
            return { convertedTypeName: "boolean" };
        } else if (schemaObject.type == "integer") {
            return { convertedTypeName: "integer" };
        } else if (schemaObject.type == "number") {
            return { convertedTypeName: "double" };
        } else if (schemaObject.type == "string") {
            return { convertedTypeName: "string" };
        }
    }
    throw new Error("Reached end of fern nested converter!");
}

function convertNonArraySchemaObjectType(
    nonArraySchemaObjectType: OpenAPIV3.NonArraySchemaObjectType
): RawSchemas.TypeDefinitionSchema | string {
    if (nonArraySchemaObjectType == "boolean") {
        return "boolean";
    } else if (nonArraySchemaObjectType == "integer") {
        return "integer";
    } else if (nonArraySchemaObjectType == "number") {
        return "double";
    } else if (nonArraySchemaObjectType == "string") {
        return "string";
    } else if (nonArraySchemaObjectType == "object") {
        return EMPTY_OBJECT_TYPE_DEFINITION;
    } else {
        throw new Error("Encountered unknown nonArraySchemaObjectType: " + nonArraySchemaObjectType);
    }
}

export function isSchemaObject(
    typeDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDefinition is OpenAPIV3.SchemaObject {
    return (typeDefinition as OpenAPIV3.ReferenceObject).$ref === undefined;
}

export function isReferenceObject(
    typeDefinition:
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.ResponseObject
        | OpenAPIV3.RequestBodyObject
): typeDefinition is OpenAPIV3.ReferenceObject {
    return (typeDefinition as OpenAPIV3.ReferenceObject).$ref !== undefined;
}

export function getTypeNameFromReferenceObject(referenceObject: OpenAPIV3.ReferenceObject): string {
    return referenceObject.$ref.replace("#/components/schemas/", "");
}

function getTypeName(typeNameHierarchy: string[]) {
    return typeNameHierarchy.map((typeName) => _.capitalize(typeName)).join("");
}
