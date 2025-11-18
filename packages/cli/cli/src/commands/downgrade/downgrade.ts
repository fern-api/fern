import {
    FERN_DIRECTORY,
    getFernDirectory,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { writeFile } from "fs/promises";
import { produce } from "immer";

import { CliContext } from "../../cli-context/CliContext";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

/**
 * Handles CLI downgrades by updating the version in fern.config.json.
 *
 * Flow:
 *   1. Validate that a target version is provided
 *   2. Load the current fern.config.json
 *   3. Update the version field to the target version
 *   4. Write the updated config back to disk
 */
export async function downgrade({
    cliContext,
    targetVersion
}: {
    cliContext: CliContext;
    targetVersion: string | undefined;
}): Promise<void> {
    if (!targetVersion) {
        return cliContext.failAndThrow("Please specify a version to downgrade to using --version");
    }

    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );

    const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
        draft.version = targetVersion;
    });

    await writeFile(projectConfig._absolutePath, ensureFinalNewline(JSON.stringify(newProjectConfig, undefined, 2)));

    cliContext.logger.info(`Updated ${PROJECT_CONFIG_FILENAME} to version ${targetVersion}`);
}
