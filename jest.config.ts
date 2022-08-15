// eslint-disable-next-line jest/no-jest-import
import execa from "execa";
import IS_CI from "is-ci";
import { Config } from "jest";
import path from "path";
import defaultConfig from "./shared/jest.config.shared";

interface YarnPackage {
    name: string;
    location: string;
}

export default async (): Promise<Config> => {
    const packages = await getAllPackages({
        // in PRs, only run tests on the changed packages
        since: isBranchInCi(),
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
                rootDir: `${p.location}/src`,
            };
        }),
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

async function getAllPackages({ since = false }: { since?: boolean } = {}): Promise<YarnPackage[]> {
    const args = ["workspaces", "list", "--json"];
    if (since) {
        args.push("--since", "--recursive");
    }

    const { stdout } = await execa("yarn", args);
    const trimmedStdout = stdout.trim();

    if (trimmedStdout === "") {
        return [];
    }

    return trimmedStdout.split("\n").reduce<YarnPackage[]>((packages, line) => {
        const parsed = JSON.parse(line) as YarnPackage;
        if (parsed.location !== ".") {
            packages.push({
                name: parsed.name,
                location: path.resolve(__dirname, parsed.location),
            });
        }
        return packages;
    }, []);
}
