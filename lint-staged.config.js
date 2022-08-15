module.exports = {
    "**/*.{ts,tsx}": "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js",
    "**/{*,_}": "yarn format",
    "**/{*,__}": () => "yarn lint:monorepo",
    "**/{package.json, __}": () => "yarn install --immutable",
};
