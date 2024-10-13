import { csharp } from "../..";

describe("class", () => {
    it("basic", async () => {
        const clazz = csharp.class_({
            name: "Car",
            namespace: "Automotive",
            access: "public",
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
        ).toEqual(`\
namespace Automotive;

public class Car(string make,string model)
{
}
`);
    });
});
