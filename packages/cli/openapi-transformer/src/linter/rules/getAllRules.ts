import { OperationIdRequired } from "./operation-id-required";
import { CustomRule, SpectralRule } from "./Rule";

const ALL_RULES = {
    spectralRules: [OperationIdRequired],
    customRules: [],
};

export function getAllRules(): { spectralRules: SpectralRule[]; customRules: CustomRule[] } {
    return ALL_RULES;
}
