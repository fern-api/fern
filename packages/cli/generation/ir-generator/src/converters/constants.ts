import { Constants } from "@fern-api/ir-sdk";

import { createNameAndWireValueObj } from "../utils/namesUtils.js";

export function generateFernConstants(): Constants {
    return {
        errorInstanceIdKey: createNameAndWireValueObj("errorInstanceId", "errorInstanceId")
    };
}
