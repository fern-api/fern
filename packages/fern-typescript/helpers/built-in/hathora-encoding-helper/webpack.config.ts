import path from "path";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import * as webpack from "webpack";

const config = (_env: unknown, { mode = "production" }: webpack.WebpackOptionsNormalized): webpack.Configuration => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "./src/index.ts"),
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
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
        plugins: [new SimpleProgressWebpackPlugin({}), new BanModulesPlugin(["ts-morph", "typescript"])],
        optimization: {
            minimize: false,
        },
    };
};

class BanModulesPlugin implements webpack.WebpackPluginInstance {
    private static NAME = "BanModulesPlugin";
    constructor(private readonly bannedModules: string[]) {}
    public apply = (compiler: webpack.Compiler) => {
        compiler.hooks.thisCompilation.tap(BanModulesPlugin.NAME, (compilation) => {
            compilation.hooks.afterOptimizeChunks.tap(BanModulesPlugin.NAME, (chunks) => {
                for (const chunk of chunks) {
                    for (const module of chunk.modulesIterable) {
                        for (const bannedModule of this.bannedModules) {
                            if (module.context?.includes(`/node_modules/${bannedModule}`)) {
                                compilation.errors.push(
                                    new BannedDependencyError(`${bannedModule} is banned`, {
                                        name: module.context,
                                    })
                                );
                            }
                        }
                    }
                }
            });
        });
    };
}

class BannedDependencyError extends webpack.WebpackError {
    constructor(message: string, loc: webpack.WebpackError["loc"]) {
        super(message);
        this.name = "BannedDependencyError";
        this.loc = loc;
    }
}

export default config;
