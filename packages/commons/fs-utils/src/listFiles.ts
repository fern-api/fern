import { glob } from "glob";

import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function listFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<AbsoluteFilePath[]> {
    const alphasort = (a: string, b: string) => a.localeCompare(b, "en");
    return (
        await glob(`**/*.${extensionGlob}`, {
            cwd: root,
            absolute: true
        })
    )
        .sort(alphasort)
        .map(AbsoluteFilePath.of);
}
