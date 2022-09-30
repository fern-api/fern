import { itSchema } from "../../../__test__/utils/itSchema";
import { string } from "../../primitives";
import { optional } from "../getSchemaUtils";

describe("optional", () => {
    itSchema("functions as identity when value is defined", optional(string()), {
        raw: "string",
        parsed: "string",
    });

    itSchema("functions as identity when value is undefined", optional(string()), {
        raw: undefined,
        parsed: undefined,
    });

    it("raw null is converted to undefined", () => {
        const schema = optional(string());
        expect(schema.parse(null)).toBeUndefined();
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
                () => schema.jsson(42);
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
