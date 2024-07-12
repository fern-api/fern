import { any } from "../../builders";
import { itSchemaIdentity } from "../utils/itSchema";

describe("any", () => {
    itSchemaIdentity(any(), true);
});
