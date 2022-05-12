const path = require("path");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = (_env, { mode = "production" }) => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "./src/index.ts"),
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
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
        plugins: [new SimpleProgressWebpackPlugin()],
        optimization: {
            minimize: false,
        },
    };
};
