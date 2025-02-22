import { Constants } from "@fern-api/ir-sdk";

import { CasingsGenerator } from "@fern-api/casings-generator";

export function generateFernConstants(casingsGenerator: CasingsGenerator): Constants {
    return {
        errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
            wireValue: "errorInstanceId",
            name: "errorInstanceId"
        })
    };
}
