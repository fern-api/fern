import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { unknown } from "../unknown";

describe("unknown", () => {
    itSchemaIdentity(unknown(), true);
});
