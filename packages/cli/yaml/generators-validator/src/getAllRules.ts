import { Rule } from "./Rule";
import { CompatibleIrVersionsRule } from "./rules/compatible-ir-versions";
import { ValidAliasGroupReferencesRule } from "./rules/valid-alias-group-references";

export function getAllRules(): Rule[] {
    return [CompatibleIrVersionsRule, ValidAliasGroupReferencesRule];
}
