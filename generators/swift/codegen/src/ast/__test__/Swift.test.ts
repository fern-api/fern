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

    it("makes enum case", () => {
        const output = Swift.makeEnumCase({
            name: "fallbackContent",
            key: "fallback_content",
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes enum", () => {
        const output = Swift.makeEnum({
            name: "CodingKeys",
            inheritance: [
                Swift.makeType({
                    name: "String"
                }),
                Swift.makeType({
                    name: "CodingKey"
                })
            ],
            enumCases: [
                Swift.makeEnumCase({
                    name: "name",
                }),
                Swift.makeEnumCase({
                    name: "fallbackContent",
                    key: "fallback_content",
                }),
            ]
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
                    type: Swift.makeType({
                        name: "String"
                    })
                }),
                Swift.makeParam({
                    title: "age",
                    type: Swift.makeType({
                        name: "Int"
                    }),
                    defaultValue: Swift.makeType({
                        name: "Int"
                    })
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
            class: Swift.makeType({
                accessLevel: AccessLevel.Open,
                classLevel: ClassLevel.Class,
                name: "Room",
                subclasses: [
                    Swift.makeType({
                        classLevel: ClassLevel.Class,
                        name: "Person",
                        functions: [
                            Swift.makeFunc({
                                name: "getName"
                            })
                        ]
                    }),
                    Swift.makeEnum({
                        name: "RoomType",
                        enumCases: [
                            Swift.makeEnumCase({
                                name: 'big'
                            }),
                            Swift.makeEnumCase({
                                name: 'small',
                                key: 'sml'
                            }),
                        ]
                    })
                ],
                functions: [
                    Swift.makeFunc({
                        name: "openDoor"
                    }),
                    Swift.makeFunc({
                        accessLevel: AccessLevel.Public,
                        modifier: FunctionModifier.Static,
                        name: "closeDoor",
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
