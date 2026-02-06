import { Rule } from "./Rule";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides";
import { NoSchemaTitleCollisionsRule } from "./rules/no-schema-title-collisions";

export function getAllRules(): Rule[] {
    return [NoDuplicateOverridesRule, NoSchemaTitleCollisionsRule];
}
