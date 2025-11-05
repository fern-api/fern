import {
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";

import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateContainerExample, generateEmptyContainerExample } from "./generateContainerExample";
import { generatePrimitiveExample } from "./generatePrimitiveExample";
import { generateTypeDeclarationExample } from "./generateTypeDeclarationExample";

export interface ExampleGenerationCache {
    // biome-ignore lint/suspicious/noExplicitAny: Cache stores results of various example types
    typeDeclarationCache: Map<string, ExampleGenerationResult<any>>;
}

export function createExampleGenerationCache(): ExampleGenerationCache {
    return {
        typeDeclarationCache: new Map()
    };
}

function getCacheKey(typeId: TypeId, currentDepth: number, maxDepth: number, skipOptionalProperties: boolean): string {
    return `${typeId}:${currentDepth}:${maxDepth}:${skipOptionalProperties}`;
}

export declare namespace generateTypeReferenceExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        typeReference: TypeReference;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        maxDepth: number;
        currentDepth: number;

        skipOptionalProperties: boolean;
        
        cache?: ExampleGenerationCache;
    }
}

export function generateTypeReferenceExample({
    fieldName,
    typeReference,
    typeDeclarations,
    maxDepth,
    currentDepth,
    skipOptionalProperties,
    cache
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
            
            if (cache != null) {
                const cacheKey = getCacheKey(typeReference.typeId, currentDepth, maxDepth, skipOptionalProperties);
                const cached = cache.typeDeclarationCache.get(cacheKey);
                if (cached != null) {
                    if (cached.type === "failure") {
                        return cached;
                    }
                    return {
                        type: "success",
                        example: {
                            jsonExample: cached.jsonExample,
                            shape: ExampleTypeReferenceShape.named({
                                shape: cached.example,
                                typeName: typeDeclaration.name
                            })
                        },
                        jsonExample: cached.jsonExample
                    };
                }
            }
            
            const generatedExample = generateTypeDeclarationExample({
                fieldName,
                typeDeclaration,
                typeDeclarations,
                maxDepth,
                currentDepth,
                skipOptionalProperties,
                cache
            });
            
            if (cache != null && generatedExample != null) {
                const cacheKey = getCacheKey(typeReference.typeId, currentDepth, maxDepth, skipOptionalProperties);
                cache.typeDeclarationCache.set(cacheKey, generatedExample);
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
                cache
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
