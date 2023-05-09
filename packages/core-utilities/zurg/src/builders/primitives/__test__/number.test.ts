import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { number } from "../number";

describe("number", () => {
    itSchemaIdentity(number(), 42);

    itValidate("non-number", number(), "hello", [
        {
            path: [],
            message: 'Expected number. Received "hello".',
        },
    ]);
});
