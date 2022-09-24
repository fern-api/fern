import { itJson, itParse, itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../../literals";
import { object } from "../../object";
import { boolean, number, string } from "../../primitives";
import { union } from "../union";

describe("union", () => {
    itSchemaIdentity(
        union("type", {
            lion: object({ meows: boolean() }),
            giraffe: object({ heightInInches: number() }),
        }),
        { type: "lion", meows: true },
        { title: "doesn't transform discriminant when it's a string" }
    );

    itSchemaIdentity(
        union(stringLiteral("type"), {
            lion: object({ meows: boolean() }),
            giraffe: object({ heightInInches: number() }),
        }),
        { type: "lion", meows: true },
        { title: "doesn't transform discriminant when it's a stringLiteral(<parsed value>)" }
    );

    itSchema(
        "transforms discriminant when it's a stringLiteral(<parsed value>, <raw value>)",
        union(stringLiteral("type", "_type"), {
            lion: object({ meows: boolean() }),
            giraffe: object({ heightInInches: number() }),
        }),
        {
            raw: { _type: "lion", meows: true },
            parsed: { type: "lion", meows: true },
        }
    );

    describe("unknown keys", () => {
        itSchema(
            "keeps unknown keys by default",
            union("type", {
                lion: object({}),
                tiger: object({ value: string() }),
            }),
            {
                raw: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
                parsed: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
            }
        );

        itSchema(
            "keeps unknown values by when skipUnknownKeys == false",
            union("type", {
                lion: object({}),
                tiger: object({ value: string() }),
            }),
            {
                raw: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
                parsed: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
                opts: { skipUnknownKeys: false },
            }
        );

        itParse(
            "parse() skips unknown values by when skipUnknownKeys == true",
            union("type", {
                lion: object({}),
                tiger: object({ value: string() }),
            }),
            {
                raw: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
                parsed: {
                    type: "lion",
                },
                opts: { skipUnknownKeys: true },
            }
        );

        itJson(
            "json() skips unknown values by when skipUnknownKeys == true",
            union("type", {
                lion: object({}),
                tiger: object({ value: string() }),
            }),
            {
                raw: {
                    type: "lion",
                },
                parsed: {
                    type: "lion",
                    // @ts-expect-error
                    additionalProperty: true,
                },
                opts: { skipUnknownKeys: true },
            }
        );
    });

    describe("withProperties", () => {
        it("Added property is included on parsed object", () => {
            const schema = union("type", {
                lion: object({}),
                tiger: object({ value: string() }),
            }).withProperties((parsed) => ({
                printType: () => parsed.type,
            }));

            const parsed = schema.parse({ type: "lion" });
            expect(parsed.printType()).toBe("lion");
        });
    });

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile when discriminant is subtype is not an object", () => {
            () =>
                union("type", {
                    // @ts-expect-error
                    lion: string(),
                });
        });

        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile when input is missing discriminant", () => {
                const schema = union("type", {
                    lion: object({}),
                    tiger: object({ value: string() }),
                });

                // @ts-expect-error
                () => schema.parse({});
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = union("type", {
                    lion: object({}),
                    tiger: object({ value: string() }),
                });

                // @ts-expect-error
                () => schema.parse([]);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile when input is missing discriminant", () => {
                const schema = union("type", {
                    lion: object({}),
                    tiger: object({ value: string() }),
                });

                // @ts-expect-error
                () => schema.json({});
            });

            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-object as input", () => {
                const schema = union("type", {
                    lion: object({}),
                    tiger: object({ value: string() }),
                });

                // @ts-expect-error
                () => schema.json([]);
            });
        });
    });
});
