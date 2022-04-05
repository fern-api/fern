import { mkdir } from "fs/promises";
import path from "path";
import { Result } from "../Result";
import { isBundle } from "../utils";
import { FileWriter } from "./utils/createFileWriter";
import { createJsonFileWriter } from "./utils/createJsonFileWriter";
import { createLooseFileWriter } from "./utils/createLooseFileWriter";
import { getPathToShared } from "./utils/getPathToShared";
import { TsConfig } from "./writeTsConfig";

const DEPLOY_PATH = "deploy";

export const writeDeploy: FileWriter = {
    relativePath: DEPLOY_PATH,
    isForBundlesOnly: true,
    write: async (args) => {
        let result = Result.success();
        if (isBundle(args.lernaPackage.name)) {
            try {
                await mkdir(path.join(args.lernaPackage.location, DEPLOY_PATH));
            } catch (error) {
                // already exists
            }
            result = result.accumulate(await writeDeployScript.write(args));
            result = result.accumulate(await writeTsConfig.write(args));
        }
        return result;
    },
};

const writeDeployScript = createLooseFileWriter({
    relativePath: `${DEPLOY_PATH}/deploy.ts`,
    isForBundlesOnly: true,
    generateFile: ({ lernaPackage }) => `#!/usr/bin/env node

import { createCdkStack } from "@usebirch/cdk-utils";
import path from "path";
	
createCdkStack({
	id: "${lernaPackage.name}", 
	bundleLocation: path.join(__dirname, ".."),
    environmentToDomain: {
        STAGING: "<TODO>",
    },
});`,
});

const RELATIVE_TS_CONFIG_PATH = `${DEPLOY_PATH}/tsconfig.json`;
const writeTsConfig = createJsonFileWriter({
    relativePath: RELATIVE_TS_CONFIG_PATH,
    isForBundlesOnly: true,
    generateJson: (args): TsConfig => {
        const cdkUtils = args.allPackages["@usebirch/cdk-utils"];
        if (cdkUtils == null) {
            throw new Error("Could not find @usebirch/cdk-utils");
        }

        const location = path.join(args.lernaPackage.location, DEPLOY_PATH);

        return {
            extends: path.relative(
                location,
                path.join(args.lernaPackage.location, getPathToShared(args.lernaPackage), "tsconfig.shared.json")
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            compilerOptions: { module: "CommonJS" as any },
            references: [
                {
                    path: path.relative(location, cdkUtils.location),
                },
            ],
        };
    },
});
