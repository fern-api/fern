module.exports = {
    "**/*.{ts,tsx}": "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js",
    "**/{*,_}": "yarn format",
    "**/{package.json, _}": () => "ts-node scripts/check-root-package.ts",
    "**/{package.json, __}": () => "yarn install --immutable --refresh-lockfile",
};
