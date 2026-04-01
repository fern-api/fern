import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { casingsGenerator, createDeclaredTypeName, createNameAndWireValue } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { ParsedSingleUnionTypeForUnion } from "../union/ParsedSingleUnionTypeForUnion.js";
import { SamePropertiesAsObjectSingleUnionTypeGenerator } from "../union/SamePropertiesAsObjectSingleUnionTypeGenerator.js";
import { UnknownSingleUnionType } from "../union/UnknownSingleUnionType.js";
import { UnknownSingleUnionTypeGenerator } from "../union/UnknownSingleUnionTypeGenerator.js";

const testCaseConverter = new CaseConverter({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: false
});

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function createUnionDeclaration(opts?: {
    discriminant?: FernIr.NameAndWireValue;
    types?: FernIr.SingleUnionType[];
}): FernIr.UnionTypeDeclaration {
    return {
        discriminant: opts?.discriminant ?? createNameAndWireValue("type", "type"),
        extends: [],
        types: opts?.types ?? [],
        baseProperties: [],
        discriminatorContext: undefined
    };
}

function createSingleUnionType(
    discriminantValue: string,
    shape: FernIr.SingleUnionTypeProperties
): FernIr.SingleUnionType {
    return {
        discriminantValue: createNameAndWireValue(discriminantValue, discriminantValue),
        shape,
        displayName: undefined,
        docs: undefined,
        availability: undefined
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for BaseContext
function createMockBaseContext(opts?: { inline?: boolean }): any {
    return {
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createTypeReferenceNode("SomeType"),
                requestTypeNode: undefined,
                responseTypeNode: undefined,
                isOptional: false
            }),
            getReferenceToTypeForInlineUnion: () => ({
                typeNode: ts.factory.createTypeReferenceNode("SomeInlineType"),
                requestTypeNode: undefined,
                responseTypeNode: undefined,
                isOptional: false
            }),
            getReferenceToNamedType: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("NamedType"),
                getEntityName: () => ts.factory.createIdentifier("NamedType"),
                getExpression: () => ts.factory.createIdentifier("NamedType")
            }),
            typeNameToTypeReference: (name: FernIr.DeclaredTypeName) =>
                FernIr.TypeReference.named({
                    ...name,
                    default: undefined,
                    inline: undefined
                }),
            getTypeDeclaration: () => ({
                name: createDeclaredTypeName("InlineType"),
                inline: opts?.inline ?? false
            }),
            getGeneratedType: () => ({
                type: "object",
                generateForInlineUnion: () => ({
                    typeNode: ts.factory.createTypeReferenceNode("InlinedObject"),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                }),
                generateProperties: () => [],
                generateModule: () => undefined
            }),
            needsRequestResponseTypeVariantById: () => ({ request: false, response: false })
        }
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// UnknownSingleUnionTypeGenerator
// ──────────────────────────────────────────────────────────────────────────────

