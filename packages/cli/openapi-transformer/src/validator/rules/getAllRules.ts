import { NoInlineEnums } from "./no-inline-enums";
import { OneOfRequiresDiscriminant } from "./one-of-requires-discriminant";
import { OperationIdRequired } from "./operation-id-required";
import { CustomRule, SpectralRule } from "./Rule";

const ALL_RULES = {
    spectralRules: [OperationIdRequired, OneOfRequiresDiscriminant, NoInlineEnums],
    customRules: [],
};

export function getAllRules(): { spectralRules: SpectralRule[]; customRules: CustomRule[] } {
    return ALL_RULES;
}
