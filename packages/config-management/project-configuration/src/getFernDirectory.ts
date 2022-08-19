import { AbsoluteFilePath } from "@fern-api/core-utils";
import { findUp } from "find-up";
import { FERN_DIRECTORY } from "./constants";

export async function getFernDirectory(): Promise<AbsoluteFilePath> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        throw new Error(`No ${FERN_DIRECTORY} directory found.`);
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
