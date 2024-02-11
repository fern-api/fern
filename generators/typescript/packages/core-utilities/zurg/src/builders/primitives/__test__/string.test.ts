import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { string } from "../string";

describe("string", () => {
    itSchemaIdentity(string(), "hello");

    itValidate("non-string", string(), 42, [
        {
            path: [],
            message: "Expected string. Received 42.",
        },
    ]);
});
