import path from "path";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import * as webpack from "webpack";

export default (_env: unknown, { mode = "production" }: webpack.WebpackOptionsNormalized): webpack.Configuration => {
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
                    options: {
                        projectReferences: true,
                    },
                    exclude: /node_modules/,
                },
            ],
            parser: {
                javascript: {
                    // this is needed for dynamically loading helpers
                    commonjsMagicComments: true,
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js"],
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
