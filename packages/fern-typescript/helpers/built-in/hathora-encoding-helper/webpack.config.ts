import path from "path";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import * as webpack from "webpack";

export default (_env: unknown, { mode = "production" }: webpack.WebpackOptionsNormalized): webpack.Configuration => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "./src/index.ts"),
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
        },
        resolve: {
            extensions: [".ts", ".js"],
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
