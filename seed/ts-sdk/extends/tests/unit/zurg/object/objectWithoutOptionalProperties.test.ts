import { stringLiteral } from "../../../../src/core/schemas/builders/literals";
import { string } from "../../../../src/core/schemas/builders/primitives";
import { objectWithoutOptionalProperties } from "../../../../src/core/schemas/builders/object/objectWithoutOptionalProperties";
import { itSchema } from "../utils/itSchema";

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
