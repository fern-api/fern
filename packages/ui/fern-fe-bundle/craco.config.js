const { getLoader, loaderByName } = require("@craco/craco");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { getPackages } = require("@lerna/project");

module.exports = async function () {
    const packages = (await getPackages()).map((p) => `${p.location}/src`);
    return {
        webpack: {
            plugins: [new NodePolyfillPlugin()],
            configure: (webpackConfig) => {
                const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
                if (isFound) {
                    const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include];
                    match.loader.include = include.concat(packages);
                } else {
                    throw new Error("Could not find babel-loader");
                }

                // add build flag to tsc
                const forkTsCheckerWebpackPlugin = webpackConfig.plugins.find(
                    (p) => p.constructor.name === "ForkTsCheckerWebpackPlugin"
                );
                if (forkTsCheckerWebpackPlugin != null) {
                    forkTsCheckerWebpackPlugin.options.typescript.build = true;
                } else {
                    throw new Error("Could not find ForkTsCheckerWebpackPlugin");
                }
                return webpackConfig;
            },
        },
    };
};
