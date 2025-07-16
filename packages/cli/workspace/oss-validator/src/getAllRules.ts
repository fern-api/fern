import { Rule } from "./Rule";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides";

export function getAllRules(): Rule[] {
    return [NoDuplicateOverridesRule];
}
