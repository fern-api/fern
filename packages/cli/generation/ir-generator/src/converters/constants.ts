import { Constants } from "@fern-fern/ir-model/constants";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function generateFernConstants(casingsGenerator: CasingsGenerator): Constants {
    return {
        errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
            wireValue: "errorInstanceId",
            name: "errorInstanceId",
        }),
    };
}
