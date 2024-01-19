const path = require("path");
const webpack = require("webpack");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = async (_env, { mode = "production" }) => {
    return {
        mode,
        target: "node",
        // CHANGE ME
        entry: path.join(__dirname, "../src/runCli.ts"),
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
                    options: {
                        projectReferences: true,
                        transpileOnly: true,
                    },
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
            path: path.join(__dirname, "dist"),
            filename: "bundle.js",
        },
        plugins: [
            new SimpleProgressWebpackPlugin({}),
            new webpack.DefinePlugin({
                "process.env.GENERATOR_VERSION": JSON.stringify(process.env.GENERATOR_VERSION),
            }),
        ],
        optimization: {
            minimize: false,
        },
    };
};
