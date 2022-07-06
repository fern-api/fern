import { CracoConfig, getLoader, loaderByName } from "@craco/craco";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { getAllPackages } from "../../../scripts/getAllPackages";

module.exports = async function (): Promise<CracoConfig> {
    const packages = (await getAllPackages()).map((p) => `${p.location}/src`);
    return {
        webpack: {
            plugins: {
                add: [new NodePolyfillPlugin()],
            },
            configure: (webpackConfig) => {
                const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
                if (isFound) {
                    const loader = (match as any).loader;
                    const include = Array.isArray(loader.include) ? loader.include : [loader.include];
                    loader.include = include.concat(packages);
                } else {
                    throw new Error("Could not find babel-loader");
                }

                // add build flag to tsc
                const forkTsCheckerWebpackPlugin = webpackConfig.plugins?.find(
                    (p) => p.constructor.name === "ForkTsCheckerWebpackPlugin"
                );
                if (forkTsCheckerWebpackPlugin != null) {
                    (forkTsCheckerWebpackPlugin as any).options.typescript.build = true;
                } else {
                    throw new Error("Could not find ForkTsCheckerWebpackPlugin");
                }

                return webpackConfig;
            },
        },
    };
};
