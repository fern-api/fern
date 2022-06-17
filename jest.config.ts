// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";
import { getAllPackages } from "./scripts/getAllPackages";
import packageConfig from "./shared/jest.config.shared";

export default async (): Promise<Config> => {
    const packages = await getAllPackages();
    return {
        projects: packages.map((p) => ({
            ...packageConfig,
            displayName: p.name,
            rootDir: `${p.location}/src`,
        })),
    };
};
