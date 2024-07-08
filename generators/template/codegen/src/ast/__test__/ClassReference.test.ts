import { LANGUAGE_NAME } from "../..";

describe("class reference", () => {
    it("generics", async () => {
        const clazz = LANGUAGE_NAME.classReference({
            name: "OneOf",
            namespace: "OneOf",
            generics: [
                LANGUAGE_NAME.Type.string(),
                LANGUAGE_NAME.Type.boolean(),
                LANGUAGE_NAME.Type.reference(
                    LANGUAGE_NAME.classReference({
                        namespace: "System",
                        name: "List",
                        generics: [LANGUAGE_NAME.Type.string()]
                    })
                )
            ]
        });
        // eslint-disable-next-line no-console
        console.log(clazz.toString());
        expect(clazz.toString()).toContain("OneOf<string, bool, List<string>>");
    });
});
