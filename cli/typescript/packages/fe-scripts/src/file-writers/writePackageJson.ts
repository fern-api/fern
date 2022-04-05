import { RawManifest } from "@lerna/package";
import produce, { Draft } from "immer";
import path from "path";
import { createOverridablePackageValueSupplierWithArgument } from "../OverridablePackageValue";
import { LernaPackage } from "../types";
import { FileWriterArgs } from "./utils/createFileWriter";
import { createJsonFileWriter } from "./utils/createJsonFileWriter";
import { getPathToShared } from "./utils/getPathToShared";

const PRODUCTION_ENVIRONMENT_ENV_VAR = "REACT_APP_PRODUCTION_ENVIRONMENT";

export const writePackageJson = createJsonFileWriter({
    relativePath: "package.json",
    isForBundlesOnly: false,
    generateJson: createOverridablePackageValueSupplierWithArgument({
        getDefaultValue: generatePackageJson,
        getValueForBundle: (packageJson, { lernaPackage }) => {
            const envCmd = getPathToExecutable(lernaPackage, "env-cmd");
            const craco = getPathToExecutable(lernaPackage, "craco");
            const cdk = getPathToExecutable(lernaPackage, "cdk");

            return produce(packageJson, (draft: Draft<RawManifest>) => {
                draft.scripts = {
                    ...draft.scripts,
                    start: `${envCmd} -e development ${envCmd} -f .env.local --silent ${craco} start`,
                    "build:staging": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=STAGING ${envCmd} -e development ${craco} --max_old_space_size=4096 build`,
                    "build:production": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=PRODUCTION ${envCmd} -e production ${craco} --max_old_space_size=4096 build`,
                    "deploy:staging": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=STAGING ${cdk} deploy --output deploy/cdk.out --require-approval never --progress events`,
                    "deploy:production": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=PRODUCTION ${cdk} deploy --output deploy/cdk.out --require-approval never --progress events`,
                    eject: "react-scripts eject",
                };
                draft.browserslist = {
                    production: [">0.2%", "not dead", "not op_mini all"],
                    development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
                };
            });
        },
    }),
});

function generatePackageJson({ lernaPackage }: FileWriterArgs): RawManifest {
    const tsc = getPathToExecutable(lernaPackage, "tsc");

    const jest = getPathToExecutable(lernaPackage, "jest");

    const eslint = getPathToExecutable(lernaPackage, "eslint");
    const pathToEslintIgnore = path.relative(lernaPackage.location, path.join(lernaPackage.rootPath, ".eslintignore"));

    const stylelint = getPathToExecutable(lernaPackage, "stylelint");

    const prettier = getPathToExecutable(lernaPackage, "prettier");
    const pathToPrettierIgnore = path.join(getPathToShared(lernaPackage), ".prettierignore");

    const depcheck = getPathToExecutable(lernaPackage, "depcheck");

    const packageJson: RawManifest = {
        name: lernaPackage.name,
        version: "0.1.0",
        private: true,
        source: "src/index.ts",
        module: "src/index.ts",
        main: "lib/index.js",
        types: "lib/index.d.ts",
        scripts: {
            clean: `${tsc} --build --clean`,
            compile: `${tsc} --build`,
            test: `${jest} --passWithNoTests`,
            "lint:eslint": `${eslint} --max-warnings 0 . --ignore-path=${pathToEslintIgnore}`,
            "lint:eslint:fix": `${eslint} --max-warnings 0 . --ignore-path=${pathToEslintIgnore} --fix`,
            "lint:style": `${stylelint} '**/*.scss' --allow-empty-input --max-warnings 0`,
            "lint:style:fix": `${stylelint} '**/*.scss' --allow-empty-input --max-warnings 0 --fix`,
            format: `${prettier} --write --ignore-unknown --ignore-path ${pathToPrettierIgnore} "**"`,
            "format:check": `${prettier} --check --ignore-unknown --ignore-path ${pathToPrettierIgnore} "**"`,
            depcheck,
        },
    };

    if (lernaPackage.dependencies != null && Object.keys(lernaPackage.dependencies).length > 0) {
        packageJson.dependencies = sortDependencies(lernaPackage.dependencies);
    }
    if (lernaPackage.devDependencies != null && Object.keys(lernaPackage.devDependencies).length > 0) {
        packageJson.devDependencies = sortDependencies(lernaPackage.devDependencies);
    }

    packageJson.postcss = {
        "postcss-modules": {
            globalModulePaths: ["@blueprintjs.*"],
        },
    };

    return packageJson;
}

function getPathToBin(lernaPackage: LernaPackage): string {
    return path.relative(lernaPackage.location, path.join(lernaPackage.rootPath, "node_modules/.bin"));
}

function getPathToExecutable(lernaPackage: LernaPackage, executable: string): string {
    return path.join(getPathToBin(lernaPackage), executable);
}

function sortDependencies(dependencies: Record<string, string>): Record<string, string> {
    return Object.keys(dependencies)
        .sort()
        .reduce(
            (all, key) => ({
                ...all,
                [key]: dependencies?.[key],
            }),
            {}
        );
}
