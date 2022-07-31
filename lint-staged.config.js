module.exports = {
    "**/*.{ts,tsx}": "eslint --fix --max-warnings 0",
    "**/{*,_}": "yarn format",
    "**/{*,__}": () => "yarn install --immutable",
};
