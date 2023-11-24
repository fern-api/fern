import { Constants } from "@fern-fern/ir-sdk/api";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function generateFernConstants(casingsGenerator: CasingsGenerator): Constants {
    return {
        errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
            wireValue: "errorInstanceId",
            name: "errorInstanceId"
        })
    };
}
