import unitConfig from "./jest.unit.config.mjs";
import browserConfig from "./jest.browser.config.mjs";
import wireConfig from "./jest.wire.config.mjs";

const configs = [unitConfig, browserConfig, wireConfig];
function extractRootConfig(configs) {
    const rootConfig = {};
    for (const config of configs) {
        if (rootConfig.workerThreads === true) {
            config.workerThreads = true;
        }
    }
    return rootConfig;
}
function stripRootConfig(configs) {
    return configs.map((config) => {
        const { workerThreads, passWithNoTests, ...rest } = config;
        return rest;
    });
}

/** @type {import('jest').Config} */
export default {
    projects: stripRootConfig(configs),
    passWithNoTests: true,
    ...extractRootConfig(configs),
};
