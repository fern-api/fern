const path = require("path");
const { readFile } = require("fs/promises");

module.exports = {
    name: "jsonc-parser-resolver",
    setup(build) {
        build.onResolve({ filter: /^jsonc-parser$/ }, (args) => {
            return {
                path: args.path,
                namespace: "jsonc-parser-resolver",
            };
        });

        build.onLoad({ filter: /.*/, namespace: "jsonc-parser-resolver" }, async () => {
            const filepath = path.join(
                __dirname,
                "../../../.yarn/unplugged/jsonc-parser-npm-2.2.1-31c56e9df8/node_modules/jsonc-parser/lib/esm/main.js"
            );
            return {
                contents: (await readFile(filepath)).toString(),
                loader: "js",
                resolveDir: path.dirname(filepath),
            };
        });
    },
};
