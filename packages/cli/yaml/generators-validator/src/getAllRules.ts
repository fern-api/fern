import { Rule } from "./Rule.js";
import { CompatibleIrVersionsRule } from "./rules/compatible-ir-versions/index.js";
import { NoDirectRubyGemsPublishingRule } from "./rules/no-direct-rubygems-publishing/index.js";
import { UnsignedMavenPublishingRule } from "./rules/unsigned-maven-publishing/index.js";
import { ValidAliasGroupReferencesRule } from "./rules/valid-alias-group-references/index.js";

export function getAllRules(): Rule[] {
    return [
        CompatibleIrVersionsRule,
        NoDirectRubyGemsPublishingRule,
        UnsignedMavenPublishingRule,
        ValidAliasGroupReferencesRule
    ];
}
