module.exports = {
    "**/*.{ts,tsx}": "eslint --fix --max-warnings 0",
    "**/*.{css,scss}": "stylelint --fix --max-warnings 0",
    "**/{*,_}": "prettier --write --ignore-unknown",
    "**/{*,__}": () => "yarn install --immutable",
};
