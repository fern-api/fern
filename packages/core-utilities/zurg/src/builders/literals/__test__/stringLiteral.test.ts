import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { stringLiteral } from "../stringLiteral";

describe("stringLiteral", () => {
    itSchemaIdentity(stringLiteral("A"), "A");

    itValidate("incorrect string", stringLiteral("A"), "B", [
        {
            path: [],
            message: 'Not equal to "A"',
        },
    ]);

    itValidate("non-string", stringLiteral("A"), 42, [
        {
            path: [],
            message: 'Not equal to "A"',
        },
    ]);
});
