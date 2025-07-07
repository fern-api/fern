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
    });
});
