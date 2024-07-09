import Lang from "../../lang";

const FULL_LANGUAGE_NAME = Lang;

describe("FULL_LANGUAGE_NAME Language", () => {
    // TODO: 👋 Add your other language tests here

    // Note: You can change the language's indentation size with FULL_LANGUAGE_NAME.indentSize

    it("makes function", () => {
        const output = FULL_LANGUAGE_NAME.makeFunction({
            name: "doSomething"
        });
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(output));
        expect(output).not.toBe(null);
    });

    it("makes class", () => {
        const output = FULL_LANGUAGE_NAME.makeClass({
            name: "Example",
            functions: [
                FULL_LANGUAGE_NAME.makeFunction({
                    name: "doSomething"
                })
            ]
        });
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(output));
        expect(output).not.toBe(null);
    });

    it("makes file", () => {
        const output = FULL_LANGUAGE_NAME.makeFile({
            name: "FernExample.LANGUAGE_NAME",
            class: FULL_LANGUAGE_NAME.makeClass({
                name: "Example",
                functions: [
                    FULL_LANGUAGE_NAME.makeFunction({
                        name: "doSomething"
                    })
                ]
            })
        });
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(output));
        expect(output).not.toBe(null);
    });
});
