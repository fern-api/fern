import IS_CI from "is-ci";
// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";
import { getAllPackages } from "./scripts/getAllPackages";
import defaultConfig from "./shared/jest.config.shared";

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in PRs, only run tests on the changed packages
        since: IS_CI && process.env.CIRCLE_BRANCH !== "main",
    });

    return {
        ...defaultConfig,
        // if there are no packages, then jest will run all tests by default.
        // so in that case, change the test match to a dummy path that doesn't
        // match anything.
        testMatch: packages.length > 0 ? defaultConfig.testMatch : ["__path_that_does_not_exist"],
        projects: packages.map((p) => ({
            ...defaultConfig,
            displayName: p.name,
            rootDir: `${p.location}/src`,
        })),
    };
};
