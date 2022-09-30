import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { number } from "../number";

describe("number", () => {
    itSchemaIdentity(number(), 42);

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-number as input", () => {
                const schema = number();

                // @ts-expect-error
                () => schema.parse("hello");
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-number as input", () => {
                const schema = number();

                // @ts-expect-error
                () => schema.json("hello");
            });
        });
    });
});
