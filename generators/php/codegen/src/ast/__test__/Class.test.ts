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
                    readonly_: true,
                    docs: "Miscellaneous metadata"
                }),
                php.parameter({
                    name: "dictionary",
                    type: php.Type.map(php.Type.string(), php.Type.mixed()),
                    access: "public",
                    docs: "A collection of arbitrary key-value pairs"
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
                namespace: "Acme",
                rootNamespace: "",
                customConfig: {}
            })
        ).toContain(`namespace Acme;

class UserClient
{
    /**
     * @var string name
     */
    private string name;

    /**
     * @param mixed metadata Miscellaneous metadata
     * @param array<string, mixed> dictionary A collection of arbitrary key-value pairs
     */
    function __construct(
        public readonly mixed metadata,
        public array dictionary,
    )
    {
        // TODO: Implement me!
    }
}
`);
    });
});
