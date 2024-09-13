import { php } from "../..";

describe("class", () => {
    it("simple", async () => {
        const clazz = php.class_({
            name: "UserClient",
            namespace: "Acme"
        });
        clazz.addConstructor({
            body: php.codeblock("// TODO: Implement me!"),
            parameters: [
                php.parameter({
                    name: "metadata",
                    type: php.Type.optional(php.Type.mixed()),
                    access: "public",
                    readonly_: true
                })
            ]
        });
        clazz.addField(
            php.field({
                name: "name",
                type: php.Type.string(),
                access: "private"
            })
        );
        expect(
            clazz.toString({
                namespace: "",
                rootNamespace: "",
                customConfig: {}
            })
        ).toContain(`namespace Acme;

class UserClient
{
    private string name;

    function __construct(public readonly mixed metadata) {
        // TODO: Implement me!
    }
}
`);
    });
});
