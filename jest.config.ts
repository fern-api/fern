import IS_CI from "is-ci";
import { Config } from "jest";
import { getAllPackages } from "./packages/scripts/src/getAllPackages";
import defaultConfig from "./shared/jest.config.shared";

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in PRs, only run tests on the changed packages
        since: isBranchInCi()
    });

    return {
        ...defaultConfig,
        // if there are no packages, then jest will run all tests by default.
        // so in that case, change the test match to a dummy path that doesn't
        // match anything.
        testMatch: packages.length > 0 ? defaultConfig.testMatch : ["__path_that_does_not_exist"],
        projects: packages.map((p) => {
            return {
                ...defaultConfig,
                displayName: p.name,
                rootDir: `${p.location}/src`
            };
        })
    };
};

function isBranchInCi() {
    if (!IS_CI) {
        return false;
    }

    const { CIRCLE_BRANCH, CIRCLE_TAG } = process.env;
    if (CIRCLE_BRANCH === "main") {
        return false;
    }
    if (CIRCLE_TAG != null && CIRCLE_TAG.length > 0) {
        return false;
    }

    return true;
}
