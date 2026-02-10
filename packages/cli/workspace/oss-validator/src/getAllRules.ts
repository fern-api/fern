import { Rule } from "./Rule.js";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides/index.js";
import { NoSchemaTitleCollisionsRule } from "./rules/no-schema-title-collisions/index.js";

export function getAllRules(): Rule[] {
    return [NoDuplicateOverridesRule, NoSchemaTitleCollisionsRule];
}
