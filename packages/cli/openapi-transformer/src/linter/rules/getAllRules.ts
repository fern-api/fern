import { NoInlinedEnums } from "./no-inlined-enums";
import { OneOfRequiresDiscriminant } from "./one-of-requires-discriminant";
import { OperationIdRequired } from "./operation-id-required";
import { CustomRule, SpectralRule } from "./Rule";

const ALL_RULES = {
    spectralRules: [OperationIdRequired, OneOfRequiresDiscriminant, NoInlinedEnums],
    customRules: [],
};

export function getAllRules(): { spectralRules: SpectralRule[]; customRules: CustomRule[] } {
    return ALL_RULES;
}
