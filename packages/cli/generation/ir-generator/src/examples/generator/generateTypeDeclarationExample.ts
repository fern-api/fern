import {
    ExampleAliasType,
    ExampleObjectProperty,
    ExampleObjectType,
    ExampleSingleUnionTypeProperties,
    ExampleTypeShape,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeId
} from "@fern-api/ir-sdk";

import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";
import { isOptional } from "./isTypeReferenceOptional";

export declare namespace generateTypeDeclarationExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        typeDeclaration: TypeDeclaration;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        maxDepth: number;
        currentDepth: number;

        skipOptionalProperties: boolean;
    }
}

export function generateTypeDeclarationExample({
    fieldName,
    typeDeclarations,
    typeDeclaration,
    maxDepth,
    currentDepth,
    skipOptionalProperties
}: generateTypeDeclarationExample.Args): ExampleGenerationResult<ExampleTypeShape> {
    switch (typeDeclaration.shape.type) {
        case "alias": {
            const generatedExample = generateTypeReferenceExample({
                fieldName,
                typeDeclarations,
                typeReference: typeDeclaration.shape.aliasOf,
                maxDepth,
                currentDepth,
                skipOptionalProperties
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example, jsonExample } = generatedExample;
            return {
                type: "success",
                example: ExampleTypeShape.alias({
                    value: example
                }),
                jsonExample
            };
        }
        case "enum": {
            const enumValue = typeDeclaration.shape.values[0];
            if (enumValue == null) {
                return { type: "failure", message: "No enum values present" };
            }
            return {
                type: "success",
                example: ExampleTypeShape.enum({
                    value: enumValue.name
                }),
                jsonExample: enumValue.name.wireValue
            };
        }
        case "object": {
            const objectExample = generateObjectDeclarationExample({
                fieldName,
                typeDeclaration,
                objectTypeDeclaration: typeDeclaration.shape,
                typeDeclarations,
                currentDepth,
                maxDepth,
                skipOptionalProperties
            });
            if (objectExample.type === "failure") {
                return objectExample;
            }
            const { example, jsonExample } = objectExample;
            return {
                type: "success",
                example: ExampleTypeShape.object(example),
                jsonExample
            };
        }
        case "undiscriminatedUnion": {
            let i = 0;
            for (const variant of typeDeclaration.shape.members) {
                const variantExample = generateTypeReferenceExample({
                    fieldName,
                    typeReference: variant.type,
                    typeDeclarations,
                    currentDepth: currentDepth + 1,
                    maxDepth,
                    skipOptionalProperties
                });
                if (variantExample.type === "failure") {
                    ++i;
                    continue;
                }
                const { example, jsonExample } = variantExample;
                return {
                    type: "success",
                    example: ExampleTypeShape.undiscriminatedUnion({
                        index: i,
                        singleUnionType: example
                    }),
                    jsonExample
                };
            }
            break;
        }
        case "union": {
            const discriminant = typeDeclaration.shape.discriminant;
            for (const variant of typeDeclaration.shape.types) {
                const variantExample = variant.shape._visit<ExampleGenerationResult<ExampleTypeShape>>({
                    noProperties: () => {
                        return {
                            type: "success",
                            example: ExampleTypeShape.union({
                                discriminant,
                                singleUnionType: {
                                    wireDiscriminantValue: variant.discriminantValue,
                                    shape: ExampleSingleUnionTypeProperties.noProperties()
                                }
                            }),
                            jsonExample: {
                                [discriminant.wireValue]: variant.discriminantValue.wireValue
                            }
                        };
                    },
                    samePropertiesAsObject: (samePropertiesAsObject) => {
                        const typeDeclaration = typeDeclarations[samePropertiesAsObject.typeId];
                        if (typeDeclaration == null) {
                            throw new Error(`Failed to find type declaration with id ${samePropertiesAsObject.typeId}`);
                        }
                        if (typeDeclaration.shape.type !== "object") {
                            throw new Error(
                                `Same properties as object union is not an object ${typeDeclaration.shape.type}`
                            );
                        }
                        const objectExample = generateObjectDeclarationExample({
                            currentDepth,
                            maxDepth,
                            fieldName,
                            objectTypeDeclaration: typeDeclaration.shape,
                            typeDeclaration,
                            typeDeclarations,
                            skipOptionalProperties
                        });
                        if (objectExample.type === "failure") {
                            return objectExample;
                        }
                        const { example, jsonExample } = objectExample;
                        return {
                            type: "success",
                            example: ExampleTypeShape.union({
                                discriminant,
                                singleUnionType: {
                                    wireDiscriminantValue: variant.discriminantValue,
                                    shape: ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                                        typeId: typeDeclaration.name.typeId,
                                        object: example
                                    })
                                }
                            }),
                            jsonExample: {
                                [discriminant.wireValue]: variant.discriminantValue.wireValue,
                                ...(typeof jsonExample === "object" ? jsonExample : {})
                            }
                        };
                    },
                    singleProperty: (value) => {
                        const singlePropertyExample = generateTypeReferenceExample({
                            currentDepth: currentDepth + 1,
                            maxDepth,
                            fieldName,
                            typeReference: value.type,
                            typeDeclarations,
                            skipOptionalProperties
                        });
                        if (singlePropertyExample.type === "failure") {
                            return singlePropertyExample;
                        }
                        const { example, jsonExample } = singlePropertyExample;
                        return {
                            type: "success",
                            example: ExampleTypeShape.union({
                                discriminant,
                                singleUnionType: {
                                    wireDiscriminantValue: variant.discriminantValue,
                                    shape: ExampleSingleUnionTypeProperties.singleProperty(example)
                                }
                            }),
                            jsonExample: {
                                [discriminant.wireValue]: variant.discriminantValue.wireValue,
                                [value.name.wireValue]: jsonExample
                            }
                        };
                    },
                    _other: () => {
                        throw new Error("Encountered unknown union type");
                    }
                });
                if (variantExample.type === "failure") {
                    continue;
                }
                return variantExample;
            }
        }
    }
    return { type: "failure", message: "Failed to generate example for type reference" };
}

