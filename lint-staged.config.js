module.exports = {
    "**/*.ts{,x}": [
        "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js",
        "yarn format:fix",
        "yarn orgznize-imports",
    ],
    "**/*.{js,json,yml,html,css,less,scss,md}": "yarn format",
    "**": () => "yarn lint:monorepo",
    "**/package.json": () => "yarn install --immutable",
};
