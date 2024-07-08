import { rust } from "../..";

describe("Rust Language", () => {

    it("makes function", async () => {
        const output = rust.makeFunction({
            name: "doSomething",
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes class", async () => {
        const output = rust.makeClass({
            name: "Example",
            functions: [
                rust.makeFunction({
                    name: "doSomething",
                }),
            ]
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes file", async () => {
        const output = rust.makeFile({
            name: "FernExample.rust",
            class: rust.makeClass({
                name: "Example",
                functions: [
                    rust.makeFunction({
                        name: "doSomething",
                    }),
                ]
            }),
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

});
