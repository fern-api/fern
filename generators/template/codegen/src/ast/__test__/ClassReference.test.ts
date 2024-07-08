import { lang } from "../..";

describe("class reference", () => {
    it("generics", async () => {
        const clazz = lang.classReference({
            name: "OneOf",
            namespace: "OneOf",
            generics: [
                lang.Type.string(),
                lang.Type.boolean(),
                lang.Type.reference(
                    lang.classReference({
                        namespace: "System",
                        name: "List",
                        generics: [lang.Type.string()]
                    })
                )
            ]
        });
        // eslint-disable-next-line no-console
        console.log(clazz.toString());
        expect(clazz.toString()).toContain("OneOf<string, bool, List<string>>");
    });
});
