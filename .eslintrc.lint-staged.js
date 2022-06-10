const DEFAULT_CONFIG = require("./.eslintrc.js");

const TYPESCRIPT_ESLINT = "@typescript-eslint";
const TYPESCRIPT_ESLINT_PARSER_OPTIONS = new Set(["project", "allowAutomaticSingleRunInference", "tsconfigRootDir"]);

module.exports = {
    ...DEFAULT_CONFIG,
    plugins: DEFAULT_CONFIG.plugins.filter((p) => p !== TYPESCRIPT_ESLINT),
    parserOptions: Object.entries(DEFAULT_CONFIG.parserOptions).reduce(
        (newParserOptions, [parserOptionKey, parserOption]) => {
            if (!TYPESCRIPT_ESLINT_PARSER_OPTIONS.has(parserOptionKey)) {
                newParserOptions[parserOptionKey] = parserOption;
            }
            return newParserOptions;
        },
        {}
    ),
    rules: Object.entries(DEFAULT_CONFIG.rules).reduce((newRules, [ruleId, rule]) => {
        if (!ruleId.startsWith(TYPESCRIPT_ESLINT)) {
            newRules[ruleId] = rule;
        }
        return newRules;
    }, {}),
};
