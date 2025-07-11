import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";

describe("Enum", () => {
    describe("write", () => {
        it("should write basic enum", () => {
            const enum_ = swift.enum_({
                name: "Direction",
                cases: [{ name: "north" }, { name: "south" }, { name: "east" }, { name: "west" }]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Direction {
                  case north
                  case south
                  case east
                  case west
              }"
            `);
        });

        it("should write enum with associated values", () => {
            const enum_ = swift.enum_({
                name: "NetworkResponse",
                cases: [
                    { name: "success", associatedValues: [swift.Type.string()] },
                    { name: "error", associatedValues: [swift.Type.int(), swift.Type.string()] }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum NetworkResponse {
                  case success(String)
                  case error(Int, String)
              }"
            `);
        });

        it("should write enum with access level and conformances", () => {
            const enum_ = swift.enum_({
                name: "Result",
                accessLevel: AccessLevel.Public,
                conformances: ["Codable", "Equatable"],
                cases: [
                    { name: "success", associatedValues: [swift.Type.string()] },
                    { name: "failure", associatedValues: [swift.Type.string()] }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "public enum Result: Codable, Equatable {
                  case success(String)
                  case failure(String)
              }"
            `);
        });

        it("should handle complex associated values", () => {
            const enum_ = swift.enum_({
                name: "ComplexEnum",
                cases: [
                    {
                        name: "complex",
                        associatedValues: [
                            swift.Type.array(swift.Type.string()),
                            swift.Type.dictionary(swift.Type.string(), swift.Type.int()),
                            swift.Type.tuple([swift.Type.string(), swift.Type.bool()])
                        ]
                    },
                    {
                        name: "simple"
                    }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum ComplexEnum {
                  case complex([String], [String: Int], (String, Bool))
                  case simple
              }"
            `);
        });
    });
});
