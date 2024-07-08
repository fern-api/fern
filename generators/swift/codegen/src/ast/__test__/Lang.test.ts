import { AccessLevel, FunctionModifier } from "..";
import Lang from "../../lang";

const Swift = Lang;

describe("Swift Language", () => {

    it("makes file header", () => {
        const output = Swift.makeFileHeader({
            header: "This is the header to a file"
        });

        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes import", () => {
        const output = Swift.makeImport({
            packageName: "ExamplePackage"
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes function", () => {
        const output = Swift.makeFunc({
            accessLevel: AccessLevel.Fileprivate,
            modifier: FunctionModifier.Static,
            name: "makePerson",
            async: "async",
            throws: "throws",
            params: [
                Swift.makeParam({
                    title: "name",
                    type: "String",
                }),
                Swift.makeParam({
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
        const output = Swift.makeClass({
            imports: [
                Swift.makeImport({ packageName: "SamplePackageOne" }),
                Swift.makeImport({ packageName: "SamplePackageTwo" }),
            ],
            accessLevel: AccessLevel.Fileprivate,
            name: "Sample",
            functions: [
                Swift.makeFunc({
                    name: "doSomething"
                })
            ],
        });
        // eslint-disable-next-line no-console
        console.log(output.toString());
    });

    it("makes file", () => {
        const output = Swift.makeFile({
            fileHeader: Swift.makeFileHeader({
                header: "This is the header to a file"
            }),
            class: Swift.makeClass({
                imports: [
                    Swift.makeImport({ packageName: "SamplePackageOne" }),
                    Swift.makeImport({ packageName: "SamplePackageTwo" })
                ],
                accessLevel: AccessLevel.Open,
                name: "Sample",
                functions: [
                    Swift.makeFunc({
                        name: "findStuff"
                    }),
                    Swift.makeFunc({
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
