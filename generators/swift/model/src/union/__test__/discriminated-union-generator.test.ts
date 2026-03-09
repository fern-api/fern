import { resolve } from "node:path";
import { swift } from "@fern-api/swift-codegen";
import { ModelGeneratorContext } from "../../ModelGeneratorContext.js";
import { createSampleGeneratorContext } from "../../test-utils/createSampleGeneratorContext.js";
import { DiscriminatedUnionGenerator } from "../DiscriminatedUnionGenerator.js";

function getUnionTypeDeclarationOrThrow(context: ModelGeneratorContext, name: string) {
    for (const declaration of Object.values(context.ir.types)) {
        const utd = declaration.shape._visit({
            object: () => null,
            alias: () => null,
            enum: () => null,
            undiscriminatedUnion: () => null,
            union: (utd) => utd,
            _other: () => null
        });
        if (utd && declaration.name.name.originalName === name) {
            return utd;
        }
    }
    throw new Error(`Type declaration for ${name} not found`);
}

function pathToDefinition(testDefinitionName: string) {
    return resolve(__dirname, "./test-definitions", testDefinitionName);
}

function generateUnion(context: ModelGeneratorContext, moduleName: string, unionName: string) {
    const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
    const generator = new DiscriminatedUnionGenerator({
        symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
            type: "enum-with-associated-values"
        }),
        unionTypeDeclaration: declaration,
        context
    });
    return generator.generate();
}

describe("DiscriminatedUnionGenerator", () => {
    it("correctly sanitizes discriminant values", async () => {
        const context = await createSampleGeneratorContext(
            pathToDefinition("discriminant-values-with-special-characters")
        );
        const union = generateUnion(context, "DiscriminantValuesWithSpecialCharacters", "UnionWithSpecialCharacters");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithSpecialCharacters.swift");
    });

    it("correctly omits variant properties colliding with discriminant", async () => {
        const context = await createSampleGeneratorContext(
            pathToDefinition("discriminated-union-variants-with-duplicate-discriminant")
        );
        const union = generateUnion(
            context,
            "DiscriminatedUnionVariantsWithDuplicateDiscriminant",
            "UnionWithDuplicateVariantDiscriminant"
        );
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithDuplicateVariantDiscriminant.swift");
    });

    it("generates samePropertiesAsObject variants using standalone types", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("same-properties-as-object"));
        const union = generateUnion(context, "SamePropertiesAsObject", "Animal");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/Animal.swift");
    });

    it("generates singleProperty variants with inner types directly", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("single-property-variants"));
        const union = generateUnion(context, "SinglePropertyVariants", "UnionWithSingleProperty");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithSingleProperty.swift");
    });

    it("generates singleProperty variants with named type keys", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("single-property-variants"));
        const union = generateUnion(context, "SinglePropertyVariants", "UnionWithNamedSingleProperty");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithNamedSingleProperty.swift");
    });

    it("generates singleProperty variants with custom discriminant and explicit keys", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("single-property-variants"));
        const union = generateUnion(context, "SinglePropertyVariants", "UnionWithCustomDiscriminantAndKeys");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithCustomDiscriminantAndKeys.swift");
    });

    it("generates noProperties variants without associated values", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("no-properties-variants"));
        const union = generateUnion(context, "NoPropertiesVariants", "UnionWithNoProperties");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithNoProperties.swift");
    });

    it("generates mixed noProperties and samePropertiesAsObject variants", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("no-properties-variants"));
        const union = generateUnion(context, "NoPropertiesVariants", "UnionWithMixedNoProperties");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithMixedNoProperties.swift");
    });

    it("generates union with all three variant shapes", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("mixed-variant-shapes"));
        const union = generateUnion(context, "MixedVariantShapes", "MixedUnion");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/MixedUnion.swift");
    });

    it("generates union with custom discriminant key", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("mixed-variant-shapes"));
        const union = generateUnion(context, "MixedVariantShapes", "UnionWithCustomDiscriminant");
        await expect(union.toString()).toMatchFileSnapshot("snapshots/UnionWithCustomDiscriminant.swift");
    });
});
