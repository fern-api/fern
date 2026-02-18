import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

import { Generation } from "../../context/generation-info.js";
import { ast, CsharpConfigSchema } from "../../index.js";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as CsharpConfigSchema,
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
                        type: generation.Primitive.string
                    }),
                    generation.csharp.parameter({
                        name: "model",
                        type: generation.Primitive.string
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
