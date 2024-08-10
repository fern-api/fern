import { glob } from "glob";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { join } from "./join";
import { RelativeFilePath } from "./RelativeFilePath";

export async function listFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<AbsoluteFilePath[]> {
    return (
        await glob(`**/*.${extensionGlob}`, {
            cwd: root,
            absolute: true
        })
    ).map(AbsoluteFilePath.of);
}
