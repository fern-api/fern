import { unknown } from "../../builders";
import { itSchemaIdentity } from "../utils/itSchema";

describe("unknown", () => {
    itSchemaIdentity(unknown(), true);
});
