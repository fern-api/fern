import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { string } from "../string";

describe("string", () => {
    itSchemaIdentity(string(), "hello");

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-string as input", () => {
                const schema = string();

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-string as input", () => {
                const schema = string();

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
