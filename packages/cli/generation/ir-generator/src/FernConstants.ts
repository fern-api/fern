import { Constants } from "@fern-fern/ir-model/constants";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { generateWireStringWithAllCasings } from "./utils/generateCasings";

export const FERN_CONSTANTS: FernConstants = {
    errorDiscriminant: "_error",
    errorInstanceIdKey: "_errorInstanceId",
    unknownErrorDiscriminantValue: "_unknown",
};

export const FERN_CONSTANTS_V2: Constants = {
    errors: {
        errorDiscriminant: generateWireStringWithAllCasings({ wireValue: "error", name: "error" }),
        errorInstanceIdKey: generateWireStringWithAllCasings({ wireValue: "errorInstanceId", name: "errorInstanceId" }),
        errorContentKey: generateWireStringWithAllCasings({ wireValue: "content", name: "content" }),
    },
};
