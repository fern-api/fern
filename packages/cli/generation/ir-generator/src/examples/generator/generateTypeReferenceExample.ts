import {
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { generatePrimitiveExample } from "./generatePrimitiveExample";
import { generateContainerExample, generateEmptyContainerExample } from "./generateContainerExample";
import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateTypeDeclarationExample } from "./generateTypeDeclarationExample";

export declare namespace generateTypeReferenceExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        typeReference: TypeReference;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        maxDepth: number;
        currentDepth: number;
    }
}

export function generateTypeReferenceExample({
    fieldName,
    typeReference,
    typeDeclarations,
    maxDepth,
    currentDepth
}: generateTypeReferenceExample.Args): ExampleGenerationResult<ExampleTypeReference> {
    switch (typeReference.type) {
        case "named": {
            const typeDeclaration = typeDeclarations[typeReference.typeId];
            if (typeDeclaration == null) {
                throw new Error(`Failed to find type declaration with id ${typeReference.typeId}`);
            }
            const generatedExample = generateTypeDeclarationExample({
                fieldName,
                typeDeclaration,
                typeDeclarations,
                maxDepth,
                currentDepth
            });
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
                currentDepth
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
