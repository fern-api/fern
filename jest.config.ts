import IS_CI from "is-ci";
// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";
import { getAllPackages } from "./scripts/getAllPackages";
import packageConfig from "./shared/jest.config.shared";

const ETE_TESTS_PACKAGE = "@fern-api/ete-tests";

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in CI, only run test on the changed packages
        since: IS_CI,
    });

    // always test the ete package
    if (!packages.some((p) => p.name === ETE_TESTS_PACKAGE)) {
        const allPackages = await getAllPackages();
        const eteTestsPackage = allPackages.find((p) => p.name === ETE_TESTS_PACKAGE);
        if (eteTestsPackage == null) {
            throw new Error("Cannot find package " + ETE_TESTS_PACKAGE);
        }
        packages.push(eteTestsPackage);
    }

    return {
        projects: packages.map((p) => ({
            ...packageConfig,
            displayName: p.name,
            rootDir: `${p.location}/src`,
        })),
    };
};
