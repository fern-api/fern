import path, { dirname } from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default (): webpack.Configuration => {
    return {
        mode: "production",
        target: "node",
        entry: path.join(__dirname, "./src/cli.ts"),
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
                {
                    test: /\.node$/,
                    loader: "node-loader",
                },
            ],
            parser: {
                javascript: {
                    commonjsMagicComments: true,
                },
            },
        },
        resolve: {
            extensions: [
                // js is first so that if we encounter equivalent TS and JS source files side-by-side
                // (e.g. in node_modules), prefer the js
                ".js",
                ".ts",
            ],
        },
        plugins: [new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })],
        output: {
            path: path.join(__dirname, "dist"),
            filename: "bundle.cjs",
        },
        optimization: {
            minimize: false,
        },
    };
};
