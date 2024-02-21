import { itJson, itParse, itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { stringLiteral } from "../../literals";
import { any, number, string, unknown } from "../../primitives";
import { object } from "../object";
import { property } from "../property";

describe("object", () => {
    itSchemaIdentity(
        object({
            foo: string(),
            bar: stringLiteral("bar")
        }),
        {
            foo: "",
            bar: "bar"
        },
        {
            title: "functions as identity when values are primitives and property() isn't used"
        }
    );

    itSchema(
        "uses raw key from property()",
        object({
            foo: property("raw_foo", string()),
            bar: stringLiteral("bar")
        }),
        {
            raw: { raw_foo: "foo", bar: "bar" },
            parsed: { foo: "foo", bar: "bar" }
        }
    );

    itSchema(
        "keys with unknown type can be omitted",
        object({
            foo: unknown()
        }),
        {
            raw: {},
            parsed: {}
        }
    );

    itSchema(
        "keys with any type can be omitted",
        object({
            foo: any()
        }),
        {
            raw: {},
            parsed: {}
        }
    );

    describe("unrecognizedObjectKeys", () => {
        describe("parse", () => {
            itParse(
                'includes unknown values when unrecognizedObjectKeys === "passthrough"',
                object({
                    foo: property("raw_foo", string()),
                    bar: stringLiteral("bar")
                }),
                {
                    raw: {
                        raw_foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    parsed: {
                        foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    opts: {
                        unrecognizedObjectKeys: "passthrough"
                    }
                }
            );

            itParse(
                'strips unknown values when unrecognizedObjectKeys === "strip"',
                object({
                    foo: property("raw_foo", string()),
                    bar: stringLiteral("bar")
                }),
                {
                    raw: {
                        raw_foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    parsed: {
                        foo: "foo",
                        bar: "bar"
                    },
                    opts: {
                        unrecognizedObjectKeys: "strip"
                    }
                }
            );
        });

        describe("json", () => {
            itJson(
                'includes unknown values when unrecognizedObjectKeys === "passthrough"',
                object({
                    foo: property("raw_foo", string()),
                    bar: stringLiteral("bar")
                }),
                {
                    raw: {
                        raw_foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    parsed: {
                        foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    opts: {
                        unrecognizedObjectKeys: "passthrough"
                    }
                }
            );

            itJson(
                'strips unknown values when unrecognizedObjectKeys === "strip"',
                object({
                    foo: property("raw_foo", string()),
                    bar: stringLiteral("bar")
                }),
                {
                    raw: {
                        raw_foo: "foo",
                        bar: "bar"
                    },
                    parsed: {
                        foo: "foo",
                        bar: "bar",
                        // @ts-expect-error
                        baz: "yoyo"
                    },
                    opts: {
                        unrecognizedObjectKeys: "strip"
                    }
                }
            );
        });
    });

    describe("nullish properties", () => {
        itSchema("missing properties are not added", object({ foo: property("raw_foo", string().optional()) }), {
            raw: {},
            parsed: {}
        });

        itSchema("undefined properties are not dropped", object({ foo: property("raw_foo", string().optional()) }), {
            raw: { raw_foo: null },
            parsed: { foo: undefined }
        });

        itSchema("null properties are not dropped", object({ foo: property("raw_foo", string().optional()) }), {
            raw: { raw_foo: null },
            parsed: { foo: undefined }
        });

        describe("extensions", () => {
            itSchema(
                "undefined properties are not dropped",
                object({}).extend(object({ foo: property("raw_foo", string().optional()) })),
                {
                    raw: { raw_foo: null },
                    parsed: { foo: undefined }
                }
            );

            describe("parse()", () => {
                itParse(
                    "null properties are not dropped",
                    object({}).extend(object({ foo: property("raw_foo", string().optional()) })),
                    {
                        raw: { raw_foo: null },
                        parsed: { foo: undefined }
                    }
                );
            });
        });
    });

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with non-object in schema", () => {
            // @ts-expect-error
            object([]);
        });
    });

    itValidate(
        "missing property",
        object({
            foo: string(),
            bar: stringLiteral("bar")
        }),
        { foo: "hello" },
        [
            {
                path: [],
                message: 'Missing required key "bar"'
            }
        ]
    );

    itValidate(
        "extra property",
        object({
            foo: string(),
            bar: stringLiteral("bar")
        }),
        { foo: "hello", bar: "bar", baz: 42 },
        [
            {
                path: ["baz"],
                message: 'Unexpected key "baz"'
            }
        ]
    );

    itValidate(
        "not an object",
        object({
            foo: string(),
            bar: stringLiteral("bar")
        }),
        [],
        [
            {
                path: [],
                message: "Expected object. Received list."
            }
        ]
    );

    itValidate(
        "nested validation error",
        object({
            foo: object({
                bar: number()
            })
        }),
        { foo: { bar: "hello" } },
        [
            {
                path: ["foo", "bar"],
                message: 'Expected number. Received "hello".'
            }
        ]
    );
});
