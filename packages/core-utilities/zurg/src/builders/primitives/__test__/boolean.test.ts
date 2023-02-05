import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { boolean } from "../boolean";

describe("boolean", () => {
    itSchemaIdentity(boolean(), true);

    itValidate("non-boolean", boolean(), 42, [
        {
            path: [],
            message: "Not a boolean",
        },
    ]);
});
