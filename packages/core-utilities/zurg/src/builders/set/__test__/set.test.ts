import { itSchema } from "../../../__test__/utils/itSchema";
import { string } from "../../primitives";
import { set } from "../set";

describe("set", () => {
    itSchema("converts between raw list and parsed Set", set(string()), {
        raw: ["A", "B"],
        parsed: new Set(["A", "B"]),
    });

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid items as input", () => {
                const schema = set(string());

                // @ts-expect-error
                () => schema.parse([42]);
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-list as input", () => {
                const schema = set(string());

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid items as input", () => {
                const schema = set(string());

                // @ts-expect-error
                () => schema.json(new Set([42]));
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-Set as input", () => {
                const schema = set(string());

                // @ts-expect-error
                () => schema.json(["hello"]);
            });
        });
    });
});
