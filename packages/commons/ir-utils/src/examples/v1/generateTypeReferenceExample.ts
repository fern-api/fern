import {
    ExampleObjectProperty,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    FernIr,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";

import { ExampleGenerationResult } from "./ExampleGenerationResult.js";
import { generateContainerExample, generateEmptyContainerExample } from "./generateContainerExample.js";
import { generatePrimitiveExample } from "./generatePrimitiveExample.js";
import { generateTypeDeclarationExample } from "./generateTypeDeclarationExample.js";

export declare namespace generateTypeReferenceExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        typeReference: TypeReference;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        maxDepth: number;
        currentDepth: number;

        skipOptionalProperties: boolean;

        visitedTypes?: Map<string, number>;
    }
}

export function generateTypeReferenceExample({
    fieldName,
    typeReference,
    typeDeclarations,
    maxDepth,
    currentDepth,
    skipOptionalProperties,
    visitedTypes
}: generateTypeReferenceExample.Args): ExampleGenerationResult<ExampleTypeReference> {
    if (currentDepth > maxDepth) {
        return { type: "failure", message: `Exceeded max depth of ${maxDepth}` };
    }
    switch (typeReference.type) {
        case "named": {
            const typeDeclaration = typeDeclarations[typeReference.typeId];
            if (typeDeclaration == null) {
                return { type: "failure", message: `Failed to find type declaration with id ${typeReference.typeId}` };
            }
            const visited = visitedTypes ?? new Map<string, number>();
            const count = visited.get(typeReference.typeId) ?? 0;
            if (count >= 2) {
                return generateMinimalNamedExample({ typeDeclaration, typeDeclarations, visitedTypes: visited });
            }
            visited.set(typeReference.typeId, count + 1);
            const generatedExample = generateTypeDeclarationExample({
                fieldName,
                typeDeclaration,
                typeDeclarations,
                maxDepth,
                currentDepth,
                skipOptionalProperties,
                visitedTypes: visited
            });
            const newCount = (visited.get(typeReference.typeId) ?? 1) - 1;
            if (newCount <= 0) {
                visited.delete(typeReference.typeId);
            } else {
                visited.set(typeReference.typeId, newCount);
            }
            if (generatedExample == null) {
                return { type: "failure", message: "Failed to generate example for type declaration" };
            }
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example, jsonExample } = generatedExample;
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.named({
                        shape: example,
                        typeName: typeDeclaration.name
                    })
                },
                jsonExample
            };
        }
        case "container": {
            const generatedExample = generateContainerExample({
                fieldName,
                containerType: typeReference.container,
                typeDeclarations,
                maxDepth,
                currentDepth,
                skipOptionalProperties,
                visitedTypes
            });
            if (generatedExample.type === "failure") {
                const { example, jsonExample } = generateEmptyContainerExample({
                    containerType: typeReference.container
                });
                return {
                    type: "success",
                    example: {
                        jsonExample,
                        shape: ExampleTypeReferenceShape.container(example)
                    },
                    jsonExample
                };
            }
            const { example, jsonExample } = generatedExample;
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.container(example)
                },
                jsonExample
            };
        }
        case "primitive": {
            const { jsonExample, example } = generatePrimitiveExample({
                fieldName,
                primitiveType: typeReference.primitive
            });
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.primitive(example)
                },
                jsonExample
            };
        }
        case "unknown": {
            const jsonExample = { key: "value" };
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.unknown(jsonExample)
                },
                jsonExample
            };
        }
    }
}

/**
 * Checks whether a type reference is a "leaf" — i.e. it can be generated
 * without recursing into named object/union types that might cycle.
 * Leaf types: primitives, enums, literals, unknown, and optional/nullable wrappers of leaves.
 */
function isLeafTypeReference(typeRef: TypeReference, typeDeclarations: Record<TypeId, TypeDeclaration>): boolean {
    switch (typeRef.type) {
        case "primitive":
        case "unknown":
            return true;
        case "named": {
            const td = typeDeclarations[typeRef.typeId];
            return td?.shape.type === "enum";
        }
        case "container": {
            switch (typeRef.container.type) {
                case "literal":
                    return true;
                case "optional":
                    return isLeafTypeReference(typeRef.container.optional, typeDeclarations);
                case "nullable":
                    return isLeafTypeReference(typeRef.container.nullable, typeDeclarations);
                default:
                    return false;
            }
        }
    }
}

