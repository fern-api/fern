import IS_CI from "is-ci";
// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";
import { getAllPackages } from "./scripts/getAllPackages";
import packageConfig from "./shared/jest.config.shared";

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in PRs, only run tests on the changed packages
        since: IS_CI && process.env.CIRCLE_BRANCH !== "main",
    });

    return {
        projects: packages.map((p) => ({
            ...packageConfig,
            displayName: p.name,
            rootDir: `${p.location}/src`,
        })),
    };
};
