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

import { getWireValue } from "../../utils/namesUtils.js";
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
                // Pass current type to prevent infinite recursion in minimal generation
                const visitedMinimalTypes = new Set<string>([typeReference.typeId]);
                return generateMinimalNamedExample({
                    typeDeclaration,
                    typeDeclarations,
                    visitedMinimalTypes
                });
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
 * Generates a stub example for a named type when cycle detection triggers.
 * Instead of returning failure (which cascades up and kills parent examples),
 * this produces a valid example with all leaf (non-recursive) properties filled in:
 * - Objects → generates all primitive/enum/literal properties, skips recursive ones
 * - Enums → first enum value
 * - Aliases → resolve non-recursive targets; recursive ones get empty object
 * - Unions → first noProperties variant if available; otherwise failure
 */
function generateMinimalNamedExample({
    typeDeclaration,
    typeDeclarations,
    visitedMinimalTypes
}: {
    typeDeclaration: TypeDeclaration;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    visitedMinimalTypes?: Set<string>;
}): ExampleGenerationResult<ExampleTypeReference> {
    const visited = visitedMinimalTypes ?? new Set<string>();
    visited.add(typeDeclaration.name.typeId);
    switch (typeDeclaration.shape.type) {
        case "object": {
            const jsonExample: Record<string, unknown> = {};
            const properties: ExampleObjectProperty[] = [];
            for (const property of [
                ...(typeDeclaration.shape.properties ?? []),
                ...(typeDeclaration.shape.extendedProperties ?? [])
            ]) {
                if (isLeafTypeReference(property.valueType, typeDeclarations)) {
                    const propertyExample = generateTypeReferenceExample({
                        fieldName: getWireValue(property.name),
                        typeReference: property.valueType,
                        typeDeclarations,
                        currentDepth: 0,
                        maxDepth: 3,
                        skipOptionalProperties: true
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
                    jsonExample[getWireValue(property.name)] = propertyExample.jsonExample;
                } else if (property.valueType.type === "named" && !visited.has(property.valueType.typeId)) {
                    // For non-leaf named types, try to generate a minimal example recursively.
                    // This ensures required object properties (like `memo`) are included in stubs.
                    const nestedDeclaration = typeDeclarations[property.valueType.typeId];
                    if (nestedDeclaration != null) {
                        const nestedExample = generateMinimalNamedExample({
                            typeDeclaration: nestedDeclaration,
                            typeDeclarations,
                            visitedMinimalTypes: visited
                        });
                        if (nestedExample.type === "success") {
                            properties.push({
                                name: property.name,
                                originalTypeDeclaration: typeDeclaration.name,
                                value: nestedExample.example,
                                propertyAccess: property.propertyAccess
                            });
                            jsonExample[getWireValue(property.name)] = nestedExample.jsonExample;
                        }
                    }
                } else if (property.valueType.type === "container") {
                    // For container types (list, set, map), generate empty containers
                    // so that round-trip serialization is consistent.
                    const { example: emptyExample, jsonExample: emptyJson } = generateEmptyContainerExample({
                        containerType: property.valueType.container
                    });
                    properties.push({
                        name: property.name,
                        originalTypeDeclaration: typeDeclaration.name,
                        value: {
                            jsonExample: emptyJson,
                            shape: ExampleTypeReferenceShape.container(emptyExample)
                        },
                        propertyAccess: property.propertyAccess
                    });
                    jsonExample[getWireValue(property.name)] = emptyJson;
                }
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
            const jsonExample = getWireValue(enumValue.name);
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
                        visitedMinimalTypes: visited
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
                    const jsonExample = { [getWireValue(discriminant)]: getWireValue(variant.discriminantValue) };
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
