const path = require("path");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = (_env, { mode = "production" }) => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "../lib/cli.js"),
        output: {
            path: __dirname,
            filename: "bundle.js",
        },
        // https://github.com/dsherret/ts-morph/issues/171#issuecomment-1107867732
        module: {
            rules: [
                {
                    test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
                    use: { loader: "umd-compat-loader" },
                },
            ],
            noParse: [require.resolve("@ts-morph/common/dist/typescript.js")],
            parser: {
                javascript: {
                    // this is needed because the dynamic import() for loading
                    // helpers is transpiled to a dynamic require() by typescript
                    commonjsMagicComments: true,
                },
            },
        },
        plugins: [new SimpleProgressWebpackPlugin()],
        optimization: {
            minimize: false,
        },
    };
};
