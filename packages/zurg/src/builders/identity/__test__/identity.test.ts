import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { createIdentitySchemaCreator } from "../createIdentitySchemaCreator";
import { identity } from "../identity";

describe("identity", () => {
    itSchemaIdentity(identity<string>(), "hello");

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid input", () => {
                const schema = identity<string>();

                // @ts-expect-error
                schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid input", () => {
                const schema = identity<string>();

                // @ts-expect-error
                schema.json(42);
            });
        });
    });
});

describe("createIdentitySchemaCreator", () => {
    itSchemaIdentity(createIdentitySchemaCreator<boolean>()(), true);
});
