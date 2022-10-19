import { Constants } from "@fern-fern/ir-model/constants";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { CasingsGenerator } from "./casings/CasingsGenerator";

export const FERN_CONSTANTS: FernConstants = {
    errorDiscriminant: "_error",
    errorInstanceIdKey: "_errorInstanceId",
    unknownErrorDiscriminantValue: "_unknown",
};

export function generateFernConstantsV2(casingsGenerator: CasingsGenerator): Constants {
    return {
        errors: {
            errorDiscriminant: casingsGenerator.generateWireCasingsV1({ wireValue: "error", name: "error" }),
            errorInstanceIdKey: casingsGenerator.generateWireCasingsV1({
                wireValue: "errorInstanceId",
                name: "errorInstanceId",
            }),
            errorContentKey: casingsGenerator.generateWireCasingsV1({ wireValue: "content", name: "content" }),
        },
        errorsV2: {
            errorDiscriminant: casingsGenerator.generateNameAndWireValue({ wireValue: "error", name: "error" }),
            errorInstanceIdKey: casingsGenerator.generateNameAndWireValue({
                wireValue: "errorInstanceId",
                name: "errorInstanceId",
            }),
            errorContentKey: casingsGenerator.generateNameAndWireValue({ wireValue: "content", name: "content" }),
        },
    };
}
