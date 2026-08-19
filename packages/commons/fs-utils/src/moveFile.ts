import { rename } from "fs/promises";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";

export async function moveFile({ src, dest }: { src: AbsoluteFilePath; dest: AbsoluteFilePath }): Promise<void> {
    await rename(src, dest);
}
