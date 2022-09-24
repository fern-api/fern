import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../stringLiteral";

describe("stringLiteral", () => {
    itSchemaIdentity(stringLiteral("A"), "A");

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with incorrect string as input", () => {
                const schema = stringLiteral("A");

                // @ts-expect-error
                () => schema.parse("D");
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-string as input", () => {
                const schema = stringLiteral("A");

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with incorrect string as input", () => {
                const schema = stringLiteral("A");

                // @ts-expect-error
                () => schema.json("D");
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-string as input", () => {
                const schema = stringLiteral("A");

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
