import { itSchemaIdentity } from "../utils/itSchema";
import { itValidate } from "../utils/itValidate";
import { number } from "../../../../src/core/schemas/builders/primitives/number";

describe("number", () => {
    itSchemaIdentity(number(), 42);

    itValidate("non-number", number(), "hello", [
        {
            path: [],
            message: 'Expected number. Received "hello".',
        },
    ]);
});
