import Swift, { AccessLevel, ClassLevel, FunctionModifier } from "../..";
import { SwiftFile } from "../../project/SwiftFile";
import { VariableType } from "../VariableType";

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
            async: true,
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

    it("makes primatives", () => {
        const output = Swift.makeField({
            name: "count",
            valueType: Swift.makePrimative({
                key: "integer"
            })
        });
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes struct", () => {
        const output = Swift.makeStruct({
            accessLevel: AccessLevel.Public,
            name: "TopGun",
            inheritance: [
                Swift.makeType({
                    name: "Movie"
                }),
            ],
            fields: [
                Swift.makeField({
                    name: "description",
                    variableType: VariableType.Let,
                    valueType: Swift.makePrimative({
                        key: "string"
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

    it("makes file", async () => {
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
                                name: "big"
                            }),
                            Swift.makeEnumCase({
                                name: "small",
                                key: "sml"
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
                        returnType: Swift.makeType({
                            name: "Int"
                        })
                    })
                ]
            })
        });
        expect(output.toString()).toMatchSnapshot();

        const file = new SwiftFile({
            name: "Example", 
            file: output, 
            directory: "src/ast/__test__",
        });

        await file.generate();

    });
});
