import {
    ExampleTypeReference,
    ExampleTypeReferenceShape,
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
                return { type: "failure", message: `Detected recursive type ${typeReference.typeId}` };
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
