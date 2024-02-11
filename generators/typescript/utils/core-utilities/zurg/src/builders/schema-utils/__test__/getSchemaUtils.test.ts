import { itSchema } from "../../../__test__/utils/itSchema";
import { object } from "../../object";
import { string } from "../../primitives";

describe("getSchemaUtils", () => {
    describe("optional()", () => {
        itSchema("optional fields allow original schema", string().optional(), {
            raw: "hello",
            parsed: "hello",
        });

        itSchema("optional fields are not required", string().optional(), {
            raw: null,
            parsed: undefined,
        });
    });

    describe("transform()", () => {
        itSchema(
            "transorm and untransform run correctly",
            string().transform({
                transform: (x) => x + "X",
                untransform: (x) => (x as string).slice(0, -1),
            }),
            {
                raw: "hello",
                parsed: "helloX",
            }
        );
    });

    describe("parseOrThrow()", () => {
        it("parses valid value", async () => {
            const value = await string().parseOrThrow("hello");
            expect(value).toBe("hello");
        });

        it("throws on invalid value", async () => {
            const value = () => object({ a: string(), b: string() }).parseOrThrow({ a: 24 });
            await expect(value).rejects.toEqual(
                new Error('a: Expected string. Received 24.; Missing required key "b"')
            );
        });
    });

    describe("jsonOrThrow()", () => {
        it("serializes valid value", async () => {
            const value = await string().jsonOrThrow("hello");
            expect(value).toBe("hello");
        });

        it("throws on invalid value", async () => {
            const value = () => object({ a: string(), b: string() }).jsonOrThrow({ a: 24 });
            await expect(value).rejects.toEqual(
                new Error('a: Expected string. Received 24.; Missing required key "b"')
            );
        });
    });
});
