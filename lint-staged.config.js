module.exports = {
    "**/*.ts{,x}": "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js --ignore-path .eslintignore",
    "**/*.{ts,js,json,yaml,html,css,less,scss,md}": "pnpm format",
    "**/package.json": () => "pnpm install --frozen-lockfile",
};
