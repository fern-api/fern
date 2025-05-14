import {
    ExampleObjectProperty,
    ExampleObjectType,
    ExampleSingleUnionTypeProperties,
    ExampleTypeShape,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeId
} from "@fern-api/ir-sdk";

import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional";
import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";

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
}: generateTypeDeclarationExample.Args): ExampleGenerationResult<ExampleTypeShape> | undefined {
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
            const baseJsonExample: Record<string, unknown> = {};
            const baseProperties: ExampleObjectProperty[] = [];

            if (typeDeclaration.shape.extends != null) {
                for (const extendedTypeReference of typeDeclaration.shape.extends) {
                    const extendedTypeDeclaration = typeDeclarations[extendedTypeReference.typeId];
                    if (extendedTypeDeclaration == null) {
                        continue;
                    }
                    const extendedExample = generateTypeDeclarationExample({
                        fieldName,
                        typeDeclaration: extendedTypeDeclaration,
                        typeDeclarations,
                        currentDepth: currentDepth + 1,
                        maxDepth,
                        skipOptionalProperties
                    });
                    if (extendedExample == null) {
                        continue;
                    }
                    if (extendedExample.type === "success" && extendedExample.example.type === "object") {
                        Object.assign(baseJsonExample, extendedExample.jsonExample);
                        baseProperties.push(...extendedExample.example.properties);
                    }
                }
            }

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
                example: ExampleTypeShape.object({
                    ...example,
                    properties: [...baseProperties, ...example.properties]
                }),
                jsonExample: Object.assign({}, baseJsonExample, jsonExample)
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
            const basePropertyExamples: Record<string, unknown> = {};
            if (typeDeclaration.shape.baseProperties != null) {
                for (const baseProperty of typeDeclaration.shape.baseProperties) {
                    const basePropertyExample = generateTypeReferenceExample({
                        fieldName: baseProperty.name.wireValue,
                        typeReference: baseProperty.valueType,
                        typeDeclarations,
                        currentDepth: currentDepth + 1,
                        maxDepth,
                        skipOptionalProperties
                    });
                    if (basePropertyExample.type === "success") {
                        basePropertyExamples[baseProperty.name.wireValue] = basePropertyExample.jsonExample;
                    }
                }
            }

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
                                [discriminant.wireValue]: variant.discriminantValue.wireValue,
                                ...basePropertyExamples
                            }
                        };
                    },
                    samePropertiesAsObject: (samePropertiesAsObject) => {
                        const typeDeclaration = typeDeclarations[samePropertiesAsObject.typeId];
                        if (typeDeclaration == null) {
                            return {
                                type: "failure",
                                message: `Failed to find type declaration with id ${samePropertiesAsObject.typeId}`
                            };
                        }

                        const typeDeclarationExample = generateTypeDeclarationExample({
                            currentDepth,
                            maxDepth,
                            fieldName,
                            typeDeclaration,
                            typeDeclarations,
                            skipOptionalProperties
                        });
                        if (typeDeclarationExample == null) {
                            return { type: "failure", message: "Failed to generate example for type reference" };
                        }

                        if (typeDeclarationExample.type === "failure") {
                            return typeDeclarationExample;
                        }

                        const { example, jsonExample } = typeDeclarationExample;
                        return {
                            type: "success",
                            example: ExampleTypeShape.union({
                                discriminant,
                                singleUnionType: {
                                    wireDiscriminantValue: variant.discriminantValue,
                                    shape: ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                                        typeId: typeDeclaration.name.typeId,
                                        object: example.type === "object" ? example : { properties: [] }
                                    })
                                }
                            }),
                            jsonExample: {
                                [discriminant.wireValue]: variant.discriminantValue.wireValue,
                                ...(typeof jsonExample === "object" ? jsonExample : {}),
                                ...basePropertyExamples
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
                                [value.name.wireValue]: jsonExample,
                                ...basePropertyExamples
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
            !isTypeReferenceOptional({ typeDeclarations, typeReference: property.valueType })
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
