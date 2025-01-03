const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const jestPlugin = require('eslint-plugin-jest');
const blueprintPlugin = require('@blueprintjs/eslint-plugin');
const deprecationPlugin = require('eslint-plugin-deprecation');
const importPlugin = require('eslint-plugin-import');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const tailwindPlugin = require('eslint-plugin-tailwindcss');

module.exports = [
    {
        // Global ignores
        ignores: ['*.js', '*.jsx']
    },
    {
        // Base configuration for all files
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parser: tsparser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },
                project: [`${__dirname}/tsconfig.eslint.json`, `${__dirname}/packages/**/tsconfig.json`],
                allowAutomaticSingleRunInference: true,
                tsconfigRootDir: __dirname
            }
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'jest': jestPlugin,
            '@blueprintjs': blueprintPlugin,
            'deprecation': deprecationPlugin,
            'import': importPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
            'tailwindcss': tailwindPlugin
        },
        settings: {
            react: {
                version: '^18.2.0'
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            ...eslint.configs.recommended.rules,
            ...tseslint.configs['recommended'].rules,
            ...tseslint.configs['strict'].rules,
            ...jestPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...tailwindPlugin.configs.recommended.rules,

            // Custom rules
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'double', { avoidEscape: true }],
            'semi': ['error', 'always'],
            'indent': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/explicit-module-boundary-types': ['error', { allowHigherOrderFunctions: false }],
            '@typescript-eslint/no-floating-promises': ['error'],
            '@typescript-eslint/no-misused-promises': ['error'],
            '@typescript-eslint/no-empty-function': ['error', {
                allow: ['private-constructors', 'protected-constructors', 'decoratedFunctions']
            }],
            'jest/unbound-method': ['error'],
            'jest/valid-describe-callback': 'off',
            'jest/valid-title': 'off',
            'object-shorthand': ['error'],
            '@typescript-eslint/no-invalid-void-type': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/prefer-optional-chain': 'off',
            'deprecation/deprecation': 'error',
            'import/no-internal-modules': ['error', { forbid: ['@fern-api/*/**'] }],
            '@typescript-eslint/no-base-to-string': 'error',
            'eqeqeq': ['error', 'always', { null: 'never' }],
            'curly': 'error',
            'no-console': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/await-thenable': 'error',
            '@blueprintjs/classes-constants': 'off',
            'tailwindcss/no-custom-classname': 'off',
            '@blueprintjs/html-components': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            'eslint-comments/no-unused-disable': 'off',
            'jest/expect-expect': 'off',
            'jest/no-conditional-expect': 'off'
        }
    },
    {
        // Test file overrides
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            'no-console': 'off'
        }
    }
];
