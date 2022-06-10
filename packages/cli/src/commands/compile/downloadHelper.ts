import { GeneratorHelper } from "@fern-api/compiler-commons";
import execa from "execa";
import { cp, mkdir, rm } from "fs/promises";
import path from "path";
import tar from "tar";
import tmp from "tmp-promise";

export async function downloadHelper({
    helper,
    absolutePathToWorkspaceTempDir,
}: {
    helper: GeneratorHelper;
    absolutePathToWorkspaceTempDir: string;
}): Promise<void> {
    const absolutePathToHelper = getDownloadPathForHelper({ helper, absolutePathToWorkspaceTempDir });
    await rm(absolutePathToHelper, { force: true, recursive: true });
    await mkdir(absolutePathToHelper, { recursive: true });

    if (helper.absoluteLocationOnDisk != null) {
        await cp(helper.absoluteLocationOnDisk, absolutePathToHelper, { recursive: true });
    } else {
        const absolutePathToTgz = await downloadHelperTgz(helper);
        await tar.extract({
            cwd: absolutePathToHelper,
            file: absolutePathToTgz,
            strip: 1, // strip "package" directory from the npm pack
        });
    }
}

// returns absolute path to tgz
async function downloadHelperTgz(helper: GeneratorHelper) {
    const dirToUnpackIn = await tmp.dir();

    const { stdout } = await execa("npm", [
        "pack",
        `${helper.name}@${helper.version}`,
        "--pack-destination",
        dirToUnpackIn.path,
        "--json",
    ]);

    const npmJson = JSON.parse(stdout);
    const filename = npmJson?.[0]?.filename;
    if (typeof filename !== "string") {
        throw new Error("Failed to parse filename of downloaded helper " + `${helper.name}@${helper.version}`);
    }

    // same logic as npm
    // https://github.com/npm/cli/blob/8a49e3ab6499c6196c5d7a0f6dad3b345944b992/lib/commands/pack.js#L59
    const sanitizedFilename = filename.replace(/^@/, "").replace(/\//, "-");

    return path.join(dirToUnpackIn.path, sanitizedFilename);
}

export function getDownloadPathForHelper({
    helper,
    absolutePathToWorkspaceTempDir,
}: {
    helper: GeneratorHelper;
    absolutePathToWorkspaceTempDir: string;
}): string {
    return path.join(absolutePathToWorkspaceTempDir, helper.name, helper.version);
}
