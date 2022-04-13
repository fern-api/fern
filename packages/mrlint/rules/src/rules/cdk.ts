import { Logger, Package, PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import { FileSystem } from "@mrlint/virtual-file-system";
import path from "path";
import { tryGetPackageJson } from "../utils/tryGetPackageJson";
import { TsConfig } from "./ts-config";

export const CdkRule: Rule.PackageRule = {
    ruleId: "package-json",
    type: RuleType.PACKAGE,
    targetedPackages: [PackageType.REACT_APP],
    run: runRule,
};

const DEPLOY_PATH = "deploy";

async function runRule({
    fileSystems,
    relativePathToSharedConfigs,
    packageToLint,
    allPackages,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);

    // write cdk.json
    try {
        await fileSystemForPackage.writeFile(
            "cdk.json",
            JSON.stringify({
                app: "npx ts-node --prefer-ts-exts deploy/deploy.ts",
                context: {
                    "@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
                    "@aws-cdk/core:stackRelativeExports": true,
                    "@aws-cdk/aws-rds:lowercaseDbIdentifier": true,
                    "@aws-cdk/aws-lambda:recognizeVersionProps": true,
                    "@aws-cdk/aws-cloudfront:defaultSecurityPolicyTLSv1.2_2021": true,
                    "@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver": true,
                    "@aws-cdk/aws-ec2:uniqueImdsv2TemplateName": true,
                    "@aws-cdk/core:target-partitions": ["aws", "aws-cn"],
                },
            })
        );
    } catch (error) {
        logger.error({
            message: "Failed to write cdk.json",
            error,
        });
        return Result.failure();
    }

    // write deploy/
    await writeDeployDirectory({
        packageToLint,
        allPackages,
        relativePathToSharedConfigs,
        fileSystemForPackage,
        logger,
    });

    return Result.success();
}

async function writeDeployDirectory({
    packageToLint,
    allPackages,
    relativePathToSharedConfigs,
    fileSystemForPackage,
    logger,
}: {
    packageToLint: Package;
    allPackages: readonly Package[];
    relativePathToSharedConfigs: string;
    fileSystemForPackage: FileSystem;
    logger: Logger;
}): Promise<Result> {
    fileSystemForPackage.mkdir(DEPLOY_PATH);
    const fileSystemForDeploy = fileSystemForPackage.getFileSystemForPrefix(DEPLOY_PATH);

    const packageJson = tryGetPackageJson(packageToLint, logger);
    if (packageJson == null) {
        return Result.failure();
    }

    await writeDeployTs({
        packageName: packageJson.name,
        fileSystemForDeploy,
        logger,
    });

    await writeTsConfig({
        packageToLint,
        allPackages,
        relativePathToSharedConfigs,
        fileSystemForDeploy,
        logger,
    });

    return Result.success();
}

async function writeDeployTs({
    packageName,
    fileSystemForDeploy,
    logger,
}: {
    packageName: string;
    fileSystemForDeploy: FileSystem;
    logger: Logger;
}): Promise<Result> {
    try {
        fileSystemForDeploy.writeFile(
            "deploy.ts",
            `#!/usr/bin/env node

import { createCdkStack } from "@fern/cdk-utils";
import path from "path";
	
createCdkStack({
	id: "${packageName}", 
	bundleLocation: path.join(__dirname, ".."),
	environmentToDomain: {
		STAGING: "<TODO>",
	},
});`
        );
        return Result.success();
    } catch (error) {
        logger.error({
            message: "Failed to write deploy.ts",
            error,
        });
        return Result.failure();
    }
}

async function writeTsConfig({
    packageToLint,
    allPackages,
    relativePathToSharedConfigs,
    fileSystemForDeploy,
    logger,
}: {
    packageToLint: Package;
    allPackages: readonly Package[];
    relativePathToSharedConfigs: string;
    fileSystemForDeploy: FileSystem;
    logger: Logger;
}): Promise<Result> {
    const cdkUtils = allPackages.find((p) => p.packageJson?.name === "@fern/cdk-utils");
    if (cdkUtils == null) {
        logger.error({
            message: "Could not find @fern/cdk-utils",
        });
        return Result.failure();
    }

    const tsConfig: TsConfig = {
        extends: path.relative(
            packageToLint.relativePath,
            path.join(relativePathToSharedConfigs, "tsconfig.shared.json")
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compilerOptions: { module: "CommonJS" as any },
        references: [
            {
                path: path.relative(packageToLint.relativePath, cdkUtils.relativePath),
            },
        ],
    };

    try {
        fileSystemForDeploy.writeFile("tsconfig.json", JSON.stringify(tsConfig));
    } catch (error) {
        logger.error({
            message: "Failed to write deploy.ts",
            error,
        });
        return Result.failure();
    }

    return Result.success();
}
