import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { parseSdkConfigV1, type SdkConfigV1, validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import type { FernSdkGenApiPackageConfig } from "./fernSdkGenApi.js";
import type { GeneratorLanguage } from "./sdk-gen-client/index.js";

const SDK_CONFIG_FILENAME = RelativeFilePath.of("sdk-config.yml");

/** Locations used for explicit SDK Config resolution and project-root discovery. */
export interface SdkConfigInputLocator {
    explicitPath?: string;
    invocationCwd: AbsoluteFilePath;
    projectRoot: AbsoluteFilePath;
}

/** Validated SDK Config with sparse request bytes and parsed effective values. */
export interface LoadedSdkConfig {
    absolutePath: AbsoluteFilePath;
    body: Buffer;
    config: SdkConfigV1;
}

/** Loads an explicit SDK Config or discovers `sdk-config.yml` at the project root. */
export async function loadSdkConfigInput(locator: SdkConfigInputLocator): Promise<LoadedSdkConfig | undefined> {
    const explicitPath = locator.explicitPath;
    const explicit = explicitPath != null;
    const absolutePath =
        explicitPath != null
            ? AbsoluteFilePath.of(resolve(locator.invocationCwd, explicitPath))
            : join(locator.projectRoot, SDK_CONFIG_FILENAME);

    if (!(await doesPathExist(absolutePath))) {
        if (!explicit) {
            return undefined;
        }
        throw new CliError({
            message: `SDK Config file not found at ${absolutePath}. Check the path passed to --sdk-config.`,
            code: CliError.Code.ConfigError
        });
    }

    try {
        const contents = await readFile(absolutePath, "utf8");
        const input: unknown = yaml.load(contents);
        const document = validateSdkConfigV1(input);
        return {
            absolutePath,
            body: Buffer.from(JSON.stringify(document), "utf8"),
            config: parseSdkConfigV1(document)
        };
    } catch (error) {
        if (error instanceof CliError) {
            throw error;
        }
        throw new CliError({
            message:
                `Failed to load SDK Config from ${absolutePath}: ${extractErrorMessage(error)}. ` +
                "Fix the file or regenerate it with `fern sdk migrate --output <path>`.",
            code: CliError.Code.ConfigError
        });
    }
}

/** Rejects explicit SDK Config input on local generation paths. */
export function assertSdkConfigRemoteGeneration(sdkConfigPath: string | undefined, isLocal: boolean): void {
    if (sdkConfigPath != null && isLocal) {
        throw new CliError({
            message:
                "The --sdk-config flag is only supported for remote generation through the SDK Generation API. " +
                "Remove --local or the custom local runner option.",
            code: CliError.Code.ConfigError
        });
    }
}

/** Returns whether the SDK Config declares a target for the generator language. */
export function hasSdkConfigTarget(sdkConfig: LoadedSdkConfig, language: GeneratorLanguage): boolean {
    return sdkConfig.config.targets.some((target) => target.language === language);
}

/** Resolves target SDK version precedence over the parsed root default. */
export function getSdkConfigVersion(sdkConfig: LoadedSdkConfig, language: GeneratorLanguage): string | undefined {
    const target = sdkConfig.config.targets.find((candidate) => candidate.language === language);
    return target?.sdkVersion ?? sdkConfig.config.sdkVersion;
}

/** Resolves request package metadata from root and target SDK Config fields. */
export function getSdkConfigPackage(
    sdkConfig: LoadedSdkConfig,
    language: GeneratorLanguage
): FernSdkGenApiPackageConfig | undefined {
    const target = sdkConfig.config.targets.find((candidate) => candidate.language === language);
    if (target == null) {
        return undefined;
    }
    const effectivePackage = { ...sdkConfig.config.package, ...target.package };
    const result: FernSdkGenApiPackageConfig = {
        ...(effectivePackage.packageName != null ? { packageName: effectivePackage.packageName } : {}),
        ...(effectivePackage.moduleName != null ? { moduleName: effectivePackage.moduleName } : {}),
        ...(effectivePackage.modulePath != null ? { modulePath: effectivePackage.modulePath } : {}),
        ...(effectivePackage.namespace != null ? { namespace: effectivePackage.namespace } : {}),
        ...(effectivePackage.groupId != null ? { groupId: effectivePackage.groupId } : {}),
        ...(effectivePackage.artifactId != null ? { artifactId: effectivePackage.artifactId } : {})
    };
    return Object.keys(result).length > 0 ? result : undefined;
}
