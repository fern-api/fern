import { Rule } from "./Rule";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides";
import { NoDuplicateTypesRule } from "./rules/no-duplicate-types";

export function getAllRules(): Rule[] {
    return [NoDuplicateOverridesRule, NoDuplicateTypesRule];
}
