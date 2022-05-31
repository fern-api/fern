import path from "path";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as webpack from "webpack";

export default (_env: unknown, { mode = "production" }: webpack.WebpackOptionsNormalized): webpack.Configuration => {
    delete process.env.TS_NODE_PROJECT;
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "./src/index.ts"),
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    options: {
                        projectReferences: true,
                    },
                    exclude: /node_modules/,
                    resolve: {
                        extensions: [".ts", ".js"],
                        plugins: [new TsconfigPathsPlugin()],
                    },
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [new TsconfigPathsPlugin()],
            alias: {
                // "@fern-typescript/helper-utils": path.join(__dirname, "../../utils/src"),
            },
        },
        output: {
            path: path.join(__dirname, "dist"),
            filename: "bundle.js",
            library: { type: "commonjs" },
        },
        plugins: [new SimpleProgressWebpackPlugin({})],
        optimization: {
            minimize: false,
        },
    };
};
