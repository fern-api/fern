import { itSchemaIdentity } from "../utils/itSchema";
import { itValidate } from "../utils/itValidate";
import { boolean } from "../../../../src/core/schemas/builders/primitives/boolean";

describe("boolean", () => {
    itSchemaIdentity(boolean(), true);

    itValidate("non-boolean", boolean(), {}, [
        {
            path: [],
            message: "Expected boolean. Received object.",
        },
    ]);
});
