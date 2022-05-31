const path = require("path");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = (_env, { mode = "production" }) => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "../dist/esm/cli.js"),
        output: {
            path: __dirname,
            filename: "bundle.js",
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
                // https://github.com/dsherret/ts-morph/issues/171#issuecomment-1107867732
                {
                    test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
                    use: { loader: "umd-compat-loader" },
                },
            ],
            noParse: [require.resolve("@ts-morph/common/dist/typescript.js")],
            parser: {
                javascript: {
                    // this is needed for dynamically loading helpers
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
