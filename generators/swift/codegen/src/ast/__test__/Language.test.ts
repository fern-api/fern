import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { FunctionModifier } from "../FunctionModifier";

describe("Swift Language", () => {

    it("makes file header", () => {
        const output = swift.makeFileHeader({
            header: "This is the header to a file"
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes import", () => {
        const output = swift.makeImport({
            packageName: "ExamplePackage"
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes function", () => {
        const output = swift.makeFunc({
            accessLevel: AccessLevel.Fileprivate,
            modifier: FunctionModifier.Static,
            name: "makePerson",
            async: "async",
            throws: "throws",
            params: [
                swift.makeParam({
                    title: "name",
                    type: "String",
                }),
                swift.makeParam({
                    title: "age",
                    type: "Int",
                    defaultValue: "33",
                })
            ]
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes class", () => {
        const output = swift.makeClass({
            imports: [
                swift.makeImport({ packageName: "SamplePackageOne" }),
                swift.makeImport({ packageName: "SamplePackageTwo" }),
            ],
            accessLevel: AccessLevel.Fileprivate,
            name: "Sample",
            functions: [
                swift.makeFunc({
                    name: "doSomething"
                })
            ],
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes file", () => {
        const output = swift.makeFile({
            fileHeader: swift.makeFileHeader({
                header: "This is the header to a file"
            }),
            class: swift.makeClass({
                imports: [
                    swift.makeImport({ packageName: "SamplePackageOne" }),
                    swift.makeImport({ packageName: "SamplePackageTwo" })
                ],
                accessLevel: AccessLevel.Open,
                name: "Sample",
                functions: [
                    swift.makeFunc({
                        name: "findStuff"
                    }),
                    swift.makeFunc({
                        accessLevel: AccessLevel.Public,
                        modifier: FunctionModifier.Static,
                        name: "getStuff",
                        async: "async",
                        throws: "throws",
                        returnObject: "String",
                    }),
                ]
            })
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

});
