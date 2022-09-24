import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { boolean } from "../boolean";

describe("boolean", () => {
    itSchemaIdentity(boolean(), true);

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-boolean as input", () => {
                const schema = boolean();

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-boolean as input", () => {
                const schema = boolean();

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
