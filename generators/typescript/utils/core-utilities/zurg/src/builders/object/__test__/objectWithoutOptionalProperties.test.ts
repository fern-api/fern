import { itSchema } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../../literals";
import { string } from "../../primitives";
import { objectWithoutOptionalProperties } from "../objectWithoutOptionalProperties";

describe("objectWithoutOptionalProperties", () => {
    itSchema(
        "all properties are required",
        objectWithoutOptionalProperties({
            foo: string(),
            bar: stringLiteral("bar").optional(),
        }),
        {
            raw: {
                foo: "hello",
            },
            // @ts-expect-error
            parsed: {
                foo: "hello",
            },
        }
    );
});
