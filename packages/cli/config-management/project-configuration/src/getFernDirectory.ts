import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { FERN_DIRECTORY } from "./constants";

export async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