describe("UnknownSingleUnionTypeGenerator", () => {
    it("generateForInlineUnion returns any type", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const result = gen.generateForInlineUnion();
        expect(getTextOfTsNode(result.typeNode)).toBe("any");
        expect(result.requestTypeNode).toBeUndefined();
        expect(result.responseTypeNode).toBeUndefined();
    });

    it("getExtendsForInterface returns empty", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        expect(gen.getExtendsForInterface()).toEqual([]);
    });

    it("getDiscriminantPropertiesForInterface returns empty", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        expect(gen.getDiscriminantPropertiesForInterface()).toEqual([]);
    });

    it("generateModule returns undefined", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        expect(gen.generateModule()).toBeUndefined();
    });

    it("getNonDiscriminantPropertiesForInterface returns empty", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        expect(gen.getNonDiscriminantPropertiesForInterface()).toEqual([]);
    });

    it("getVisitorArguments returns local reference", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const localRef = ts.factory.createIdentifier("value");
        const args = gen.getVisitorArguments({ localReferenceToUnionValue: localRef });
        expect(args).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(args[0]!)).toBe("value");
    });

    it("getVisitMethodParameterType returns type literal with discriminant", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const context = createMockBaseContext();
        const typeNode = gen.getVisitMethodParameterType(context, { discriminant: "type" });
        expect(typeNode).toBeDefined();
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(typeNode!)).toContain("type");
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(typeNode!)).toContain("string");
    });

    it("getParametersForBuilder returns parameter with type literal", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const context = createMockBaseContext();
        const params = gen.getParametersForBuilder(context, { discriminant: "kind" });
        expect(params).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        const paramText = getTextOfTsNode(params[0]!);
        expect(paramText).toContain("value");
        expect(paramText).toContain("kind");
    });

    it("getBuilderArgsFromExistingValue returns existing value", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const existing = ts.factory.createIdentifier("existingVal");
        const args = gen.getBuilderArgsFromExistingValue(existing);
        expect(args).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(args[0]!)).toBe("existingVal");
    });

    it("getNonDiscriminantPropertiesForBuilder returns spread assignment", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        const props = gen.getNonDiscriminantPropertiesForBuilder();
        expect(props).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(props[0]! as unknown as ts.Expression)).toContain("value");
    });

    it("needsRequestResponse returns false for both", () => {
        const gen = new UnknownSingleUnionTypeGenerator();
        expect(gen.needsRequestResponse()).toEqual({ request: false, response: false });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// UnknownSingleUnionType
// ──────────────────────────────────────────────────────────────────────────────

describe("UnknownSingleUnionType", () => {
    it("getDiscriminantValueType returns string keyword", () => {
        // biome-ignore lint/suspicious/noExplicitAny: UnknownSingleUnionType inherits constructor from AbstractParsedSingleUnionType
        const unknownType = new (UnknownSingleUnionType as any)({
            singleUnionType: new UnknownSingleUnionTypeGenerator(),
            includeUtilsOnUnionMembers: true
        });
        const typeNode = unknownType.getDiscriminantValueType();
        expect(getTextOfTsNode(typeNode)).toBe("string");
    });

    it("needsRequestResponse returns false for both", () => {
        // biome-ignore lint/suspicious/noExplicitAny: UnknownSingleUnionType inherits constructor from AbstractParsedSingleUnionType
        const unknownType = new (UnknownSingleUnionType as any)({
            singleUnionType: new UnknownSingleUnionTypeGenerator(),
            includeUtilsOnUnionMembers: true
        });
        expect(unknownType.needsRequestResponse()).toEqual({ request: false, response: false });
    });

    it("getDocs returns undefined", () => {
        // biome-ignore lint/suspicious/noExplicitAny: UnknownSingleUnionType inherits constructor from AbstractParsedSingleUnionType
        const unknownType = new (UnknownSingleUnionType as any)({
            singleUnionType: new UnknownSingleUnionTypeGenerator(),
            includeUtilsOnUnionMembers: true
        });
        expect(unknownType.getDocs()).toBeUndefined();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// SamePropertiesAsObjectSingleUnionTypeGenerator
// ──────────────────────────────────────────────────────────────────────────────

describe("SamePropertiesAsObjectSingleUnionTypeGenerator", () => {
    const extended = createDeclaredTypeName("MyObject");

    it("needsRequestResponse delegates to context", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext();
        const result = gen.needsRequestResponse(context);
        expect(result).toEqual({ request: false, response: false });
    });

    it("generateForInlineUnion returns reference when not inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext({ inline: false });
        const result = gen.generateForInlineUnion(context);
        expect(getTextOfTsNode(result.typeNode)).toBe("SomeType");
    });

    it("generateForInlineUnion delegates to generated type when inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: true });
        const context = createMockBaseContext({ inline: true });
        const result = gen.generateForInlineUnion(context);
        expect(getTextOfTsNode(result.typeNode)).toBe("InlinedObject");
    });

    it("getExtendsForInterface returns reference when not inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext({ inline: false });
        const result = gen.getExtendsForInterface(context);
        expect(result).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(result[0]!.typeNode)).toBe("SomeType");
    });

    it("getExtendsForInterface returns empty when inline types enabled and type is inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: true });
        const context = createMockBaseContext({ inline: true });
        const result = gen.getExtendsForInterface(context);
        expect(result).toEqual([]);
    });

    it("getDiscriminantPropertiesForInterface returns empty when not inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext({ inline: false });
        const result = gen.getDiscriminantPropertiesForInterface(context);
        expect(result).toEqual([]);
    });

    it("getDiscriminantPropertiesForInterface returns properties when inline and object type", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: true });
        const context = createMockBaseContext({ inline: true });
        const result = gen.getDiscriminantPropertiesForInterface(context);
        // Our mock returns [] from generateProperties
        expect(result).toEqual([]);
    });

    it("generateModule returns undefined when enableInlineTypes is false", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext();
        expect(gen.generateModule(context)).toBeUndefined();
    });

    it("generateModule returns undefined when not inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: true });
        const context = createMockBaseContext({ inline: false });
        expect(gen.generateModule(context)).toBeUndefined();
    });

    it("generateModule delegates to generated type when inline", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: true });
        const context = createMockBaseContext({ inline: true });
        // Mock returns undefined from generateModule
        expect(gen.generateModule(context)).toBeUndefined();
    });

    it("getNonDiscriminantPropertiesForInterface returns empty", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        expect(gen.getNonDiscriminantPropertiesForInterface()).toEqual([]);
    });

    it("getParametersForBuilder returns parameter with named type reference", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext();
        const params = gen.getParametersForBuilder(context);
        expect(params).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        const paramText = getTextOfTsNode(params[0]!);
        expect(paramText).toContain("value");
    });

    it("getNonDiscriminantPropertiesForBuilder returns spread assignment", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const props = gen.getNonDiscriminantPropertiesForBuilder();
        expect(props).toHaveLength(1);
    });

    it("getVisitMethodParameterType returns named type reference", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const context = createMockBaseContext();
        const typeNode = gen.getVisitMethodParameterType(context);
        expect(typeNode).toBeDefined();
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(typeNode!)).toBe("NamedType");
    });

    it("getVisitorArguments returns local reference", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const localRef = ts.factory.createIdentifier("val");
        const args = gen.getVisitorArguments({ localReferenceToUnionValue: localRef });
        expect(args).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(args[0]!)).toBe("val");
    });

    it("getBuilderArgsFromExistingValue returns existing value", () => {
        const gen = new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes: false });
        const existing = ts.factory.createIdentifier("x");
        const args = gen.getBuilderArgsFromExistingValue(existing);
        expect(args).toHaveLength(1);
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(args[0]!)).toBe("x");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// ParsedSingleUnionTypeForUnion
// ──────────────────────────────────────────────────────────────────────────────

