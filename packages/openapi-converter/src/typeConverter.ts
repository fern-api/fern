import { RawSchemas } from "@fern-api/syntax-analysis";
import { OpenAPIV3 } from "openapi-types";
import { isSchemaObject, isReferenceObject } from "./utils";
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
                unionTypeDefinition.union[nestedUnionFernType] = nestedUnionFernType;
            }
        });
        conversionResult.typeDefinitions[typeName] = unionTypeDefinition;
    } else if (schemaObject.enum !== undefined) {
        conversionResult.typeDefinitions[typeName] = {
            enum: schemaObject.enum.filter((value) => typeof value === "string"),
        };
    } else if (schemaObject.type == "boolean") {
        conversionResult.typeDefinitions[typeName] = "boolean";
    } else if (schemaObject.type == "integer") {
        conversionResult.typeDefinitions[typeName] = "integer";
    } else if (schemaObject.type == "number") {
        conversionResult.typeDefinitions[typeName] = "double";
    } else if (schemaObject.type == "string") {
        conversionResult.typeDefinitions[typeName] = "string";
    } else if (schemaObject.type == "object" || schemaObject.properties != null) {
        const requiredProperties = new Set();
        if (schemaObject.required !== undefined) {
            schemaObject.required.forEach((requiredProperty) => requiredProperties.add(requiredProperty));
        }
        const objectTypeDefinition: RawSchemas.TypeDefinitionSchema = EMPTY_OBJECT_TYPE_DEFINITION;
        if (schemaObject.properties != null) {
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

export function getTypeNameFromReferenceObject(referenceObject: OpenAPIV3.ReferenceObject): string {
    return referenceObject.$ref.replace("#/components/schemas/", "");
}

function getTypeName(typeNameHierarchy: string[]) {
    return typeNameHierarchy.map((typeName) => _.capitalize(typeName)).join("");
}
