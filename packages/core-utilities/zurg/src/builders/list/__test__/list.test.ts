import { itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object, property } from "../../object";
import { string } from "../../primitives";
import { list } from "../list";

describe("list", () => {
    itSchemaIdentity(list(string()), ["hello", "world"], {
        title: "functions as identity when item type is primitive",
    });

    itSchema(
        "converts objects correctly",
        list(
            object({
                helloWorld: property("hello_world", string()),
            })
        ),
        {
            raw: [{ hello_world: "123" }],
            parsed: [{ helloWorld: "123" }],
        }
    );

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid items as input", () => {
                const schema = list(string());

                // @ts-expect-error
                () => schema.parse([42]);
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-list as input", () => {
                const schema = list(string());

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with invalid items as input", () => {
                const schema = list(string());

                // @ts-expect-error
                () => schema.json([42]);
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-list as input", () => {
                const schema = list(string());

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
