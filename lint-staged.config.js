module.exports = {
    "**/*.ts{,x}": ["eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js", "yarn format"],
    "**/*.{js,json,yml,html,css,less,scss,md}": "yarn format",
    "**/{*,__}": () => "yarn lint:monorepo",
    "**/{package.json, __}": () => "yarn install --immutable",
};
