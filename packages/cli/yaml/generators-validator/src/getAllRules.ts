import { Rule } from "./Rule.js";
import { CompatibleIrVersionsRule } from "./rules/compatible-ir-versions/index.js";
import { ValidAliasGroupReferencesRule } from "./rules/valid-alias-group-references/index.js";

export function getAllRules(): Rule[] {
    return [CompatibleIrVersionsRule, ValidAliasGroupReferencesRule];
}
