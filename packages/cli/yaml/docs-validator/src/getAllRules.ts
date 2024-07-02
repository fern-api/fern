import { Rule } from "./Rule";
import { AccentColorContrastRule } from "./rules/accent-color-contrast";
import { FilepathsExistRule } from "./rules/filepaths-exist";
import { OnlyVersionedNavigation } from "./rules/only-versioned-navigation";
import { ValidFileTypes } from "./rules/valid-file-types";
import { ValidMarkdownRule } from "./rules/valid-markdown";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link";
import { ValidateVersionFileRule } from "./rules/validate-version-file";

export function getAllRules(): Rule[] {
    return [
        FilepathsExistRule,
        ValidMarkdownRule,
        OnlyVersionedNavigation,
        ValidateVersionFileRule,
        AccentColorContrastRule,
        ValidMarkdownLinks,
        ValidFileTypes
    ];
}
