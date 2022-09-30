import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { enum_ } from "../enum";

describe("enum", () => {
    itSchemaIdentity(enum_(["A", "B", "C"]), "A");

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid enum as input", () => {
                const schema = enum_(["A", "B", "C"]);

                // @ts-expect-error
                () => schema.parse("D");
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-enum as input", () => {
                const schema = enum_(["A", "B", "C"]);

                // @ts-expect-error
                () => schema.parse([]);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid enum as input", () => {
                const schema = enum_(["A", "B", "C"]);

                // @ts-expect-error
                () => schema.json("D");
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-enum as input", () => {
                const schema = enum_(["A", "B", "C"]);

                // @ts-expect-error
                () => schema.json([]);
            });
        });
    });
});
