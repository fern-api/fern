import { CracoConfig, getLoader, loaderByName } from "@craco/craco";
import { ForkTsCheckerWebpackPluginConfig } from "fork-ts-checker-webpack-plugin/lib/plugin-config";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { getAllPackages } from "../../scripts/src/getAllPackages";

module.exports = async function (): Promise<CracoConfig> {
    const packages = await getAllPackages();

    return {
        webpack: {
            plugins: {
                add: [new NodePolyfillPlugin()],
            },
            configure: (webpackConfig) => {
                // load/watch src/ files in other packages
                const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
                if (isFound) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const loader = (match as any).loader;
                    const include = Array.isArray(loader.include) ? loader.include : [loader.include];
                    loader.include = include.concat(packages.map((p) => `${p.location}/src`));
                } else {
                    throw new Error("Could not find babel-loader");
                }

                const forkTsCheckerWebpackPlugin = webpackConfig.plugins?.find(
                    (p) => p.constructor.name === "ForkTsCheckerWebpackPlugin"
                );
                if (forkTsCheckerWebpackPlugin != null) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const options = (forkTsCheckerWebpackPlugin as any).options as ForkTsCheckerWebpackPluginConfig;
                    // add --build flag to tsc for building project references
                    options.typescript.build = true;
                    // compile ESM, not CJS
                    options.typescript.configFile = "tsconfig.json";
                } else {
                    throw new Error("Could not find ForkTsCheckerWebpackPlugin");
                }

                return webpackConfig;
            },
        },
    };
};
