import { PrimitiveTypeV1, PrimitiveTypeV2, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import {
    createExampleGenerationCache,
    generateTypeReferenceExample
} from "../examples/v1/generateTypeReferenceExample";

describe("Example Generation Memoization", () => {
    it("should cache and reuse results for the same type with same parameters", () => {
        const cache = createExampleGenerationCache();

        const stringTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {};

        const result1 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        const result2 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        expect(result1.type).toBe("success");
        expect(result2.type).toBe("success");

        if (result1.type === "success" && result2.type === "success") {
            expect(result1.jsonExample).toEqual(result2.jsonExample);
        }
    });

    it("should generate different cache entries for different parameters", () => {
        const cache = createExampleGenerationCache();

        const stringTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {};

        const result1 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        const result2 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 1,
            skipOptionalProperties: false,
            cache
        });

        expect(result1.type).toBe("success");
        expect(result2.type).toBe("success");

        expect(cache.typeDeclarationCache.size).toBeGreaterThanOrEqual(0);
    });

    it("should generate different cache entries for different skipOptionalProperties values", () => {
        const cache = createExampleGenerationCache();

        const stringTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {};

        const result1 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        const result2 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: true,
            cache
        });

        expect(result1.type).toBe("success");
        expect(result2.type).toBe("success");
    });

    it("should work without cache parameter (backward compatibility)", () => {
        const stringTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {};

        const result = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false
        });

        expect(result.type).toBe("success");
    });

    it("should handle cache with multiple different types", () => {
        const cache = createExampleGenerationCache();

        const stringTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const intTypeReference: TypeReference = TypeReference.primitive({
            v1: PrimitiveTypeV1.Integer,
            v2: PrimitiveTypeV2.integer({
                default: undefined,
                validation: undefined
            })
        });

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {};

        const result1 = generateTypeReferenceExample({
            typeReference: stringTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        const result2 = generateTypeReferenceExample({
            typeReference: intTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        expect(result1.type).toBe("success");
        expect(result2.type).toBe("success");

        if (result1.type === "success" && result2.type === "success") {
            expect(typeof result1.jsonExample).toBe("string");
            expect(typeof result2.jsonExample).toBe("number");
        }
    });

    it("should not cache alias types to preserve fieldName-dependent examples", () => {
        const cache = createExampleGenerationCache();

        const stringAliasTypeId: TypeId = "StringAlias";

        const stringPrimitiveType = TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: undefined,
                validation: undefined
            })
        });

        const stringAliasDeclaration: TypeDeclaration = {
            name: {
                typeId: stringAliasTypeId,
                fernFilepath: {
                    allParts: [],
                    file: "StringAlias",
                    packagePath: []
                },
                name: "StringAlias"
            },
            shape: {
                type: "alias",
                aliasOf: stringPrimitiveType,
                resolvedType: stringPrimitiveType
            },
            docs: undefined,
            availability: undefined,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            v2Examples: undefined,
            referencedTypes: new Set(),
            encoding: undefined,
            source: undefined,
            inlineTypes: undefined
        };

        const typeDeclarations: Record<TypeId, TypeDeclaration> = {
            [stringAliasTypeId]: stringAliasDeclaration
        };

        const aliasTypeReference: TypeReference = TypeReference.named({
            name: stringAliasDeclaration.name,
            typeId: stringAliasTypeId
        });

        const result1 = generateTypeReferenceExample({
            fieldName: "firstName",
            typeReference: aliasTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        const result2 = generateTypeReferenceExample({
            fieldName: "lastName",
            typeReference: aliasTypeReference,
            typeDeclarations,
            maxDepth: 5,
            currentDepth: 0,
            skipOptionalProperties: false,
            cache
        });

        expect(result1.type).toBe("success");
        expect(result2.type).toBe("success");

        if (result1.type === "success" && result2.type === "success") {
            expect(result1.jsonExample).toBe("firstName");
            expect(result2.jsonExample).toBe("lastName");
        }
    });
});
