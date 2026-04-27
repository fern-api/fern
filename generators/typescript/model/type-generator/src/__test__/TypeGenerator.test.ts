import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { Reference } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { casingsGenerator, createDeclaredTypeName, createNameAndWireValue } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { TypeGenerator } from "../TypeGenerator.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function createFernFilepath(): FernIr.FernFilepath {
    return {
        allParts: [casingsGenerator.generateName("types")],
        packagePath: [casingsGenerator.generateName("types")],
        file: casingsGenerator.generateName("types")
    };
}

function createReferenceToSelf(): Reference {
    return {
        getTypeNode: () => ts.factory.createTypeReferenceNode("TestType"),
        getEntityName: () => ts.factory.createIdentifier("TestType"),
        getExpression: () => ts.factory.createIdentifier("TestType")
    };
}

function createBaseArgs(shape: FernIr.Type): TypeGenerator.generateType.Args<BaseContext> {
    return {
        typeName: "TestType",
        shape,
        examples: [],
        docs: undefined,
        fernFilepath: createFernFilepath(),
        getReferenceToSelf: createReferenceToSelf,
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inline: false
    };
}

const testCaseConverter = new CaseConverter({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: false
});

function createDefaultGenerator(): TypeGenerator {
    return new TypeGenerator({
        useBrandedStringAliases: false,
        includeUtilsOnUnionMembers: true,
        includeOtherInUnionTypes: true,
        enableForwardCompatibleEnums: false,
        includeSerdeLayer: true,
        noOptionalProperties: false,
        retainOriginalCasing: false,
        enableInlineTypes: false,
        generateReadWriteOnlyTypes: false,
        caseConverter: testCaseConverter
    });
}

// ──────────────────────────────────────────────────────────────────────────────
// TypeGenerator
// ──────────────────────────────────────────────────────────────────────────────

describe("TypeGenerator", () => {
    describe("generateType", () => {
        it("generates object type", () => {
            const generator = createDefaultGenerator();
            const shape = FernIr.Type.object({
                properties: [],
                extends: [],
                extraProperties: false,
                extendedProperties: undefined
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("object");
        });

        it("generates enum type", () => {
            const generator = createDefaultGenerator();
            const shape = FernIr.Type.enum({
                values: [
                    {
                        name: createNameAndWireValue("Active", "ACTIVE"),
                        docs: undefined,
                        availability: undefined
                    }
                ],
                default: undefined,
                forwardCompatible: undefined
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("enum");
        });

        it("generates union type", () => {
            const generator = createDefaultGenerator();
            const shape = FernIr.Type.union({
                discriminant: createNameAndWireValue("type", "type"),
                extends: [],
                types: [],
                baseProperties: [],
                default: undefined,
                discriminatorContext: undefined
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("union");
        });

        it("generates undiscriminated union type", () => {
            const generator = createDefaultGenerator();
            const shape = FernIr.Type.undiscriminatedUnion({
                members: [
                    {
                        type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    }
                ],
                baseProperties: undefined
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("undiscriminatedUnion");
        });

        it("generates alias type for non-string primitive", () => {
            const generator = createDefaultGenerator();
            const shape = FernIr.Type.alias({
                aliasOf: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                resolvedType: FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.Integer,
                    v2: undefined
                })
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("alias");
        });

        it("generates alias type for named type", () => {
            const generator = createDefaultGenerator();
            const namedType = createDeclaredTypeName("User");
            const shape = FernIr.Type.alias({
                aliasOf: FernIr.TypeReference.named({
                    ...namedType,
                    default: undefined,
                    inline: undefined
                }),
                resolvedType: FernIr.ResolvedTypeReference.named({
                    name: namedType,
                    shape: FernIr.ShapeType.Object
                })
            });
            const result = generator.generateType(createBaseArgs(shape));
            expect(result.type).toBe("alias");
        });
    });

    describe("generateAlias - branded string aliases", () => {
        it("generates branded string alias for string type", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "UserId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates branded string alias for UUID type", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "UniqueId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "UUID", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates branded string alias for date type", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "BirthDate",
                aliasOf: FernIr.TypeReference.primitive({ v1: "DATE", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates branded string alias for base64 type", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "EncodedData",
                aliasOf: FernIr.TypeReference.primitive({ v1: "BASE_64", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates branded string alias for bigInteger type", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "BigNum",
                aliasOf: FernIr.TypeReference.primitive({ v1: "BIG_INTEGER", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates regular alias for integer (non-string-like) when branded enabled", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "Count",
                aliasOf: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates regular alias for double (non-string-like) when branded enabled", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "Price",
                aliasOf: FernIr.TypeReference.primitive({ v1: "DOUBLE", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates regular alias for boolean (non-string-like) when branded enabled", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const result = generator.generateAlias({
                typeName: "IsActive",
                aliasOf: FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });

        it("generates regular alias for named type when branded enabled", () => {
            const generator = new TypeGenerator({
                useBrandedStringAliases: true,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true,
                enableForwardCompatibleEnums: false,
                includeSerdeLayer: true,
                noOptionalProperties: false,
                retainOriginalCasing: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const namedType = createDeclaredTypeName("User");
            const result = generator.generateAlias({
                typeName: "UserAlias",
                aliasOf: FernIr.TypeReference.named({
                    ...namedType,
                    default: undefined,
                    inline: undefined
                }),
                examples: [],
                docs: undefined,
                fernFilepath: createFernFilepath(),
                getReferenceToSelf: createReferenceToSelf
            });
            expect(result.type).toBe("alias");
        });
    });
});
