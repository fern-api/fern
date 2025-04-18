import { findUp } from "find-up";

import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";

export async function getFernDirectory(nameOverride?: string): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(nameOverride ?? FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    const absolutePathToFernDirectory = AbsoluteFilePath.of(fernDirectoryStr);

    if (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)))) {
        return absolutePathToFernDirectory;
    } else {
        return undefined;
    }
}
