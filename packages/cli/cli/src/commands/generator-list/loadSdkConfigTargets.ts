import { SDK_CONFIG_FILENAME } from "@fern-api/configuration-loader";
import { errorMessageOrString } from "@fern-api/core-utils";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { FERN_GENERATOR_LATEST_VERSION } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1, SdkConfigV1OutputConfig } from "@postman/sdk-config/sdk-config/v1";
import { CliContext } from "../../cli-context/CliContext.js";
import { getDuplicateTargetLanguageIndexes } from "../generate/getDuplicateTargetLanguageIndexes.js";
import { loadSdkConfigV1 } from "../generate/loadSdkConfigV1.js";
import { getSdkConfigGeneratorName } from "../generate/sdkConfigGeneratorName.js";

export interface SdkConfigTargetSummary {
    /** The target's language, suffixed with its position among same-language targets when repeated (`java-0`). */
    id: string;
    language: string;
    /** The generator `fern generate` runs for this target, if the language has one. */
    generator: string | undefined;
    /** The pinned `generatorVersion`, or `latest` when the target leaves it unpinned. */
    version: string;
    output: SdkConfigV1OutputConfig | undefined;
}

export interface SdkConfigTargetSource {
    workspaceName: string | undefined;
    absolutePathToSdkConfig: string;
    targets: SdkConfigTargetSummary[];
}

/**
 * Reads the SDK Config targets `fern generate` would discover, for commands that only describe configuration.
 *
 * An API workspace owns the sdk-config.yml beside its generators.yml; an SDK Config-only workspace owns its own.
 * Files load in preview mode, so publishing credentials are never resolved. Unselected APIs are skipped before their
 * files are read, so an invalid sdk-config.yml in one API cannot fail a command scoped to another.
 */
export async function loadSdkConfigTargets({
    project,
    cliContext,
    isSelectedApi
}: {
    project: Project;
    cliContext: CliContext;
    isSelectedApi: (workspaceName: string | undefined) => boolean;
}): Promise<SdkConfigTargetSource[]> {
    const owners = [...project.apiWorkspaces, ...(project.sdkConfigWorkspaces ?? [])].filter((owner) =>
        isSelectedApi(owner.workspaceName)
    );
    const sources: SdkConfigTargetSource[] = [];
    const seenPaths = new Set<string>();
    for (const owner of owners) {
        const absolutePathToSdkConfig = join(owner.absoluteFilePath, RelativeFilePath.of(SDK_CONFIG_FILENAME));
        if (seenPaths.has(absolutePathToSdkConfig) || !(await doesPathExist(absolutePathToSdkConfig))) {
            continue;
        }
        seenPaths.add(absolutePathToSdkConfig);

        const config = await loadPreviewSdkConfig({ absolutePathToSdkConfig, cliContext });
        const duplicateTargetLanguageIndexes = getDuplicateTargetLanguageIndexes(config.targets);
        sources.push({
            workspaceName: owner.workspaceName,
            absolutePathToSdkConfig,
            targets: config.targets.map((target, index) => {
                const duplicateIndex = duplicateTargetLanguageIndexes[index];
                return {
                    id: duplicateIndex == null ? target.language : `${target.language}-${duplicateIndex}`,
                    language: target.language,
                    generator: getSdkConfigGeneratorName(target.language),
                    version: target.generatorVersion ?? FERN_GENERATOR_LATEST_VERSION,
                    output: target.output ?? config.output
                };
            })
        });
    }
    return sources;
}

async function loadPreviewSdkConfig({
    absolutePathToSdkConfig,
    cliContext
}: {
    absolutePathToSdkConfig: string;
    cliContext: CliContext;
}): Promise<SdkConfigV1> {
    try {
        return (await loadSdkConfigV1(absolutePathToSdkConfig, true)).config;
    } catch (error) {
        return cliContext.failAndThrow(errorMessageOrString(error), undefined, {
            code: CliError.Code.ConfigError
        });
    }
}
