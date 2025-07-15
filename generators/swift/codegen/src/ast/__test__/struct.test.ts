import { describe, expect, it } from "vitest";

import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { DeclarationType } from "../DeclarationType";
import { Type } from "../Type";

describe("Struct", () => {
    describe("write", () => {
        it("should write struct with all features", () => {
            const properties = [
                swift.property({
                    unsafeName: "id",
                    declarationType: DeclarationType.Let,
                    type: Type.int()
                }),
                swift.property({
                    unsafeName: "name",
                    accessLevel: AccessLevel.Public,
                    declarationType: DeclarationType.Let,
                    type: Type.string()
                })
            ];

            const struct = swift.struct({
                name: "User",
                accessLevel: AccessLevel.Public,
                conformances: ["Codable", "Equatable"],
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
                    type: Type.string()
                }),
                swift.property({
                    unsafeName: "optionalProperty",
                    declarationType: DeclarationType.Var,
                    type: Type.int(),
                    optional: true
                }),
                swift.property({
                    unsafeName: "privateProperty",
                    accessLevel: AccessLevel.Private,
                    declarationType: DeclarationType.Let,
                    type: Type.array(Type.string())
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
                    type: Type.string()
                }),
                swift.property({
                    unsafeName: "enum",
                    declarationType: DeclarationType.Let,
                    type: Type.int()
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
                    type: Type.array(Type.string())
                }),
                swift.property({
                    unsafeName: "dictProperty",
                    declarationType: DeclarationType.Let,
                    type: Type.dictionary(Type.string(), Type.int())
                }),
                swift.property({
                    unsafeName: "tupleProperty",
                    declarationType: DeclarationType.Let,
                    type: Type.tuple([Type.string(), Type.int()])
                }),
                swift.property({
                    unsafeName: "nestedProperty",
                    declarationType: DeclarationType.Let,
                    type: Type.array(Type.dictionary(Type.string(), Type.int()))
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
                    type: Type.string()
                }),
                swift.property({
                    unsafeName: "privateOptional",
                    accessLevel: AccessLevel.Private,
                    declarationType: DeclarationType.Var,
                    type: Type.int(),
                    optional: true
                }),
                swift.property({
                    unsafeName: "fileprivateArray",
                    accessLevel: AccessLevel.Fileprivate,
                    declarationType: DeclarationType.Let,
                    type: Type.array(Type.double())
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
                        type: Type.int64(),
                        declarationType: DeclarationType.Let
                    }),
                    swift.property({
                        unsafeName: "petId",
                        type: Type.string(),
                        declarationType: DeclarationType.Let
                    })
                ],
                nestedTypes: [
                    swift.enumWithRawValues({
                        name: "Status",
                        conformances: ["String", "Codable", "CaseIterable"],
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
                        type: Type.int(),
                        declarationType: DeclarationType.Let
                    }),
                    swift.property({
                        unsafeName: "name",
                        type: Type.string(),
                        declarationType: DeclarationType.Let
                    })
                ],
                nestedTypes: [
                    swift.enumWithRawValues({
                        name: "Status",
                        conformances: ["String", "Codable", "CaseIterable"],
                        cases: [
                            { unsafeName: "available", rawValue: "available" },
                            { unsafeName: "pending", rawValue: "pending" }
                        ]
                    }),
                    swift.enumWithRawValues({
                        name: "CodingKeys",
                        conformances: ["String", "CodingKey"],
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
                        type: Type.int()
                    }),
                    swift.property({
                        unsafeName: "name",
                        accessLevel: AccessLevel.Private,
                        declarationType: DeclarationType.Var,
                        type: Type.string()
                    })
                ],
                methods: [
                    swift.method({
                        unsafeName: "getId",
                        accessLevel: AccessLevel.Public,
                        returnType: Type.int(),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("return self.id");
                        })
                    }),
                    swift.method({
                        unsafeName: "getName",
                        accessLevel: AccessLevel.Public,
                        returnType: Type.string(),
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
                                type: Type.int()
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: Type.string()
                            })
                        ],
                        returnType: Type.custom("User"),
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
                        type: Type.int()
                    }),
                    swift.property({
                        unsafeName: "name",
                        declarationType: DeclarationType.Let,
                        type: Type.string()
                    })
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "id",
                                unsafeName: "id",
                                type: Type.int()
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: Type.string()
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
                        type: Type.int()
                    }),
                    swift.property({
                        unsafeName: "name",
                        declarationType: DeclarationType.Let,
                        type: Type.string()
                    }),
                    swift.property({
                        unsafeName: "price",
                        declarationType: DeclarationType.Let,
                        type: Type.double()
                    })
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "id",
                                unsafeName: "id",
                                type: Type.int()
                            }),
                            swift.functionParameter({
                                argumentLabel: "name",
                                unsafeName: "name",
                                type: Type.string()
                            }),
                            swift.functionParameter({
                                argumentLabel: "price",
                                unsafeName: "price",
                                type: Type.double()
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
                                type: Type.dictionary(Type.string(), Type.any())
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
    });
});