/**
 * Checks whether a type reference points to a named type that has reached
 * the cycle limit (i.e. has been visited at least twice).
 * This unwraps containers like list, set, optional, nullable, and map.
 */
function isTypeReferenceInCycle(typeRef: TypeReference, visitedTypes: Map<string, number> | undefined): boolean {
    if (visitedTypes == null) {
        return false;
    }
    switch (typeRef.type) {
        case "named":
            return (visitedTypes.get(typeRef.typeId) ?? 0) >= 2;
        case "container":
            switch (typeRef.container.type) {
                case "list":
                    return isTypeReferenceInCycle(typeRef.container.list, visitedTypes);
                case "set":
                    return isTypeReferenceInCycle(typeRef.container.set, visitedTypes);
                case "optional":
                    return isTypeReferenceInCycle(typeRef.container.optional, visitedTypes);
                case "nullable":
                    return isTypeReferenceInCycle(typeRef.container.nullable, visitedTypes);
                case "map":
                    return isTypeReferenceInCycle(typeRef.container.valueType, visitedTypes);
                default:
                    return false;
            }
        default:
            return false;
    }
}

/**
 * Generates a stub example for a named type when cycle detection triggers.
 * Instead of returning failure (which cascades up and kills parent examples),
 * this produces a valid example with safe properties filled in:
 * - Objects → leaf properties + empty containers for list/set/map + required non-leaf properties outside cycle
 * - Enums → first enum value
 * - Aliases → resolve non-recursive targets; recursive ones get empty object
 * - Unions → first noProperties variant if available; otherwise failure
 */
