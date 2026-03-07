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

describe("parameter", () => {
    it("this parameter for extension methods", async () => {
        const clazz = generation.csharp.class_({
            name: "ServiceCollectionExtensions",
            namespace: "MyApi.Extensions",
            access: ast.Access.Public,
            static_: true
        });
        clazz.addMethod({
            access: ast.Access.Public,
            isAsync: false,
            type: ast.MethodType.STATIC,
            name: "AddMyClient",
            return_: generation.csharp.classReference({
                name: "IServiceCollection",
                namespace: "Microsoft.Extensions.DependencyInjection"
            }),
            parameters: [
                generation.csharp.parameter({
                    name: "services",
                    type: generation.csharp.classReference({
                        name: "IServiceCollection",
                        namespace: "Microsoft.Extensions.DependencyInjection"
                    }),
                    this_: true
                })
            ],
            body: generation.csharp.codeblock((writer) => {
                writer.writeLine("return services;");
            })
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

    it("regular parameter without this", async () => {
        const param = generation.csharp.parameter({
            name: "value",
            type: generation.Primitive.string
        });
        expect(param.name).toBe("value");
    });

    it("ref parameter", async () => {
        const clazz = generation.csharp.class_({
            name: "TestClass",
            namespace: "Test",
            access: ast.Access.Public
        });
        clazz.addMethod({
            access: ast.Access.Public,
            name: "TestMethod",
            parameters: [
                generation.csharp.parameter({
                    name: "value",
                    type: generation.csharp.classReference({
                        name: "int",
                        namespace: "System"
                    }),
                    ref: true
                })
            ],
            body: generation.csharp.codeblock("")
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
