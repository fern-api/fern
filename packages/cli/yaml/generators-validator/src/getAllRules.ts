import { Rule } from "./Rule";
import { CompatibleIrVersionsRule } from "./rules/compatible-ir-versions";

export function getAllRules(): Rule[] {
    return [CompatibleIrVersionsRule];
}
