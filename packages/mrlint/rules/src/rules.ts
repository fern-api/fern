import { Rule } from "@mrlint/commons";
import { CdkRule } from "./rules/cdk";
import { CliRule } from "./rules/cli";
import { CracoRule } from "./rules/craco";
import { DeclarationsRule } from "./rules/declarations";
import { DepcheckRule } from "./rules/depcheck";
import { JestRule } from "./rules/jest";
import { PackageJsonRule } from "./rules/package-json";
import { PrettierRule } from "./rules/prettier";
import { StyleLintRule } from "./rules/stylelint";
import { TsConfigRule } from "./rules/ts-config";

export interface Rules {
    rules: Rule[];
}

export const RULES: Rules = {
    rules: [
        PackageJsonRule,
        TsConfigRule,
        CdkRule,
        DepcheckRule,
        DeclarationsRule,
        CracoRule,
        JestRule,
        PrettierRule,
        StyleLintRule,
        CliRule,
    ],
};
