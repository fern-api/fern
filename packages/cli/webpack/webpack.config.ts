import path from "path";
import * as webpack from "webpack";

// TODO store these in a central package so we don't harcode them twice
const PACKAGE_VERSION_ENV_VAR = "PACKAGE_VERSION";
const AUTH0_DOMAIN_ENV_VAR = "AUTH0_DOMAIN";
const AUTH0_CLIENT_ID_ENV_VAR = "AUTH0_CLIENT_ID";

export default (): webpack.Configuration => {
    return {
        mode: "production",
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
                        configFile: "tsconfig.esm.json",
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.node$/,
                    loader: "node-loader",
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
        plugins: [
            new webpack.EnvironmentPlugin(PACKAGE_VERSION_ENV_VAR, AUTH0_DOMAIN_ENV_VAR, AUTH0_CLIENT_ID_ENV_VAR),
            new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        ],
        output: {
            path: path.join(__dirname, "dist"),
            filename: "bundle.js",
        },
        optimization: {
            minimize: false,
        },
    };
};
