import { resolve } from "node:path";
import { swift } from "@fern-api/swift-codegen";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { createSampleGeneratorContext } from "../../test-utils/createSampleGeneratorContext";
import { DiscriminatedUnionGenerator } from "../DiscriminatedUnionGenerator";

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
});
