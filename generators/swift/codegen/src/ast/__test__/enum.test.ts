import { describe, expect, it } from "vitest";

import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { Type } from "../Type";

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
    });
});
