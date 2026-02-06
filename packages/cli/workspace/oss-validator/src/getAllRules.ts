import { Rule } from "./Rule.js";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides/index.js";

export function getAllRules(): Rule[] {
    return [NoDuplicateOverridesRule];
}
