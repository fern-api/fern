import { describe, expect, it } from "vitest";

import { swift } from "../../..";
import { AccessLevel } from "../../AccessLevel";
import { DeclarationType } from "../../DeclarationType";

describe("Struct", () => {
    describe("write", () => {
        it("should write struct with all features", () => {
            const properties = [
                swift.property({
                    unsafeName: "id",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.int())
                }),
                swift.property({
                    unsafeName: "name",
                    accessLevel: AccessLevel.Public,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.string())
                })
            ];

            const struct = swift.struct({
                name: "User",
                accessLevel: AccessLevel.Public,
                conformances: [swift.Protocol.Codable, swift.Protocol.Equatable],
                properties
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "public struct User: Codable, Equatable {
                  let id: Int
                  public let name: String
              }"
            `);
        });

        it("should write struct with multiple conformances", () => {
            const struct = swift.struct({
                name: "TestStruct",
                conformances: ["Codable", "Equatable", "Hashable"],
                properties: []
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "struct TestStruct: Codable, Equatable, Hashable {
              }"
            `);
        });

        it("should write struct with complex properties", () => {
            const properties = [
                swift.property({
                    unsafeName: "staticProperty",
                    static_: true,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.string())
                }),
                swift.property({
                    unsafeName: "optionalProperty",
                    declarationType: DeclarationType.Var,
                    type: swift.TypeReference.type(swift.Type.optional(swift.Type.int()))
                }),
                swift.property({
                    unsafeName: "privateProperty",
                    accessLevel: AccessLevel.Private,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.array(swift.Type.string()))
                })
            ];

            const struct = swift.struct({
                name: "ComplexStruct",
                properties
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "struct ComplexStruct {
                  static let staticProperty: String
                  var optionalProperty: Int?
                  private let privateProperty: [String]
              }"
            `);
        });

        it("should write struct with reserved keyword properties", () => {
            const properties = [
                swift.property({
                    unsafeName: "class",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.string())
                }),
                swift.property({
                    unsafeName: "enum",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.int())
                })
            ];

            const struct = swift.struct({
                name: "ReservedStruct",
                properties
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "struct ReservedStruct {
                  let \`class\`: String
                  let \`enum\`: Int
              }"
            `);
        });

        it("should handle complex type properties", () => {
            const properties = [
                swift.property({
                    unsafeName: "arrayProperty",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.array(swift.Type.string()))
                }),
                swift.property({
                    unsafeName: "dictProperty",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.dictionary(swift.Type.string(), swift.Type.int()))
                }),
                swift.property({
                    unsafeName: "tupleProperty",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.tuple([swift.Type.string(), swift.Type.int()]))
                }),
                swift.property({
                    unsafeName: "nestedProperty",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(
                        swift.Type.array(swift.Type.dictionary(swift.Type.string(), swift.Type.int()))
                    )
                })
            ];

            const struct = swift.struct({
                name: "ComplexTypeStruct",
                properties
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "struct ComplexTypeStruct {
                  let arrayProperty: [String]
                  let dictProperty: [String: Int]
                  let tupleProperty: (String, Int)
                  let nestedProperty: [[String: Int]]
              }"
            `);
        });

        it("should handle mixed property access levels", () => {
            const properties = [
                swift.property({
                    unsafeName: "publicStatic",
                    accessLevel: AccessLevel.Public,
                    static_: true,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.string())
                }),
                swift.property({
                    unsafeName: "privateOptional",
                    accessLevel: AccessLevel.Private,
                    declarationType: DeclarationType.Var,
                    type: swift.TypeReference.type(swift.Type.optional(swift.Type.int()))
                }),
                swift.property({
                    unsafeName: "fileprivateArray",
                    accessLevel: AccessLevel.Fileprivate,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.array(swift.Type.double()))
                })
            ];

            const struct = swift.struct({
                name: "AccessLevelStruct",
                accessLevel: AccessLevel.Internal,
                properties
            });

            expect(struct.toString()).toMatchInlineSnapshot(`
              "internal struct AccessLevelStruct {
                  public static let publicStatic: String
                  private var privateOptional: Int?
                  fileprivate let fileprivateArray: [Double]
              }"
            `);
        });

        it("should write struct with 1 nested enum", async () => {
            const struct = swift.struct({
                name: "Order",
                properties: [
                    swift.property({
                        unsafeName: "id",
                        type: swift.TypeReference.type(swift.Type.int64()),
                        declarationType: DeclarationType.Let
                    }),
                    swift.property({
                        unsafeName: "petId",
                        type: swift.TypeReference.type(swift.Type.string()),
                        declarationType: DeclarationType.Let
                    })
                ],
                nestedTypes: [
                    swift.enumWithRawValues({
                        name: "Status",
                        conformances: ["String", swift.Protocol.Codable, swift.Protocol.CaseIterable],
                        cases: [
                            { unsafeName: "available", rawValue: "available" },
                            { unsafeName: "pending", rawValue: "pending" }
                        ]
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_1_nested_enum.swift");
        });

        it("should write struct with 2 nested enums", async () => {
            const struct = swift.struct({
                name: "Pet",
                properties: [
                    swift.property({
                        unsafeName: "id",
                        type: swift.TypeReference.type(swift.Type.int()),
                        declarationType: DeclarationType.Let
                    }),
                    swift.property({
                        unsafeName: "name",
                        type: swift.TypeReference.type(swift.Type.string()),
                        declarationType: DeclarationType.Let
                    })
                ],
                nestedTypes: [
                    swift.enumWithRawValues({
                        name: "Status",
                        conformances: ["String", swift.Protocol.Codable, swift.Protocol.CaseIterable],
                        cases: [
                            { unsafeName: "available", rawValue: "available" },
                            { unsafeName: "pending", rawValue: "pending" }
                        ]
                    }),
                    swift.enumWithRawValues({
                        name: "CodingKeys",
                        conformances: ["String", swift.Protocol.CodingKey],
                        cases: [
                            { unsafeName: "id", rawValue: "id" },
                            { unsafeName: "name", rawValue: "name" }
                        ]
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_2_nested_enums.swift");
        });

        it("should write struct with methods", async () => {
            const struct = swift.struct({
                name: "User",
                accessLevel: AccessLevel.Public,
                conformances: ["Codable"],
                properties: [
                    swift.property({
                        unsafeName: "id",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.int())
                    }),
                    swift.property({
                        unsafeName: "name",
                        accessLevel: AccessLevel.Private,
                        declarationType: DeclarationType.Var,
                        type: swift.TypeReference.type(swift.Type.string())
                    })
                ],
                methods: [
                    swift.method({
                        unsafeName: "getId",
                        accessLevel: AccessLevel.Public,
                        returnType: swift.TypeReference.type(swift.Type.int()),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("return self.id");
                        })
                    }),
                    swift.method({
                        unsafeName: "getName",
                        accessLevel: AccessLevel.Public,
                        returnType: swift.TypeReference.type(swift.Type.string()),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("return self.name");
                        })
                    }),
                    swift.method({
                        unsafeName: "create",
                        accessLevel: AccessLevel.Public,
                        static_: true,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "with",
                                unsafeName: "id",
                                type: swift.TypeReference.type(swift.Type.int())
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: swift.TypeReference.type(swift.Type.string())
                            })
                        ],
                        returnType: swift.TypeReference.type(swift.Type.custom("User")),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("return User(id: id, name: name)");
                        })
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_3_methods.swift");
        });

        it("should write struct with basic initializer", async () => {
            const struct = swift.struct({
                name: "User",
                accessLevel: AccessLevel.Public,
                conformances: ["Codable"],
                properties: [
                    swift.property({
                        unsafeName: "id",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.int())
                    }),
                    swift.property({
                        unsafeName: "name",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.string())
                    })
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "id",
                                unsafeName: "id",
                                type: swift.TypeReference.type(swift.Type.int())
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: swift.TypeReference.type(swift.Type.string())
                            })
                        ],
                        body: swift.CodeBlock.withStatements([
                            swift.Statement.propertyAssignment("id", swift.Expression.reference("id")),
                            swift.Statement.propertyAssignment("name", swift.Expression.reference("name"))
                        ])
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_basic_initializer.swift");
        });

        it("should write struct with multiple initializers using statements", async () => {
            const struct = swift.struct({
                name: "Product",
                accessLevel: AccessLevel.Public,
                properties: [
                    swift.property({
                        unsafeName: "id",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.int())
                    }),
                    swift.property({
                        unsafeName: "name",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.string())
                    }),
                    swift.property({
                        unsafeName: "price",
                        declarationType: DeclarationType.Let,
                        type: swift.TypeReference.type(swift.Type.double())
                    })
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "id",
                                unsafeName: "id",
                                type: swift.TypeReference.type(swift.Type.int())
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: swift.TypeReference.type(swift.Type.string())
                            }),
                            swift.functionParameter({
                                argumentLabel: "price",
                                unsafeName: "price",
                                type: swift.TypeReference.type(swift.Type.double())
                            })
                        ],
                        body: swift.CodeBlock.withStatements([
                            swift.Statement.propertyAssignment("id", swift.Expression.reference("id")),
                            swift.Statement.propertyAssignment("name", swift.Expression.reference("name")),
                            swift.Statement.propertyAssignment("price", swift.Expression.reference("price"))
                        ])
                    }),
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        failable: true,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "from",
                                unsafeName: "dictionary",
                                type: swift.TypeReference.type(
                                    swift.Type.dictionary(swift.Type.string(), swift.Type.any())
                                )
                            })
                        ],
                        body: swift.codeBlock((writer) => {
                            writer.writeLine('guard let id = dictionary["id"] as? Int,');
                            writer.writeLine('      let name = dictionary["name"] as? String,');
                            writer.writeLine('      let price = dictionary["price"] as? Double else {');
                            writer.writeLine("    return nil");
                            writer.writeLine("}");
                            writer.writeLine("self.id = id");
                            writer.writeLine("self.name = name");
                            writer.writeLine("self.price = price");
                        })
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_multiple_initializers.swift");
        });

        it("should write struct with no properties and 1 method", async () => {
            const struct = swift.struct({
                name: "NoProperties",
                properties: [],
                methods: [
                    swift.method({
                        unsafeName: "doSomething",
                        returnType: swift.TypeReference.type(swift.Type.void()),
                        body: swift.CodeBlock.withStatements([swift.Statement.raw(`print("doSomething")`)])
                    })
                ]
            });

            await expect(struct.toString()).toMatchFileSnapshot("snapshots/struct_with_no_properties.swift");
        });
    });
});
