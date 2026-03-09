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
    describe("standard-shapes", () => {
        let context: ModelGeneratorContext;
        beforeAll(async () => {
            context = await createSampleGeneratorContext(pathToDefinition("standard-shapes"));
        });

        it("samePropertiesAsObject: uses standalone types as associated values", async () => {
            const union = generateUnion(context, "StandardShapes", "ObjectVariantsUnion");
            await expect(union.toString()).toMatchFileSnapshot("snapshots/standard-shapes/ObjectVariantsUnion.swift");
        });

        it("singleProperty with primitives: wraps primitives under default value key", async () => {
            const union = generateUnion(context, "StandardShapes", "PrimitiveVariantsUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/standard-shapes/PrimitiveVariantsUnion.swift"
            );
        });

        it("singleProperty with explicit keys: wraps named types under specified keys", async () => {
            const union = generateUnion(context, "StandardShapes", "KeyedVariantsUnion");
            await expect(union.toString()).toMatchFileSnapshot("snapshots/standard-shapes/KeyedVariantsUnion.swift");
        });

        it("noProperties: generates bare enum cases without associated values", async () => {
            const union = generateUnion(context, "StandardShapes", "EmptyVariantsUnion");
            await expect(union.toString()).toMatchFileSnapshot("snapshots/standard-shapes/EmptyVariantsUnion.swift");
        });

        it("mixed: combines all three variant shapes in one union", async () => {
            const union = generateUnion(context, "StandardShapes", "MixedShapesUnion");
            await expect(union.toString()).toMatchFileSnapshot("snapshots/standard-shapes/MixedShapesUnion.swift");
        });
    });

    describe("custom-discriminant", () => {
        let context: ModelGeneratorContext;
        beforeAll(async () => {
            context = await createSampleGeneratorContext(pathToDefinition("custom-discriminant"));
        });

        it("samePropertiesAsObject with custom discriminant wire value", async () => {
            const union = generateUnion(context, "CustomDiscriminant", "CustomDiscriminantObjectUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/custom-discriminant/CustomDiscriminantObjectUnion.swift"
            );
        });

        it("singleProperty with custom discriminant and explicit keys", async () => {
            const union = generateUnion(context, "CustomDiscriminant", "CustomDiscriminantKeyedUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/custom-discriminant/CustomDiscriminantKeyedUnion.swift"
            );
        });
    });

    describe("edge-cases", () => {
        let context: ModelGeneratorContext;
        beforeAll(async () => {
            context = await createSampleGeneratorContext(pathToDefinition("edge-cases"));
        });

        it("sanitizes discriminant values with special characters", async () => {
            const union = generateUnion(context, "EdgeCases", "SpecialCharacterDiscriminantsUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/edge-cases/SpecialCharacterDiscriminantsUnion.swift"
            );
        });

        it("collapses singleProperty to bare case when key equals discriminant", async () => {
            const union = generateUnion(context, "EdgeCases", "DiscriminantKeyCollisionUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/edge-cases/DiscriminantKeyCollisionUnion.swift"
            );
        });

        it("handles multiple variants with the same underlying primitive type", async () => {
            const union = generateUnion(context, "EdgeCases", "DuplicatePrimitiveVariantsUnion");
            await expect(union.toString()).toMatchFileSnapshot(
                "snapshots/edge-cases/DuplicatePrimitiveVariantsUnion.swift"
            );
        });
    });
});
