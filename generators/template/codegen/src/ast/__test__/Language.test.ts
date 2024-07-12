import LANGUAGE from "../../template";

describe("LANGUAGE Language", () => {
    // TODO: 👋 Add your other language tests here

    // Note: You can change the language's indentation size with FULL_LANGUAGE_NAME.indentSize

    it("not null", () => {
        const output = LANGUAGE.makeFunction({
            name: "doSomething"
        });
        expect(output).not.toBe(null);
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // it("makes function", () => {
    //     const output = LANGUAGE.makeFunction({
    //         name: "doSomething"
    //     });
    //     // eslint-disable-next-line @typescript-eslint/no-base-to-string
    //     expect(output.toString()).toMatchSnapshot();
    // });

    // eslint-disable-next-line jest/no-commented-out-tests
    // it("makes class", () => {
    //     const output = LANGUAGE.makeClass({
    //         name: "Example",
    //         functions: [
    //             LANGUAGE.makeFunction({
    //                 name: "doSomething"
    //             })
    //         ]
    //     });
    //     // eslint-disable-next-line @typescript-eslint/no-base-to-string
    //     expect(output.toString()).toMatchSnapshot();
    // });

    // eslint-disable-next-line jest/no-commented-out-tests
    // it("makes file", () => {
    //     const output = LANGUAGE.makeFile({
    //         name: "FernExample.template",
    //         class: LANGUAGE.makeClass({
    //             name: "Example",
    //             functions: [
    //                 LANGUAGE.makeFunction({
    //                     name: "doSomething"
    //                 })
    //             ]
    //         })
    //     });
    //     // eslint-disable-next-line @typescript-eslint/no-base-to-string
    //     expect(output.toString()).toMatchSnapshot();
    // });
});
