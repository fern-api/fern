import { FernGeneratorExec } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { constructNpmPackageArgs, getRepoUrlFromUrl } from "@fern-typescript/commons";

/**
 * Extracts npm package info from the IR's publishConfig.
 * This is used as a fallback when constructNpmPackage returns undefined
 * (e.g., in downloadFiles mode) to preserve package.json metadata.
 *
 * Handles all three publishConfig types:
 * - github: Uses target.type === "npm" and constructs repoUrl from owner/repo
 * - direct: Uses target.type === "npm" (no repoUrl)
 * - filesystem: Uses publishTarget.type === "npm" (no repoUrl)
 */
export function npmPackageInfoFromPublishConfig(
    config: FernGeneratorExec.GeneratorConfig,
    publishConfig: FernIr.PublishingConfig | undefined,
    isPackagePrivate: boolean
): constructNpmPackageArgs {
    let args = {};
    if (publishConfig?.type === "github" || publishConfig?.type === "direct" || publishConfig?.type === "filesystem") {
        const target = publishConfig?.type === "filesystem" ? publishConfig.publishTarget : publishConfig.target;
        if (target?.type === "npm") {
            args = {
                packageName: target.packageName,
                version: target.version,
                repoUrl: getRepoUrl(publishConfig),
                publishInfo: undefined,
                licenseConfig: config.license
            };
        }
    }
    return {
        ...args,
        isPackagePrivate
    };
}

function getRepoUrl(
    publishConfig: FernIr.PublishingConfig.Github | FernIr.PublishingConfig.Direct | FernIr.PublishingConfig.Filesystem
): string | undefined {
    const url = publishConfig._visit<string | undefined>({
        github: (value) => {
            if (value.owner != null && value.repo != null) {
                return `https://github.com/${value.owner}/${value.repo}`;
            }
            return value.uri;
        },
        direct: () => undefined,
        filesystem: () => undefined,
        _other: () => undefined
    });
    if (!url) {
        return undefined;
    }
    return getRepoUrlFromUrl(url);
}
