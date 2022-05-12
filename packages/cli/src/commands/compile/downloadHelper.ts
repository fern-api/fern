import { PluginHelper } from "@fern-api/compiler-commons";
import execa from "execa";
import { lstat, mkdir, rm } from "fs/promises";
import path from "path";
import tar from "tar";
import tmp from "tmp-promise";

export async function downloadHelper({
    helper,
    absolutePathToWorkspaceTempDir,
}: {
    helper: PluginHelper;
    absolutePathToWorkspaceTempDir: string;
}): Promise<void> {
    const absolutePathToHelper = getDownloadPathForHelper({ helper, absolutePathToWorkspaceTempDir });
    if (await doesDirectoryExist(absolutePathToHelper)) {
        return;
    }

    await rm(absolutePathToHelper, { force: true, recursive: true });
    const absolutePathToTgz = await downloadHelperTgz(helper);
    await mkdir(absolutePathToHelper, { recursive: true });
    await tar.extract({
        cwd: absolutePathToHelper,
        file: absolutePathToTgz,
        strip: 1, // strip "package" directory from the npm pack
    });
}

// returns absolute path to tgz
async function downloadHelperTgz(helper: PluginHelper) {
    if (helper.locationOnDisk != null) {
        return helper.locationOnDisk;
    }

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

    return path.join(dirToUnpackIn.path, filename);
}

export function getDownloadPathForHelper({
    helper,
    absolutePathToWorkspaceTempDir,
}: {
    helper: PluginHelper;
    absolutePathToWorkspaceTempDir: string;
}): string {
    return path.join(absolutePathToWorkspaceTempDir, helper.name, helper.version);
}

async function doesDirectoryExist(filepath: string): Promise<boolean> {
    try {
        const stats = await lstat(filepath);
        return stats.isDirectory();
    } catch {
        return false;
    }
}
