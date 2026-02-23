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

describe("DiscriminatedUnionGenerator", () => {
    it("correctly sanitizes discriminant values", async () => {
        const context = await createSampleGeneratorContext(
            pathToDefinition("discriminant-values-with-special-characters")
        );
        const moduleName = "DiscriminantValuesWithSpecialCharacters";
        const unionName = "UnionWithSpecialCharacters";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });

    it("correctly omits variant properties colliding with discriminant", async () => {
        const context = await createSampleGeneratorContext(
            pathToDefinition("discriminated-union-variants-with-duplicate-discriminant")
        );
        const moduleName = "DiscriminatedUnionVariantsWithDuplicateDiscriminant";
        const unionName = "UnionWithDuplicateVariantDiscriminant";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });

    it("uses standalone types when all variants include the discriminant", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("all-variants-include-discriminant"));
        const moduleName = "AllVariantsIncludeDiscriminant";
        const unionName = "UnionAllVariantsIncludeDiscriminant";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });

    it("generates nested structs when no variants include the discriminant", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("no-variants-include-discriminant"));
        const moduleName = "NoVariantsIncludeDiscriminant";
        const unionName = "UnionNoVariantsIncludeDiscriminant";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });

    it("uses standalone type only for the variant that includes the discriminant", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("some-variants-include-discriminant"));
        const moduleName = "SomeVariantsIncludeDiscriminant";
        const unionName = "UnionSomeVariantsIncludeDiscriminant";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });

    it("correctly references variants whose names collide with built-in types", async () => {
        const context = await createSampleGeneratorContext(pathToDefinition("variants-with-colliding-names"));
        const moduleName = "VariantsWithCollidingNames";
        const unionName = "UnionWithCollidingVariantNames";
        const declaration = getUnionTypeDeclarationOrThrow(context, unionName);
        const generator = new DiscriminatedUnionGenerator({
            symbol: swift.Symbol.create(`${moduleName}.${unionName}`, unionName, {
                type: "enum-with-associated-values"
            }),
            unionTypeDeclaration: declaration,
            context
        });
        const union = generator.generate();
        await expect(union.toString()).toMatchFileSnapshot(`snapshots/${unionName}.swift`);
    });
});
