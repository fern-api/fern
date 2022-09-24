import { itJson, itParse, itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../../literals";
import { string } from "../../primitives";
import { object } from "../object";
import { property } from "../property";

describe("object", () => {
    itSchemaIdentity(
        object({
            foo: string(),
            bar: stringLiteral("bar"),
        }),
        {
            foo: "",
            bar: "bar",
        },
        {
            title: "functions as identity when values are primitives and property() isn't used",
        }
    );

    itSchema(
        "uses raw value from property()",
        object({
            foo: property("raw_foo", string()),
            bar: stringLiteral("bar"),
        }),
        {
            raw: { raw_foo: "foo", bar: "bar" },
            parsed: { foo: "foo", bar: "bar" },
        }
    );

    describe("unknown keys", () => {
        itSchema(
            "keeps unknown keys by default",
            object({
                foo: property("raw_foo", string()),
                bar: stringLiteral("bar"),
            }),
            {
                raw: {
                    raw_foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
                parsed: {
                    foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
            }
        );

        itSchema(
            "keeps unknown values by when skipUnknownKeys == false",
            object({
                foo: property("raw_foo", string()),
                bar: stringLiteral("bar"),
            }),
            {
                raw: {
                    raw_foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
                parsed: {
                    foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
                opts: { skipUnknownKeys: false },
            }
        );

        itParse(
            "parse() skips unknown values by when skipUnknownKeys == true",
            object({
                foo: property("raw_foo", string()),
                bar: stringLiteral("bar"),
            }),
            {
                raw: {
                    raw_foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
                parsed: {
                    foo: "foo",
                    bar: "bar",
                },
                opts: { skipUnknownKeys: true },
            }
        );

        itJson(
            "json() skips unknown values by when skipUnknownKeys == true",
            object({
                foo: property("raw_foo", string()),
                bar: stringLiteral("bar"),
            }),
            {
                raw: {
                    raw_foo: "foo",
                    bar: "bar",
                },
                parsed: {
                    foo: "foo",
                    bar: "bar",
                    // @ts-expect-error
                    baz: "yoyo",
                },
                opts: { skipUnknownKeys: true },
            }
        );
    });

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with missing property", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.parse({ foo: "hello" });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with extra property", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                () =>
                    schema.parse({
                        foo: "hello",
                        bar: "bar",
                        // @ts-expect-error
                        baz: 42,
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with missing property", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.json({ foo: "hello" });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with extra property", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                () =>
                    schema.json({
                        foo: "hello",
                        bar: "bar",
                        // @ts-expect-error
                        baz: 42,
                    });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.json(42);
            });
        });
    });
});
