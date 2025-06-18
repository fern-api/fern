import { any } from "../../../../../../src/test-packagePath/core/schemas/builders";
import { itSchemaIdentity } from "../utils/itSchema";

describe("any", () => {
    itSchemaIdentity(any(), true);
});
