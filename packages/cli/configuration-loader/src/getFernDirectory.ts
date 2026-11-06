import { PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findFernDirectory } from "./findFernDirectory.js";

export async function getFernDirectory(nameOverride?: string): Promise<AbsoluteFilePath | undefined> {
    const absolutePathToFernDirectory = await findFernDirectory(nameOverride);
    if (absolutePathToFernDirectory == null) {
        return undefined;
    }

    if (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)))) {
        return absolutePathToFernDirectory;
    } else {
        return undefined;
    }
}
