import { ast, CSharp } from "../..";

const csharp = new CSharp();
describe("class", () => {
    it("basic", async () => {
        const clazz = csharp.class_({
            name: "Car",
            namespace: "Automotive",
            access: ast.Access.Public,
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
