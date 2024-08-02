import Swift, { AccessLevel, FunctionModifier } from "../..";
import { SwiftFile } from "../../project/SwiftFile";
import { VariableType } from "../VariableType";

describe("Swift Language", () => {
    it("makes file header", () => {
        const output = Swift.makeFileHeader({
            header: "This is the header to a file"
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes import", () => {
        const output = Swift.makeImport({
            packageName: "ExamplePackage"
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("uses a factory", () => {
        const output = Swift.makeCodingKeys([]);
        expect(output.render()).toMatchSnapshot();
    });

    it("makes enum case", () => {
        const output = Swift.makeEnumCase({
            name: "fallbackContent",
            value: "fallback_content",
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes enum", () => {
        const output = Swift.makeEnum({
            name: "CodingKeys",
            inheritance: [
                Swift.makeString(),
                Swift.makeClass({ name: "CodingKey" })
            ],
            enumCases: [
                Swift.makeEnumCase({
                    name: "name",
                }),
                Swift.makeEnumCase({
                    name: "fallbackContent",
                    value: "fallback_content",
                }),
            ]
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes function", () => {
        const output = Swift.makeFunc({
            accessLevel: AccessLevel.Fileprivate,
            modifier: FunctionModifier.Static,
            name: "makePerson",
            async: true,
            params: [
                Swift.makeParam({
                    title: "name",
                    class: Swift.makeString()
                }),
                Swift.makeParam({
                    title: "age",
                    class: Swift.makeString(),
                    defaultValue: "TODO"
                })
            ]
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes primatives", () => {
        const output = Swift.makeField({
            name: "count",
            class: Swift.makeInt()
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes struct", () => {
        const output = Swift.makeStruct({
            accessLevel: AccessLevel.Public,
            name: "TopGun",
            inheritance: [
                Swift.makeClass({
                    name: "Movie"
                }),
            ],
            fields: [
                Swift.makeField({
                    name: "description",
                    variableType: VariableType.Let,
                    class: Swift.makeString()
                })
            ]
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes class", () => {
        const output = Swift.makeClass({
            accessLevel: AccessLevel.Open,
            name: "ExampleObject",
            functions: [
                Swift.makeFunc({
                    name: "fetchData"
                })
            ],
            inheritance: [
                Swift.makeClass({
                    name: "Codable"
                }),
                Swift.makeClass({
                    name: "NSObject"
                }),
            ]
        });
        expect(output.render()).toMatchSnapshot();
    });

    it("makes file", async () => {
        const output = Swift.makeFile({
            fileHeader: Swift.makeFileHeader({
                header: "// Sample.swift"
            }),
            imports: [
                Swift.makeImport({ packageName: "Foundation" }),
                Swift.makeImport({ packageName: "UIKit" })
            ],
            node: Swift.makeClass({
                accessLevel: AccessLevel.Open,
                name: "Room",
                subclasses: [
                    Swift.makeClass({
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
                                name: "big"
                            }),
                            Swift.makeEnumCase({
                                name: "small",
                                value: "sml"
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
                        async: true,
                        throws: true,
                        returnClass: Swift.makeInt()
                    })
                ]
            })
        });
        expect(output.render()).toMatchSnapshot();

        const file = new SwiftFile({
            name: "Example", 
            file: output, 
            directory: "src/ast/__test__",
        });

        await file.generate();

    });
});
