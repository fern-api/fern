import { Rule } from "./Rule";
import { FilepathsExistRule } from "./rules/filepaths-exist";

export function getAllRules(): Rule[] {
    return [FilepathsExistRule];
}
