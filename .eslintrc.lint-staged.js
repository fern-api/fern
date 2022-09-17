const DEFAULT_CONFIG = require("./.eslintrc.js");

const TYPESCRIPT_ESLINT = "@typescript-eslint";
const TYPESCRIPT_ESLINT_PARSER_OPTIONS = new Set(["project", "allowAutomaticSingleRunInference", "tsconfigRootDir"]);

module.exports = {
    ...DEFAULT_CONFIG,
    extends: [
        ...DEFAULT_CONFIG.extends.filter((extended) => !extended.startsWith(`plugin:${TYPESCRIPT_ESLINT}/`)),
        // needed to disable recommended eslint rules that don't apply
        "plugin:@typescript-eslint/eslint-recommended",
    ],
    parserOptions: Object.entries(DEFAULT_CONFIG.parserOptions).reduce(
        (newParserOptions, [parserOptionKey, parserOption]) => {
            if (!TYPESCRIPT_ESLINT_PARSER_OPTIONS.has(parserOptionKey)) {
                newParserOptions[parserOptionKey] = parserOption;
            }
            return newParserOptions;
        },
        {}
    ),
    rules: Object.entries(DEFAULT_CONFIG.rules).reduce(
        (newRules, [ruleId, rule]) => {
            if (!doesRuleRequireTypeInformation(ruleId) || rule === "off") {
                newRules[ruleId] = rule;
            }
            return newRules;
        },
        {
            "no-unused-vars": "off",
        }
    ),
};

function doesRuleRequireTypeInformation(ruleId) {
    if (ruleId.startsWith(`${TYPESCRIPT_ESLINT}/`)) {
        return true;
    }
    switch (ruleId) {
        case "deprecation/deprecation":
        case "jest/unbound-method":
            return true;
        default:
            return false;
    }
}
