import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { stringLiteral } from "../stringLiteral";

describe("stringLiteral", () => {
    itSchemaIdentity(stringLiteral("A"), "A");

    itValidate("incorrect string", stringLiteral("A"), "B", [
        {
            path: [],
            message: 'Expected "A". Received "B".',
        },
    ]);

    itValidate("non-string", stringLiteral("A"), 42, [
        {
            path: [],
            message: 'Expected "A". Received 42.',
        },
    ]);
});
