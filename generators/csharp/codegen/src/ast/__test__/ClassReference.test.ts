import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { CsharpConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as CsharpConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

describe("class reference", () => {
    it("generics", async () => {
        const clazz = generation.csharp.classReference({
            name: "OneOf",
            namespace: "OneOf",
            generics: [
                generation.Primitive.string,
                generation.Primitive.boolean,
                generation.csharp.classReference({
                    namespace: "System",
                    name: "List",
                    generics: [generation.Primitive.string]
                })
            ]
        });
        expect(
            clazz.toString({
                namespace: "",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation: generation
            })
        ).toContain("OneOf<string, bool, List<string>>");
    });
});
