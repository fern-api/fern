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
            errorDiscriminant: casingsGenerator.generateWireCasings({ wireValue: "error", name: "error" }),
            errorInstanceIdKey: casingsGenerator.generateWireCasings({
                wireValue: "errorInstanceId",
                name: "errorInstanceId",
            }),
            errorContentKey: casingsGenerator.generateWireCasings({ wireValue: "content", name: "content" }),
        },
    };
}
