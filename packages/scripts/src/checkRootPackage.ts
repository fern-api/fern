import chalk from "chalk";
import execa from "execa";
import { readFile, writeFile } from "fs/promises";
import produce from "immer";
import isEqual from "lodash-es/isEqual";
import path from "path";
import process from "process";
import { getAllPackages } from "./getAllPackages";

const COMPILE_ROOT_PACKAGE = "@fern-api/compile-root";

export async function checkRootPackage({ shouldFix }: { shouldFix: boolean }): Promise<void> {
    const packages = await getAllPackages();

    const rootPackage = packages.find((p) => p.name === COMPILE_ROOT_PACKAGE);
    if (rootPackage == null) {
        throw new Error("Could not find package " + COMPILE_ROOT_PACKAGE);
    }

    const pathToRootPackageJson = path.join(rootPackage.location, "package.json");
    const rootPackageJsonStr = await readFile(pathToRootPackageJson);
    const rootPackageJson: Record<string, unknown> = JSON.parse(rootPackageJsonStr.toString());
    const oldDependencies = rootPackageJson.dependencies as Record<string, string>;
    const newDependencies = packages
        .map((p) => p.name)
        .filter((name) => name !== COMPILE_ROOT_PACKAGE)
        .reduce(
            (dependencies, name) => ({
                ...dependencies,
                [name]: "workspace:*",
            }),
            {}
        );

    if (isEqual(oldDependencies, newDependencies)) {
        return;
    }

    if (!shouldFix) {
        // eslint-disable-next-line no-console
        console.log(
            chalk.red(
                `${COMPILE_ROOT_PACKAGE} dependencies are not correct. Run ${chalk.bold(
                    "yarn root-package:fix"
                )} to fix.`
            )
        );
        process.exit(1);
    }

    await writeFile(
        pathToRootPackageJson,
        JSON.stringify(
            produce(rootPackageJson, (draft) => {
                draft.dependencies = newDependencies;
            }),
            undefined,
            2
        )
    );
    await execa("yarn", ["lint:monorepo:fix"]);
    await execa("yarn", ["install"]);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Updated ${COMPILE_ROOT_PACKAGE}`));
}
