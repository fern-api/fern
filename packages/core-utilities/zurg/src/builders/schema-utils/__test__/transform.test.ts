import { itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object, property } from "../../object";
import { string } from "../../primitives";

describe("transform", () => {
    itSchemaIdentity(
        string().transform<string>({
            parse: (value) => value,
            json: (value) => value,
        }),
        "hello world",
        {
            title: "identity transformer function as identity",
        }
    );

    itSchema(
        "correctly transforms in both directions",
        object({ foo: property("raw_foo", string()) }).transform<{ fooInBox: string }>({
            parse: (value) => ({ fooInBox: value.foo }),
            json: ({ fooInBox }) => ({ foo: fooInBox }),
        }),
        {
            raw: { raw_foo: "hello world" },
            parsed: { fooInBox: "hello world" },
        }
    );

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile if input is invalid", () => {
                const schema = string().transform<{ value: string }>({
                    parse: (value) => ({ value }),
                    json: ({ value }) => value,
                });

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile if input is invalid", () => {
                const schema = string().transform<{ value: string }>({
                    parse: (value) => ({ value }),
                    json: ({ value }) => value,
                });

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
