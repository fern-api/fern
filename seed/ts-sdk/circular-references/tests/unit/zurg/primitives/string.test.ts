import { itSchemaIdentity } from "../utils/itSchema";
import { itValidate } from "../utils/itValidate";
import { string } from "../../../../src/core/schemas/builders/primitives/string";

describe("string", () => {
    itSchemaIdentity(string(), "hello");

    itValidate("non-string", string(), 42, [
        {
            path: [],
            message: "Expected string. Received 42.",
        },
    ]);
});