function generateMinimalNamedExample({
    typeDeclaration,
    typeDeclarations,
    visitedTypes,
    leafOnly = false
}: {
    typeDeclaration: TypeDeclaration;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    visitedTypes?: Map<string, number>;
    leafOnly?: boolean;
}): ExampleGenerationResult<ExampleTypeReference> {
    switch (typeDeclaration.shape.type) {
        case "object": {
            const jsonExample: Record<string, unknown> = {};
            const properties: ExampleObjectProperty[] = [];
            for (const property of [
                ...(typeDeclaration.shape.properties ?? []),
                ...(typeDeclaration.shape.extendedProperties ?? [])
            ]) {
                if (
                    property.valueType.type === "container" &&
                    (property.valueType.container.type === "list" ||
                        property.valueType.container.type === "set" ||
                        property.valueType.container.type === "map")
                ) {
                    const emptyContainer = generateEmptyContainerExample({
                        containerType: property.valueType.container
                    });
                    properties.push({
                        name: property.name,
                        originalTypeDeclaration: typeDeclaration.name,
                        value: {
                            jsonExample: emptyContainer.jsonExample,
                            shape: ExampleTypeReferenceShape.container(emptyContainer.example)
                        },
                        propertyAccess: property.propertyAccess
                    });
                    jsonExample[property.name.wireValue] = emptyContainer.jsonExample;
                    continue;
                }
                const isLeaf = isLeafTypeReference(property.valueType, typeDeclarations);
                const isInCycle = !isLeaf && isTypeReferenceInCycle(property.valueType, visitedTypes);
                if (leafOnly && !isLeaf) {
                    continue;
                }
                if (isInCycle) {
                    if (property.valueType.type === "named") {
                        const td = typeDeclarations[property.valueType.typeId];
                        if (td != null) {
                            const leafStub = generateMinimalNamedExample({
                                typeDeclaration: td,
                                typeDeclarations,
                                visitedTypes,
                                leafOnly: true
                            });
                            if (leafStub.type === "success") {
                                properties.push({
                                    name: property.name,
                                    originalTypeDeclaration: typeDeclaration.name,
                                    value: leafStub.example,
                                    propertyAccess: property.propertyAccess
                                });
                                jsonExample[property.name.wireValue] = leafStub.jsonExample;
                            }
                        }
                    }
                    continue;
                }
                const propertyExample = generateTypeReferenceExample({
                    fieldName: property.name.wireValue,
                    typeReference: property.valueType,
                    typeDeclarations,
                    currentDepth: 0,
                    maxDepth: 3,
                    skipOptionalProperties: true,
                    visitedTypes
                });
                if (propertyExample.type === "failure") {
                    continue;
                }
                properties.push({
                    name: property.name,
                    originalTypeDeclaration: typeDeclaration.name,
                    value: propertyExample.example,
                    propertyAccess: property.propertyAccess
                });
                jsonExample[property.name.wireValue] = propertyExample.jsonExample;
            }
            const example = ExampleTypeShape.object({
                properties,
                extraProperties: undefined
            });
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.named({
                        shape: example,
                        typeName: typeDeclaration.name
                    })
                },
                jsonExample
            };
        }
        case "enum": {
            const enumValue = typeDeclaration.shape.values[0];
            if (enumValue == null) {
                return { type: "failure", message: "No enum values present for recursive type stub" };
            }
            const jsonExample = enumValue.name.wireValue;
            const example = ExampleTypeShape.enum({ value: enumValue.name });
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.named({
                        shape: example,
                        typeName: typeDeclaration.name
                    })
                },
                jsonExample
            };
        }
        case "alias": {
            const aliasOf = typeDeclaration.shape.aliasOf;
            if (aliasOf.type === "primitive") {
                const { jsonExample, example } = generatePrimitiveExample({
                    fieldName: undefined,
                    primitiveType: aliasOf.primitive
                });
                return {
                    type: "success",
                    example: {
                        jsonExample,
                        shape: ExampleTypeReferenceShape.named({
                            shape: ExampleTypeShape.alias({
                                value: { jsonExample, shape: ExampleTypeReferenceShape.primitive(example) }
                            }),
                            typeName: typeDeclaration.name
                        })
                    },
                    jsonExample
                };
            }
            if (aliasOf.type === "named") {
                const aliasedDeclaration = typeDeclarations[aliasOf.typeId];
                if (aliasedDeclaration != null && aliasedDeclaration.name.typeId !== typeDeclaration.name.typeId) {
                    return generateMinimalNamedExample({
                        typeDeclaration: aliasedDeclaration,
                        typeDeclarations,
                        visitedTypes
                    });
                }
            }
            const jsonExample = {};
            return {
                type: "success",
                example: {
                    jsonExample,
                    shape: ExampleTypeReferenceShape.named({
                        shape: ExampleTypeShape.alias({
                            value: { jsonExample, shape: ExampleTypeReferenceShape.unknown(jsonExample) }
                        }),
                        typeName: typeDeclaration.name
                    })
                },
                jsonExample
            };
        }
        case "union": {
            const discriminant = typeDeclaration.shape.discriminant;
            for (const variant of typeDeclaration.shape.types) {
                const isNoProperties = variant.shape._visit<boolean>({
                    noProperties: () => true,
                    samePropertiesAsObject: () => false,
                    singleProperty: () => false,
                    _other: () => false
                });
                if (isNoProperties) {
                    const jsonExample = { [discriminant.wireValue]: variant.discriminantValue.wireValue };
                    return {
                        type: "success",
                        example: {
                            jsonExample,
                            shape: ExampleTypeReferenceShape.named({
                                shape: ExampleTypeShape.union({
                                    discriminant,
                                    singleUnionType: {
                                        wireDiscriminantValue: variant.discriminantValue,
                                        shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                                    },
                                    baseProperties: [],
                                    extendProperties: []
                                }),
                                typeName: typeDeclaration.name
                            })
                        },
                        jsonExample
                    };
                }
            }
            return {
                type: "failure",
                message: `No simple variant available for recursive union ${typeDeclaration.name.typeId}`
            };
        }
        case "undiscriminatedUnion": {
            return {
                type: "failure",
                message: `Cannot generate stub for recursive undiscriminated union ${typeDeclaration.name.typeId}`
            };
        }
    }
}
