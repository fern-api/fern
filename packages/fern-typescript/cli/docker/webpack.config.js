const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
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
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};
