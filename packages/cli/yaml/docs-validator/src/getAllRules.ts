import { Rule } from "./Rule";
import { FilepathsExistRule } from "./rules/filepaths-exist";
import { OnlyVersionedNavigation } from "./rules/only-versioned-navigation";
import { ValidMarkdownRule } from "./rules/valid-markdown";
import { ValidateVersionFileRule } from "./rules/validate-version-file";

export function getAllRules(): Rule[] {
    return [FilepathsExistRule, ValidMarkdownRule, OnlyVersionedNavigation, ValidateVersionFileRule];
}
