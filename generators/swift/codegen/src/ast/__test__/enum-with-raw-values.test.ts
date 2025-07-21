import { swift } from "../..";

describe("Enum", () => {
    describe("write", () => {
        it("should omit raw values if they are the same as the case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Direction",
                conformances: ["String"],
                cases: [
                    { unsafeName: "north", rawValue: "north" },
                    { unsafeName: "south", rawValue: "south" },
                    { unsafeName: "east", rawValue: "east" },
                    { unsafeName: "west", rawValue: "west" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Direction: String {
                  case north
                  case south
                  case east
                  case west
              }"
            `);
        });

        it("should specify raw values if they are not the same as the case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Direction",
                conformances: ["String"],
                cases: [
                    { unsafeName: "northWest", rawValue: "north-west" },
                    { unsafeName: "southWest", rawValue: "south-west" },
                    { unsafeName: "east", rawValue: "east" },
                    { unsafeName: "west", rawValue: "west" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum Direction: String {
                  case northWest = "north-west"
                  case southWest = "south-west"
                  case east
                  case west
              }"
            `);
        });

        it("should handle reserved keywords in case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "KeywordEnum",
                cases: [
                    { unsafeName: "class", rawValue: "class" },
                    { unsafeName: "associatedtype", rawValue: "associated-type" },
                    { unsafeName: "north", rawValue: "north" }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum KeywordEnum {
                  case \`class\`
                  case \`associatedtype\` = "associated-type"
                  case north
              }"
            `);
        });
    });
});
