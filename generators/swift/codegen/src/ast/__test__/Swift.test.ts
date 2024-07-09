import { AccessLevel, FunctionModifier } from "..";
import Swift from "../../swift";

describe("Swift Language", () => {

    it("makes file header", () => {
        const output = Swift.makeFileHeader({
            header: "This is the header to a file"
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes import", () => {
        const output = Swift.makeImport({
            packageName: "ExamplePackage"
        });
        expect(output.toString()).toMatchSnapshot();
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
        expect(output.toString()).toMatchSnapshot();
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
        expect(output.toString()).toMatchSnapshot();
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
        expect(output.toString()).toMatchSnapshot();
    });

});
