import fs from "fs/promises";
import path from "path";

import { ScriptFile } from "./ScriptFile";

const fileName = "rename-to-esm-files.js";
const filePathOnDockerContainer = `/assets/scripts/${fileName}`;
export const renameToEsmFilesFile: ScriptFile = {
    copyToFolder: async (destinationFolder: string): Promise<void> => {
        await fs.copyFile(filePathOnDockerContainer, path.join(destinationFolder, fileName));
    }
} as const;
