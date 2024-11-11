import { csharp } from "../..";

describe("class", () => {
    it("basic", async () => {
        const clazz = csharp.class_({
            name: "Car",
            namespace: "Automotive",
            access: csharp.Access.Public,
            primaryConstructor: {
                parameters: [
                    csharp.parameter({
                        name: "make",
                        type: csharp.Type.string()
                    }),
                    csharp.parameter({
                        name: "model",
                        type: csharp.Type.string()
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
                rootNamespace: "",
                customConfig: {}
            })
        ).toMatchSnapshot();
    });
});
