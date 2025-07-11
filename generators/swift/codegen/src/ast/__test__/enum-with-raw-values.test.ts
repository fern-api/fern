import { swift } from "../..";

describe("Enum", () => {
    describe("write", () => {
        it("should omit raw values if they are the same as the case names", () => {
            const enum_ = swift.enumWithRawValues({
                name: "Direction",
                conformances: ["String"],
                cases: [
                    { name: "north", rawValue: "north" },
                    { name: "south", rawValue: "south" },
                    { name: "east", rawValue: "east" },
                    { name: "west", rawValue: "west" }
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
                    { name: "northWest", rawValue: "north-west" },
                    { name: "southWest", rawValue: "south-west" },
                    { name: "east", rawValue: "east" },
                    { name: "west", rawValue: "west" }
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
    });
});
