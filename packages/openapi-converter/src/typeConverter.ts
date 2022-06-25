import { RawSchemas } from "@fern-api/syntax-analysis";
import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject, isSchemaObject } from "./utils";

export interface FernTypeConversionResult {
    typeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema | string>;
}

const EMPTY_OBJECT_TYPE_DEFINITION: RawSchemas.ObjectSchema = {
    properties: {},
};

export function convertToFernType(typeName: string, schemaObject: OpenAPIV3.SchemaObject): FernTypeConversionResult {
    const conversionResult: FernTypeConversionResult = {
        typeDeclarations: {},
    };
    if (_.isEmpty(schemaObject)) {
        conversionResult.typeDeclarations[typeName] = EMPTY_OBJECT_TYPE_DEFINITION;
    } else if (schemaObject.oneOf !== undefined) {
        const unionTypeDeclaration: RawSchemas.UnionSchema = { union: {} };
        schemaObject.oneOf.forEach((nestedUnionType) => {
            if (isSchemaObject(nestedUnionType)) {
                throw new Error("Don't support converting inlined oneOf types:" + typeName);
            } else {
                const nestedUnionFernType = getTypeNameFromReferenceObject(nestedUnionType);
                unionTypeDeclaration.union[nestedUnionFernType] = nestedUnionFernType;
            }
        });
        conversionResult.typeDeclarations[typeName] = unionTypeDeclaration;
    } else if (schemaObject.enum !== undefined) {
        conversionResult.typeDeclarations[typeName] = {
            enum: schemaObject.enum.filter((value) => typeof value === "string"),
        };
    } else if (schemaObject.type == "boolean") {
        conversionResult.typeDeclarations[typeName] = "boolean";
    } else if (schemaObject.type == "integer") {
        conversionResult.typeDeclarations[typeName] = "integer";
    } else if (schemaObject.type == "number") {
        conversionResult.typeDeclarations[typeName] = "double";
    } else if (schemaObject.type == "string") {
        conversionResult.typeDeclarations[typeName] = "string";
    } else if (schemaObject.type == "object" || schemaObject.properties != null) {
        const requiredProperties = new Set();
        if (schemaObject.required !== undefined) {
            schemaObject.required.forEach((requiredProperty) => requiredProperties.add(requiredProperty));
        }
        const objectTypeDeclaration: RawSchemas.TypeDeclarationSchema = EMPTY_OBJECT_TYPE_DEFINITION;
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
                    if (nestedConversionResult.newTypeDeclarations !== undefined) {
                        for (const [newTypeName, newTypeDeclaration] of Object.entries(
                            nestedConversionResult.newTypeDeclarations
                        )) {
                            conversionResult.typeDeclarations[newTypeName] = newTypeDeclaration;
                        }
                    }
                }
                if (requiredProperties.has(propertyName)) {
                    objectTypeDeclaration.properties[propertyName] = fernPropertyType;
                } else {
                    objectTypeDeclaration.properties[propertyName] = "optional<" + fernPropertyType + ">";
                }
            }
        }
        conversionResult.typeDeclarations[typeName] = objectTypeDeclaration;
    }
    return conversionResult;
}

interface NestedFernTypeConversionResult {
    convertedTypeName: string;
    newTypeDeclarations?: Record<string, RawSchemas.TypeDeclarationSchema>;
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
            newTypeDeclarations: {
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
                        newTypeDeclarations: {
                            ...nestedConversionResult.newTypeDeclarations,
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
