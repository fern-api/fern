import { stringLiteral } from "../../literals";
import { object } from "../../object/object";
import { property } from "../../object/property";
import { string } from "../../primitives";

describe("withProperties", () => {
    it("Added properties included on parsed object", async () => {
        const schema = object({
            foo: property("raw_foo", string()),
            bar: stringLiteral("bar"),
        }).withProperties({
            printFoo: (parsed) => () => parsed.foo,
            printHelloWorld: () => () => "Hello world",
            helloWorld: "Hello world",
        });

        const parsed = await schema.parse({ raw_foo: "value of foo", bar: "bar" });
        expect(parsed.printFoo()).toBe("value of foo");
        expect(parsed.printHelloWorld()).toBe("Hello world");
        expect(parsed.helloWorld).toBe("Hello world");
    });

    it("Added property is removed on raw object", async () => {
        const schema = object({
            foo: property("raw_foo", string()),
            bar: stringLiteral("bar"),
        }).withProperties({
            printFoo: (parsed) => () => parsed.foo,
        });

        const original = { raw_foo: "value of foo", bar: "bar" } as const;
        const parsed = await schema.parse(original);
        const raw = await schema.json(parsed);
        expect(raw).toEqual(original);
    });

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with non-object schema", () => {
            () =>
                object({
                    foo: string(),
                })
                    // @ts-expect-error
                    .withProperties(42);
        });

        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with missing property in input", () => {
            const schema = object({
                foo: string(),
            }).withProperties({
                bar: "yo",
            });

            // @ts-expect-error
            () => schema.json({ foo: "hello" });
        });

        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with additional property in input", () => {
            const schema = object({
                foo: string(),
            }).withProperties({
                bar: "yo",
            });

            () =>
                schema.json({
                    foo: "hello",
                    bar: "world",
                    // @ts-expect-error
                    baz: 42,
                });
        });
    });
});
