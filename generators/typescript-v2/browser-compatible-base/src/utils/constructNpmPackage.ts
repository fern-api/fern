import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { type NpmPackage } from "../NpmPackage";

export function constructNpmPackage({
    generatorConfig,
    isPackagePrivate
}: {
    generatorConfig: FernGeneratorExec.GeneratorConfig;
    isPackagePrivate: boolean;
}): NpmPackage | undefined {
    const outputMode = generatorConfig.output.mode;
    switch (outputMode.type) {
        case "downloadFiles":
            return undefined;
        case "publish":
            return {
                packageName: outputMode.registriesV2.npm.packageName,
                version: outputMode.version,
                private: isPackagePrivate,
                publishInfo: {
                    registryUrl: outputMode.registriesV2.npm.registryUrl,
                    token: outputMode.registriesV2.npm.token
                },
                license: undefined,
                repoUrl: undefined
            };
        case "github":
            if (outputMode.publishInfo != null && outputMode.publishInfo.type !== "npm") {
                throw new Error(
                    `Expected to receive npm publish info but received ${outputMode.publishInfo.type} instead`
                );
            }
            return {
                packageName: outputMode.publishInfo != null ? outputMode.publishInfo.packageName : "",
                version: outputMode.version,
                private: isPackagePrivate,
                publishInfo: undefined,
                repoUrl: getRepoUrlFromUrl(outputMode.repoUrl),
                license: getLicense(generatorConfig.license)
            };
        default:
            throw new Error(`Encountered unknown output mode: ${outputMode}`);
    }
}

function getLicense(license: FernGeneratorExec.LicenseConfig | undefined): string | undefined {
    if (license == null) {
        return undefined;
    }
    switch (license.type) {
        case "basic":
            return license.id;
        case "custom":
            return `See ${license.filename}`;
        default:
            return undefined;
    }
}

function getRepoUrlFromUrl(repoUrl: string): string {
    if (repoUrl.startsWith("https://github.com/")) {
        return `github:${removeGitSuffix(repoUrl).replace("https://github.com/", "")}`;
    }
    if (repoUrl.startsWith("ssh://github.com/")) {
        return `github:${removeGitSuffix(repoUrl).replace("ssh://github.com/", "")}`;
    }
    if (repoUrl.startsWith("https://bitbucket.org/")) {
        return `bitbucket:${removeGitSuffix(repoUrl).replace("https://bitbucket.org/", "")}`;
    }
    if (repoUrl.startsWith("ssh://bitbucket.org/")) {
        return `bitbucket:${removeGitSuffix(repoUrl).replace("ssh://bitbucket.org/", "")}`;
    }
    if (repoUrl.startsWith("https://gitlab.com/")) {
        return `gitlab:${removeGitSuffix(repoUrl).replace("https://gitlab.com/", "")}`;
    }
    if (repoUrl.startsWith("ssh://gitlab.com/")) {
        return `gitlab:${removeGitSuffix(repoUrl).replace("ssh://gitlab.com/", "")}`;
    }
    if (!repoUrl.startsWith("git+")) {
        repoUrl = `git+${repoUrl}`;
    }
    if (!repoUrl.endsWith(".git")) {
        repoUrl = `${repoUrl}.git`;
    }
    return repoUrl;
}

function removeGitSuffix(repoUrl: string): string {
    if (repoUrl.endsWith(".git")) {
        return repoUrl.slice(0, -4);
    }
    return repoUrl;
}
