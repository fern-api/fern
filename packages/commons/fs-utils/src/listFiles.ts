import glob from "glob-promise";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { join } from "./join";
import { RelativeFilePath } from "./RelativeFilePath";

export async function listFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<AbsoluteFilePath[]> {
    const files: AbsoluteFilePath[] = [];

    const filepaths = (
        await glob(`**/*.${extensionGlob}`, {
            cwd: root
        })
    ).map(RelativeFilePath.of);

    for (const filepath of filepaths) {
        files.push(join(root, filepath));
    }

    return files;
}
