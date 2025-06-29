module.exports = {
    "**/*.ts{,x}": "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js --ignore-path .eslintignore --no-ignore",
    "**/*.{ts,js,json,yaml,html,css,less,scss,md}": "prettier --write --ignore-unknown --ignore-path ./shared/.prettierignore",
    "**/package.json": () => "pnpm install --frozen-lockfile",
    "fern/apis/**/*.yml": "pnpm jsonschema",
    "**/versions.yml": (files) => [`ajv validate -s fern-versions-yml.schema.json --strict=false  ${files.map(file => `-d ${file}`).join(' ')}`],
};
