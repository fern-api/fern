import { swift } from "../..";

describe("class reference", () => {
    it("generics", async () => {
        const clazz = swift.classReference({
            name: "OneOf",
            namespace: "OneOf",
            generics: [
                swift.Type.string(),
                swift.Type.boolean(),
                swift.Type.reference(
                    swift.classReference({
                        namespace: "System",
                        name: "List",
                        generics: [swift.Type.string()]
                    })
                )
            ]
        });
        console.log(clazz.toString());
        expect(clazz.toString()).toContain("OneOf<string, bool, List<string>>");
    });
});
