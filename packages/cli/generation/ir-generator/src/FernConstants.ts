import { Constants } from "@fern-fern/ir-model/constants";
import { FernConstants } from "@fern-fern/ir-model/ir";

export const FERN_CONSTANTS: FernConstants = {
    errorDiscriminant: "_error",
    errorInstanceIdKey: "_errorInstanceId",
    unknownErrorDiscriminantValue: "_unknown",
};

export const FERN_CONSTANTS_V2: Constants = {
    errors: {
        errorDiscriminant: "error",
        errorInstanceIdKey: "errorInstanceId",
        errorContentKey: "content",
    },
};
