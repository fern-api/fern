import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, type TaskContext } from "@fern-api/task-context";
import { handleFailedWorkspaceParserResult, loadAPIWorkspace } from "@fern-api/workspace-loader";
import type { SdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

import { mergeOverlays } from "./overlays.js";
import { GROUP_NAME } from "./rules/generator.js";
import { formatDiagnostic, translateCliTarget } from "./translateCliTarget.js";

/** The language of the SDK Config target this adapter generates. */
export const CLI_LANGUAGE = "cli";

export interface PreparedCliTargetWorkspace {
    workspace: AbstractAPIWorkspace<unknown>;
    groupName: string;
    /** The SDK version from sdk-config.yml, used when `fern generate` gets no `--version`. */
    version: string | undefined;
    cleanup: () => Promise<void>;
}

/**
 * Prepares the cli target of an SDK Config for generation. No generator runs SDK Config for the cli
 * target, so it is translated into a throwaway generators.yml for fernapi/fern-cli-generator, in a
 * temporary folder, and loaded as an ordinary workspace. Spec and output paths in it point at the
 * user's files, so `--local`, Fiddle and sdk-gen-api all generate it the way they generate a
 * generators.yml group. Nothing in the user's project changes; `cleanup` deletes the folder.
 */
export async function prepareCliTargetWorkspace({
    context,
    sdkConfig,
    absolutePathToConfig,
    organization,
    workspaceName,
    cliVersion
}: {
    context: TaskContext;
    sdkConfig: SdkConfigV1;
    absolutePathToConfig: string;
    organization: string;
    workspaceName: string | undefined;
    cliVersion: string;
}): Promise<PreparedCliTargetWorkspace> {
    const folder = await mkdtemp(join(tmpdir(), "fern-cli-target-"));
    const cleanup = () => rm(folder, { recursive: true, force: true });
    try {
        const translation = await translateCliTarget({
            context,
            sdkConfig,
            absolutePathToConfig,
            outDir: folder,
            apiName: workspaceName ?? "api",
            organization
        });
        const errors = translation.diagnostics.filter((diagnostic) => diagnostic.severity === "error");
        for (const diagnostic of translation.diagnostics.filter((entry) => entry.severity === "warning")) {
            context.logger.warn(formatDiagnostic(diagnostic));
        }
        if (translation.generatorsYml == null || errors.length > 0) {
            throw new CliError({
                message: [
                    `The cli target in ${absolutePathToConfig} cannot be generated:`,
                    ...errors.map(formatDiagnostic)
                ].join("\n"),
                code: CliError.Code.ConfigError
            });
        }
        for (const note of translation.notes) {
            context.logger.debug(note);
        }

        await writeFile(join(folder, GENERATORS_CONFIGURATION_FILENAME), YAML.stringify(translation.generatorsYml));
        for (const merge of translation.overlayMerges) {
            await mkdir(dirname(merge.path), { recursive: true });
            await writeFile(merge.path, await mergeOverlays(merge.overlayPaths));
        }
        context.logger.debug(`Generating the cli target from ${join(folder, GENERATORS_CONFIGURATION_FILENAME)}`);

        const loaded = await loadAPIWorkspace({
            absolutePathToWorkspace: AbsoluteFilePath.of(folder),
            context,
            cliVersion,
            workspaceName
        });
        if (!loaded.didSucceed) {
            handleFailedWorkspaceParserResult(loaded, context.logger);
            throw new CliError({
                message: `The cli target in ${absolutePathToConfig} translated into a workspace Fern could not load.`,
                code: CliError.Code.InternalError
            });
        }
        return { workspace: loaded.workspace, groupName: GROUP_NAME, version: translation.version, cleanup };
    } catch (error) {
        await cleanup();
        throw error;
    }
}
