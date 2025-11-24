import { unknown } from "../../../../../../src/test-packagePath/core/schemas/builders";
import { itSchemaIdentity } from "../utils/itSchema";

describe("unknown", () => {
    itSchemaIdentity(unknown(), true);
});
