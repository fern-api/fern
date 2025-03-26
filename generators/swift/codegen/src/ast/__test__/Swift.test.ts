import Swift, { AccessLevel, ClassLevel, FunctionModifier } from "../..";
import { SwiftFile } from "../../project/SwiftFile";
import { VariableType } from "../VariableType";

describe("Swift Language", () => {
    it("makes file header", () => {
        const output = Swift.makeFileHeader({
            header: "This is the header to a file"
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes import", () => {
        const output = Swift.makeImport({
            packageName: "ExamplePackage"
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes enum case", () => {
        const output = Swift.makeEnumCase({
            name: "fallbackContent",
            key: "fallback_content"
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
                    name: "name"
                }),
                Swift.makeEnumCase({
                    name: "fallbackContent",
                    key: "fallback_content"
                })
            ]
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes primitives", () => {
        const output = Swift.makeField({
            name: "count",
            valueType: Swift.makePrimitive({
                key: "integer"
            })
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes struct", () => {
        const output = Swift.makeStruct({
            accessLevel: AccessLevel.Public,
            name: "TopGun",
            inheritance: [
                Swift.makeType({
                    name: "Movie"
                })
            ],
            fields: [
                Swift.makeField({
                    name: "description",
                    variableType: VariableType.Let,
                    valueType: Swift.makePrimitive({
                        key: "string"
                    })
                })
            ]
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
                })
            ]
        });
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });

    it("makes file", async () => {
        const output = Swift.makeFile({
            fileHeader: Swift.makeFileHeader({
                header: "// Sample.swift"
            }),
            imports: [Swift.makeImport({ packageName: "Foundation" }), Swift.makeImport({ packageName: "UIKit" })],
            node: Swift.makeType({
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
                            })
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
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(output.toString()).toMatchSnapshot();
    });
});
