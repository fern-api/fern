import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { any } from "../any";

describe("any", () => {
    itSchemaIdentity(any(), true);
});
