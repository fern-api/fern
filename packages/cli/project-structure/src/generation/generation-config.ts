import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { findSdkConfigFile, WorkspaceDir } from "../workspace/index.js";

export function hasGeneratorsFile(dir: WorkspaceDir): boolean {
    return dir.generatorsFile.type !== "none";
}

/** A folder whose SDKs are configured by `sdk-config.yml` alone. Its API is not loaded through a generators file. */
export function isSdkConfigOnly(dir: WorkspaceDir): boolean {
    return dir.sdkConfigFile != null && !hasGeneratorsFile(dir);
}

/** Whether any of the directories has an `sdk-config.yml`, whatever else is configured beside it. */
export async function anyDirectoryHasSdkConfig(directories: readonly AbsoluteFilePath[]): Promise<boolean> {
    const files = await Promise.all(directories.map((directory) => findSdkConfigFile(directory)));
    return files.some((file) => file != null);
}
