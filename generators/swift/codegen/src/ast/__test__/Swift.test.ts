import { AccessLevel, FunctionModifier, ClassLevel } from "..";
import Swift from "../../swift";
import { FileGenerator } from "@fern-api/generator-commons";

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
                    type: "String"
                }),
                Swift.makeParam({
                    title: "age",
                    type: "Int",
                    defaultValue: "33"
                })
            ]
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes struct", () => {

        const output = Swift.makeStruct({
            accessLevel: AccessLevel.Internal,
            name: "Sample",
            inheritance: [
                Swift.makeClass({
                    name: "Codable"
                })
            ]
        });

        expect(output.toString()).toMatchSnapshot();

    });

    it("makes class", () => {
        const output = Swift.makeClass({
            name: "MyService",
            functions: [
                Swift.makeFunc({
                    name: "fetchData"
                })
            ],
            inheritance: [
                Swift.makeClass({
                    name: "ExampleApiService"
                })
            ]
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes type", () => {
        const output = Swift.makeType({
            accessLevel: AccessLevel.Open,
            classLevel: ClassLevel.Struct,
            name: "ExampleObject",
            functions: [
                Swift.makeFunc({
                    name: "fetchData"
                })
            ],
            inheritance: [
                Swift.makeType({
                    name: "Codable"
                }),
                Swift.makeType({
                    name: "NSObject"
                }),
            ]
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes file", () => {
        const output = Swift.makeFile({
            fileHeader: Swift.makeFileHeader({
                header: "// Sample.swift"
            }),
            imports: [
                Swift.makeImport({ packageName: "Foundation" }),
                Swift.makeImport({ packageName: "UIKit" })
            ],
            class: Swift.makeClass({
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
                        returnType: Swift.makeType({
                            name: "Int"
                        })
                    })
                ]
            })
        });
        expect(output.toString()).toMatchSnapshot();

        // Make a sample file that actually testable
        FileGenerator.generate({
            fileName: "Sample", 
            node: output, 
            extension: "swift", 
            outputDir: "src/ast/__test__/__snapshots__",
        });

    });
});
