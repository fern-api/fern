import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { readdir } from "fs/promises";
import { CliContext } from "../../cli-context/CliContext";
import { getOutputDirectories } from "../../persistence/getOutputDirectories";
import { storeOutputDirectories } from "../../persistence/storeOutputDirectories";

export interface CheckOutputDirectoryResult {
    shouldProceed: boolean;
    didSaveDirectory: boolean;
}

/**
 * Checks if an output directory is safe to write to and handles user confirmations
 * @param outputPath The path to check
 * @param cliContext The CLI context for prompting
 * @returns Object containing whether to proceed and if directory was saved
 */
export async function checkOutputDirectory(
    outputPath: AbsoluteFilePath | undefined,
    cliContext: CliContext
): Promise<CheckOutputDirectoryResult> {
    if (!outputPath) {
        return {
            shouldProceed: true,
            didSaveDirectory: false
        };
    }

    // First check if this is already a saved output directory
    const savedDirectories = await getOutputDirectories();
    if (savedDirectories?.includes(outputPath)) {
        return {
            shouldProceed: true,
            didSaveDirectory: false
        };
    }

    // Check if directory exists and has files
    const doesExist = await doesPathExist(outputPath);
    if (!doesExist) {
        return {
            shouldProceed: true,
            didSaveDirectory: false
        };
    }

    const files = await readdir(outputPath);
    if (files.length === 0) {
        return {
            shouldProceed: true,
            didSaveDirectory: false
        };
    }

    // Prompt user for confirmation since directory has files
    const shouldOverwrite = await cliContext.confirmPrompt(
        `Directory ${outputPath} contains existing files that may be overwritten. Continue?`,
        false
    );

    if (!shouldOverwrite) {
        return {
            shouldProceed: false,
            didSaveDirectory: false
        };
    }

    // Ask if they want to save this as a valid output path
    const shouldSave = await cliContext.confirmPrompt(
        "Would you like to save this as a valid output directory for future generations?",
        true
    );

    if (shouldSave) {
        await storeOutputDirectories([...(savedDirectories ?? []), outputPath]);
    }

    return {
        shouldProceed: true,
        didSaveDirectory: shouldSave
    };
}
