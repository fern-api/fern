import { Rule } from "../Rule";
import { NoDuplicateEnumValuesRule } from "./no-duplicate-enum-values/no-duplicate-enum-values";
import { NoUndefinedTypeReferenceRule } from "./no-undefined-type-reference/no-undefined-type-reference";

export const rules: Rule[] = [NoUndefinedTypeReferenceRule, NoDuplicateEnumValuesRule];
