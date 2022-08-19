import { AbsoluteFilePath } from "@fern-api/core-utils";
import { findUp } from "find-up";
import { FERN_DIRECTORY } from "./constants";

export async function getFernDirectoryOrThrow(): Promise<AbsoluteFilePath> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        throw new Error(`No ${FERN_DIRECTORY} directory found.`);
    }
    return fernDirectory;
}

export async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
