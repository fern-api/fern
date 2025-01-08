import fs from "fs/promises";
import path from "path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { renameToEsmFilesFile } from "./RenameToEsmFilesFile";

export class ScriptsManager {
    public async copyScripts({ pathToRoot }: { pathToRoot: AbsoluteFilePath }): Promise<void> {
        // make sure the scripts directory exists
        const scriptsDir = path.join(pathToRoot, "scripts");
        await fs.mkdir(scriptsDir, { recursive: true });
        await renameToEsmFilesFile.copyToFolder(scriptsDir);
    }
}
