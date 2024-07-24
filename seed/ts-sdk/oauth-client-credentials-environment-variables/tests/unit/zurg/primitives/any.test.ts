import { any } from "../../../../src/core/schemas/builders/primitives/any";
import { itSchemaIdentity } from "../utils/itSchema";

describe("any", () => {
    itSchemaIdentity(any(), true);
});
