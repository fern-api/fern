import { assertNever } from "@fern-api/core-utils";
import { ContainerType, ExampleContainer, ExamplePrimitive, TypeDeclaration, TypeId } from "@fern-api/ir-sdk";

import { ExampleGenerationResult, ExampleGenerationSuccess } from "./ExampleGenerationResult";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";

export declare namespace generateContainerExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        containerType: ContainerType;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        maxDepth: number;
        currentDepth: number;

        skipOptionalProperties: boolean;
    }
}

export function generateContainerExample({
    fieldName,
    containerType,
    maxDepth,
    currentDepth,
    typeDeclarations,
    skipOptionalProperties
}: generateContainerExample.Args): ExampleGenerationResult<ExampleContainer> {
    if (currentDepth >= maxDepth) {
        return generateEmptyContainerExample({ containerType });
    }
    switch (containerType.type) {
        case "list": {
            const example = generateTypeReferenceExample({
                fieldName,
                typeReference: containerType.list,
                maxDepth,
                currentDepth: currentDepth + 1,
                typeDeclarations,
                skipOptionalProperties
            });
            if (example.type === "failure") {
                return generateEmptyContainerExample({ containerType });
            }
            return {
                type: "success",
                example: ExampleContainer.list({
                    list: [example.example, example.example],
                    itemType: containerType.list
                }),
                jsonExample: [example.jsonExample, example.jsonExample]
            };
        }
        case "literal": {
            return {
                type: "success",
                example: ExampleContainer.literal({
                    literal: containerType.literal._visit<ExamplePrimitive>({
                        boolean: (value) => ExamplePrimitive.boolean(value),
                        string: (value) => ExamplePrimitive.string({ original: value }),
                        _other: () => {
                            throw new Error("Encountered unknown literal type");
                        }
                    })
                }),
                jsonExample: containerType.literal._visit<unknown>({
                    boolean: (value) => value,
                    string: (value) => value,
                    _other: () => {
                        throw new Error("Encountered unknown literal type");
                    }
                })
            };
        }
        case "optional": {
            if (skipOptionalProperties) {
                return generateEmptyContainerExample({ containerType });
            }
            const example = generateTypeReferenceExample({
                fieldName,
                typeReference: containerType.optional,
                maxDepth,
                currentDepth: currentDepth + 1,
                typeDeclarations,
                skipOptionalProperties
            });
            if (example.type === "failure") {
                return generateEmptyContainerExample({ containerType });
            }
            return {
                type: "success",
                example: ExampleContainer.optional({
                    optional: example.example,
                    valueType: containerType.optional
                }),
                jsonExample: example.jsonExample
            };
        }
        case "set": {
            const example = generateTypeReferenceExample({
                fieldName,
                typeReference: containerType.set,
                maxDepth,
                currentDepth: currentDepth + 1,
                typeDeclarations,
                skipOptionalProperties
            });
            if (example.type === "failure") {
                return generateEmptyContainerExample({ containerType });
            }
            return {
                type: "success",
                example: ExampleContainer.set({
                    set: [example.example],
                    itemType: containerType.set
                }),
                jsonExample: [example.jsonExample]
            };
        }
        case "map": {
            const keyExample = generateTypeReferenceExample({
                fieldName,
                typeReference: containerType.keyType,
                maxDepth,
                currentDepth: currentDepth + 1,
                typeDeclarations,
                skipOptionalProperties
            });
            const valueExample = generateTypeReferenceExample({
                fieldName,
                typeReference: containerType.valueType,
                maxDepth,
                currentDepth: currentDepth + 1,
                typeDeclarations,
                skipOptionalProperties
            });
            if (keyExample.type === "failure" || valueExample.type === "failure") {
                return generateEmptyContainerExample({ containerType });
            }
            return {
                type: "success",
                example: ExampleContainer.map({
                    map: [
                        {
                            key: keyExample.example,
                            value: valueExample.example
                        }
                    ],
                    keyType: containerType.keyType,
                    valueType: containerType.valueType
                }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                jsonExample: { [keyExample.jsonExample as any]: valueExample.jsonExample }
            };
        }

        default:
            assertNever(containerType);
    }
}

export function generateEmptyContainerExample({
    containerType
}: {
    containerType: ContainerType;
}): ExampleGenerationSuccess<ExampleContainer> {
    switch (containerType.type) {
        case "list": {
            return {
                type: "success",
                example: ExampleContainer.list({
                    list: [],
                    itemType: containerType.list
                }),
                jsonExample: []
            };
        }
        case "literal": {
            return {
                type: "success",
                example: ExampleContainer.literal({
                    literal: containerType.literal._visit<ExamplePrimitive>({
                        boolean: (value) => ExamplePrimitive.boolean(value),
                        string: (value) => ExamplePrimitive.string({ original: value }),
                        _other: () => {
                            throw new Error("Encountered unknown literal type");
                        }
                    })
                }),
                jsonExample: containerType.literal._visit<unknown>({
                    boolean: (value) => value,
                    string: (value) => value,
                    _other: () => {
                        throw new Error("Encountered unknown literal type");
                    }
                })
            };
        }
        case "optional": {
            return {
                type: "success",
                example: ExampleContainer.optional({
                    optional: undefined,
                    valueType: containerType.optional
                }),
                jsonExample: undefined
            };
        }
        case "set": {
            return {
                type: "success",
                example: ExampleContainer.set({
                    set: [],
                    itemType: containerType.set
                }),
                jsonExample: []
            };
        }
        case "map": {
            return {
                type: "success",
                example: ExampleContainer.map({
                    map: [],
                    keyType: containerType.keyType,
                    valueType: containerType.valueType
                }),
                jsonExample: {}
            };
        }
        default:
            assertNever(containerType);
    }
}
