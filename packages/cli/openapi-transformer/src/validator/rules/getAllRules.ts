import { NoInlineEnums } from "./no-inline-enums";
import { NoInlineObjects } from "./no-inline-objects";
import { NoInlineUnions } from "./no-inline-unions";
import { OperationIdRequired } from "./operation-id-required";
import { RequestName } from "./request-name";
import { CustomRule, SpectralRule } from "./Rule";
import { ServerNameIsPresent } from "./server-name-is-present";
import { ValidEnumValue } from "./valid-enum-value";

const ALL_RULES = {
    spectralRules: [
        OperationIdRequired,
        NoInlineEnums,
        NoInlineObjects,
        NoInlineUnions,
        ValidEnumValue,
        RequestName,
        ServerNameIsPresent,
    ],
    customRules: [],
};

export function getAllRules(): { spectralRules: SpectralRule[]; customRules: CustomRule[] } {
    return ALL_RULES;
}
