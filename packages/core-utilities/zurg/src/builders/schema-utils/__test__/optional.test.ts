import { itParse, itSchema } from "../../../__test__/utils/itSchema";
import { string } from "../../primitives";
import { optional } from "../getSchemaUtils";

describe("optional", () => {
    itSchema("functions as identity when value is defined", optional(string()), {
        raw: "string",
        parsed: "string",
    });

    itSchema("converts between raw null and parsed undefined", optional(string()), {
        raw: null,
        parsed: undefined,
    });

    describe("parse()", () => {
        itParse("raw undefined is converted to undefined", optional(string()), {
            raw: undefined,
            parsed: undefined,
        });
    });

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid input", () => {
                const schema = optional(string());

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid input", () => {
                const schema = optional(string());

                // @ts-expect-error
                () => schema.json(42);
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with null input", () => {
                const schema = optional(string());

                // @ts-expect-error
                () => schema.json(null);
            });
        });
    });
});
