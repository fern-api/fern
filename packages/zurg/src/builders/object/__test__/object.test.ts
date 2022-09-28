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

    describe("skipUnknownKeysOnParse", () => {
        itParse(
            "includes unknown keys by default",
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

        itParse(
            "includes unknown values by when skipUnknownKeysOnParse === false",
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
                opts: {
                    skipUnknownKeysOnParse: false,
                },
            }
        );

        itParse(
            "skip unknown values by when skipUnknownKeysOnParse === true",
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
                opts: {
                    skipUnknownKeysOnParse: true,
                },
            }
        );
    });

    describe("includeUnknownKeysOnJson", () => {
        itJson(
            "skips unknown keys by default",
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
            }
        );

        itJson(
            "skips unknown values by when includeUnknownKeysOnJson === false",
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
                opts: {
                    includeUnknownKeysOnJson: false,
                },
            }
        );

        itJson(
            "includes unknown values by when includeUnknownKeysOnJson === true",
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
                opts: {
                    includeUnknownKeysOnJson: true,
                },
            }
        );
    });

    describe("nullish properties", () => {
        itSchema("optional properties are allowed to be omitted", object({ foo: string().optional() }), {
            raw: {},
            parsed: {},
        });

        describe("parse()", () => {
            itParse("undefined properties are dropped", object({ foo: string().optional() }), {
                raw: { foo: undefined },
                parsed: {},
            });

            itParse("null properties are dropped", object({ foo: string().optional() }), {
                raw: { foo: null },
                parsed: {},
            });
        });

        describe("json()", () => {
            itJson("undefined properties are dropped", object({ foo: string().optional() }), {
                raw: {},
                parsed: { foo: undefined },
            });
        });
    });

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with non-object in schema", () => {
            // @ts-expect-error
            object([]);
        });

        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with missing property in input", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.parse({ foo: "hello" });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with extra property in input", () => {
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
            it("doesn't compile with missing property in input", () => {
                const schema = object({
                    foo: string(),
                    bar: stringLiteral("bar"),
                });

                // @ts-expect-error
                () => schema.json({ foo: "hello" });
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with extra property in input", () => {
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
            it("doesn't compile with non-object as input in input", () => {
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
