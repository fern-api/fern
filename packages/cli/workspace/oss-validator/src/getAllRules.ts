import { Rule } from "./Rule.js";
import { NoDuplicateAuthHeaderParametersRule } from "./rules/no-duplicate-auth-header-parameters/index.js";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides/index.js";
import { NoSchemaTitleCollisionsRule } from "./rules/no-schema-title-collisions/index.js";

export function getAllRules(): Rule[] {
    return [NoDuplicateAuthHeaderParametersRule, NoDuplicateOverridesRule, NoSchemaTitleCollisionsRule];
}