function generateObjectDeclarationExample({
    fieldName,
    typeDeclaration,
    objectTypeDeclaration,
    typeDeclarations,
    maxDepth,
    currentDepth,
    skipOptionalProperties
}: {
    fieldName?: string;
    typeDeclaration: TypeDeclaration;
    objectTypeDeclaration: ObjectTypeDeclaration;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    maxDepth: number;
    currentDepth: number;
    skipOptionalProperties: boolean;
}): ExampleGenerationResult<ExampleObjectType> {
    const jsonExample: Record<string, unknown> = {};
    const properties: ExampleObjectProperty[] = [];
    for (const property of [
        ...(objectTypeDeclaration.properties ?? []),
        ...(objectTypeDeclaration.extendedProperties ?? [])
    ]) {
        const propertyExample = generateTypeReferenceExample({
            fieldName: property.name.wireValue,
            typeReference: property.valueType,
            typeDeclarations,
            currentDepth: currentDepth + 1,
            maxDepth,
            skipOptionalProperties
        });
        if (
            propertyExample.type === "failure" &&
            !isOptional({ typeDeclarations, typeReference: property.valueType })
        ) {
            return {
                type: "failure",
                message: `Failed to generate required property ${property.name.wireValue} b/c ${propertyExample.message}`
            };
        } else if (propertyExample.type === "failure") {
            continue;
        }
        const { example, jsonExample: propertyJsonExample } = propertyExample;
        properties.push({
            name: property.name,
            originalTypeDeclaration: typeDeclaration.name,
            value: example
        });
        jsonExample[property.name.wireValue] = propertyJsonExample;
    }
    return {
        type: "success",
        example: ExampleTypeShape.object({
            properties
        }),
        jsonExample
    };
}
