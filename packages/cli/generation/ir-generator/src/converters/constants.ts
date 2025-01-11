import { Constants } from "@fern-api/ir-sdk";

import { CasingsGenerator } from "../casings/CasingsGenerator";

export function generateFernConstants(casingsGenerator: CasingsGenerator): Constants {
    return {
        errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
            wireValue: "errorInstanceId",
            name: "errorInstanceId"
        })
    };
}
