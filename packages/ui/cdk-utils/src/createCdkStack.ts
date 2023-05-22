#!/usr/bin/env node

import * as cdk from "@aws-cdk/core";
import { FernFernCloud, FernFernCloudClient } from "@fern-fern/fern-cloud-sdk";
import { ENVIRONMENT } from "./environment.js";
import { CdkStack } from "./stack.js";

const fernCloudClient = new FernFernCloudClient({
    environment: "https://raw.githubusercontent.com",
    token: getGithubToken(),
});

export async function createCdkStack({ distDirectory }: { distDirectory: string }): Promise<void> {
    new CdkStack({
        scope: new cdk.App(),
        id: `fern-docs-${ENVIRONMENT}`,
        stackProps: {
            env: {
                account: "985111089818",
                region: "us-east-1",
            },
        },
        distDirectory,
        domain: (await getEnvironmentConfig()).docsDomain,
    });
}

function getGithubToken(): string {
    if (process.env.GITHUB_TOKEN == null) {
        throw new Error("GITHUB_TOKEN is not defined");
    }
    return process.env.GITHUB_TOKEN;
}

async function getEnvironmentConfig(): Promise<FernFernCloud.EnvironmentInfo> {
    const environments = await fernCloudClient.environments.getEnvironments();
    const environmentConfig = environments[ENVIRONMENT];
    if (environmentConfig == null) {
        throw new Error("No environment config defined for " + ENVIRONMENT);
    }
    return environmentConfig;
}
