import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ast, BaseCsharpCustomConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as BaseCsharpCustomConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

describe("class", () => {
    it("basic", async () => {
        const clazz = generation.csharp.class_({
            name: "Car",
            namespace: "Automotive",
            access: ast.Access.Public,
            primaryConstructor: {
                parameters: [
                    generation.csharp.parameter({
                        name: "make",
                        type: generation.csharp.Type.string
                    }),
                    generation.csharp.parameter({
                        name: "model",
                        type: generation.csharp.Type.string
                    })
                ],
                superClassArguments: []
            }
        });
        expect(
            clazz.toString({
                namespace: "",
                allNamespaceSegments: new Set<string>(),
                allTypeClassReferences: new Map<string, Set<string>>(),
                generation
            })
        ).toMatchSnapshot();
    });
});
