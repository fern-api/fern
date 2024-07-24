import { itSchemaIdentity } from "../utils/itSchema";
import { itValidate } from "../utils/itValidate";
import { stringLiteral } from "../../../../src/core/schemas/builders/literals/stringLiteral";

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
