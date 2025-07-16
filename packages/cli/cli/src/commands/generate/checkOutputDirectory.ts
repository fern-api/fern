import { readdir } from "fs/promises";

import { AbsoluteFilePath, doesPathExist, isCI } from "@fern-api/fs-utils";

import { CliContext } from "../../cli-context/CliContext";
import { getOutputDirectories } from "../../persistence/output-directories/getOutputDirectories";
import { storeOutputDirectories } from "../../persistence/output-directories/storeOutputDirectories";

export interface CheckOutputDirectoryResult {
    shouldProceed: boolean;
}

/**
 * Checks if an output directory is safe to write to and handles user confirmations
 * @param outputPath The path to check
 * @param cliContext The CLI context for prompting
 * @returns Object containing whether to proceed and if directory was saved
 */
export async function checkOutputDirectory(
    outputPath: AbsoluteFilePath | undefined,
    cliContext: CliContext,
    force: boolean
): Promise<CheckOutputDirectoryResult> {
    if (!outputPath || isCI() || force) {
        return {
            shouldProceed: true
        };
    }

    // First check if this is already a saved output directory
    const savedDirectories = await getOutputDirectories();
    if (savedDirectories?.includes(outputPath)) {
        return {
            shouldProceed: true
        };
    }

    // Check if directory exists and has files
    const doesExist = await doesPathExist(outputPath);
    if (!doesExist) {
        return {
            shouldProceed: true
        };
    }

    const files = await readdir(outputPath);
    if (files.length === 0) {
        return {
            shouldProceed: true
        };
    }

    // Prompt user for confirmation since directory has files
    const shouldOverwrite = await cliContext.confirmPrompt(
        `Directory ${outputPath} contains existing files that may be overwritten. Continue?`,
        false
    );

    if (!shouldOverwrite) {
        return {
            shouldProceed: false
        };
    }

    await storeOutputDirectories([...(savedDirectories ?? []), outputPath]);

    return {
        shouldProceed: true
    };
}
