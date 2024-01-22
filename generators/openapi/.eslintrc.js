module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    plugins: ["@typescript-eslint", "jest", "deprecation"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:jest/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        project: ["./tsconfig.json"],
    },
    env: {
        "jest/globals": true,
    },
    ignorePatterns: ["*.js"],
    rules: {
        "linebreak-style": ["error", "unix"],
        quotes: [
            "error",
            "double",
            {
                avoidEscape: true,
            },
        ],
        semi: ["error", "always"],
        indent: "off",
        "no-empty": [
            "error",
            {
                allowEmptyCatch: true,
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                ignoreRestSiblings: true,
            },
        ],
        "@typescript-eslint/no-namespace": [
            "error",
            {
                allowDeclarations: true,
            },
        ],
        "@typescript-eslint/explicit-module-boundary-types": [
            "error",
            {
                allowHigherOrderFunctions: false,
            },
        ],
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-empty-function": [
            "error",
            {
                allow: ["private-constructors", "protected-constructors", "decoratedFunctions"],
            },
        ],
        "jest/unbound-method": ["error"],
        "object-shorthand": ["error"],
        "@typescript-eslint/no-invalid-void-type": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "deprecation/deprecation": "error",
    },
};
