import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { number, string } from "../../primitives";
import { record } from "../record";

describe("record", () => {
    itSchemaIdentity(record(string(), string()), { hello: "world" });

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid keys", () => {
                const schema = record(number(), string());

                () =>
                    schema.parse({
                        // @ts-expect-error
                        hello: "world",
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid values", () => {
                const schema = record(string(), number());

                () =>
                    schema.parse({
                        // @ts-expect-error
                        hello: "world",
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-record as input", () => {
                const schema = record(string(), string());

                // @ts-expect-error
                () => schema.parse([]);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid keys", () => {
                const schema = record(number(), string());

                () =>
                    schema.json({
                        // @ts-expect-error
                        hello: "world",
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid values", () => {
                const schema = record(string(), number());

                () =>
                    schema.json({
                        // @ts-expect-error
                        hello: "world",
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-record as input", () => {
                const schema = record(string(), string());

                // @ts-expect-error
                () => schema.json([]);
            });
        });
    });
});
