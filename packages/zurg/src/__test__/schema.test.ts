import { boolean, list, number, object, string, stringLiteral, union } from "../builders";
import { property } from "../builders/object/property";
import { itSchema } from "./utils/itSchema";

describe("Schema", () => {
    itSchema(
        "large nested object",
        object({
            a: string(),
            b: stringLiteral("b value"),
            c: property(
                "raw_c",
                list(
                    object({
                        animal: union(stringLiteral("type", "_type"), {
                            dog: object({ value: boolean() }),
                            cat: object({ value: property("raw_cat", number()) }),
                        }),
                    })
                )
            ),
            d: property("raw_d", boolean()),
        }),
        {
            raw: {
                a: "hello",
                b: "b value",
                raw_c: [
                    {
                        animal: {
                            _type: "dog",
                            value: true,
                        },
                    },
                    {
                        animal: {
                            _type: "cat",
                            raw_cat: 42,
                        },
                    },
                ],
                raw_d: false,
            },
            parsed: {
                a: "hello",
                b: "b value",
                c: [
                    {
                        animal: {
                            type: "dog",
                            value: true,
                        },
                    },
                    {
                        animal: {
                            type: "cat",
                            value: 42,
                        },
                    },
                ],
                d: false,
            },
        }
    );
});
