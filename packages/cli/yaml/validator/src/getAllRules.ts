import { Rule } from "./Rule";
import ImportFileExistsRule from "./rules/import-file-exists";
import NoCircularImportsRule from "./rules/no-circular-imports";
import NoDuplicateDeclarationsRule from "./rules/no-duplicate-declarations";
import NoDuplicateEnumValuesRule from "./rules/no-duplicate-enum-values";
import NoUndefinedErrorReferenceRule from "./rules/no-undefined-error-reference";
import NoUndefinedPathParametersRule from "./rules/no-undefined-path-parameters";
import NoUndefinedTypeReferenceRule from "./rules/no-undefined-type-reference";
import ValidEnumNameRule from "./rules/valid-enum-name";

export function getAllRules(): Rule[] {
    return [
        NoUndefinedTypeReferenceRule,
        NoDuplicateEnumValuesRule,
        NoUndefinedPathParametersRule,
        ValidEnumNameRule,
        ImportFileExistsRule,
        NoDuplicateDeclarationsRule,
        NoUndefinedErrorReferenceRule,
        NoCircularImportsRule,
    ];
}
