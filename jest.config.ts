import IS_CI from "is-ci";
// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";
import { getAllPackages } from "./scripts/getAllPackages";
import defaultConfig from "./shared/jest.config.shared";

const ETE_TESTS_PACKAGE_NAME = "@fern-api/ete-tests";

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in PRs, only run tests on the changed packages
        since: isBranchInCi(),
    });

    // force include ete tests
    if (!packages.some((p) => p.name === ETE_TESTS_PACKAGE_NAME)) {
        const allPackages = await getAllPackages();
        const eteTestsPacakge = allPackages.find((p) => p.name === ETE_TESTS_PACKAGE_NAME);
        if (eteTestsPacakge == null) {
            throw new Error(`Could not find package ${ETE_TESTS_PACKAGE_NAME}`);
        }
        packages.push(eteTestsPacakge);
    }

    return {
        ...defaultConfig,
        projects: packages.map((p) => ({
            ...defaultConfig,
            displayName: p.name,
            rootDir: `${p.location}/src`,
        })),
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
