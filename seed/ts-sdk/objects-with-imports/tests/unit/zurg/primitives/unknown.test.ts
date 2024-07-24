import { unknown } from "../../../../src/core/schemas/builders/primitives/unknown";
import { itSchemaIdentity } from "../utils/itSchema";

describe("unknown", () => {
    itSchemaIdentity(unknown(), true);
});
