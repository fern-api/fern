const path = require("path");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = async (_env, { mode = "production" }) => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "../src/cli.ts"),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [
                // js is first so that if we encounter equivalent TS and JS source files side-by-side
                // (e.g. in node_modules), prefer the js
                ".js",
                ".ts",
            ],
        },
        output: {
            path: __dirname,
            filename: "bundle.js",
        },
        plugins: [new SimpleProgressWebpackPlugin({})],
        optimization: {
            minimize: false,
        },
    };
};