describe("ParsedSingleUnionTypeForUnion", () => {
    const union = createUnionDeclaration();

    describe("with noProperties shape", () => {
        it("creates instance with noProperties shape", () => {
            const singleUnionType = createSingleUnionType("none", FernIr.SingleUnionTypeProperties.noProperties());
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getTypeName()).toBe("None");
            expect(parsed.getDiscriminantValue()).toBe("none");
        });
    });

    describe("with samePropertiesAsObject shape", () => {
        it("creates instance with samePropertiesAsObject shape", () => {
            const extended = createDeclaredTypeName("UserObject");
            const singleUnionType = createSingleUnionType(
                "user",
                FernIr.SingleUnionTypeProperties.samePropertiesAsObject(extended)
            );
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getTypeName()).toBe("User");
            expect(parsed.getDiscriminantValue()).toBe("user");
        });
    });

    describe("with singleProperty shape", () => {
        it("creates instance with singleProperty shape", () => {
            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValue("value", "value"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };
            const singleUnionType = createSingleUnionType(
                "text",
                FernIr.SingleUnionTypeProperties.singleProperty(singleProperty)
            );
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getTypeName()).toBe("Text");
            expect(parsed.getDiscriminantValue()).toBe("text");
        });
    });

    describe("getDocs", () => {
        it("returns undefined when no docs", () => {
            const singleUnionType = createSingleUnionType("none", FernIr.SingleUnionTypeProperties.noProperties());
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getDocs()).toBeUndefined();
        });

        it("returns docs when provided", () => {
            const singleUnionType: FernIr.SingleUnionType = {
                discriminantValue: createNameAndWireValue("none", "none"),
                shape: FernIr.SingleUnionTypeProperties.noProperties(),
                displayName: undefined,
                docs: "A type with no properties",
                availability: undefined
            };
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getDocs()).toBe("A type with no properties");
        });
    });

    describe("getBuilderName", () => {
        it("returns camelCase name with serde layer and no retain original casing", () => {
            const singleUnionType = createSingleUnionType(
                "my_variant",
                FernIr.SingleUnionTypeProperties.noProperties()
            );
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getBuilderName()).toBe(testCaseConverter.camelUnsafe(singleUnionType.discriminantValue));
        });

        it("returns wire value when retainOriginalCasing is true", () => {
            const singleUnionType = createSingleUnionType(
                "my_variant",
                FernIr.SingleUnionTypeProperties.noProperties()
            );
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: true,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getBuilderName()).toBe("my_variant");
        });

        it("returns wire value when includeSerdeLayer is false", () => {
            const singleUnionType = createSingleUnionType(
                "my_variant",
                FernIr.SingleUnionTypeProperties.noProperties()
            );
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: false,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getBuilderName()).toBe("my_variant");
        });
    });

    describe("getVisitorKey", () => {
        it("returns camelCase name with serde layer", () => {
            const singleUnionType = createSingleUnionType("some_key", FernIr.SingleUnionTypeProperties.noProperties());
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getVisitorKey()).toBe(testCaseConverter.camelUnsafe(singleUnionType.discriminantValue));
        });

        it("returns wire value when retainOriginalCasing is true", () => {
            const singleUnionType = createSingleUnionType("some_key", FernIr.SingleUnionTypeProperties.noProperties());
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: true,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            expect(parsed.getVisitorKey()).toBe("some_key");
        });
    });

    describe("getSinglePropertyKey (static)", () => {
        it("returns camelCase name with serde layer", () => {
            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValue("myProp", "my_prop"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };
            const key = ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                caseConverter: testCaseConverter
            });
            expect(key).toBe(testCaseConverter.camelUnsafe(singleProperty.name));
        });

        it("returns wire value when retainOriginalCasing is true", () => {
            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValue("myProp", "my_prop"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };
            const key = ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                includeSerdeLayer: true,
                retainOriginalCasing: true,
                caseConverter: testCaseConverter
            });
            expect(key).toBe("my_prop");
        });

        it("returns wire value when includeSerdeLayer is false", () => {
            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValue("myProp", "my_prop"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };
            const key = ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                includeSerdeLayer: false,
                retainOriginalCasing: false,
                caseConverter: testCaseConverter
            });
            expect(key).toBe("my_prop");
        });
    });

    describe("sanitizeIdentifier (via getTypeName)", () => {
        it("prefixes with underscore when name starts with digit", () => {
            const name = casingsGenerator.generateName("123type");
            // The casings generator produces a pascalCase that starts with a digit
            const singleUnionType: FernIr.SingleUnionType = {
                discriminantValue: {
                    name,
                    wireValue: "123type"
                },
                shape: FernIr.SingleUnionTypeProperties.noProperties(),
                displayName: undefined,
                docs: undefined,
                availability: undefined
            };
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const typeName = parsed.getTypeName();
            // sanitizeIdentifier should prefix with _ if starts with digit
            if (/^\d/.test(name.pascalCase.unsafeName)) {
                expect(typeName).toBe(`_${name.pascalCase.unsafeName}`);
            } else {
                expect(typeName).toBe(name.pascalCase.unsafeName);
            }
        });
    });

    describe("needsRequestResponse", () => {
        it("delegates to singleUnionType", () => {
            const singleUnionType = createSingleUnionType("none", FernIr.SingleUnionTypeProperties.noProperties());
            const parsed = new ParsedSingleUnionTypeForUnion({
                singleUnionType,
                union,
                includeUtilsOnUnionMembers: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                noOptionalProperties: false,
                enableInlineTypes: false,
                generateReadWriteOnlyTypes: false,
                caseConverter: testCaseConverter
            });
            const context = createMockBaseContext();
            const result = parsed.needsRequestResponse(context);
            expect(result).toEqual({ request: false, response: false });
        });
    });
});
