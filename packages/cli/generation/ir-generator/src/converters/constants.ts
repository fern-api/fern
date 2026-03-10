import { CasingsGenerator } from "@fern-api/casings-generator";
import { Constants } from "@fern-api/ir-sdk";

export function generateFernConstants(casingsGenerator: CasingsGenerator): Constants {
    return {
        errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
            wireValue: "errorInstanceId",
            name: "errorInstanceId"
        })
    };
}
