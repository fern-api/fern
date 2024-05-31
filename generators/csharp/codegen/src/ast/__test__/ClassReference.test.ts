import { csharp } from "../..";

describe("class reference", () => {
    it("generics", async () => {
        const clazz = csharp.classReference({
            name: "OneOf",
            namespace: "OneOf",
            generics: [
                csharp.Type.string(),
                csharp.Type.boolean(),
                csharp.Type.reference(
                    csharp.classReference({
                        namespace: "System",
                        name: "List",
                        generics: [csharp.Type.string()]
                    })
                )
            ]
        });
        expect(clazz.toString()).toContain("OneOf<string, bool, List<string>>");
    });
});
