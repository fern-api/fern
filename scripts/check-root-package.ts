import chalk from "chalk";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import produce from "immer";
import { isEqual } from "lodash";
import path from "path";
import process from "process";
import { promisify } from "util";

const promisifiedExec = promisify(exec);

const MONOREPO_ROOT_PACKAGE = "fern";
const COMPILE_ROOT_PACKAGE = "@fern-api/_root";

interface YarnPackage {
    name: string;
    location: string;
}

async function main() {
    const argv = process.argv;
    const shouldFix = argv[2] === "--fix";

    const { stdout } = await promisifiedExec("yarn workspaces list --json");
    const packages = stdout
        .trim()
        .split("\n")
        .map((line): YarnPackage => JSON.parse(line));

    const rootPackage = packages.find((p) => p.name === COMPILE_ROOT_PACKAGE);
    if (rootPackage == null) {
        throw new Error("Could not find package " + COMPILE_ROOT_PACKAGE);
    }

    const pathToRootPackageJson = path.join(__dirname, "..", rootPackage.location, "package.json");
    const rootPackageJsonStr = await readFile(pathToRootPackageJson);
    const rootPackageJson: Record<string, unknown> = JSON.parse(rootPackageJsonStr.toString());
    const oldDependencies = rootPackageJson.dependencies as Record<string, string>;
    const newDependencies = packages
        .map((p) => p.name)
        .filter((name) => name !== MONOREPO_ROOT_PACKAGE && name !== COMPILE_ROOT_PACKAGE)
        .sort()
        .reduce(
            (dependencies, name) => ({
                ...dependencies,
                [name]: "workspace:*",
            }),
            {}
        );

    if (isEqual(oldDependencies, newDependencies)) {
        return;
    } else if (!shouldFix) {
        console.log(
            chalk.red(`${COMPILE_ROOT_PACKAGE} dependencies are not correct. Run ${chalk.bold("yarn compile")} to fix.`)
        );
        process.exit(1);
    } else {
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
        await promisifiedExec("yarn lint:monorepo:fix");
        await promisifiedExec("yarn install");
        console.log(chalk.green(`Updated ${COMPILE_ROOT_PACKAGE}`));
    }
}

void main();
