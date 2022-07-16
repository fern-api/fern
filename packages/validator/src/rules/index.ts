import { Rule } from "../Rule";
import { NoDuplicateEnumValuesRule } from "./no-duplicate-enum-values/no-duplicate-enum-values";
import { NoUndefinedPathParametersRule } from "./no-undefined-path-parameters/no-undefined-path-parameters";
import { NoUndefinedTypeReferenceRule } from "./no-undefined-type-reference/no-undefined-type-reference";
import { ValidAuthInServiceRule } from "./valid-auth-in-service/valid-auth-in-service";
import { ValidEnumNameRule } from "./valid-enum-name/valid-enum-name";

export const rules: Rule[] = [
    NoUndefinedTypeReferenceRule,
    NoDuplicateEnumValuesRule,
    NoUndefinedPathParametersRule,
    ValidAuthInServiceRule,
    ValidEnumNameRule,
];
