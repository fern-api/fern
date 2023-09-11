import { Rule } from "./Rule";
import { FilepathsExistRule } from "./rules/filepaths-exist";
import { ValidMarkdownRule } from "./rules/valid-markdown";

export function getAllRules(): Rule[] {
    return [FilepathsExistRule, ValidMarkdownRule];
}
