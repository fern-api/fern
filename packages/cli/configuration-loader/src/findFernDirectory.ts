import { FERN_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";

/**
 * Searches upward from the current directory for a directory named `nameOverride` (default `fern`).
 * Unlike `getFernDirectory`, it does not check that the directory contains a project config file.
 */
export async function findFernDirectory(nameOverride?: string): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(nameOverride ?? FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
