import { Config } from "jest";

import defaultConfig from "./shared/jest.config.shared";

export default async (): Promise<Config> => {
    return {
        ...defaultConfig
        // if there are no packages, then jest will run all tests by default.
        // so in that case, change the test match to a dummy path that doesn't
        // match anything.
        // testMatch: packages.length > 0 ? defaultConfig.testMatch : ["__path_that_does_not_exist"],
        // projects: packages.map((p) => {
        //     return {
        //         ...defaultConfig,
        //         displayName: p.name,
        //         rootDir: `${p.location}/src`
        //     };
        // })
    };
};
